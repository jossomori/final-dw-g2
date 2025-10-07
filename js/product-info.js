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
                 alt="${product.name} miniatura" 
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
            
            // Manejar navegación por teclado
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
        const result = await getJSONData(CATEGORIES_URL);
        if (result.status === 'ok') {
            const categories = result.data;
            const category = categories.find(cat => cat.name === categoryName);
            if (category) {
                categoryLink.textContent = categoryName;
                categoryLink.href = `products.html?catID=${category.id}`;
                localStorage.setItem('catID', category.id);
            }
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
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

    document.title = `${product.name} - eMercado`;
}

const renderSimilarProducts = (relatedProducts) => {
    if (!relatedProducts?.length) return;

    const container = document.getElementById(ELEMENT_IDS.SIMILAR_PRODUCTS);
    if (!container) return;

    const similarProductsHTML = relatedProducts.map(product => `
        <div class="col-md-3 mb-4">
            <div class="similar-card h-100" 
                 onclick="localStorage.setItem('productID', ${product.id}); window.location='product-info.html';">
                <img src="${product.image}" class="similar-img" alt="${product.name}">
                <div class="similar-info">
                    <div class="similar-title-card">${product.name}</div>
                    <div class="similar-desc">Haz click para ver más detalles</div>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = similarProductsHTML;
};

const initProductPage = async () => {
    const productID = localStorage.getItem('productID');
    if (!productID) {
        showError(ERROR_MESSAGES.NO_PRODUCT);
        return;
    }

    try {
        const result = await getJSONData(`${PRODUCT_INFO_URL}${productID}${EXT_TYPE}`);
        
        if (result.status === 'ok' && result.data) {
            const product = result.data;
            setupProductGallery(product);
            await updateProductInfo(product);
            renderSimilarProducts(product.relatedProducts);
        } else {
            showError(ERROR_MESSAGES.LOAD_ERROR);
        }
    } catch (error) {
        console.error('Error loading product:', error);
        showError(ERROR_MESSAGES.LOAD_ERROR);
    }
};

document.addEventListener('DOMContentLoaded', initProductPage);