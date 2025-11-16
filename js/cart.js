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
                        <span class="info-value">${product.moneda} ${product.costo}</span>
                    </div>
                    <div class="info-group">
                        <label for="quantity-${index}" class="info-label">Cantidad</label>
                        <div class="quantity-wrapper">
                            <button class="quantity-btn quantity-decrease" data-index="${index}" aria-label="Disminuir cantidad">
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
                                data-index="${index}">
                            <button class="quantity-btn quantity-increase" data-index="${index}" aria-label="Aumentar cantidad">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="M11 5h2v14h-2V5zm-6 6h14v2H5z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="info-group">
                        <span class="info-label">Subtotal</span>
                        <span class="subtotal" data-index="${index}">${product.moneda} ${subtotal}</span>
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
        subtotalElement.textContent = `${product.moneda} ${subtotal}`;
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
    
    const increaseButtons = document.querySelectorAll('.quantity-increase');
    const decreaseButtons = document.querySelectorAll('.quantity-decrease');
    
    increaseButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            const input = document.getElementById(`quantity-${index}`);
            let newQuantity = parseInt(input.value) + 1;
            
            if (newQuantity <= MAX_QUANTITY) {
                input.value = newQuantity;
                updateSubtotal(index, newQuantity);
            }
        });
    });
    
    decreaseButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            const input = document.getElementById(`quantity-${index}`);
            let newQuantity = parseInt(input.value) - 1;
            
            if (newQuantity >= 1) {
                input.value = newQuantity;
                updateSubtotal(index, newQuantity);
            }
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
    let subtotal = 0;
    let currency = 'USD';
    
    cart.forEach(product => {
        subtotal += product.costo * product.cantidad;
        currency = product.moneda;
    });
    
    const shippingCost = 0;
    const total = subtotal + shippingCost;
    
    return { subtotal, shippingCost, total, currency };
};

const renderCartSummary = () => {
    const cart = getCart();
    const summaryContainer = document.getElementById('cart-summary');
    
    if (!summaryContainer) return;
    
    if (cart.length === 0) {
        summaryContainer.innerHTML = '';
        return;
    }
    
    const { subtotal, shippingCost, total, currency } = calculateTotal();
    
    summaryContainer.innerHTML = `
        <div class="cart-summary-prices">
            <div class="summary-row">
                <span class="summary-label">Subtotal:</span>
                <span class="summary-value">${currency} ${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row summary-total">
                <span class="summary-label">Total:</span>
                <span class="summary-value">${currency} ${total.toFixed(2)}</span>
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