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

/**
 * Env Vraibales
 */
// Commerce Webstore Site Url (https://abcd.my.site.com/abcd)
export const SFDC_COMMERCE_WEBSTORE_SITE_URL = process.env.SFDC_COMMERCE_WEBSTORE_SITE_URL;

// SFDC App Version (for ex: v64.0)
export const SFDC_COMMERCE_API_VERSION = process.env.SFDC_COMMERCE_API_VERSION;

// Webstore Name
export const SFDC_COMMERCE_WEBSTORE_NAME = process.env.SFDC_COMMERCE_WEBSTORE_NAME;

// Webstore Id
export const SFDC_COMMERCE_WEBSTORE_ID = process.env.SFDC_COMMERCE_WEBSTORE_ID;

// Site Id
export const SFDC_COMMERCE_WEBSTORE_SITE_ID = process.env.SFDC_COMMERCE_WEBSTORE_SITE_ID;

// Connected App Consumer Key (Clinet Id)
export const SALESFORCE_CONSUMER_KEY = process.env.SALESFORCE_CONSUMER_KEY;

// Connected App Consumer Secret (Clinet Secret)
export const SALESFORCE_CONSUMER_SECRET = process.env.SALESFORCE_CONSUMER_SECRET;

/**
 * Constant Vraibales
 */

// SFDC Auth Token Key
export const SFDC_AUTH_TOKEN_COOKIE_NAME = "sid";

// Guest UUID Essential Cookie Name
export const SFDC_GUEST_ESSENTIAL_ID_COOKIE_NAME = `guest_uuid_essential_${SFDC_COMMERCE_WEBSTORE_SITE_ID}`;

// Guest Cart Session Id Cookie Name
export const SFDC_GUEST_CART_SESSION_ID_COOKIE_NAME = `GuestCartSessionId_${SFDC_COMMERCE_WEBSTORE_ID}`;

export const IS_GUEST_USER_COOKIE_NAME = 'isGuestUser';

export const GUEST_COOKIE_AGE = 365 * 24 * 60 * 60; /* one year */

// CSRF Token
export const CSRF_TOKEN_COOKIE_NAME = 'csrf-token';

export const CART_ID_COOKIE_NAME = 'cartId';

/**
 * URLs
 */
// Auth URLs
export const SALESFORCE_LOGIN_URL = "https://login.salesforce.com/services/oauth2/token";

// SFDC Webruntime API URL (https://abcd.my.site.com/abcd/webruntime/api)
export const SFDC_SITE_WEBRUNTIME_URL = SFDC_COMMERCE_WEBSTORE_SITE_URL + '/webruntime';

// SFDC Webruntime API URL (https://abcd.my.site.com/abcd/webruntime/api)
export const SFDC_SITE_WEBRUNTIME_API_URL = SFDC_SITE_WEBRUNTIME_URL + '/api';

// SFDC Webruntime API URL (https://abcd.my.site.com/abcd/webruntime/api/services/data/v63.0)
const SFDC_SITE_SERVICE_DATA_API_URL = SFDC_SITE_WEBRUNTIME_API_URL + '/services/data/' + SFDC_COMMERCE_API_VERSION;

// SFDC Commerce Webstore URL
export const SFDC_COMMERCE_WEBSTORE_API_URL = SFDC_SITE_SERVICE_DATA_API_URL + "/commerce/webstores";

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

// Session Context URL
export const SESSION_CONTEXT_URL = "/session-context";

// Apex Execute URL
export const APEX_EXECUTE = '/apex/execute';

// CSRF Token URL
export const CSRF_TOKEN_URL = '/module/@app/csrfToken';