document.addEventListener('DOMContentLoaded', () => {
    // Clave en localStorage
    const IMG_KEY = 'profileImageData';

    // Elementos del DOM (coinciden con el HTML actual)
    const sidebarBtns = document.querySelectorAll('.sidebar .sidebar-btn');
    const profilePhoto = document.getElementById('profilePhoto');
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const deletePhotoBtn = document.getElementById('deletePhotoBtn');

    const editarBtn = document.getElementById('editarBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const profileForm = document.getElementById('profileForm');
    const profileView = document.getElementById('profileView');
    const profileInfo = document.querySelector('.profile-info');

    // Cargar imagen guardada (si existe)
    try {
        const saved = localStorage.getItem(IMG_KEY);
        if (saved && profilePhoto) profilePhoto.src = saved;
    } catch (err) {
        console.error('Error leyendo la imagen de perfil desde localStorage', err);
    }

    // Botones de la barra lateral: alternar clase 'active'
    if (sidebarBtns && sidebarBtns.length) {
        sidebarBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sidebarBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    // Helper: crear un input file oculto y dispararlo
    function openFilePicker(callback) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        document.body.appendChild(input);
        input.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            callback(file);
            document.body.removeChild(input);
        });
        input.click();
    }

    // Cambiar foto: abrir selector, leer archivo, guardar en localStorage y actualizar vista
    if (changePhotoBtn) {
        changePhotoBtn.addEventListener('click', () => {
            openFilePicker((file) => {
                if (!file) return;
                if (!file.type.startsWith('image/')) return alert('Selecciona un archivo de imagen.');

                const reader = new FileReader();
                reader.onload = (ev) => {
                    const dataUrl = ev.target.result;
                    try {
                        localStorage.setItem(IMG_KEY, dataUrl);
                    } catch (err) {
                        console.error('No se pudo guardar la imagen en localStorage', err);
                        alert('No se pudo guardar la imagen en tu navegador (espacio).');
                    }
                    if (profilePhoto) profilePhoto.src = dataUrl;
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // Eliminar foto
    if (deletePhotoBtn) {
        deletePhotoBtn.addEventListener('click', () => {
            try { localStorage.removeItem(IMG_KEY); } catch (err) { console.error(err); }
            if (profilePhoto) profilePhoto.src = 'img/myprofile.png';
        });
    }

    // Alternar edición de perfil (mostrar/ocultar formulario)
    if (editarBtn && cancelEditBtn && profileForm && profileView && profileInfo) {
        editarBtn.addEventListener('click', () => {
            profileView.classList.add('hidden');
            profileForm.classList.remove('hidden');
            profileInfo.classList.add('edit-mode');
            editarBtn.classList.add('hidden');
        });

        cancelEditBtn.addEventListener('click', () => {
            profileView.classList.remove('hidden');
            profileForm.classList.add('hidden');
            profileInfo.classList.remove('edit-mode');
            editarBtn.classList.remove('hidden');
        });

        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('nombre');
            const apellido = document.getElementById('apellido');
            const telefono = document.getElementById('telefono');
            if (nombre) document.getElementById('nombreTexto').textContent = nombre.value;
            if (apellido) document.getElementById('apellidoTexto').textContent = apellido.value;
            if (telefono) document.getElementById('telefonoTexto').textContent = telefono.value;

            profileView.classList.remove('hidden');
            profileForm.classList.add('hidden');
            profileInfo.classList.remove('edit-mode');
            editarBtn.classList.remove('hidden');
        });
    }
});