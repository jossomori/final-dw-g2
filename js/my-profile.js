document.addEventListener("DOMContentLoaded", function () {
  const editarBtn = document.getElementById("editarBtn");
  const perfilDatos = document.getElementById("perfilDatos");
  const perfilForm = document.getElementById("perfilForm");

  const nombreTexto = document.getElementById("nombreTexto");
  const apellidoTexto = document.getElementById("apellidoTexto");
  const emailTexto = document.getElementById("emailTexto");
  const telefonoTexto = document.getElementById("telefonoTexto");

  const inputNombre = document.getElementById("nombre");
  const inputApellido = document.getElementById("apellido");
  const inputEmail = document.getElementById("email");
  const inputTelefono = document.getElementById("telefono");

  // Se hace clic en "Editar perfil"
  editarBtn.addEventListener("click", () => {
    perfilDatos.style.display = "none";
    perfilForm.style.display = "block";
  });

  // Se guarda el formulario
  perfilForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Actualizar los datos mostrados
    nombreTexto.textContent = inputNombre.value;
    apellidoTexto.textContent = inputApellido.value;
    telefonoTexto.textContent = inputTelefono.value;

    // Cambiar de vista
    perfilForm.style.display = "none";
    perfilDatos.style.display = "block";
  });
});