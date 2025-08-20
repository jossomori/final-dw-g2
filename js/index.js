document.addEventListener("DOMContentLoaded", function(){
    const usuario = localStorage.getItem("usuarioLogueado");
    
    if (!usuario) {
        // Si no hay usuario logueado, redirigir a login
        window.location.href = "login.html";
    }

    document.getElementById("autos").addEventListener("click", function() {
        localStorage.setItem("catID", 101);
        window.location = "products.html"
    });
    document.getElementById("juguetes").addEventListener("click", function() {
        localStorage.setItem("catID", 102);
        window.location = "products.html"
    });
    document.getElementById("muebles").addEventListener("click", function() {
        localStorage.setItem("catID", 103);
        window.location = "products.html"
    });
});

