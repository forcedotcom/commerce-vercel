import {
  CARTS_CURRENT_URL,
  CARTS_CURRENT_ITEMS_URL,
  CATEGORY_PRODUCTS_SEARCH_URL,
  CHILD_CATEGORIES_URL,
  PARENT_CATEGORIES_URL,
  PRODUCT_DETAILS_URL,
  PRODUCTS_PRICING_URL,
  TAGS,
  SFDC_COMMERCE_WEBSTORE_API_URL,
  SFDC_AUTH_TOKEN_COOKIE_NAME,
  SFDC_COMMERCE_WEBSTORE_ID,
  SFDC_GUEST_ESSENTIAL_ID_COOKIE_NAME,
  SFDC_GUEST_CART_SESSION_ID_COOKIE_NAME,
  SESSION_CONTEXT_URL,
  CSRF_TOKEN_COOKIE_NAME,
} from 'lib/constants';
import { revalidateTag } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  Cart,
  Collection,
  Menu,
  Page,
  Product,
  Category,
  ProductOption,
  PricingApiResponse,
  CartItem,
} from './types';
import { getCsrfTokenFromCookie, getGuestCartSessionUuid, getGuestEssentialUuidFromCookie, getIsGuestUserFromCookie, getSfdcAuthToken, setCartIdInCookie } from 'app/api/auth/authUtil';

export enum HttpMethod {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}


async function makeSfdcApiCall(endpoint: string, httpMethod: HttpMethod, body?: object, req?: NextRequest): Promise<any> {
  try {
    // get is guest user from cookie
    const isGuestUserHeader = req?.headers.get('x-guest-user') ?? null;
    const isGuestUser =
      isGuestUserHeader !== null
        ? JSON.parse(isGuestUserHeader)
        : await getIsGuestUserFromCookie();

    const headers = await setApiheaders(isGuestUser, httpMethod, endpoint, req);
    endpoint += endpoint.includes('?')
      ? `&isGuest=${isGuestUser ? 'true' : 'false'}`
      : `?isGuest=${isGuestUser ? 'true' : 'false'}`;


    const fetchOptions: RequestInit = {
      method: httpMethod,
      headers,
      body: body ? JSON.stringify(body) : null,
      credentials: 'include',
    };

    const response = await fetch(endpoint, fetchOptions);

    if (!response.ok) {
      console.error('HTTP error! ', response);
    }

    // extract guest cart session id from response and set it to cookie
    if (endpoint.match('carts')) {
      await extractGuestCartSessionIdFromResponseHeaders(response);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

async function setApiheaders(isGuestUser: boolean, httpMethod: HttpMethod, endpoint: string, req?: NextRequest) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Authenticated User
  if (!isGuestUser) {
    const cookies = [];
    const authToken = await getSfdcAuthToken();
    if (authToken) {
      cookies.push(`${SFDC_AUTH_TOKEN_COOKIE_NAME}=${authToken}`);
    }
    if (cookies.length) {
      headers['Cookie'] = cookies.join('; ');
    }
    const csrfToken = await getCsrfTokenFromCookie();
    if (csrfToken && endpoint.match('cart-items') && (httpMethod === HttpMethod.POST || httpMethod === HttpMethod.PATCH || httpMethod === HttpMethod.DELETE)) {
      headers[CSRF_TOKEN_COOKIE_NAME] = csrfToken;
    }
  }

  // Guest User
  if (isGuestUser) {
    const cookies = [];

    // add cart cookies in request headres
    if (endpoint.match('carts')) {
      const guestUuid =
        req?.headers.get('x-guest-uuid') ??
        (await getGuestEssentialUuidFromCookie());
      if (guestUuid) {
        cookies.push(`${SFDC_GUEST_ESSENTIAL_ID_COOKIE_NAME}=${guestUuid}`);
      }
      const guestCartSessionUuid = await getGuestCartSessionUuid(req);
      if (guestCartSessionUuid) {
        cookies.push(`${SFDC_GUEST_CART_SESSION_ID_COOKIE_NAME}=${guestCartSessionUuid}`);
      }
    }
    if (cookies.length) {
      headers['Cookie'] = cookies.join('; ');
    }
  }
  return headers;
}

async function extractGuestCartSessionIdFromResponseHeaders(response: any) {
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

export async function createCart(): Promise<Cart> {
  const endpoint =
    SFDC_COMMERCE_WEBSTORE_API_URL + '/' + SFDC_COMMERCE_WEBSTORE_ID + CARTS_CURRENT_URL;
  const response = await makeSfdcApiCall(endpoint, HttpMethod.PUT);
  return mapCart(response);
}

export async function addToCart(
  cartId: string | null,
  lines: { productId: string; quantity: number, type: string }
): Promise<Cart> {
  console.log('addToCart');
  const endpoint =
    SFDC_COMMERCE_WEBSTORE_API_URL + '/' + SFDC_COMMERCE_WEBSTORE_ID + CARTS_CURRENT_ITEMS_URL;
  const requestBody = {
    productId: lines.productId,
    quantity: lines.quantity,
    type: lines.type,
  };
  const response = await makeSfdcApiCall(endpoint, HttpMethod.POST, requestBody);

  // Add a 2-second delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  return mapCart(response);
}

export async function removeFromCart(cartId: string, cartItemId: string): Promise<void> {
  const endpoint =
    SFDC_COMMERCE_WEBSTORE_API_URL + '/' + SFDC_COMMERCE_WEBSTORE_ID + CARTS_CURRENT_ITEMS_URL + "/" + cartItemId;
  const response = await makeSfdcApiCall(endpoint, HttpMethod.DELETE);
}

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
  return mapCart(response);
}

export async function getCart(cartId: string | null): Promise<Cart | undefined> {
  const endpoint =
    SFDC_COMMERCE_WEBSTORE_API_URL + '/' + SFDC_COMMERCE_WEBSTORE_ID + CARTS_CURRENT_URL;
  const response = await makeSfdcApiCall(endpoint, HttpMethod.GET);

  // Old carts becomes `null` when you checkout.
  if (!response) {
    return undefined;
  }
  const cart: Cart = mapCart(response);
  if (cart && cart.id) {
    const cartItem: CartItem[] = await getCartItems(cart.id);
    cart.lines = cartItem;
  }
  return cart;
}

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

export async function getCartItems(cartId: string): Promise<CartItem[]> {
  const endpoint =
    SFDC_COMMERCE_WEBSTORE_API_URL + '/' + SFDC_COMMERCE_WEBSTORE_ID + CARTS_CURRENT_ITEMS_URL;
  const response = await makeSfdcApiCall(endpoint, HttpMethod.GET);
  let cartItems = [];
  if (response && response.cartItems) {
    cartItems = response.cartItems.map((cartItemWrapper: any) => mapCartItem(cartItemWrapper.cartItem))
  }
  return cartItems;
}

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

export async function getCollection(handle: string): Promise<Collection | undefined> {
  return undefined;
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  if (collection === 'hidden-homepage-featured-items' || collection === 'hidden-homepage-carousel') {
    // get products for home page
    const categoriesHavingProducts: Category[] = await getAllCategoriesHavingProducts();
    const sortedCategories = categoriesHavingProducts.sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName)
    );
    const limitedCategories = getLimitedCategories(sortedCategories);

    // get products from all categories
    let allProducts = await fetchCategoryProducts(limitedCategories);
    allProducts = await fetchProductsPricing(allProducts);
    return allProducts;
  } else {
    // get products from selected category (collection)
    const categories: Category[] = [
      {
        categoryId: collection,
        categoryName: ''
      }
    ]
    let categoryProducts = await fetchCategoryProducts(categories)
    categoryProducts = await fetchProductsPricing(categoryProducts);
    return categoryProducts;
  }
}

function getLimitedCategories(categories: Category[], maxProducts = 10): Category[] {
  let selectedCategories: Category[] = [];
  let totalProducts = 0;

  for (const category of categories) {
    const productsCount = Number(category.numberOfProducts); // Convert to number

    // Always include at least one category
    if (selectedCategories.length === 0 || totalProducts + productsCount <= maxProducts) {
      selectedCategories.push(category);
      totalProducts += productsCount;
    } else {
      break;
    }
  }

  return selectedCategories;
}


export async function getAllCategoryDetails() {
  // get parent categories
  const parentCategories = await fetchParentCategories();

  // get child categories
  const childCategories = await fetchChildCategories(parentCategories);

  const allcategories = parentCategories.concat(childCategories);
  return allcategories;
}

export async function getAllCategoriesHavingProducts(): Promise<Category[]> {
  const categories = await getAllCategoryDetails();
  const categoriesHavingProducts: Category[] = [];
  for (const cetagory of categories) {
    if (cetagory.numberOfProducts != null && cetagory.numberOfProducts > 0) {
      categoriesHavingProducts.push(cetagory);
    }
  }
  return categoriesHavingProducts;
}

async function fetchParentCategories(): Promise<Category[]> {
  let results: Category[] = [];
  try {
    const endpoint =
      SFDC_COMMERCE_WEBSTORE_API_URL + '/' + SFDC_COMMERCE_WEBSTORE_ID + PARENT_CATEGORIES_URL;

    const response = await makeSfdcApiCall(endpoint, HttpMethod.GET);
    results = extractParentCategories(response);
  } catch (error) {
    console.error(`Error fetching parent categories for store ${SFDC_COMMERCE_WEBSTORE_ID}:`, error);
  }
  return results;
}

function extractParentCategories(response: any): Category[] {
  const uniqueCategories: Map<string, Category> = new Map();
  if (response && response.productCategories) {
    response.productCategories.forEach((category: any) => {
      const { id, fields } = category;
      if (fields?.IsNavigational === 'true' && id && fields.Name) {
        uniqueCategories.set(id, {
          categoryId: id, categoryName: fields.Name, numberOfProducts: fields.NumberOfProducts
        });
      }
    });
  }
  return Array.from(uniqueCategories.values());
}

async function fetchChildCategories(parentCategories: Category[]): Promise<Category[]> {
  const fetchPromises = parentCategories.map(async (parent) => {
    try {
      const endpoint =
        SFDC_COMMERCE_WEBSTORE_API_URL +
        '/' +
        SFDC_COMMERCE_WEBSTORE_ID +
        CHILD_CATEGORIES_URL +
        parent.categoryId;

      const response = await makeSfdcApiCall(endpoint, HttpMethod.GET);
      return extractChildCategories(response, parent.categoryId, parent.categoryName);
    } catch (error) {
      console.error(`Error fetching child categories from parent category ${parent.categoryId}:`, error);
      return []; // Gracefully skip this parent
    }
  });

  const results = await Promise.all(fetchPromises);
  return results.flat(); // Flatten nested arrays into a single Category[]
}

function extractChildCategories(
  data: any,
  parentCategoryId: string,
  parentCategoryName: string
): Category[] {
  const uniqueCategories: Map<string, Category> = new Map();
  data.productCategories.forEach((category: any) => {
    const { id, fields } = category;
    if (id && fields.Name) {
      uniqueCategories.set(id, {
        categoryId: id,
        categoryName: fields.Name,
        parentCategoryId: parentCategoryId,
        parentCategoryName: parentCategoryName,
        numberOfProducts: fields.NumberOfProducts
      });
    }
  });
  return Array.from(uniqueCategories.values());
}

async function fetchCategoryProducts(categories: Category[]): Promise<Product[]> {
  const fetchPromises = categories.map(async (category) => {
    try {
      const endpoint =
        SFDC_COMMERCE_WEBSTORE_API_URL +
        '/' +
        SFDC_COMMERCE_WEBSTORE_ID +
        CATEGORY_PRODUCTS_SEARCH_URL +
        category.categoryId;

      const response = await makeSfdcApiCall(endpoint, HttpMethod.GET);
      return mapCategoryProductsToProduct(response);
    } catch (error) {
      console.error(`Error fetching products for category ${category.categoryId}:`, error);
      return []; // Skip on error
    }
  });

  const results = await Promise.all(fetchPromises);
  return results.flat(); // Flatten array of arrays
}

function mapCategoryProductsToProduct(apiResponse: any): Product[] {
  return apiResponse.productsPage.products.map((product: any) => ({
    id: product.id,
    title: product.name,
    description: product.fields?.Description?.value || "",
    handle: product.id,
    featuredImage: {
      url: product.defaultImage?.url || "",
      altText: product.defaultImage?.alternateText || "",
    }
  }));
}

async function fetchProductsPricing(products: Product[]): Promise<Product[]> {
  const pricingPromises = products.map(async (product) => {
    try {
      const pricingApiResponse = await fetchProductPricingDetails(product.id);
      return mapPricingToProduct(product, pricingApiResponse);
    } catch (error) {
      console.error(`Skipping pricing for product ${product.id} due to error.`);
      return product; // return product as-is if pricing fails
    }
  });

  const updatedProducts = await Promise.all(pricingPromises);
  return updatedProducts;
}

async function fetchProductPricingDetails(productId: string): Promise<PricingApiResponse> {
  try {
    const endpoint = `${SFDC_COMMERCE_WEBSTORE_API_URL}/${SFDC_COMMERCE_WEBSTORE_ID}${PRODUCTS_PRICING_URL}${productId}`;
    const response = await makeSfdcApiCall(endpoint, HttpMethod.GET);
    if (!response?.success || !response.pricingLineItemResults?.length) {
      throw new Error("Invalid response or no pricing data available");
    }
    const pricingData = response.pricingLineItemResults[0];
    return {
      unitPrice: pricingData.unitPrice,
      listPrice: pricingData.listPrice,
      currencyIsoCode: response.currencyIsoCode,
    };
  } catch (error) {
    console.error(`Error fetching product pricing details for product ${productId}:`, error);
    throw error;
  }
}



function mapPricingToProduct(product: Product, pricingResponse: PricingApiResponse): Product {
  product.priceRange = {
    maxVariantPrice: {
      amount: pricingResponse.unitPrice,
      currencyCode: pricingResponse.currencyIsoCode,
    },
    minVariantPrice: {
      amount: pricingResponse.listPrice,
      currencyCode: pricingResponse.currencyIsoCode,
    },
  };
  return product;
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  return await fetchProductDetails(handle);
}

async function fetchProductDetails(productId: string): Promise<any> {
  try {
    const productDetailsPromise = (async () => {
      const endpoint =
        SFDC_COMMERCE_WEBSTORE_API_URL + '/' +
        SFDC_COMMERCE_WEBSTORE_ID +
        PRODUCT_DETAILS_URL + '/' +
        productId;

      const response = await makeSfdcApiCall(endpoint, HttpMethod.GET);
      return { rawResponse: response, details: extractProductDetails(response) };
    })();

    const pricingPromise = fetchProductPricingDetails(productId);

    // Run both in parallel
    const [{ rawResponse, details }, pricingApiResponse] = await Promise.all([
      productDetailsPromise,
      pricingPromise,
    ]);

    const productWithPricing = mapPricingToProduct(details, pricingApiResponse);
    productWithPricing.variants = extractProductVariants(rawResponse, pricingApiResponse);

    return productWithPricing;

  } catch (error) {
    console.error(`Error fetching product details for ${productId}:`, error);
    return undefined;
  }
}


function extractProductDetails(apiResponse: any): any {
  return {
    availableForSale: true,
    id: apiResponse.id,
    title: apiResponse.fields.Name,
    description: apiResponse.fields?.Description || "",
    featuredImage: {
      url: apiResponse.defaultImage?.url || "",
      altText: apiResponse.defaultImage?.alternateText || "",
    },
    images: [{
      url: apiResponse.defaultImage?.url,
      altText: apiResponse.defaultImage?.alternateText,
    }],
    options: extractProductOptions(apiResponse),
    tags: [],
    seo: {
      title: apiResponse.fields.name,
      description: ''
    }
  };
}

function extractProductOptions(apiResponse: any): ProductOption[] {
  return Object.values(apiResponse.attributeSetInfo || {})
    .flatMap((attributeSet: any) =>
      Object.values(attributeSet.attributeInfo || {}).map((attribute: any) => ({
        id: attribute.fieldEnumOrId,
        name: attribute.label,
        values: attribute.options.map((option: any) => option.label),
      }))
    );
}

function extractProductVariants(apiResponse: any, pricingApiResponse: PricingApiResponse): any[] {
  const productVariants = apiResponse.attributeSetInfo ? [] : [
    {
      id: apiResponse.id,
      selectedOptions: [],
      price: {
        amount: pricingApiResponse.unitPrice,
        currencyCode: pricingApiResponse.currencyIsoCode
      }
    },
  ]
  return productVariants;
}

export async function getCollections(): Promise<Collection[]> {
  const categoriesHavingProducts: Category[] = await getAllCategoriesHavingProducts();
  const sortedCategories = categoriesHavingProducts.sort((a, b) =>
    a.categoryName.localeCompare(b.categoryName)
  );
  const categoryAsCollections: Collection[] = sortedCategories.map((obj) => ({
    title: obj.categoryName,
    handle: '',
    description: obj.categoryName,
    seo: {
      title: obj.categoryName,
      description: obj.categoryName
    },
    path: `/search/${obj.categoryId}`,
    updatedAt: new Date().toISOString()
  }));
  return categoryAsCollections;
}

export async function getMenu(handle: string): Promise<Menu[]> {
  const categoriesHavingProducts: Category[] = await getAllCategoriesHavingProducts();
  const sortedCategories = categoriesHavingProducts.sort((a, b) =>
    a.categoryName.localeCompare(b.categoryName)
  );
  const categoryAsMenueItems = sortedCategories.map(({ categoryId, categoryName }) => ({
    title: categoryName,
    path: `search/${categoryId}`,
  }));
  if (handle === 'next-js-frontend-footer-menu' || handle === 'next-js-frontend-header-menu') {
    return categoryAsMenueItems.slice(0, 3);
  }
  return categoryAsMenueItems;
}

export async function getPage(handle: string): Promise<Page | undefined> {
  return undefined;
}

export async function getPages(): Promise<Page[]> {
  return [];
}

export async function getProductRecommendations(productId: string): Promise<Product[]> {
  return [];
}

export async function getProducts({
  query,
  reverse,
  sortKey
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  return [];
}

export async function fetchSessionContextDetails(): Promise<boolean> {
  let isGuestUser = null;
  try {
    const endpoint =
      SFDC_COMMERCE_WEBSTORE_API_URL + '/' + SFDC_COMMERCE_WEBSTORE_ID + SESSION_CONTEXT_URL;
    const response = await makeSfdcApiCall(endpoint, HttpMethod.GET);
    isGuestUser = response.guestUser
  } catch (error) {
    console.error(`Error fetching session context details :`, error);
  }
  return isGuestUser;
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: NextRequest): Promise<NextResponse> {
  // We always need to respond with a 200 status code to Shopify,
  // otherwise it will continue to retry the request.
  const collectionWebhooks = ['collections/create', 'collections/delete', 'collections/update'];
  const productWebhooks = ['products/create', 'products/delete', 'products/update'];
  const topic = (await headers()).get('x-shopify-topic') || 'unknown';
  const secret = req.nextUrl.searchParams.get('secret');
  const isCollectionUpdate = collectionWebhooks.includes(topic);
  const isProductUpdate = productWebhooks.includes(topic);

  if (!secret || secret !== process.env.SHOPIFY_REVALIDATION_SECRET) {
    console.error('Invalid revalidation secret.');
    return NextResponse.json({ status: 401 });
  }

  if (!isCollectionUpdate && !isProductUpdate) {
    // We don't need to revalidate anything for any other topics.
    return NextResponse.json({ status: 200 });
  }

  if (isCollectionUpdate) {
    revalidateTag(TAGS.collections);
  }

  if (isProductUpdate) {
    revalidateTag(TAGS.products);
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}
