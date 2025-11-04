const MAX_QUANTITY = 99;

const getCart = () => {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
};

const saveCart = (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
};

const calculateSubtotal = (costo, cantidad) => {
    return costo * cantidad;
};

const renderCartProduct = (product, index) => {
    const subtotal = calculateSubtotal(product.costo, product.cantidad);

    return `
        <div class="cart-item" data-index="${index}">
            <div class="cart-item-image">
                <img src="${product.imagen}" alt="${product.nombre}">
            </div>
            <div class="cart-item-details">
                <h5 class="cart-item-name" data-product-id="${product.id || ''}">${product.nombre}</h5>
                <div class="cart-item-info">
                    <div class="info-group">
                        <span class="info-label">Precio</span>
                        <span class="info-value">${product.moneda} ${product.costo.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div class="info-group">
                        <label for="quantity-${index}" class="info-label">Cantidad</label>
                        <input 
                            type="number" 
                            id="quantity-${index}" 
                            class="quantity-input" 
                            value="${product.cantidad}" 
                            min="1" 
                            max="${MAX_QUANTITY}" 
                            data-index="${index}">
                    </div>
                    <div class="info-group">
                        <span class="info-label">Subtotal</span>
                        <span class="subtotal" data-index="${index}">${product.moneda} ${subtotal.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>
            <button class="remove-item" data-index="${index}" aria-label="Eliminar producto">
                <svg  xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 6V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H2v2h2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8h2V6zM9 4h6v2H9zM6 20V8h12v12z"></path>
                </svg>
            </button>
        </div>
    `;
};

const renderCart = () => {
    const cart = getCart();
    const cartContainer = document.getElementById('cart-container');

    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="no-products">No hay productos en el carrito.</p>';
    } else {
        const cartHTML = cart.map((product, index) => renderCartProduct(product, index)).join('');
        cartContainer.innerHTML = cartHTML;

        attachQuantityListeners();
        attachRemoveListeners();
        attachProductNameListeners();
    }
    
    renderCartSummary();
};

const updateSubtotal = (index, newQuantity) => {
    const cart = getCart();

    if (index < 0 || index >= cart.length) return;

    const product = cart[index];
    product.cantidad = parseInt(newQuantity);

    saveCart(cart);

    const subtotal = calculateSubtotal(product.costo, product.cantidad);
    const subtotalElement = document.querySelector(`.subtotal[data-index="${index}"]`);

    if (subtotalElement) {
        subtotalElement.textContent = `${product.moneda} ${subtotal.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
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
    const quantityInputs = document.querySelectorAll('.quantity-input');

    quantityInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            let newQuantity = parseInt(e.target.value);

            if (newQuantity < 1 || isNaN(newQuantity)) {
                newQuantity = 1;
                e.target.value = 1;
            } else if (newQuantity > MAX_QUANTITY) {
                newQuantity = MAX_QUANTITY;
                e.target.value = MAX_QUANTITY;
            }

            updateSubtotal(index, newQuantity);
        });
    });
};

const attachRemoveListeners = () => {
    const removeButtons = document.querySelectorAll('.remove-item');

    removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            removeFromCart(index);
        });
    });
};

const attachProductNameListeners = () => {
    const productNames = document.querySelectorAll('.cart-item-name');
    
    productNames.forEach(productName => {
        const productId = productName.getAttribute('data-product-id');
        
        productName.style.cursor = 'pointer';
        
        productName.addEventListener('click', () => {
            if (productId && productId !== '') {
                localStorage.setItem('productID', productId);
                window.location.href = 'product-info.html';
            }
        });
    });
};

const calculateTotal = () => {
    const cart = getCart();
    let subtotalUYU = 0;
    let subtotalUSD = 0;
    
    cart.forEach(product => {
        const subtotal = product.costo * product.cantidad;
        
        if (product.moneda === 'USD') {
            subtotalUSD += subtotal;
        } else {
            subtotalUYU += subtotal;
        }
    });
    
    // Convertir todo a UYU para el total
    const totalUYU = subtotalUYU + (subtotalUSD * 40);
    const shippingCost = 0;
    
    return { 
        subtotalUYU, 
        subtotalUSD, 
        shippingCost, 
        total: totalUYU
    };
};

const renderCartSummary = () => {
    const cart = getCart();
    const summaryContainer = document.getElementById('cart-summary');
    
    if (!summaryContainer) return;
    
    if (cart.length === 0) {
        summaryContainer.innerHTML = '';
        return;
    }
    
    const { subtotalUYU, subtotalUSD, shippingCost, total } = calculateTotal();
    
    // Construir las líneas de subtotal
    let subtotalHTML = '';
    if (subtotalUYU > 0) {
        subtotalHTML += `
            <div class="summary-row">
                <span class="summary-label">Subtotal UYU:</span>
                <span class="summary-value">UYU ${subtotalUYU.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>`;
    }
    if (subtotalUSD > 0) {
        subtotalHTML += `
            <div class="summary-row">
                <span class="summary-label">Subtotal USD:</span>
                <span class="summary-value">USD ${subtotalUSD.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>`;
    }
    
    // Verificar si hay productos en USD para mostrar la nota de conversión
    const conversionNote = subtotalUSD > 0 ? '<p class="conversion-note">* Conversión: 1 USD = 40 UYU</p>' : '';
    
    summaryContainer.innerHTML = `
        <div class="cart-summary-prices">
            ${subtotalHTML}
            ${conversionNote}
            <div class="summary-divider"></div>
            <div class="summary-row summary-total">
                <span class="summary-label">Total:</span>
                <span class="summary-value">UYU ${total.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
        </div>
        <button class="checkout-button">Finalizar compra</button>
    `;
    
    const checkoutButton = summaryContainer.querySelector('.checkout-button');
    checkoutButton.addEventListener('click', () => {
        alert('Funcionalidad de compra en desarrollo');
    });
};

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});