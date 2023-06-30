function submitForm() {
    var input = document.getElementById("myTextarea").value;
    var styleOption = document.getElementById("style-options-dropdown").value;
    var resolutionOption = document.getElementById("resolution-options-dropdown").value;

    document.getElementById("myInput").value = input;
    document.getElementById("style-option-input").value = styleOption;
    document.getElementById("resolution-option-input").value = resolutionOption;
    document.getElementById("myForm").submit();
}
  