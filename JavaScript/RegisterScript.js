import { registerWithEmail, loginWithEmail } from './FireBase.js';

document.addEventListener("DOMContentLoaded", () => {
    const togglePassword = document.getElementById("togglePassword");
    const password = document.getElementById("password");
    const registerBtn = document.getElementById("registerBtn");
    const authMessage = document.getElementById("auth-message");
    const emailInput = document.getElementById("email");
    const usernameInput = document.getElementById("username");

    // Toggle password visibility
    togglePassword.addEventListener("click", () => {
        if (password.type === "password") {
            password.type = "text";
            togglePassword.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            password.type = "password";
            togglePassword.classList.replace("fa-eye-slash", "fa-eye");
        }
    });

    // Register button
    registerBtn.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const passwordVal = password.value.trim();
        const username = usernameInput.value.trim();

        if (!email || !passwordVal || !username) {
            authMessage.textContent = "All fields are required!";
            authMessage.style.color = "red";
            return;
        }

        try {
            const user = await registerWithEmail(email, passwordVal);
            console.log("User registered:", user);

            // Optional: save username to database if you want
            // e.g., set(ref(database, 'users/' + user.uid), { username });

            authMessage.textContent = `Account created! Welcome, ${username}! 🎉`;
            authMessage.style.color = "lime";

            // Clear fields
            emailInput.value = "";
            password.value = "";
            usernameInput.value = "";

            // Redirect after 2s (optional)
            setTimeout(() => {
                window.location.href = "../index.html";
            }, 2000);

        } catch (err) {
            console.error(err);
            authMessage.textContent = `Error: ${err.message}`;
            authMessage.style.color = "red";
        }
    });
});
