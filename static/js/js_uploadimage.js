function previewImage(event) {
    var previewContainer = document.getElementById('preview-container');
    previewContainer.innerHTML = ''; // clear previous preview

    var file = event.target.files[0];
    var imageType = /^image\//;

    if (!imageType.test(file.type)) {
        previewContainer.innerHTML = "Please select an image file.";
        return;
    }

    var img = document.createElement("img");
    img.classList.add("preview-image");

    var reader = new FileReader();
    reader.onload = function() {
        img.src = reader.result;
        showButtons(); // Show the Upload button and Back button
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
    document.getElementById("upload-btn").classList.remove("hidden");
    document.getElementById("back-btn").classList.remove("hidden");
}

function submitForm() {
    var styleOption = document.getElementById("style-options-dropdown").value;
    var resolutionOption = document.getElementById("resolution-options-dropdown").value;

    console.log("Upload button pressed");
    console.log("Style chosen is:", styleOption);
    console.log("Resolution chosen is:", resolutionOption);

    document.getElementById("myForm").submit();
}
