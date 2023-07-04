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

  // Clear the error message if it was previously displayed
  errorContainer.textContent = "";
  errorContainer.style.display = "none"; // Hide the error container

  document.getElementById("myInput").value = input;
  document.getElementById("style-option-input").value = styleOption;
  document.getElementById("resolution-option-input").value = resolutionOption;
  document.getElementById("myForm").submit();
}
