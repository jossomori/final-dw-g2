const MAX_QUANTITY = 99;

const getCart = () => {
  const cartData = localStorage.getItem("cart");
  return cartData ? JSON.parse(cartData) : [];
};

const saveCart = (cart) => {
  localStorage.setItem("cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cartUpdated"));
};

const calculateSubtotal = (costo, cantidad) => costo * cantidad;

// renderizado de productos
const renderCartProduct = (product, index) => {
  const subtotal = calculateSubtotal(product.costo, product.cantidad);
  return `
    <div class="cart-item" data-index="${index}">
      <div class="cart-item-image">
        <img src="${product.imagen}" alt="${product.nombre}">
      </div>
      <div class="cart-item-details">
        <h5 class="cart-item-name" data-product-id="${product.id || ""}">${product.nombre}</h5>
        <div class="cart-item-info">
          <div class="info-group">
            <span class="info-label">Precio</span>
            <span class="info-value">${product.moneda} ${product.costo.toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="info-group">
            <label for="quantity-${index}" class="info-label">Cantidad</label>
            <input type="number" id="quantity-${index}" class="quantity-input" value="${product.cantidad}" min="1" max="${MAX_QUANTITY}" data-index="${index}">
          </div>
          <div class="info-group">
            <span class="info-label">Subtotal</span>
            <span class="subtotal" data-index="${index}">${product.moneda} ${subtotal.toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
      <button class="remove-item" data-index="${index}" aria-label="Eliminar producto">🗑️</button>
    </div>
  `;
};

// render del carrito completo
const renderCart = () => {
  const cart = getCart();
  const cartContainer = document.getElementById("cart-container");
  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p class='no-products'>No hay productos en el carrito.</p>";
  } else {
    const cartHTML = cart.map((p, i) => renderCartProduct(p, i)).join("");
    cartContainer.innerHTML = cartHTML;
    attachQuantityListeners();
    attachRemoveListeners();
    attachProductNameListeners();
  }

  renderCartSummary();
};

// calcular totales
const calculateTotal = (envioPercent = 0) => {
  const cart = getCart();
  let subtotalUYU = 0;
  let subtotalUSD = 0;

  cart.forEach((p) => {
    const subtotal = p.costo * p.cantidad;
    if (p.moneda === "USD") subtotalUSD += subtotal;
    else subtotalUYU += subtotal;
  });

  const totalUYU = subtotalUYU + subtotalUSD * 40;
  const shippingCost = totalUYU * envioPercent;
  const total = totalUYU + shippingCost;

  return { subtotalUYU, subtotalUSD, shippingCost, total };
};

// render del resumen y secciones 
const renderCartSummary = () => {
  const cart = getCart();
  const summaryContainer = document.getElementById("cart-summary");
  if (!summaryContainer) return;

  if (cart.length === 0) {
    summaryContainer.innerHTML = "";
    return;
  }

  summaryContainer.innerHTML = `
    <h3>Tipo de envío</h3>
    <div id="tipo-envio">
      <label><input type="radio" name="envio" value="0.15"> Premium 2 a 5 días (15%)</label><br>
      <label><input type="radio" name="envio" value="0.07"> Express 5 a 8 días (7%)</label><br>
      <label><input type="radio" name="envio" value="0.05"> Standard 12 a 15 días (5%)</label>
    </div>

    <h3 class="mt-3">Dirección de envío</h3>
    <div id="direccion">
      <input type="text" placeholder="Departamento">
      <input type="text" placeholder="Localidad">
      <input type="text" placeholder="Calle">
      <input type="text" placeholder="Número">
      <input type="text" placeholder="Esquina">
    </div>

    <h3 class="mt-3">Forma de pago</h3>
    <div id="pago">
      <label><input type="radio" name="pago" value="tarjeta"> Debito / Credito </label>
      <label><input type="radio" name="pago" value="transferencia"> Transferencia bancaria</label>

      <div class="pago-tarjeta mt-2" style="display:none;">
        <input type="text" placeholder="Número de tarjeta">
        <input type="text" placeholder="Titular">
      </div>

      <div class="pago-transferencia mt-2" style="display:none;">
        <input type="text" placeholder="Número de cuenta">
      </div>
    </div>

    <div id="costos" class="mt-4"></div>
    <button id="finalizar-compra" class="btn btn-success mt-5">Finalizar compra</button>
  `;

  const costosDiv = document.getElementById("costos");

  // funcion para actualizar costos en tiempo real
  const updateCostos = () => {
    const envioSeleccionado = document.querySelector("input[name='envio']:checked");
    const envioPercent = envioSeleccionado ? Number(envioSeleccionado.value) : 0;
    const { subtotalUYU, subtotalUSD, shippingCost, total } = calculateTotal(envioPercent);

    let subtotalHTML = "";
    if (subtotalUYU > 0)
      subtotalHTML += `<div id="subtotalUYU">Subtotal UYU: <strong> UYU$ ${subtotalUYU.toLocaleString()}</strong></div>`;
    if (subtotalUSD > 0)
      subtotalHTML += `<div id="subtotalUSD">Subtotal USD: <strong> USD$ ${subtotalUSD.toLocaleString()}</strong></div><br>
      <p class="cambioFijo">Conversión: 1 USD = 40 UYU</p>`;
    costosDiv.innerHTML = `
      ${subtotalHTML}
      <div class="totalenvio">Costo de envío: <strong>UYU$ ${shippingCost.toLocaleString("es-UY", { minimumFractionDigits: 2 })}</strong></div><br>
      <div>Total: <strong  class="totaluyu">UYU$ ${total.toLocaleString("es-UY", { minimumFractionDigits: 2 })} </strong></div>
    `;
  };

  // listen cambios de tipo de envio
  document.querySelectorAll("input[name='envio']").forEach((radio) =>
    radio.addEventListener("change", updateCostos)
  );

  // escuchar cambios de cantidad (recalcula costos sin perder seleccion)
  window.addEventListener("cartUpdated", updateCostos);

  updateCostos();

  // mostrar campos según forma de pago
  document.querySelectorAll("input[name='pago']").forEach((radio) => {
    radio.addEventListener("change", (e) => {
      document.querySelector(".pago-tarjeta").style.display =
        e.target.value === "tarjeta" ? "block" : "none";
      document.querySelector(".pago-transferencia").style.display =
        e.target.value === "transferencia" ? "block" : "none";
    });
  });

  // validaciones al finalizar compra
  document.querySelector("#finalizar-compra").addEventListener("click", (e) => {
    e.preventDefault();

    const direccionInputs = document.querySelectorAll("#direccion input");
    const direccionCompleta = Array.from(direccionInputs).every(
      (input) => input.value.trim() !== ""
    );

    const envioSeleccionado = document.querySelector("input[name='envio']:checked");
    const cantidades = document.querySelectorAll(".quantity-input");
    const cantidadesValidas = Array.from(cantidades).every(
      (input) => Number(input.value) > 0
    );
    const pagoSeleccionado = document.querySelector("input[name='pago']:checked");

    let pagoValido = false;
    if (pagoSeleccionado) {
      const metodo = pagoSeleccionado.value;
      const camposPago = document.querySelectorAll(`.pago-${metodo} input`);
      pagoValido = Array.from(camposPago).every((i) => i.value.trim() !== "");
    }

    if (!direccionCompleta) return alert("Por favor, complete todos los campos de dirección.");
    if (!envioSeleccionado) return alert("Debe seleccionar una forma de envío.");
    if (!cantidadesValidas) return alert("La cantidad de cada producto debe ser mayor a 0.");
    if (!pagoSeleccionado) return alert("Debe seleccionar una forma de pago.");
    if (!pagoValido) return alert("Complete todos los campos del método de pago seleccionado.");

    const modal = new bootstrap.Modal(document.getElementById("compraExitosaModal"));
    modal.show();
  });
};

// listeners para cantidades, eliminar y click en nombre
const updateSubtotal = (index, newQuantity) => {
  const cart = getCart();
  if (index < 0 || index >= cart.length) return;
  const product = cart[index];
  product.cantidad = parseInt(newQuantity);
  saveCart(cart);
};

const attachQuantityListeners = () => {
  document.querySelectorAll(".quantity-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const index = parseInt(e.target.dataset.index);
      let newQuantity = parseInt(e.target.value);
      if (newQuantity < 1 || isNaN(newQuantity)) newQuantity = 1;
      if (newQuantity > MAX_QUANTITY) newQuantity = MAX_QUANTITY;
      e.target.value = newQuantity;
      updateSubtotal(index, newQuantity);
    });
  });
};

const attachRemoveListeners = () => {
  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      removeFromCart(index);
    });
  });
};

const attachProductNameListeners = () => {
  document.querySelectorAll(".cart-item-name").forEach((name) => {
    const productId = name.getAttribute("data-product-id");
    if (productId) {
      name.style.cursor = "pointer";
      name.addEventListener("click", () => {
        localStorage.setItem("productID", productId);
        window.location.href = "product-info.html";
      });
    }
  });
};

const removeFromCart = (index) => {
  const cart = getCart();
  if (index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
};

// inicialización
document.addEventListener("DOMContentLoaded", renderCart);

