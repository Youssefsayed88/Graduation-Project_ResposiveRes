// function previewImage(event) {
//     var previewContainer = document.getElementById('preview-container');
//     previewContainer.innerHTML = ''; // clear previous preview

//     var file = event.target.files[0];
//     var imageType = /^image\//;

//     if (!imageType.test(file.type)) {
//         previewContainer.innerHTML = "Please select an image file.";
//         return;
//     }

//     var img = document.createElement("img");
//     img.classList.add("preview-image");

//     var reader = new FileReader();
//     reader.onload = function() {
//         img.src = reader.result;
//         document.getElementById("upload-btn").classList.remove("hidden");
//         document.getElementById("back-btn").classList.remove("hidden");
//     }
//     reader.readAsDataURL(file);

//     previewContainer.appendChild(img);
//     }

function previewImage(event) {
    var previewContainer = document.getElementById('preview-container');
    var headingElement = document.querySelector('.heading');

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
        document.getElementById("upload-btn").classList.remove("hidden");
        document.getElementById("back-btn").classList.remove("hidden");
        headingElement.style.display = 'none'; // Hide the heading element
    }
    reader.readAsDataURL(file);

    previewContainer.appendChild(img);
}


function additionalAction() {
// Code to perform additional action goes here
}

function showButtons() {
document.getElementById("upload-btn").classList.remove("hidden");
document.getElementById("back-btn").classList.remove("hidden");
}

function uploadFile() {
    event.preventDefault(); // Prevent form submission
    
    var fileInput = document.getElementById("myFile");
    var file = fileInput.files[0];
    
    var img = document.createElement("img");
    var objectURL = URL.createObjectURL(file);
    
    img.onload = function() {
        URL.revokeObjectURL(this.src);
    }
    
    img.src = objectURL;
}