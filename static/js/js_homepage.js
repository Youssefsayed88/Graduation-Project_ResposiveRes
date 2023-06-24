window.addEventListener('DOMContentLoaded', function () {
    var modalContainer = document.getElementById("modal-container");
    var modalImage = document.getElementById("modal-image");
    var modalCaption = document.getElementById("modal-caption");
  
    var showcaseItems = document.getElementsByClassName("showcase-item");
  
    for (var i = 0; i < showcaseItems.length; i++) {
      var image = showcaseItems[i].querySelector("img");
  
      // Set the cursor style to "pointer" for the image
      image.style.cursor = "pointer";
  
      showcaseItems[i].addEventListener("click", function (event) {
        event.stopPropagation(); // Prevent click event from propagating to modalContainer
        var image = this.querySelector("img");
        var caption = this.querySelector(".image-caption");
  
        modalImage.src = image.src;
        modalCaption.textContent = caption.textContent;
  
        modalContainer.style.display = "flex";
        setTimeout(function () {
          modalContainer.classList.add("open");
        }, 10);
      });
  
      // Hide the caption initially
      showcaseItems[i].querySelector(".overlay-text").style.display = "none";
    }
  
    document.addEventListener("click", function (event) {
      var target = event.target;
      var isImage = target === modalImage || modalImage.contains(target);
  
      if (!isImage) {
        closeModal();
      }
    });
  
    function closeModal() {
      modalContainer.classList.remove("open");
      setTimeout(function () {
        modalContainer.style.display = "none";
        modalImage.src = "";
        modalCaption.textContent = "";
      }, 300);
    }
  });
  