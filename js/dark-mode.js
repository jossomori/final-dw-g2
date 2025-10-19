// Función para establecer el modo oscuro
function setDarkMode(isDark) {
    document.documentElement.classList.toggle("dark-mode", isDark);
    localStorage.setItem("darkMode", isDark);
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.checked = isDark;
    }
}

// Restaurar el modo oscuro guardado al cargar la página
document.addEventListener("DOMContentLoaded", function() {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
});

// Escuchar cambios en el toggle
document.addEventListener("DOMContentLoaded", function() {
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.addEventListener("change", function() {
            setDarkMode(this.checked);
        });
    }
});