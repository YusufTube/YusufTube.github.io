document.addEventListener("DOMContentLoaded", function () {

    const passwordInput = document.getElementById("passwordInput");
    const togglePasswordBtn = document.getElementById("togglePasswordBtn");
    const eyeIcon = togglePasswordBtn.querySelector("i");

    togglePasswordBtn.addEventListener("click", function () {

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeIcon.classList.remove("fa-eye");
            eyeIcon.classList.add("fa-eye-slash");
        } else {
            passwordInput.type = "password";
            eyeIcon.classList.remove("fa-eye-slash");
            eyeIcon.classList.add("fa-eye");
        }

    });

});
