import { getJSONData } from './init.js';

const ELEMENT_IDS = {
    MAIN_IMAGE: 'main-product-image',
    THUMBNAILS: 'product-thumbnails',
    SOLD_COUNT: 'product-sold-count',
    PRODUCT_NAME: 'product-name',
    DESCRIPTION: 'product-description',
    PRICE: 'product-price',
    BREADCRUMB: 'breadcrumb-product-name',
    SIMILAR_PRODUCTS: 'similar-products',
    MAIN_CONTAINER: 'main .container'
};

const ERROR_MESSAGES = {
    NO_PRODUCT: 'No se ha seleccionado un producto.',
    LOAD_ERROR: 'No se pudo cargar la información del producto.',
    NO_IMAGES: 'El producto no tiene imágenes',
    NO_MAIN_IMAGE: 'No se encontró el elemento main-product-image'
};


const showError = (message) => {
    const container = document.querySelector(ELEMENT_IDS.MAIN_CONTAINER);
    if (container) {
        container.innerHTML = `<div class="alert alert-danger text-center">${message}</div>`;
    }
};


const setupProductGallery = (product) => {
    if (!product.images?.length) {
        console.warn(ERROR_MESSAGES.NO_IMAGES);
        return;
    }

    const mainImg = document.getElementById(ELEMENT_IDS.MAIN_IMAGE);
    if (!mainImg) {
        console.warn(ERROR_MESSAGES.NO_MAIN_IMAGE);
        return;
    }

    mainImg.src = product.images[0];
    mainImg.alt = product.name;

    const thumbnailsContainer = document.getElementById(ELEMENT_IDS.THUMBNAILS);
    if (thumbnailsContainer) {
        const thumbsHTML = product.images.map((img, i) => `
            <img src="${img}" 
                 alt="${product.name} miniatura ${i + 1}" 
                 class="img-fluid ${i === 0 ? 'thumbnail-active' : ''}" 
                 tabindex="0"
                 data-img-idx="${i}">
        `).join('');
        thumbnailsContainer.innerHTML = thumbsHTML;

        thumbnailsContainer.querySelectorAll('img').forEach(thumb => {
            const updateThumbnail = () => {
                mainImg.src = thumb.src;
                thumbnailsContainer.querySelectorAll('img').forEach(t =>
                    t.classList.remove('thumbnail-active'));
                thumb.classList.add('thumbnail-active');
            };

            // Manejar click
            thumb.addEventListener('click', updateThumbnail);

            // Manejar navegación por teclado (accesibilidad)
            thumb.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    updateThumbnail();
                }
            });
        });
    }
};


const updateCategoryInfo = async (categoryName, categoryLink) => {
    try {
        const result = await getJSONData("http://localhost:3000/categories");
        const categories = result.data;

        const category = categories.find(cat => cat.name === categoryName);
        if (category) {
            categoryLink.textContent = categoryName;
            categoryLink.href = `products.html?catID=${category.id}`;
            localStorage.setItem("catID", category.id);
        }
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
};



const updateProductInfo = async (product) => {
    const elements = {
        soldCount: document.getElementById(ELEMENT_IDS.SOLD_COUNT),
        name: document.getElementById(ELEMENT_IDS.PRODUCT_NAME),
        description: document.getElementById(ELEMENT_IDS.DESCRIPTION),
        price: document.getElementById(ELEMENT_IDS.PRICE),
        breadcrumb: document.getElementById(ELEMENT_IDS.BREADCRUMB),
        categoryLink: document.getElementById('breadcrumb-category')
    };

    if (elements.soldCount) elements.soldCount.textContent = `${product.soldCount} vendidos`;
    if (elements.name) elements.name.textContent = product.name;
    if (elements.description) elements.description.textContent = product.description;
    if (elements.price) elements.price.textContent = `${product.currency} ${product.cost}`;
    if (elements.breadcrumb) elements.breadcrumb.textContent = product.name;

    if (elements.categoryLink && product.category) {
        await updateCategoryInfo(product.category, elements.categoryLink);
    }

    document.title = `eMercado - ${product.name}`;
};


const renderSimilarProducts = async (relatedProducts, catID) => {
    if (!relatedProducts?.length) return;

    const container = document.getElementById(ELEMENT_IDS.SIMILAR_PRODUCTS);
    if (!container) return;

    let detailedRelatedProducts = relatedProducts;

    if (catID) {
        try {
            const categoryProductsResult = await getJSONData(`http://localhost:3000/products/${catID}`);
            if (categoryProductsResult.data.products) {

                const allProductsMap = new Map(
                    categoryProductsResult.data.products.map(p => [p.id, p])
                );

                detailedRelatedProducts = relatedProducts.map(
                    related => allProductsMap.get(related.id) || related
                );
            }
        } catch (error) {
            console.error("No se pudieron cargar los detalles de productos relacionados:", error);
        }
    }

    const similarProductsHTML = detailedRelatedProducts.map(product => `
        <div class="similar-card"
             onclick="localStorage.setItem('productID', ${product.id}); window.location='product-info.html';"
             role="button"
             tabindex="0">
            <img src="${product.image || product.images?.[0]}" 
                 class="similar-img" 
                 alt="${product.name}">
            <div class="similar-info">
                <div class="similar-title-card">${product.name}</div>
                <div class="similar-desc">${product.description || 'Haz clic para ver más detalles'}</div>
                <div class="similar-card-bottom">
                    <span class="similar-price">${product.currency || ''} ${product.cost || ''}</span>
                    <small class="similar-sold-count">${product.soldCount || 0} vendidos</small>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = similarProductsHTML;
};

const initProductPage = async () => {
    const productID = localStorage.getItem("productID");
    if (!productID) {
        showError(ERROR_MESSAGES.NO_PRODUCT);
        return;
    }

    try {
        const result = await getJSONData(`http://localhost:3000/product/${productID}`);
        const product = result.data;

        setupProductGallery(product);
        await updateProductInfo(product);

        const catID = localStorage.getItem("catID");
        await renderSimilarProducts(product.relatedProducts, catID);

        setupBuyButton(product);

    } catch (error) {
        console.error("Error loading product:", error);
        showError(ERROR_MESSAGES.LOAD_ERROR);
    }
};


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

const setupBuyButton = (product) => {
    const buyButton = document.querySelector('.buy-button');
    if (!buyButton) return;

    buyButton.addEventListener('click', () => {
        const cartProduct = {
            id: product.id,
            nombre: product.name,
            costo: product.cost,
            moneda: product.currency,
            cantidad: 1,
            imagen: product.images[0]
        };

        addToCart(cartProduct);

        buyButton.classList.add('added');

        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 800);
    });
};

document.addEventListener('DOMContentLoaded', initProductPage);
