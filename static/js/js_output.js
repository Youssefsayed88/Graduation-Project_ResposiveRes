let currentImageIndex = 1;

// Function to show the current image and hide others
function showCurrentImage() {
  const rightPage = document.querySelector('.right-page');
  const images = rightPage.querySelectorAll('img');

  for (let i = 0; i < images.length; i++) {
    if (i === currentImageIndex - 1) {
      images[i].classList.remove('hidden');
    } else {
      images[i].classList.add('hidden');
    }
  }
}


// Function to navigate to the previous image
function prevImage() {
  currentImageIndex--;
  if (currentImageIndex < 1) {
    currentImageIndex = 4;
  }
  showCurrentImage();
}

// Function to navigate to the next image
function nextImage() {
  currentImageIndex++;
  if (currentImageIndex > 4) {
    currentImageIndex = 1;
  }
  showCurrentImage();
}

// Function to download the current image
function downloadCurrentImage() {
  const rightPage = document.querySelector('.right-page');
  const currentImage = rightPage.querySelector('img:not(.hidden)');

  const downloadLink = document.createElement('a');
  downloadLink.href = currentImage.src;
  downloadLink.download = 'generated_image.png';

  downloadLink.click();
}

// Attach click event listener to the download image button
const downloadImageButton = document.getElementById('download-image');
downloadImageButton.addEventListener('click', downloadCurrentImage);
