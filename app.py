from flask import Flask, render_template, request
import paddleocr
import PyPDF2
import os

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("start_loading.html", pagetitle = "")

@app.route("/home_page")
def start_website():
    return render_template("html_homepage.html", pagetitle="Home Page")

@app.route("/choose_input")
def choose_input():
    return render_template("html_chooseinput.html", pagetitle="Choose Input")

@app.route("/upload_image")
def upload_image():
    return render_template("html_uploadimage.html", pagetitle="Upload Image")


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
        
        return render_template("html_output.html", result=text)
    
    except Exception as e:
        return f"Error processing image: {e}"


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
    
    
    
    # try:
    #     pdf_file = request.files['pdf-file']
    #     extracted_text = process_pdf(pdf_file)



    #     # summarize extracted text
    #     # summary = generate_summary(extracted_text)

    #     # do something with the summary, like display it on a page
    #     rendered = render_template("html_output.html", result=extracted_text)
    #     return rendered
    # except Exception as e:
    #     print("---- EXCEPTION FOUND ----")
    #     print(e)

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