const toggleBtn = document.querySelector(".toggle-password");


// Funcionalidad para mostrar/ocultar contraseña
toggleBtn.addEventListener("click", () => {
    const password = document.getElementById("password");
    const showEye = document.querySelector(".showing-icon");
    const hideEye = document.querySelector(".hiding-icon");

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