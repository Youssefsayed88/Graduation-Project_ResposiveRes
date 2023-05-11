function submitForm() {
    var input = document.getElementById("myTextarea").value;
    document.getElementById("myInput").value = input;
    document.getElementById("myForm").submit();
}