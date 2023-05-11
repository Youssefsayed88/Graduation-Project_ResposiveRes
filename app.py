from flask import Flask, render_template, request
import paddleocr
import os

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("html_uploadimage.html", pagetitle = "Upload Image")

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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
