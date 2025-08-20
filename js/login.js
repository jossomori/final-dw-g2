document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const contrasena = document.getElementById("contrasena").value;

    if (usuario !== "" && contrasena !== "") {
      localStorage.setItem("usuarioLogueado", usuario);

      window.location.href = "index.html";
    } else {
      alert("Debes ingresar usuario y contraseña.");
    }
  });
});
