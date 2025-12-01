// Funciones para mostrar/ocultar loader
export function showLoader() {
    let loader = document.getElementById('globalLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'globalLoader';
        loader.className = 'loader-overlay';
        loader.innerHTML = '<div class="loader"></div>';
        document.body.appendChild(loader);
    }
    setTimeout(() => loader.classList.add('active'), 10);
}

export function hideLoader() {
    const loader = document.getElementById('globalLoader');
    if (loader) {
        loader.classList.remove('active');
    }
}

// Función wrapper para fetch con loader automático
export async function fetchWithLoader(url, options = {}) {
    showLoader();
    try {
        const token = localStorage.getItem('authToken');
        if (token) {
            options.headers = options.headers || {};
            if (!options.headers['Authorization'] && !options.headers['authorization']) {
                options.headers['Authorization'] = 'Bearer ' + token;
            }
        }
        const response = await fetch(url, options);
        return response;
    } catch (error) {
        hideLoader();
        throw error;
    } finally {
        // Ocultamos después de un pequeño delay para asegurar que el DOM se actualice
        setTimeout(hideLoader, 100);
    }
}
