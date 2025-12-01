const MAX_QUANTITY = 99;

const getCart = () => {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
};

const saveCart = (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated')); // importante para notify al summary
};

const calculateSubtotal = (costo, cantidad) => costo * cantidad;

const renderCartProduct = (product, index) => {
    const subtotal = calculateSubtotal(product.costo, product.cantidad);

    return `
        <div class="cart-item" data-index="${index}">
            <div class="cart-item-image">
                <img src="${product.imagen}" alt="${product.nombre}">
            </div>

            <div class="cart-item-details">
                <h5 class="cart-item-name" data-product-id="${product.id || ''}">
                    ${product.nombre}
                </h5>

                <div class="cart-item-info">

                    <div class="info-group">
                        <span class="info-label">Precio</span>
                        <span class="info-value">${product.moneda} ${product.costo}</span>
                    </div>

                    <div class="info-group">
                        <label class="info-label">Cantidad</label>
                        <div class="quantity-wrapper">
                            <button class="quantity-btn quantity-decrease" data-index="${index}">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="M5 11h14v2H5z"/>
                                </svg>
                            </button>

                            <input 
                                type="number"
                                id="quantity-${index}"
                                class="quantity-input"
                                value="${product.cantidad}"
                                min="1"
                                max="${MAX_QUANTITY}"
                                data-index="${index}"
                            >

                            <button class="quantity-btn quantity-increase" data-index="${index}">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="M11 5h2v14h-2V5zm-6 6h14v2H5z"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="info-group">
                        <span class="info-label">Subtotal</span>
                        <span class="subtotal" data-index="${index}">
                            ${product.moneda} ${subtotal}
                        </span>
                    </div>

                </div>
            </div>

            <button class="remove-item" data-index="${index}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 6V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H2v2h2v12
                        c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8h2V6zM9 4h6v2H9zM6 20V8h12v12z">
                    </path>
                </svg>
            </button>
        </div>
    `;
};

const renderCart = () => {
    const cart = getCart();
    const cartContainer = document.getElementById("cart-container");
    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="no-products">No hay productos en el carrito.</p>';
    } else {
        cartContainer.innerHTML = cart.map(renderCartProduct).join('');

        attachQuantityListeners();
        attachRemoveListeners();
        attachProductNameListeners();
    }

    renderCartSummary(); // render del checkout complejo
};

const updateSubtotal = (index, newQuantity) => {
    const cart = getCart();
    if (index < 0 || index >= cart.length) return;

    const product = cart[index];
    product.cantidad = parseInt(newQuantity);

    saveCart(cart);

    const subtotal = calculateSubtotal(product.costo, product.cantidad);
    document.querySelector(`.subtotal[data-index="${index}"]`).textContent =
        `${product.moneda} ${subtotal}`;

    renderCartSummary();
};

const removeFromCart = (index) => {
    const cart = getCart();
    if (index < 0 || index >= cart.length) return;
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
};

const attachQuantityListeners = () => {
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            let q = parseInt(e.target.value);

            if (q < 1 || isNaN(q)) q = 1;
            if (q > MAX_QUANTITY) q = MAX_QUANTITY;

            e.target.value = q;
            updateSubtotal(index, q);
        });
    });

    document.querySelectorAll('.quantity-increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(btn.dataset.index);
            const input = document.getElementById(`quantity-${index}`);
            let q = parseInt(input.value) + 1;
            if (q > MAX_QUANTITY) q = MAX_QUANTITY;
            input.value = q;
            updateSubtotal(index, q);
        });
    });

    document.querySelectorAll('.quantity-decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(btn.dataset.index);
            const input = document.getElementById(`quantity-${index}`);
            let q = parseInt(input.value) - 1;
            if (q < 1) q = 1;
            input.value = q;
            updateSubtotal(index, q);
        });
    });
};

const attachRemoveListeners = () => {
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            removeFromCart(index);
        });
    });
};

const attachProductNameListeners = () => {
    document.querySelectorAll('.cart-item-name').forEach(name => {
        const id = name.dataset.productId;
        if (!id) return;
        name.style.cursor = 'pointer';
        name.addEventListener('click', () => {
            localStorage.setItem('productID', id);
            window.location.href = '/product-info';
        });
    });
};

const calculateTotalComplex = (envioPercent = 0) => {
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

const renderCartSummary = () => {
    const cart = getCart();
    const container = document.getElementById("cart-summary");
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = "";
        container.style.display = "none";
        return;
    }

    container.style.display = "flex";
    container.innerHTML = `
        <h3>Tipo de envío</h3>
        <div id="tipo-envio">
            <label><input type="radio" name="envio" value="0.15"> Premium 2 a 5 días (15%)</label>
            <label><input type="radio" name="envio" value="0.07"> Express 5 a 8 días (7%)</label>
            <label><input type="radio" name="envio" value="0.05"> Standard 12 a 15 días (5%)</label>
        </div>

        <h3>Dirección de envío</h3>
        <div id="direccion">
            <input type="text" placeholder="Departamento">
            <input type="text" placeholder="Localidad">
            <input type="text" placeholder="Calle">
            <input type="text" placeholder="Número">
            <input type="text" placeholder="Esquina">
        </div>

        <h3>Forma de pago</h3>
        <div id="pago">
            <label><input type="radio" name="pago" value="tarjeta"> Débito / Crédito</label>
            <label><input type="radio" name="pago" value="transferencia"> Transferencia bancaria</label>

            <div class="pago-tarjeta" style="display:none;">
                <input type="text" placeholder="Número de tarjeta">
                <input type="text" placeholder="Titular">
            </div>

            <div class="pago-transferencia" style="display:none;">
                <input type="text" placeholder="Número de cuenta">
            </div>
        </div>

        <div id="costos"></div>
        <button id="finalizar-compra">Finalizar compra</button>
    `;

    const costosDiv = document.getElementById("costos");

    const updateCostos = () => {
        const envio = document.querySelector("input[name='envio']:checked");
        const envioPercent = envio ? Number(envio.value) : 0;

        const { subtotalUYU, subtotalUSD, shippingCost, total } =
            calculateTotalComplex(envioPercent);

        let subtotalHTML = "";
        if (subtotalUYU > 0)
            subtotalHTML += `<div>Subtotal UYU: <strong>${subtotalUYU.toLocaleString('es-UY')} UYU</strong></div>`;
        if (subtotalUSD > 0)
            subtotalHTML += `<div>Subtotal USD: <strong>${subtotalUSD.toLocaleString('es-UY')} USD</strong></div>`;
        
        if (subtotalUSD > 0)
            subtotalHTML += `<p>Conversión: 1 USD = 40 UYU</p>`;

        costosDiv.innerHTML = `
            ${subtotalHTML}
            <div>Costo de envío: <strong>${shippingCost.toLocaleString('es-UY', { minimumFractionDigits: 2 })} UYU</strong></div>
            <div>Total: <strong>${total.toLocaleString('es-UY', { minimumFractionDigits: 2 })} UYU</strong></div>
        `;
    };

    document.querySelectorAll("input[name='envio']").forEach(r =>
        r.addEventListener("change", updateCostos)
    );

    document.querySelectorAll("input[name='pago']").forEach(r =>
        r.addEventListener("change", (e) => {
            document.querySelector(".pago-tarjeta").style.display =
                e.target.value === "tarjeta" ? "block" : "none";

            document.querySelector(".pago-transferencia").style.display =
                e.target.value === "transferencia" ? "block" : "none";
        })
    );

    window.addEventListener("cartUpdated", updateCostos);

    updateCostos();

    document.getElementById("finalizar-compra").addEventListener("click", async () => {
        const direccion = document.querySelectorAll("#direccion input");
        const pago = document.querySelector("input[name='pago']:checked");
        const envio = document.querySelector("input[name='envio']:checked");
        const cantidadesValidas = [...document.querySelectorAll(".quantity-input")]
            .every(i => Number(i.value) > 0);

        if (![...direccion].every(i => i.value.trim() !== ""))
            return alert("Complete todos los campos de dirección.");
        if (!envio)
            return alert("Seleccione un tipo de envío.");
        if (!cantidadesValidas)
            return alert("Las cantidades deben ser válidas.");
        if (!pago)
            return alert("Seleccione un método de pago.");

        const metodo = pago.value;
        const camposPago = document.querySelectorAll(`.pago-${metodo} input`);
        if (![...camposPago].every(i => i.value.trim() !== ""))
            return alert("Complete todos los datos del método de pago.");

        const direccionObj = Array.from(direccion).map(i => i.value).join(', ');
        const envioVal = envio ? envio.value : null;

        const items = getCart().map(p => ({ product_id: p.id, quantity: p.cantidad }));

        const body = {
            items,
            payment_method: metodo,
            shipping_type: envioVal,
            address: direccionObj
        };

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const err = await res.json().catch(() => null);
                return alert((err && err.message) || 'Error al guardar el carrito');
            }

            // Limpiar el carrito local y notificar
            localStorage.removeItem('cart');
            window.dispatchEvent(new Event('cartUpdated'));

            const modal = new bootstrap.Modal(document.getElementById("compraExitosaModal"));
            modal.show();
        } catch (err) {
            console.error('Error al enviar carrito:', err);
            alert('No se pudo completar la compra. Intente nuevamente.');
        }
    });
};

document.addEventListener("DOMContentLoaded", () => renderCart());
