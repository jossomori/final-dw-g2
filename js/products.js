// Obtener catID de la URL
const urlParams = new URLSearchParams(window.location.search);
const catID = urlParams.get('catID');
const URL = `https://japceibal.github.io/emercado-api/cats_products/${catID}.json`;
let productsData = [];
let filteredProducts = [];

const getCart = () => {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
};

const saveCart = (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
};

const addToCart = (product) => {
    const cart = getCart();
    
    const existingProductIndex = cart.findIndex(
        item => item.nombre === product.nombre && item.imagen === product.imagen
    );
    
    if (existingProductIndex !== -1) {
        cart[existingProductIndex].cantidad += product.cantidad;
    } else {
        cart.push(product);
    }
    
    saveCart(cart);
};

document.addEventListener("DOMContentLoaded", function() {
    loadProducts();
    setupEventListeners();
});

function loadProducts() {
    fetch(URL)
        .then(response => response.json())
        .then(data => {
            document.title = data.catName;
            document.getElementById("category-title").textContent = data.catName;
            
            productsData = data.products;
            filteredProducts = [...productsData];

			// Ordenar por precio ascendente por defecto
            sortProductsByDefault();
            displayProducts(filteredProducts);
        })
        .catch(error => console.error("Error al cargar los productos:", error));
}

function setupEventListeners() {
    document.getElementById("sort-options").addEventListener("change", sortProducts);
    document.getElementById("apply-price-filter").addEventListener("click", applyFilters);
    
    // Filtrar con Enter
    document.getElementById("min-price").addEventListener("keypress", function(e) {
        if (e.key === "Enter") applyFilters();
    });
    
    document.getElementById("max-price").addEventListener("keypress", function(e) {
        if (e.key === "Enter") applyFilters();
    });

    // Filtrar en tiempo real por texto - para TODOS los inputs de búsqueda (desktop y mobile)
    const searchInputs = document.querySelectorAll(".search-input");
    searchInputs.forEach(searchInput => {
        searchInput.addEventListener("input", function() {
            // Sincronizar ambos inputs de búsqueda
            searchInputs.forEach(input => {
                if (input !== searchInput) {
                    input.value = searchInput.value;
                }
            });
            applyFilters();
        });
    });
}

function displayProducts(products) {
    const contenedor = document.getElementById("productos");
    contenedor.innerHTML = "";
    
    if (products.length === 0) {
        contenedor.innerHTML = `<p class="no-products">No se encontraron productos.</p>`;
        return;
    }
    
    products.forEach(prod => {
        const item = document.createElement("article");
        item.classList.add("product-card");
        item.setAttribute("role", "article");

        item.innerHTML = `
            <div class="product-img-container">
                <img class="product-img" src="${prod.image}" alt="${prod.name}">
            </div>
            <div class="product-info">
                <div class="product-meta">
                    <span>${prod.soldCount} vendidos</span>
                </div>

                <div class="product-details">
                    <h2 class="product-name">${prod.name}</h2>
                    <p class="product-desc">${prod.description}</p>
                </div>

                <div class="product-actions">
                    <span class="product-price">${prod.currency} ${prod.cost}</span>
                    <div class="add-to-cart">
                        <button class="buy-button">
                            <span>Añadir al carrito</span>
                            <svg class="icon add-to-cart-icon" xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10.5 18a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3M17.5 18a1.5 1.5 0 1 0 0 3 
                                        1.5 1.5 0 1 0 0-3M15 13v-3h3V8h-3V5h-2v3h-3v2h3v3z"></path>
                                <path d="M8.82 15.77c.31.75 1.04 1.23 1.85 1.23h6.18c.79 0 1.51-.47 
                                        1.83-1.2L21.66 9h-2.18l-2.62 6h-6.18L5.92 3.62C5.76 
                                        3.25 5.4 3 5 3H2v2h2.33z"></path>
                            </svg>
                            <svg class="icon check-icon" xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const buyButton = item.querySelector('.buy-button');
        buyButton.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const cartProduct = {
                id: prod.id,
                nombre: prod.name,
                costo: prod.cost,
                moneda: prod.currency,
                cantidad: 1,
                imagen: prod.image
            };
            
            addToCart(cartProduct);
            
            buyButton.classList.add('added');
            
            setTimeout(() => {
                buyButton.classList.remove('added');
            }, 2000);
        });
        
        item.addEventListener("click", () => {
            localStorage.setItem("productID", prod.id); 
            window.location = "product-info.html";       
        });

        contenedor.appendChild(item);
    });
}

function sortProducts() {
    const sortOption = document.getElementById("sort-options").value;
    
    switch(sortOption) {
        case "asc":
            filteredProducts.sort((a, b) => a.cost - b.cost);
            break;
        case "desc":
            filteredProducts.sort((a, b) => b.cost - a.cost);
            break;
        case "rel":
        default:
            filteredProducts.sort((a, b) => b.soldCount - a.soldCount);
            break;
    }
    
    displayProducts(filteredProducts);
}

function sortProductsByDefault() {
    filteredProducts.sort((a, b) => a.cost - b.cost);
    document.getElementById("sort-options").value = "asc";
}

function applyFilters() {
    // Intenta convertir los valores a números. Si no son números, el resultado será NaN.
    let minPrice = parseFloat(document.getElementById("min-price").value);
    let maxPrice = parseFloat(document.getElementById("max-price").value);

    // Solo hacemos la validación si ambos son números válidos.
    if (!isNaN(minPrice) && !isNaN(maxPrice) && minPrice > maxPrice) {
        alert("El filtro de precio mínimo no puede ser mayor al máximo.");
        return;
    }

    // Si minPrice es NaN (o 0, que es falsy), se le asigna 0.
    minPrice = minPrice || 0;
    // Si maxPrice es NaN, se le asigna el número máximo.
    maxPrice = maxPrice || Number.MAX_SAFE_INTEGER;

    // Obtener el texto de búsqueda del primer input visible (puede ser desktop o mobile)
    const searchInputs = document.querySelectorAll(".search-input");
    let searchText = "";
    searchInputs.forEach(input => {
        if (input.value) {
            searchText = input.value.toLowerCase();
        }
    });

    filteredProducts = productsData.filter(product => {
        const matchesPrice = product.cost >= minPrice && product.cost <= maxPrice;
        const matchesSearch =
            product.name.toLowerCase().includes(searchText) ||
            product.description.toLowerCase().includes(searchText);
        return matchesPrice && matchesSearch;
    });

    sortProducts();
}

