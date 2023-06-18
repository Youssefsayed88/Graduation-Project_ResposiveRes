from flask import Flask, render_template, request
# from transformers import PegasusForConditionalGeneration, PegasusTokenizer
# import torch
# import paddleocr
import PyPDF2
import os
import base64


app = Flask(__name__)
# device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
# print("Device used is...")
# print(device)

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

# model_name = "google/pegasus-cnn_dailymail"
# tokenizer = PegasusTokenizer.from_pretrained(model_name)
# model = PegasusForConditionalGeneration.from_pretrained(model_name)

# model.to(device)

# def generate_summary(text):
#     inputs = tokenizer(text, max_length=1024, truncation=True, return_tensors='pt').to(device)
#     summary_ids = model.generate(inputs['input_ids'], num_beams=4, max_length=128, early_stopping=True)
#     summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
#     index = summary.find("<n>")
#     if index != -1:
#         sliced_string = summary[:index]
#     else:
#         sliced_string = summary
#     return sliced_string


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

        # return result
        return text

        # redirect to summarization route
        # return redirect(url_for('generate_summary'))
    except Exception as e:
        return {'result': f'Error processing PDF file: {str(e)}'}

######################################################################################################

@app.route("/process_text", methods=["POST"])
def process_text():
    try:
        text = request.form["text"]
        summary = generate_summary(text)
        return render_template("html_output.html", result=text , result2 = summary)
    except:
        return "Error processing text"

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
        summary ="helllooooo"

        image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        # text = extract_text(image_bytes)
        # summary = generate_summary(text)
        return render_template("html_output.html", result=summary,result2=image_base64)

    except Exception as e:
        return f"Error processing image: {e}"

@app.route("/process_pdf", methods=['GET','POST'])
def process_pdf():
    try:
        # check if a file was uploaded
        if 'pdf-file' not in request.files:
            return {'result': 'No file uploaded'}

        # get the uploaded file
        pdf_file = request.files['pdf-file']
        text = extract_text_from_pdf(pdf_file)
        return render_template("html_output.html", result=text)
    except Exception as e:
        return f"Error processing image: {e}"

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5501))
    app.run(host='127.0.0.1', port=port)

