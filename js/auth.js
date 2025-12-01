function checkAuth() {
    const token = localStorage.getItem('authToken');
    const usuario = localStorage.getItem('authUser');
    const raw = window.location.pathname.split('/').pop();
    const currentPage = raw ? raw.split('.').shift() : '';

    if ((!token || !usuario) && currentPage !== 'login') {
        window.location.href = '/login';
        return null;
    }

    if (token && usuario && currentPage === 'login') {
        window.location.href = '/';
        return usuario;
    }

    return usuario;
}

// Función para escuchar cambios en el localStorage
function setupStorageListener() {
    window.addEventListener('storage', (e) => {
        if (e.key === 'authToken' || e.key === 'authUser') {
            checkAuth();
        }
    });
}

// Exportamos las funciones para usarlas en otros archivos
export { checkAuth, setupStorageListener };