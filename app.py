from flask import Flask, render_template, request
from transformers import PegasusForConditionalGeneration, PegasusTokenizer
import torch
import paddleocr
import PyPDF2
import os
import base64

#Text to Image Imports
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
pipe = StableDiffusionPipeline.from_pretrained("OmarAhmed1/pixelperfect300withoutcaption", torch_dtype=torch.float16)
pipe = pipe.to("cuda")
pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
# torch.backends.cuda.matmul.allow_tf32 = True  # Enable TF32 math mode if supported
# torch.backends.cudnn.allow_tf32 = True  # Enable TF32 for cuDNN operations if supported
# torch.backends.cudnn.benchmark = True  # Enable cuDNN benchmark mode for performance optimization
# torch.backends.cuda.max_split_size_mb = 4096

@app.route("/")
def index():
    return render_template("start_loading.html", pagetitle = "")


@app.route("/home_page")
def start_website():
    return render_template("html_homepage.html", pagetitle="Home Page")

@app.route("/choose_input")
def choose_input():
    return render_template("html_chooseinput.html", pagetitle="Choose Input")

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


def extract_text_from_pdf(pdf_file):
    # extract text from uploaded PDF
    try:
        pdfFileObj = PyPDF2.PdfReader(pdf_file)
        numPages = len(pdfFileObj.pages)  # pdfFileObj.getNumPages()
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

def generate_image(summary):
    prompt = summary

    #this will be the o/p of the autocomplete model
    prompt += ", fantasy, cartoon, novel design, 8k"

    print("\nThe prompt is:", prompt)

    negative = """ugly tiling, disfigured, deformed, low quality, pixelated, blurry, grains, grainy, text watermark, signature, out of frame,
      disproportioned, bad proportions, gross proportions, bad anatomy, body out of frame, duplicate, cropped, cut off draft, extra hands,
      extra arms, extra legs, extra fingers, extra limbs, long neck mutation, mutilated, mutated hands, poorly drawn face, poorly drawn feet,
      poorly drawn hands, missing hands,
      missing arms, missing legs, missing fingers, fused fingers ,unnatural pose ,out of frame,
      low resolution ,morbid ,blank background ,boring background ,render ,unreal engine"""

    scale = 7           
    image_height = 256
    image_width = 256 
    steps = 50
    try:

        generated_image = pipe(prompt,negative_prompt = negative, height=image_height, width=image_width, guidance_scale = scale, num_inference_steps = steps).images[0]
        # generated_image type is PIL.Image.Image
        image_data = io.BytesIO()
        generated_image.save(image_data, format='PNG')
        image_data.seek(0)
        image_base64 = base64.b64encode(image_data.read()).decode('utf-8')

        return image_base64
    except Exception as e:
        print("Error occured during generating image")
        print("Exception:",e)
        return('Error occured during generating image\nException:',e)

######################################################################################################

@app.route("/process_text", methods=["POST"])
def process_text():
    try:
        text = request.form["text"]
        summary = generate_summary(text)        
    except:
        return "Error processing text"
    
    generated_image = generate_image(summary)

    # Assign the data URL to the `result2` variable
    result2 = 'data:image/png;base64,' + generated_image

    return render_template("html_output.html", result=text, result2=result2)

def extract_text(image_bytes):
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
        image_file = request.files["image"]
        image_bytes = image_file.read()

        text = extract_text(image_bytes)
        summary = generate_summary(text)
        
    except Exception as e:
        return f"Error processing image: {e}"

    generated_image = generate_image(summary)

    # Assign the data URL to the `result2` variable
    result2 = 'data:image/png;base64,' + generated_image
    return render_template("html_output.html", result=text,result2=result2)


@app.route("/process_pdf", methods=['GET','POST'])
def process_pdf():
    try:
        # check if a file was uploaded
        if 'pdf-file' not in request.files:
            return {'result': 'No file uploaded'}

        # get the uploaded file
        pdf_file = request.files['pdf-file']
        text = extract_text_from_pdf(pdf_file)
        summary = generate_summary(text)
    except Exception as e:
        return f"Error processing image: {e}"

    generated_image = generate_image(summary)

    # Assign the data URL to the `result2` variable
    result2 = 'data:image/png;base64,' + generated_image
    return render_template("html_output.html", result=text, result2=result2)


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5501))
    app.run(host='127.0.0.1', port=port)

