document.addEventListener("DOMContentLoaded", () => {
    const navButtons = document.querySelectorAll("aside .btn");
    const sections = document.querySelectorAll("section[data-section]");
    const perfilForm = document.getElementById("perfilForm");
    const inputFile = document.getElementById("fotoPerfil");
    const imgPreview = document.getElementById("imgPreview");

    // ====== Navegación lateral ======
    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Desactivar todos los botones
            navButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // Mostrar sección correspondiente
            const target = btn.dataset.target;
            sections.forEach(sec => {
                sec.classList.toggle("hidden", sec.dataset.section !== target);
            });
        });
    });

    // ====== Preview de imagen de perfil ======
    if (inputFile && imgPreview) {
        inputFile.addEventListener("change", e => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = ev => {
                imgPreview.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // ====== Manejo del formulario de perfil ======
    if (perfilForm) {
        perfilForm.addEventListener("submit", e => {
            e.preventDefault();

            const formData = new FormData(perfilForm);
            const data = Object.fromEntries(formData.entries());

            // Simulación de guardado
            console.log("Perfil actualizado:", data);

            // Feedback visual (puede reemplazarse con Toast/Modal)
            const btn = perfilForm.querySelector("button[type='submit']");
            btn.disabled = true;
            btn.textContent = "Guardando...";

            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = "Guardar cambios";
                alert("Perfil actualizado correctamente");
            }, 1200);
        });
    }

    const editarBtn = document.getElementById("editarBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const profileForm = document.getElementById("profileForm");
    const profileView = document.getElementById("profileView");
    const profileInfo = document.querySelector(".profile-info");

    // Entrar en modo edición
    editarBtn.addEventListener("click", () => {
        profileView.classList.add("hidden");
        profileForm.classList.remove("hidden");
        profileInfo.classList.add("edit-mode"); // activa los botones de imagen
        editarBtn.classList.add("hidden"); // ocultar botón principal mientras editás
    });

    // Cancelar edición
    cancelEditBtn.addEventListener("click", () => {
        profileView.classList.remove("hidden");
        profileForm.classList.add("hidden");
        profileInfo.classList.remove("edit-mode");
        editarBtn.classList.remove("hidden");
    });

    // Guardar cambios del formulario
    profileForm.addEventListener("submit", e => {
        e.preventDefault();

        document.getElementById("nombreTexto").textContent = document.getElementById("nombre").value;
        document.getElementById("apellidoTexto").textContent = document.getElementById("apellido").value;
        document.getElementById("telefonoTexto").textContent = document.getElementById("telefono").value;

        profileView.classList.remove("hidden");
        profileForm.classList.add("hidden");
        profileInfo.classList.remove("edit-mode");
        editarBtn.classList.remove("hidden");
    });
});
