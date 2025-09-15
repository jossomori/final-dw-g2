const URL = "https://japceibal.github.io/emercado-api/cats_products/101.json";
let productsData = [];
let filteredProducts = [];

document.addEventListener("DOMContentLoaded", function() {
    loadProducts();
    setupEventListeners();
});

function loadProducts() {
    fetch(URL)
        .then(response => response.json())
        .then(data => {
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
    document.getElementById("apply-price-filter").addEventListener("click", filterByPrice);
    
    // Filtrar con Enter
    document.getElementById("min-price").addEventListener("keypress", function(e) {
        if (e.key === "Enter") filterByPrice();
    });
    
    document.getElementById("max-price").addEventListener("keypress", function(e) {
        if (e.key === "Enter") filterByPrice();
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
                        </button>
                    </div>
                </div>
            </div>
        `;

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

function filterByPrice() {
    const minPrice = parseFloat(document.getElementById("min-price").value) || 0;
    const maxPrice = parseFloat(document.getElementById("max-price").value) || Number.MAX_SAFE_INTEGER;
    
    if (minPrice > maxPrice) {
        alert("El precio mínimo no puede ser mayor al precio máximo");
        return;
    }
    
    filteredProducts = productsData.filter(product => {
        return product.cost >= minPrice && product.cost <= maxPrice;
    });
    
    sortProducts();
}