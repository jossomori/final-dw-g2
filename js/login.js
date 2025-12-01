const toggleBtn = document.querySelector(".toggle-password");

if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
    const password = document.getElementById("password");
    const showEye = document.querySelector(".showing-icon");
    const hideEye = document.querySelector(".hiding-icon");

    if (password.type === "password") {
        password.type = "text";
        showEye.style.display = "none";
        hideEye.style.display = "inline";
    } else {
        password.type = "password";
        showEye.style.display = "inline";
        hideEye.style.display = "none";
    }
    });
}
function initLogin() {
    const form = document.getElementById("loginForm");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const usuario = document.getElementById("username").value;
        const contrasena = document.getElementById("password").value;

        if (usuario.trim() === "" || contrasena.trim() === "") {
            alert("Debes ingresar usuario y contraseña.");
            return;
        }

        try {
            const res = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usuario, password: contrasena })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => null);
                alert((err && err.message) || 'Error en el login');
                return;
            }

            const data = await res.json();
            if (data && data.token) {
                localStorage.setItem('authToken', data.token);
                if (data.user && data.user.username) {
                    localStorage.setItem('authUser', data.user.username);
                }
                window.location.href = '/';
            } else {
                alert('Login fallido');
            }
        } catch (err) {
            alert('No se pudo conectar con el servidor');
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogin);
} else {
    initLogin();
}