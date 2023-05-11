document.addEventListener("DOMContentLoaded", function() {
  // Sidebar toggle functionality
  var sidebar = document.querySelector('.sidebar');
  var sidebarBtn = document.querySelector('.sidebar-btn');
  
  function toggleSidebar() {
    sidebar.classList.toggle('visible');
    sidebarBtn.classList.toggle('hidden');
  }

  sidebarBtn.addEventListener('click', toggleSidebar);

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

  // Close sidebar when clicking outside of it
  window.addEventListener('click', function(event) {
    if (event.target !== sidebar && event.target.parentNode !== sidebar && event.target !== sidebarBtn) {
      sidebar.classList.remove('visible');
      sidebarBtn.classList.remove('hidden');
    }
    
    // Remove neon effect when clicking outside of choices
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
          url = "html_uploadtext.html";
        } else if (id === "option2") {
          url = "html_uploadimage.html";
        } else if (id === "option3") {
          url = "html_uploadpdf.html";
        } else if (id === "option4") {
          url = "html_uploadaudio.html";
        }
      }
    });
    if (url) {
      window.location.href = url;
    }
  }
  
  submitBtn.addEventListener('click', redirectToPage);

});
