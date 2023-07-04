function previewImage(event) {
    var previewContainer = document.getElementById('preview-container');
    var errorMessage = document.getElementById('error-message');
    var errorMessageText = document.getElementById('error-message-text');
    previewContainer.innerHTML = ''; // clear previous preview
    errorMessage.style.display = 'none'; // hide error message

    var file = event.target.files[0];
    var imageType = /^image\//;

    if (!imageType.test(file.type)) {
        errorMessageText.textContent = 'Please upload an image.'; // set custom error message
        errorMessage.style.display = 'block'; // show error message
        document.getElementById("submit-btn").classList.add("hidden"); // hide submit button
        document.getElementById("remove-btn").classList.add("hidden"); // hide remove button
        document.getElementById("style-options-box").classList.add("hidden"); // hide style options
        return;
    }

    var img = document.createElement("img");
    img.classList.add("preview-image");

    var reader = new FileReader();
    reader.onload = function() {
        img.src = reader.result;
        showButtons(); // Show the Submit button and Remove button
    };
    reader.readAsDataURL(file);

    previewContainer.appendChild(img);
}




function logStyleOption() {
    var styleOption = document.getElementById("style-options-dropdown").value;
    console.log("Style chosen is:", styleOption);
    document.getElementById("style-option-input").value = styleOption;
}

function logResolutionOption() {
    var resolutionOption = document.getElementById("resolution-options-dropdown").value;
    console.log("Resolution chosen is:", resolutionOption);
    document.getElementById("resolution-option-input").value = resolutionOption;
}

function showButtons() {

    var styleOptionsBox = document.getElementById("style-options-box");
    styleOptionsBox.style.display = "block";
  

    var submitBtn = document.getElementById("upload-btn");
    submitBtn.style.display = "block";

    var removeBtn = document.getElementById("remove-btn");
    removeBtn.style.display = "block";
}


function submitForm() {
    var styleOption = document.getElementById("style-options-dropdown").value;
    var resolutionOption = document.getElementById("resolution-options-dropdown").value;

    console.log("Upload button pressed");
    console.log("Style chosen is:", styleOption);
    console.log("Resolution chosen is:", resolutionOption);

    document.getElementById("myForm").submit();
}

function removeImage() {
    // Clear the file input value
    document.getElementById("myFile").value = "";

    // Hide the preview container and remove the preview image source
    document.getElementById("preview-container").innerHTML = "";

    // Remove the upload and remove buttons
    var uploadBtn = document.getElementById("upload-btn");
    var removeBtn = document.getElementById("remove-btn");
    uploadBtn.parentNode.removeChild(uploadBtn);
    removeBtn.parentNode.removeChild(removeBtn);

    // Remove the style options box
    var styleOptionsBox = document.getElementById("style-options-box");
    styleOptionsBox.parentNode.removeChild(styleOptionsBox);

    // Show the file input again
    document.getElementById("myFile").style.display = "block";
}




