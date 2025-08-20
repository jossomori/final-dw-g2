// Funcionalidad para mostrar/ocultar contraseña
const password = document.getElementById("password");
const toggleBtn = document.getElementById("toggle-password");
const showEye = document.getElementById("showing-password");
const hideEye = document.getElementById("hiding-password");

toggleBtn.addEventListener("click", () => {
    if (password.type === "password") {
        // Mostrar contraseña
        password.type = "text";
        showEye.style.display = "none";
        hideEye.style.display = "inline";
    } else {
        // Ocultar contraseña
        password.type = "password";
        showEye.style.display = "inline";
        hideEye.style.display = "none";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const usuario = document.getElementById("username").value;
        const contrasena = document.getElementById("password").value;

        if (usuario.trim() !== "" && contrasena.trim() !== "") {
            localStorage.setItem("usuarioLogueado", usuario);
            window.location.href = "index.html"; // redirección

        } else {
            alert("Debes ingresar usuario y contraseña.");
        }
    });
});