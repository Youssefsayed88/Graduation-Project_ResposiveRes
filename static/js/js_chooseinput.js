document.addEventListener("DOMContentLoaded", function() {
    // Neon effect functionality
    const choices = document.querySelectorAll(".choice");
  
    function addNeonEffect() {
      // remove selected class from any other choices
      choices.forEach(choice => {
        choice.classList.remove("selected");
        const neon = choice.querySelector(".neon");
        if (neon) {
          choice.removeChild(neon);
        }
      });
  
      // add selected class and neon effect to clicked choice
      this.classList.add("selected");
      const neon = document.createElement("div");
      neon.classList.add("neon");
      this.appendChild(neon);
    }
  
    choices.forEach((choice) => {
      choice.addEventListener("click", addNeonEffect);
    });
  
    // Remove neon effect when clicking outside of choices
    window.addEventListener('click', function(event) {
      choices.forEach(choice => {
        if (!choice.contains(event.target)) {
          choice.classList.remove("selected");
          const neon = choice.querySelector(".neon");
          if (neon) {
            choice.removeChild(neon);
          }
        }
      });
    });
  
    // Submit button functionality
    const submitBtn = document.querySelector('.submit-button');
  
    function redirectToPage() {
      let url;
      choices.forEach(choice => {
        if (choice.classList.contains("selected")) {
          const id = choice.getAttribute("id");
          if (id === "option1") {
            url = "/upload_text";
          } else if (id === "option2") {
            url = "/upload_image";
          } else if (id === "option3") {
            url = "/upload_pdf";
          }
        }
      });
      if (url) {
        window.location.href = url;
      }
    }
  
    submitBtn.addEventListener('click', redirectToPage);
  
  });
  