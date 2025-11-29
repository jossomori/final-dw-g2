import { fetchWithLoader } from './loader.js';

// Endpoints del backend local
export const CATEGORIES_URL = "http://localhost:3000/cats";
export const PRODUCTS_URL = "http://localhost:3000/cats_products/";
export const PRODUCT_INFO_URL = "http://localhost:3000/products/";
export const PRODUCT_INFO_COMMENTS_URL = "http://localhost:3000/products_comments/";
export const CART_INFO_URL = "http://localhost:3000/user_cart/";
export const EXT_TYPE = ""; // ya no usamos .json

export function getJSONData(url) {
    return fetchWithLoader(url)
        .then(response => {
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        })
        .then(data => {

            // 🚨 Detectar si ya viene un JSON "crudo" del backend
            // y envolverlo en { status:"ok", data:... } para compatibilidad
            return {
                status: "ok",
                data: data
            };
        })
        .catch(error => {
            return {
                status: "error",
                data: error
            };
        });
}
