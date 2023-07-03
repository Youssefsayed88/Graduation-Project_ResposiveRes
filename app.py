from flask import Flask, render_template, request
from transformers import PegasusForConditionalGeneration, PegasusTokenizer
import torch
import paddleocr
import PyPDF2
import os
import base64
from transformers import pipeline


#Text to Image Imports
from safetensors.torch import load_file
from collections import defaultdict
import subprocess
import io
from PIL import Image
import numpy as np
from diffusers import (
    StableDiffusionPipeline,
    EulerAncestralDiscreteScheduler,
    DPMSolverMultistepScheduler,
    PNDMScheduler,
    DDIMScheduler,
    KDPM2AncestralDiscreteScheduler )

app = Flask(__name__)

#checking if cuda is working properly
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print("Device used is...")
print(device)

#Preparing the model's pipeline
pipe = StableDiffusionPipeline.from_pretrained("PixelPerfect/PixelPerfect",custom_pipeline = "lpw_stable_diffusion", torch_dtype=torch.float16)
pipe = pipe.to("cuda")
pipe.enable_xformers_memory_efficient_attention()
pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)

# Preparing the prompt auto complete model
AutoComplete_model = pipeline(model='PixelPerfect/PixelPerfect_StableDiffusion_AutoCompleteModel', device=0)


@app.route("/")
def index():
    return render_template("start_loading.html", pagetitle = "")
@app.route("/home_page")
def start_website():
    return render_template("html_homepage.html", pagetitle="Home Page")
@app.route("/choose_input")
def choose_input():
    return render_template("html_chooseinput.html", pagetitle="Choose Input")

@app.route("/guide")
def guide():
    return render_template("html_guide.html", page_title = "Guide")
@app.route("/about")
def about():
    return render_template("html_about.html", page_title = "About")
@app.route("/contact")
def contact():
    return render_template("html_contact.html", page_title = "Contact")

######################################################################################################

@app.route("/upload_text")
def upload_text():
    return render_template("html_uploadtext.html", pagetitle="Upload Text")
@app.route("/upload_image")
def upload_image():
    return render_template("html_uploadimage.html", pagetitle="Upload Image")

model_name = "google/pegasus-cnn_dailymail"
tokenizer = PegasusTokenizer.from_pretrained(model_name)
model = PegasusForConditionalGeneration.from_pretrained(model_name)

model.to(device)

def generate_summary(text):
    inputs = tokenizer(text, max_length=1024, truncation=True, return_tensors='pt').to(device)
    summary_ids = model.generate(inputs['input_ids'], num_beams=4, max_length=128, early_stopping=True)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    index = summary.find("<n>")
    if index != -1:
        sliced_string = summary[:index]
    else:
        sliced_string = summary
    return sliced_string


@app.route('/upload_pdf', methods=['GET','POST'])
def upload_pdf():
    return render_template("html_uploadpdf.html", pagetitle="Upload PDF")


def extract_text_from_pdf(pdf_file, specified_page = None):
    # extract text from uploaded PDF
    try:
        # Creating PyPDF2 Obj
        pdfFileObj = PyPDF2.PdfReader(pdf_file)

        # Specified Pages Case:
        if specified_page is not None:
            pageObj = pdfFileObj.pages[specified_page -1] # -1 to get the desired page not the index
            text = pageObj.extract_text()

        # Generate whole PDF Case:
        else:
            numPages = len(pdfFileObj.pages) 
            text = ''
            for pageNum in range(numPages):
                pageObj = pdfFileObj.pages[pageNum]
                text += pageObj.extract_text()

        print("///////////////////////////")
        print("The pdf processing result is...")
        print(text)

        return text

    except Exception as e:
        return {'result': f'Error processing PDF file: {str(e)}'}

# *********************
# Text to Image Model *
# *********************

def generate_image(summary, style, resolution):

    def load_lora_weights(pipeline, checkpoint_path, multiplier, device, dtype):
        LORA_PREFIX_UNET = "lora_unet"
        LORA_PREFIX_TEXT_ENCODER = "lora_te"
        # load LoRA weight from .safetensors
        state_dict = load_file(checkpoint_path, device=device)

        updates = defaultdict(dict)
        for key, value in state_dict.items():
            # it is suggested to print out the key, it usually will be something like below
            # "lora_te_text_model_encoder_layers_0_self_attn_k_proj.lora_down.weight"

            layer, elem = key.split('.', 1)
            updates[layer][elem] = value

        # directly update weight in diffusers model
        for layer, elems in updates.items():

            if "text" in layer:
                layer_infos = layer.split(LORA_PREFIX_TEXT_ENCODER + "_")[-1].split("_")
                curr_layer = pipeline.text_encoder
            else:
                layer_infos = layer.split(LORA_PREFIX_UNET + "_")[-1].split("_")
                curr_layer = pipeline.unet

            # find the target layer
            temp_name = layer_infos.pop(0)
            while len(layer_infos) > -1:
                try:
                    curr_layer = curr_layer.__getattr__(temp_name)
                    if len(layer_infos) > 0:
                        temp_name = layer_infos.pop(0)
                    elif len(layer_infos) == 0:
                        break
                except Exception:
                    if len(temp_name) > 0:
                        temp_name += "_" + layer_infos.pop(0)
                    else:
                        temp_name = layer_infos.pop(0)

            # get elements for this layer
            weight_up = elems['lora_up.weight'].to(dtype)
            weight_down = elems['lora_down.weight'].to(dtype)
            alpha = elems['alpha']
            if alpha:
                alpha = alpha.item() / weight_up.shape[1]
            else:
                alpha = 1.0

            # update weight
            if len(weight_up.shape) == 4:
                curr_layer.weight.data += multiplier * alpha * torch.mm(weight_up.squeeze(3).squeeze(2), weight_down.squeeze(3).squeeze(2)).unsqueeze(2).unsqueeze(3)
            else:
                curr_layer.weight.data += multiplier * alpha * torch.mm(weight_up, weight_down)

        return pipeline
    
    def GenerateImage(pipe, lora_path, weight, final_prompt, negative, img_width, img_height, steps = 50, scale = 7):

        pipe = load_lora_weights(pipe, lora_path, weight, "cuda", torch.float16)

        image = pipe(final_prompt, negative_prompt=negative, width=img_width, height=img_height, num_inference_steps=steps, guidance_scale=scale).images[0]

        pipe = load_lora_weights(pipe, lora_path, weight * (-1), "cuda", torch.float16)

        return image





    # prompt = summary

    #this will be the o/p of the autocomplete model
    # prompt += ", fantasy, cartoon, novel design, 8k"
    prompt = AutoComplete_model(summary + ",", num_return_sequences=1)[0]["generated_text"]

    # Selecting the required resolution
    if resolution == "landscape-res":
      img_width = 768
      img_height = 512
    elif resolution == "square-res":
      img_width = 512
      img_height = 512
    elif resolution == "portrait-res":
      img_width = 512
      img_height = 768

    print(f"Resolution is: {resolution} ({img_width}x{img_height})")

    # Selecting the required style
    if style == "pixelperfect-style":
      lora_path = "/content/Graduation-Project/LORAs/Enhancer2.safetensors"
      weight = 1
      prompt = "Portrait of " + prompt
    elif style == "kids-style":
      lora_path = "/content/Graduation-Project/LORAs/Kids.safetensors"
      weight = 1.2
    elif style == "novel-style":
      lora_path = "/content/Graduation-Project/LORAs/Novels.safetensors"
      weight = 0.7
    elif style == "photorealistic-style":
      lora_path = "/content/Graduation-Project/LORAs/Enhancer2.safetensors"
      weight = 1
      prompt = "photorealistic, " + summary

    print("Style is:",style)
    # prompt = "Portrait of " + prompt
    print("\nThe prompt is:", prompt)

    negative = """ugly tiling, disfigured, deformed, low quality, pixelated, blurry, grains, grainy, text watermark, signature, out of frame,
      disproportioned, bad proportions, gross proportions, bad anatomy, body out of frame, duplicate, cropped, cut off draft, extra hands,
      extra arms, extra legs, extra fingers, extra limbs, long neck mutation, mutilated, mutated hands, poorly drawn face, poorly drawn feet,
      poorly drawn hands, missing hands,
      missing arms, missing legs, missing fingers, fused fingers ,unnatural pose ,out of frame,
      low resolution ,morbid ,blank background ,boring background ,render ,unreal engine"""

    scale = 7           
    steps = 50
    try:
        generated_image = GenerateImage(pipe, lora_path, weight, prompt, negative, img_width, img_height)
        generated_image.save("model_output/output.png")
        print("Image saved Successfully\n")


        command = "python Real-ESRGAN/inference_realesrgan.py -n RealESRGAN_x4plus -i model_output"
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        print("Upscaller called successfully\n")

        print("Accessing the upscalled image")
        upscalled_image = Image.open("results/output_out.png")
        print("Upscalled image accessed successfully\n")

        # Generated_image type is PIL.Image.Image
        # Saving the generated image as PNG in a BytesIO object
        image_data = io.BytesIO()
        upscalled_image.save(image_data, format='PNG')
        image_data.seek(0)

        # Convert BytesIO to base64
        image_base64 = base64.b64encode(image_data.read()).decode('utf-8')

        return image_base64
    except Exception as e:
        print("Error occurred during generating image")
        print("Exception:", e)
        return 'Error occurred during generating image\nException:' + str(e)

######################################################################################################

@app.route("/process_text", methods=["POST"])
def process_text():
    try:
        text = request.form["text"]
        style = request.form["style"]
        resolution = request.form["resolution"]

        print("Style is:", style)
        print("Resolution is:", resolution)
        summary = generate_summary(text)        
    except:
        return "Error processing text"

    generated_images = []
    for i in range(4):
      print("\nGenerating image number:",i+1)
      generated_image = generate_image(summary, style, resolution)
      generated_images.append(generated_image)

    # Assign the data URL to the `result2` variable
    result1 = 'data:image/png;base64,' + generated_images[0]
    result2 = 'data:image/png;base64,' + generated_images[1]
    result3 = 'data:image/png;base64,' + generated_images[2]
    result4 = 'data:image/png;base64,' + generated_images[3]

    return render_template("html_output.html", result=text,result1=result1, result2=result2, result3=result3, result4=result4)

def extract_text_from_image(image_bytes):
        model = paddleocr.PaddleOCR(use_angle_cls=True, lang='en')
        output = model.ocr(image_bytes)
        result = ""
        i=0
        for res in output:
                while i < len(output[0]):
                     result = result + res[i][1][0]
                     result = result + ' '
                     i+=1
        return result
@app.route("/process_image", methods=["POST"])
def process_image():
    try:
        # Get the uploaded image
        print("Getting the image..")
        image_file = request.files["image"]
        print("\nTransforming the image..")
        image_bytes = image_file.read()
        print("transformed successfully")
        print("\nExtracting text..")
        text = extract_text_from_image(image_bytes)
        print("text extracted successfully")
        print("text is:", text)
        print("\nGenerating summary..")
        summary = generate_summary(text)
        print("summary is:", summary)
        # Get the style and the resolution
        style = request.values.get('style')
        resolution = request.values.get('resolution')
        print("Style is:", style)
        print("Resolution is:", resolution)

    except Exception as e:
        return f"Error processing image: {e}"

    generated_images = []
    for i in range(4):
      print("\nGenerating image number:",i+1)
      generated_image = generate_image(summary, style, resolution)
      generated_images.append(generated_image)

    # Assign the data URL to the `result2` variable
    result1 = 'data:image/png;base64,' + generated_images[0]
    result2 = 'data:image/png;base64,' + generated_images[1]
    result3 = 'data:image/png;base64,' + generated_images[2]
    result4 = 'data:image/png;base64,' + generated_images[3]

    return render_template("html_output.html", result=text,result1=result1, result2=result2, result3=result3, result4=result4)

@app.route("/process_pdf", methods=['GET','POST'])
def process_pdf():
    try:
        # check if a file was uploaded
        if 'pdf-file' not in request.files:
            return {'result': 'No file uploaded'}

        #get the selected Style and Resolution
        style = request.form.get('style')
        resolution = request.form.get('resolution')
        print("Style is:", style)
        print("Resolution is:", resolution)

        #get the specified page if exists
        specified_page = request.form.get('specified-page')
        if specified_page is not None:
            specified_page = int(specified_page)
            print("Specified page is:", specified_page)
            print("Type of specified_page is:", type(specified_page))

        # get the uploaded file
        pdf_file = request.files['pdf-file']
        print("Calling extract_text_from_pdf function")
        text = extract_text_from_pdf(pdf_file, specified_page)
        print("extract_text_from_pdf called successfully")
        print("\ntext output is:\n")
        print(text)
        summary = generate_summary(text)
    except Exception as e:
        return f"Error processing image: {e}"

    generated_images = []
    for i in range(4):
      print("\nGenerating image number:",i+1)
      generated_image = generate_image(summary, style, resolution)
      generated_images.append(generated_image)

    # Assign the data URL to the `result2` variable
    result1 = 'data:image/png;base64,' + generated_images[0]
    result2 = 'data:image/png;base64,' + generated_images[1]
    result3 = 'data:image/png;base64,' + generated_images[2]
    result4 = 'data:image/png;base64,' + generated_images[3]

    return render_template("html_output.html", result=text,result1=result1, result2=result2, result3=result3, result4=result4)


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='127.0.0.1', port=port)