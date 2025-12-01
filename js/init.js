import { fetchWithLoader } from './loader.js';

export const CATEGORIES_URL = "http://localhost:3000/json/cats/cat.json";
export const PUBLISH_PRODUCT_URL = "http://localhost:3000/json/sell/publish.json";
export const PRODUCTS_URL = "http://localhost:3000/json/cats_products/";
export const PRODUCT_INFO_URL = "http://localhost:3000/json/products/";
export const PRODUCT_INFO_COMMENTS_URL = "http://localhost:3000/json/products_comments/";
export const CART_INFO_URL = "http://localhost:3000/json/user_cart/";
export const CART_BUY_URL = "http://localhost:3000/json/cart/buy.json";
export const EXT_TYPE = ".json";

export function getJSONData(url) {
    let result = {};
    return fetchWithLoader(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw Error(response.statusText);
            }
        })
        .then(function (response) {
            result.status = 'ok';
            result.data = response;
            return result;
        })
        .catch(function (error) {
            result.status = 'error';
            result.data = error;
            return result;
        });
}