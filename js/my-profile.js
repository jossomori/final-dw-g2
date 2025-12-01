document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogueado = localStorage.getItem('authUser');
    const token = localStorage.getItem('authToken');
    if (!token || !usuarioLogueado) {
        window.location.href = '/login';
        return;
    }

    const IMG_KEY = `profileImageData_${usuarioLogueado}`;
    const PROFILE_DATA_KEY = `profileData_${usuarioLogueado}`;
    const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

    // Elementos del DOM
    const profilePhoto = document.getElementById('profilePhoto');
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const deletePhotoBtn = document.getElementById('deletePhotoBtn');
    const editarBtn = document.getElementById('editarBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const profileForm = document.getElementById('profileForm');
    const profileView = document.getElementById('profileView');

    // Cargar datos guardados
    loadProfileData();
    loadProfileImage();

    // Helper: crear input file oculto
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

    // Cargar imagen desde localStorage
    function loadProfileImage() {
        try {
            const saved = localStorage.getItem(IMG_KEY);
            if (saved && profilePhoto) {
                profilePhoto.src = saved;
            }
        } catch (err) {
            console.error('Error leyendo imagen de perfil', err);
        }
    }

    // Cargar datos del perfil desde localStorage
    function loadProfileData() {
        try {
            const saved = localStorage.getItem(PROFILE_DATA_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                updateProfileDisplay(data);
                updateFormInputs(data);
            } else {
                // Si no hay datos guardados, usar el nombre del usuario logueado
                const defaultData = {
                    nombre: usuarioLogueado,
                    apellido: '',
                    email: '',
                    telefono: ''
                };
                updateProfileDisplay(defaultData);
                updateFormInputs(defaultData);
            }
        } catch (err) {
            console.error('Error leyendo datos de perfil', err);
        }
    }

    // Actualizar vista de información
    function updateProfileDisplay(data) {
        const nombre = data.nombre || '';
        const apellido = data.apellido || '';
        const email = data.email || '';
        const telefono = data.telefono || '';

        document.getElementById('nombreTexto').textContent = nombre || '-';
        document.getElementById('apellidoTexto').textContent = apellido || '-';
        document.getElementById('emailTexto').textContent = email || '-';
        document.getElementById('telefonoTexto').textContent = telefono || '-';
        
        document.getElementById('displayName').textContent = nombre + (apellido ? ' ' + apellido : '');
        document.getElementById('displayEmail').textContent = email || '-';
    }

    // Actualizar inputs del formulario
    function updateFormInputs(data) {
        document.getElementById('nombre').value = data.nombre || '';
        document.getElementById('apellido').value = data.apellido || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('telefono').value = data.telefono || '';
    }

    // Guardar datos del perfil
    function saveProfileData(data) {
        try {
            localStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(data));
        } catch (err) {
            console.error('Error guardando datos de perfil', err);
        }
    }

    // Cambiar foto
    if (changePhotoBtn) {
        changePhotoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openFilePicker((file) => {
                if (!file) return;
                if (!file.type.startsWith('image/')) {
                    alert('Selecciona un archivo de imagen.');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (ev) => {
                    const dataUrl = ev.target.result;
                    try {
                        localStorage.setItem(IMG_KEY, dataUrl);
                        if (profilePhoto) profilePhoto.src = dataUrl;
                    } catch (err) {
                        console.error('No se pudo guardar la imagen', err);
                        alert('No se pudo guardar la imagen. Intenta con una imagen más pequeña.');
                    }
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // Eliminar foto
    if (deletePhotoBtn) {
        deletePhotoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            try {
                localStorage.removeItem(IMG_KEY);
                if (profilePhoto) profilePhoto.src = DEFAULT_AVATAR;
            } catch (err) {
                console.error(err);
            }
        });
    }

    // Mostrar formulario de edición
    if (editarBtn) {
        editarBtn.addEventListener('click', () => {
            profileView.classList.add('hidden');
            profileForm.classList.remove('hidden');
        });
    }

    // Cancelar edición
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            loadProfileData(); // Restaurar valores originales
            profileView.classList.remove('hidden');
            profileForm.classList.add('hidden');
        });
    }

    // Guardar cambios del formulario
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('nombre').value.trim();
            const apellido = document.getElementById('apellido').value.trim();
            const email = document.getElementById('email').value.trim();
            const telefono = document.getElementById('telefono').value.trim();

            // Validación básica
            if (!nombre) {
                alert('El nombre es requerido.');
                return;
            }

            if (email && !email.includes('@')) {
                alert('Ingresa un email válido.');
                return;
            }

            const profileData = { nombre, apellido, email, telefono };
            
            // Guardar y actualizar
            saveProfileData(profileData);
            updateProfileDisplay(profileData);

            // Actualizar el nombre de usuario en localStorage y en el header
            localStorage.setItem('authUser', nombre);
            const headerUsername = document.getElementById('nombreUsuario');
            if (headerUsername) {
                headerUsername.textContent = nombre;
            }

            // Volver a vista de información
            profileView.classList.remove('hidden');
            profileForm.classList.add('hidden');
        });
    }
});
