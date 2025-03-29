export type SortFilterItem = {
  title: string;
  slug: string | null;
  sortKey: 'RELEVANCE' | 'BEST_SELLING' | 'CREATED_AT' | 'PRICE';
  reverse: boolean;
};

export const defaultSort: SortFilterItem = {
  title: 'Relevance',
  slug: null,
  sortKey: 'RELEVANCE',
  reverse: false
};

export const sorting: SortFilterItem[] = [
  defaultSort,
  { title: 'Trending', slug: 'trending-desc', sortKey: 'BEST_SELLING', reverse: false }, // asc
  { title: 'Latest arrivals', slug: 'latest-desc', sortKey: 'CREATED_AT', reverse: true },
  { title: 'Price: Low to high', slug: 'price-asc', sortKey: 'PRICE', reverse: false }, // asc
  { title: 'Price: High to low', slug: 'price-desc', sortKey: 'PRICE', reverse: true }
];

export const TAGS = {
  collections: 'collections',
  products: 'products',
  cart: 'cart'
};

export const HIDDEN_PRODUCT_TAG = 'nextjs-frontend-hidden';
export const DEFAULT_OPTION = 'Default Title';

// SFDC Auth Token Key
export const SFDC_AUTH_TOKEN_KEY = "sfdc_auth_token";

// SFDC Domain URL (for ex: https://alpinecommerce32.my.salesforce.com)
const SFDC_DOMAIN_URL = process.env.SFDC_DOMAIN_URL;

// SFDC App Version (for ex: v64.0)
const SFDC_COMMERCE_API_VERSION = process.env.SFDC_COMMERCE_API_VERSION;

// Auth URLs
export const SALESFORCE_AUTH_URL = SFDC_DOMAIN_URL + "/services/oauth2/authorize";
export const SALESFORCE_TOKEN_URL= SFDC_DOMAIN_URL + "/services/oauth2/token";
export const  SALESFORCE_USERINFO_URL = SFDC_DOMAIN_URL + "s/ervices/oauth2/userinfo";

// SFDC Public API URL
export const SFDC_SERVICES_ENDPOINT = '/services/data/' + SFDC_COMMERCE_API_VERSION;

// SFDC Commerce Webstore URL
export const SFDC_COMMERCE_WEBSTORE_URL = SFDC_DOMAIN_URL + SFDC_SERVICES_ENDPOINT + "/commerce/webstores";

// SFDC Categories URLs
export const SFDC_STORE_PARENT_CATEGORIES_ENDPOINT = "/product-categories/children";
export const SFDC_STORE_CHILD_CATEGORIES_ENDPOINT = "/product-categories/children?parentProductCategoryId=";
export const SFDC_STORE_CATEGORY_PRODUCTS_SEARCH_ENDPOINT = "/search/products?categoryId=";

// SFDC Products URLs
export const SFDC_STORE_PRODUCTS_PRICING_ENDPOINT = "/pricing/products?productIds=";
export const SFDC_STORE_PRODUCT_DETAILS_ENDPOINT = "/products";

// SFDC Cart URLs
export const CARTS_URL = "/carts";
export const CARTS_CURRENT_URL = CARTS_URL + "/current";
export const CARTS_CURRENT_ITEMS_URL = CARTS_CURRENT_URL + "/cart-items";
