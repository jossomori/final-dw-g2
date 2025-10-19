function checkAuth() {
    const usuario = localStorage.getItem("usuarioLogueado");
    const currentPage = window.location.pathname.split('/').pop();
    
    // Si no hay usuario logueado y no estamos en la página de login, redirigir a login
    if (!usuario && currentPage !== 'login.html') {
        window.location.href = "login.html";
        return null;
    }
    
    // Si hay usuario logueado y estamos en login, redirigir a index
    if (usuario && currentPage === 'login.html') {
        window.location.href = "index.html";
        return usuario;
    }
    
    return usuario;
}

// Función para escuchar cambios en el localStorage
function setupStorageListener() {
    window.addEventListener('storage', (e) => {
        if (e.key === 'usuarioLogueado') {
            checkAuth();
        }
    });
}

// Exportamos las funciones para usarlas en otros archivos
export { checkAuth, setupStorageListener };