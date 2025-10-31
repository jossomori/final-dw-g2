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
            <div class="row align-items-center">
                <div class="col-md-2 col-sm-3">
                    <img src="${product.imagen}" alt="${product.nombre}" class="img-fluid rounded">
                </div>
                <div class="col-md-3 col-sm-4">
                    <h5 class="mb-0">${product.nombre}</h5>
                </div>
                <div class="col-md-2 col-sm-2">
                    <p class="mb-0"><strong>Precio:</strong></p>
                    <p class="mb-0">${product.moneda} ${product.costo}</p>
                </div>
                <div class="col-md-2 col-sm-3">
                    <label for="quantity-${index}" class="form-label"><strong>Cantidad:</strong></label>
                    <input 
                        type="number" 
                        id="quantity-${index}" 
                        class="form-control quantity-input" 
                        value="${product.cantidad}" 
                        min="1" 
                        data-index="${index}">
                </div>
                <div class="col-md-2 col-sm-2">
                    <p class="mb-0"><strong>Precio:</strong></p>
                    <p class="mb-0 subtotal" data-index="${index}">${product.moneda} ${subtotal}</p>
                </div>
                <div class="col-md-1 col-sm-2 text-end">
                    <button class="btn btn-danger btn-sm remove-item" data-index="${index}">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
};

const renderCart = () => {
    const cart = getCart();
    const cartContainer = document.getElementById('cart-container');
    
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '';
    } else {
        const cartHTML = cart.map((product, index) => renderCartProduct(product, index)).join('');
        cartContainer.innerHTML = cartHTML;
        
        attachQuantityListeners();
        attachRemoveListeners();
    }
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

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});
