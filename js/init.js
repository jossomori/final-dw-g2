import { fetchWithLoader } from './loader.js';

export const CATEGORIES_URL = "https://japceibal.github.io/emercado-api/cats/cat.json";
export const PUBLISH_PRODUCT_URL = "https://japceibal.github.io/emercado-api/sell/publish.json";
export const PRODUCTS_URL = "https://japceibal.github.io/emercado-api/cats_products/";
export const PRODUCT_INFO_URL = "https://japceibal.github.io/emercado-api/products/";
export const PRODUCT_INFO_COMMENTS_URL = "https://japceibal.github.io/emercado-api/products_comments/";
export const CART_INFO_URL = "https://japceibal.github.io/emercado-api/user_cart/";
export const CART_BUY_URL = "https://japceibal.github.io/emercado-api/cart/buy.json";
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