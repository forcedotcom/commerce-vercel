import {
  CARTS_CURRENT_URL,
  CARTS_CURRENT_ITEMS_URL,
  SFDC_COMMERCE_WEBSTORE_API_URL,
  SFDC_COMMERCE_WEBSTORE_ID,
  SFDC_GUEST_CART_SESSION_ID_COOKIE_NAME
} from 'lib/constants';
import { Cart, CartItem } from './types';
import { makeSfdcApiCall, HttpMethod } from './sfdcApiUtil';
import { cookies } from 'next/headers';

/**
 * Creates a new cart and stores the guest cart session ID in cookies if present in the response headers.
 * @returns {Promise<Cart>} The newly created cart object.
 */
export async function createCart(): Promise<Cart> {
  const endpoint =
    SFDC_COMMERCE_WEBSTORE_API_URL + '/' + SFDC_COMMERCE_WEBSTORE_ID + CARTS_CURRENT_URL;
  const response = await makeSfdcApiCall(endpoint, HttpMethod.PUT);
  await extractGuestCartSessionIdFromResponseHeaders(response);
  const text = await response.text();
  return mapCart(text ? JSON.parse(text) : null);
}

/**
 * Adds a product to the cart.
 * @param {{ productId: string; quantity: number; type: string }} lines - The product details to add.
 * @returns {Promise<Cart>} The updated cart object.
 */
export async function addToCart(
  lines: { productId: string; quantity: number, type: string }
): Promise<Cart> {
  const endpoint =
    SFDC_COMMERCE_WEBSTORE_API_URL + '/' + SFDC_COMMERCE_WEBSTORE_ID + CARTS_CURRENT_ITEMS_URL;
  const requestBody = {
    productId: lines.productId,
    quantity: lines.quantity,
    type: lines.type,
  };
  const response = await makeSfdcApiCall(endpoint, HttpMethod.POST, requestBody);
  // Add a 2-second delay
  await new Promise(resolve => setTimeout(resolve, 4000));
  const text = await response.text();
  return mapCart(text ? JSON.parse(text) : null);
}

/**
 * Removes a product from the cart.
 * @param {string} cartItemId - The ID of the cart item to remove.
 * @returns {Promise<Cart>} The updated cart object.
 */
export async function removeFromCart(cartItemId: string): Promise<void> {
  const endpoint =
    SFDC_COMMERCE_WEBSTORE_API_URL + '/' + SFDC_COMMERCE_WEBSTORE_ID + CARTS_CURRENT_ITEMS_URL + "/" + cartItemId;
  await makeSfdcApiCall(endpoint, HttpMethod.DELETE);
}

/**
 * Updates the quantity of a product in the cart.
 * @param {string} cartItemId - The ID of the cart item to update.
 * @param {number} quantity - The new quantity.
 * @returns {Promise<Cart>} The updated cart object.
 */
export async function updateCart(
  cartItemId: string,
  quantity: number
): Promise<Cart> {
  const endpoint =
    SFDC_COMMERCE_WEBSTORE_API_URL + '/' + SFDC_COMMERCE_WEBSTORE_ID + CARTS_CURRENT_ITEMS_URL + "/" + cartItemId;
  const requestBody = {
    quantity: quantity
  };
  const response = await makeSfdcApiCall(endpoint, HttpMethod.PATCH, requestBody);
  const text = await response.text();
  return mapCart(text ? JSON.parse(text) : null);
}

/**
 * Retrieves the current cart and its items.
 * @returns {Promise<Cart | undefined>} The cart object, or undefined if not found.
 */
export async function getCart(): Promise<Cart | undefined> {
  const endpoint =
    SFDC_COMMERCE_WEBSTORE_API_URL + '/' + SFDC_COMMERCE_WEBSTORE_ID + CARTS_CURRENT_URL;
  const cartResponse = await makeSfdcApiCall(endpoint, HttpMethod.GET);
  const cartItems = await getCartItems();
  const text = await cartResponse.text();
  if (!text) {
    return undefined;
  }
  const cart: Cart = mapCart(JSON.parse(text));
  if (cart && cart.id) {
    cart.lines = cartItems;
  }
  return cart;
}

/**
 * Retrieves all items in the current cart.
 * @returns {Promise<CartItem[]>} An array of cart items.
 */
export async function getCartItems(): Promise<CartItem[]> {
  const endpoint =
    SFDC_COMMERCE_WEBSTORE_API_URL + '/' + SFDC_COMMERCE_WEBSTORE_ID + CARTS_CURRENT_ITEMS_URL;
  const response = await makeSfdcApiCall(endpoint, HttpMethod.GET);
  const text = await response.text();
  let cartItems = [];
  const data = text ? JSON.parse(text) : null;
  if (data && data.cartItems) {
    cartItems = data.cartItems.map((cartItemWrapper: any) => mapCartItem(cartItemWrapper.cartItem))
  }
  return cartItems;
}

/**
 * Maps the raw API response to a Cart object.
 * @param {any} response - The raw API response.
 * @returns {Cart} The mapped cart object.
 */
function mapCart(response: any): Cart {
  const cart: Cart = {
    id: response?.cartId,
    checkoutUrl: "",
    cost: {
      subtotalAmount: { amount: "0", currencyCode: response?.currencyIsoCode },
      totalAmount: { amount: response?.grandTotalAmount, currencyCode: response?.currencyIsoCode },
      totalTaxAmount: { amount: response?.totalTaxAmount, currencyCode: response?.currencyIsoCode },
    },
    lines: [],
    totalQuantity: Number(response?.totalProductCount) || 0
  };
  return cart;
}

/**
 * Maps the raw API cart item to a CartItem object.
 * @param {any} apiCartItem - The raw API cart item.
 * @returns {CartItem} The mapped cart item object.
 */
function mapCartItem(apiCartItem: any): CartItem {
  return {
    id: apiCartItem.cartItemId,
    quantity: parseInt(apiCartItem.quantity, 10),
    cost: {
      totalAmount: {
        amount: apiCartItem.totalAmount,
        currencyCode: apiCartItem.currencyIsoCode
      }
    },
    merchandise: {
      id: apiCartItem.productId,
      title: apiCartItem.name,
      selectedOptions: Object.entries(apiCartItem.productDetails.variationAttributes || {}).map(([key, value]: [string, any]) => ({
        name: value.label,
        value: value.value
      })),
      product: {
        id: apiCartItem.productDetails.productId,
        handle: "", // No equivalent field in the API response
        title: apiCartItem.productDetails.name,
        featuredImage: {
          url: apiCartItem.productDetails.thumbnailImage.url,
          altText: apiCartItem.productDetails.thumbnailImage.alternateText,
          width: 0,
          height: 0
        }
      }
    }
  };
}

/**
 * Extracts the guest cart session ID from the response headers and stores it in cookies (server-side only).
 * @param {any} response - The fetch response object.
 */
export async function extractGuestCartSessionIdFromResponseHeaders(response: any) {
  const setCookieHeaders = response.headers?.get('set-cookie') || '';
  let guestCartSessionId = '';
  if (typeof window === 'undefined' && setCookieHeaders) {
    const match = setCookieHeaders.match(new RegExp(`GuestCartSessionId_${SFDC_COMMERCE_WEBSTORE_ID}=([^;]+)`));
    if (match) {
      guestCartSessionId = match[1] ? match[1] : '';
      (await cookies()).set({
        name: SFDC_GUEST_CART_SESSION_ID_COOKIE_NAME,
        value: guestCartSessionId,
        httpOnly: true,
        secure: true,
        path: '/',
      });
    }
  }
} 