function submitForm(event) {
    event.preventDefault(); // Prevent the form submission
  
    var input = document.getElementById("myTextarea").value;
    var styleOption = document.getElementById("style-options-dropdown").value;
    var resolutionOption = document.getElementById("resolution-options-dropdown").value;
  
    var errorContainer = document.getElementById("error-container");
  
    if (input.trim() === "") {
      errorContainer.textContent = "Please enter some text in the text area.";
      errorContainer.style.display = "block"; // Show the error container
  
      // Scroll to the error message for better visibility
      errorContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  
      return;
    }
  
    // Clear the error message if it was previously displayed
    errorContainer.textContent = "";
    errorContainer.style.display = "none"; // Hide the error container
  
    document.getElementById("myInput").value = input;
    document.getElementById("style-option-input").value = styleOption;
    document.getElementById("resolution-option-input").value = resolutionOption;
    document.getElementById("myForm").submit();
  }
  