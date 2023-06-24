document.addEventListener("DOMContentLoaded", function() {
    let pdfUploadBtn = document.getElementById("pdf-upload-btn");
    let pdfRemoveBtn = document.getElementById("pdf-remove-btn");
    let pdfBackBtn = document.getElementById("pdf-back-btn");
    let pdfSubmitBtn = document.getElementById("pdf-submit-btn");
  
    let pdfPreviewBox = document.getElementById("pdf-preview-box");
    let pdfPreviewFilename = document.getElementById("pdf-preview-filename");
  
    let pdfOptionsBox = document.getElementById("pdf-options-box");

    let pdfOptionsDropdown = document.getElementById("pdf-options-dropdown");
    let styleOptionsDropdown = document.getElementById("style-options-dropdown");
    let resOptionsDropdown = document.getElementById("resolution-options-dropdown");
  
    let pdfErrorBox = document.getElementById("pdf-error-box");
    let pdfPageNumbersBox = document.getElementById("pdf-page-numbers-box");
    let pdfPageNumbersInput = document.getElementById("pdf-specified-pages-input");
  
    let fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/pdf";
    fileInput.style.display = "none";
  
    let form = document.createElement("form");
    form.method = "POST";
    form.action = "/process_pdf";
    form.enctype = "multipart/form-data";
    form.appendChild(fileInput);
  
    document.body.appendChild(form);

    if (pdfUploadBtn){
        pdfUploadBtn.addEventListener("click", function () {
            console.log("Upload Button clicked");
            fileInput.click();
        });
    }

    if (fileInput){
        fileInput.addEventListener("change", function () {
            if (fileInput.files.length > 0) {
                if (fileInput.files[0].type !== "application/pdf") {
                    pdfErrorBox.style.display = "block";
                    pdfErrorBox.innerText = "Please select a PDF file or press Back and choose another method.";
                    return;
                }
                let filename = fileInput.files[0].name;
                pdfPreviewFilename.innerText = filename;
                pdfPreviewBox.style.display = "block";
                pdfUploadBtn.style.display = "none";
                pdfRemoveBtn.style.display = "inline-block";
                pdfPageNumbersBox.style.display = "none";
                pdfOptionsBox.style.display = "block";
                pdfErrorBox.style.display = "none";
            }
        });
    }

    if (pdfRemoveBtn){
        pdfRemoveBtn.addEventListener("click", function () {
            console.log("Remove Button clicked");
            fileInput.value = "";
            pdfPreviewFilename.innerText = "";
            pdfPreviewBox.style.display = "none";
            pdfUploadBtn.style.display = "inline-block";
            pdfRemoveBtn.style.display = "none";
            pdfPageNumbersBox.style.display = "none"; // hide the page numbers box when removing the PDF
            pdfErrorBox.style.display = "none";
        });
    }

    if(pdfBackBtn){
        pdfBackBtn.addEventListener("click", function () {
            pdfPageNumbersBox.style.display = "none";
        });
    }

    if (pdfOptionsDropdown){
        pdfOptionsDropdown.addEventListener("change", function () {
            let selectedOption = pdfOptionsDropdown.value;
            if (selectedOption === "generate-specified") {
                pdfPageNumbersBox.style.display = "block";
            } else {
                pdfPageNumbersBox.style.display = "none";
            }
            // pdfSubmitBtn.style.display = "inline-block"; // show the submit button after any choice from the dropdown menu
            if (selectedOption === "generate-all") {
                pdfPageNumbersInput.value = ""; // clear the page numbers input if the "generate all pages" option is selected
            }
        });
    }
    if (styleOptionsDropdown) {
      styleOptionsDropdown.addEventListener("change", function () {
        let selectedStyle = styleOptionsDropdown.value;
        // Perform actions based on the selected style
        console.log("Selected style:", selectedStyle);
      });
    }

    if (resOptionsDropdown) {
      resOptionsDropdown.addEventListener("change", function () {
        let selectedResolution = resOptionsDropdown.value;
        // Perform actions based on the selected resolution
        console.log("Selected resolution:", selectedResolution);
      });
    }

    if (pdfOptionsDropdown && styleOptionsDropdown && resOptionsDropdown) {
        // Function to check if all three dropdown menus have selected values
        function checkDropdownSelection() {
          let pdfOption = pdfOptionsDropdown.value;
          let styleOption = styleOptionsDropdown.value;
          let resOption = resOptionsDropdown.value;
      
          if (pdfOption && styleOption && resOption) {
            pdfSubmitBtn.style.display = "inline-block";
          } else {
            pdfSubmitBtn.style.display = "none";
          }
        }
      
        // Add event listeners to all three dropdown menus
        pdfOptionsDropdown.addEventListener("change", checkDropdownSelection);
        styleOptionsDropdown.addEventListener("change", checkDropdownSelection);
        resOptionsDropdown.addEventListener("change", checkDropdownSelection);
    }
      

    if(pdfPageNumbersInput){
        pdfPageNumbersInput.addEventListener("input", function () {
            pdfPageNumbersInput.value = pdfPageNumbersInput.value.replace(/[^0-9]/g, "");
        });
    }

    
    if (pdfSubmitBtn) {
        pdfSubmitBtn.addEventListener("click", function (event) {
          event.preventDefault();
          console.log("Submit Button clicked");
          let selectedOption = pdfOptionsDropdown.value;
          let selectedStyle = styleOptionsDropdown.value;
          let selectedResolution = resOptionsDropdown.value;
          let specifiedPage = null;
      
          if (selectedOption === "generate-specified") {
            let page = parseInt(pdfPageNumbersInput.value.trim());
            if (isNaN(page) || page < 1) {
              pdfErrorBox.style.display = "block";
              pdfErrorBox.innerText = "Please enter a valid page number.";
              return;
            }
            specifiedPage = page;
          }
      
          let file = fileInput.files[0];
          if (!file) {
            pdfErrorBox.style.display = "block";
            pdfErrorBox.innerText = "Please select a PDF file.";
            return;
          }
      
          let formData = new FormData();
          formData.append("pdf-file", file);
          if (specifiedPage !== null) {
            formData.append("specified-page", specifiedPage); // Pass the specified page number            
            console.log("Specified page is: ", specifiedPage);
        }

          formData.append("resolution", selectedResolution); // Pass the chosen resolution
          formData.append("style", selectedStyle); // Pass the chosen style
          console.log("Resolution is: ", selectedResolution)
          console.log("Style is: ", selectedStyle)
          
          fetch("/process_pdf", {
            method: "POST",
            body: formData,
          })
            .then((response) => response.text())
            .then((html) => {
              document.open();
              document.write(html);
              document.close();
            })
            .catch((error) => console.error(error));
      
          // Show the submit button after a choice is made from the dropdown menu
          pdfSubmitBtn.style.display = "inline-block";
        });
      }
      
});
