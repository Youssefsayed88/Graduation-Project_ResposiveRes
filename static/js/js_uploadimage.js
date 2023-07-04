function previewImage(event) {
    var previewContainer = document.getElementById('preview-container');
    var errorMessage = document.getElementById('error-message');
    var errorMessageText = document.getElementById('error-message-text');
    var styleDropdown = document.getElementById("style-options-dropdown");
    var resolutionDropdown = document.getElementById("resolution-options-dropdown");

    // Clear previous preview
    previewContainer.innerHTML = '';
    // Hide error message
    errorMessage.style.display = 'none';

    // Reset style and resolution dropdowns
    styleDropdown.selectedIndex = 0;
    resolutionDropdown.selectedIndex = 0;

    // Reset style dropdown appearance
    styleDropdown.style.borderColor = '';
    styleDropdown.style.backgroundColor = '';

    // Reset resolution dropdown appearance
    resolutionDropdown.style.borderColor = '';
    resolutionDropdown.style.backgroundColor = '';

    var file = event.target.files[0];
    var imageType = /^image\//;

    if (!imageType.test(file.type)) {
        errorMessageText.textContent = 'Please upload an image.'; // Set custom error message
        errorMessage.style.display = 'block'; // Show error message
        document.getElementById("submit-btn").classList.add("hidden"); // Hide submit button
        document.getElementById("remove-btn").classList.add("hidden"); // Hide remove button
        document.getElementById("style-options-box").classList.add("hidden"); // Hide style options
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
    var errorContainer = document.getElementById("error-message");
  
    if (styleOption === "" || resolutionOption === "") {
        errorContainer.textContent = "Please choose an option in the dropdown menu.";
        errorContainer.style.display = "block"; // Show the error container

        // Add red color to the unchosen style option
        var styleDropdown = document.getElementById("style-options-dropdown");
        styleDropdown.style.borderColor = styleOption === "" ? "red" : "";
        styleDropdown.style.backgroundColor = styleOption === "" ? "#ffe6e6" : "";

        // Add red color to the unchosen resolution option
        var resolutionDropdown = document.getElementById("resolution-options-dropdown");
        resolutionDropdown.style.borderColor = resolutionOption === "" ? "red" : "";
        resolutionDropdown.style.backgroundColor = resolutionOption === "" ? "#ffe6e6" : "";

        // Scroll to the error message and the dropdown menus for better visibility
        errorContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        styleDropdown.scrollIntoView({ behavior: "smooth", block: "start" });

        return;
    }

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

    // Hide the upload and remove buttons
    var uploadBtn = document.getElementById("upload-btn");
    var removeBtn = document.getElementById("remove-btn");
    uploadBtn.style.display = "none";
    removeBtn.style.display = "none";

    // Remove the style options box
    var styleOptionsBox = document.getElementById("style-options-box");
    styleOptionsBox.style.display = "none";

    // Clear the error messages
    var errorMessage = document.getElementById("error-message");
    var errorMessageText = document.getElementById("error-message-text");
    errorMessage.style.display = "none";
    errorMessageText.textContent = "";

    // Show the file input again
    document.getElementById("myFile").style.display = "block";
}
