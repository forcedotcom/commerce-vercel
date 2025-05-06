import {
    CATEGORY_PRODUCTS_SEARCH_URL,
    PRODUCT_DETAILS_URL,
    PRODUCTS_PRICING_URL,
    SFDC_COMMERCE_WEBSTORE_API_URL,
    SFDC_COMMERCE_WEBSTORE_ID,
} from 'lib/constants';
import {
    Product,
    Category,
    ProductOption,
    PricingApiResponse,
} from './types';
import { makeSfdcApiCall } from './sfdcApiUtil';
import { HttpMethod } from 'lib/sfdc/sfdcApiUtil';

/**
 * Fetches products for the given categories from the SFDC API.
 * @param {Object} params - The parameters object.
 * @param {Category[]} params.categories - The categories to fetch products for.
 * @param {boolean} [params.reverse] - Whether to reverse the product order.
 * @param {string} [params.sortKey] - The key to sort products by.
 * @returns {Promise<Product[]>} An array of products.
 */
export async function getProductsByCategories({
    categories,
    reverse,
    sortKey,
}: {
    categories: Category[];
    reverse?: boolean;
    sortKey?: string;
}): Promise<Product[]> {
    // Fetch products based on categories (inline logic from fetchCategoryProducts)
    const productPromises = categories.map(async (category) => {
        try {
            const endpoint =
                SFDC_COMMERCE_WEBSTORE_API_URL +
                '/' +
                SFDC_COMMERCE_WEBSTORE_ID +
                CATEGORY_PRODUCTS_SEARCH_URL +
                category.categoryId + '&pageSize=3';

            const response = await makeSfdcApiCall(endpoint, HttpMethod.GET);
            const text = await response.text();
            const data = text ? JSON.parse(text) : null;
            return mapCategoryProductsToProduct(data);
        } catch (error) {
            console.error(`Error fetching products for category ${category.categoryId}:`, error);
            return [];
        }
    });

    const categoryProductsArrays = await Promise.all(productPromises);
    const categoryProducts = categoryProductsArrays.flat();

    // Then fetch pricing for those products
    const pricingData = await fetchProductsPricing(categoryProducts.map(product => product.id));

    // Merge pricing data with products
    const result = categoryProducts.map(product => ({
        ...product,
        priceRange: pricingData ? pricingData[product.id] : undefined
    }));
    return result;
}

async function fetchProductsPricing(productIds: string[]): Promise<Record<string, any>> {
    const pricingData: Record<string, any> = {};
    const endpoint = `${SFDC_COMMERCE_WEBSTORE_API_URL}/${SFDC_COMMERCE_WEBSTORE_ID}${PRODUCTS_PRICING_URL}${productIds}`;
    const response = await makeSfdcApiCall(endpoint, HttpMethod.GET);
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (data && Array.isArray(data.pricingLineItemResults)) {
        for (const item of data.pricingLineItemResults) {
            pricingData[item.productId] = {
                minVariantPrice: {
                    amount: item.listPrice,
                    currencyCode: data.currencyIsoCode || 'USD',
                },
                maxVariantPrice: {
                    amount: item.unitPrice,
                    currencyCode: data.currencyIsoCode || 'USD',
                },
            };
        }
    }
    return pricingData;
}

function mapCategoryProductsToProduct(apiResponse: any): Product[] {
    if (!apiResponse || !apiResponse.productsPage) {
        return [];
    }
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

function mapPricingToProduct(product: Product, pricingResponse: PricingApiResponse): Product {
    product.priceRange = {
        maxVariantPrice: {
            amount: pricingResponse.unitPrice,
            currencyCode: pricingResponse.currencyIsoCode
        },
        minVariantPrice: {
            amount: pricingResponse.listPrice,
            currencyCode: pricingResponse.currencyIsoCode
        }
    };
    return product;
}

/**
 * Fetches a single product by its handle or ID from the SFDC API.
 * @param {string} handle - The product handle or ID.
 * @returns {Promise<Product | undefined>} The product object, or undefined if not found.
 */
export async function getProduct(handle: string): Promise<Product | undefined> {
    const productId = handle;
    try {
        // Prepare endpoints
        const productDetailsEndpoint =
            SFDC_COMMERCE_WEBSTORE_API_URL + '/' +
            SFDC_COMMERCE_WEBSTORE_ID +
            PRODUCT_DETAILS_URL +
            '/' +
            productId;

        // Fetch product details and pricing in parallel
        const [productDetailsResponse, pricingBatch] = await Promise.all([
            makeSfdcApiCall(productDetailsEndpoint, HttpMethod.GET),
            fetchProductsPricing([productId])
        ]);
        const detailsText = await productDetailsResponse.text();
        const detailsData = detailsText ? JSON.parse(detailsText) : null;
        const details = extractProductDetails(detailsData);
        const pricingApiResponse = pricingBatch[productId] ? {
            unitPrice: pricingBatch[productId].maxVariantPrice.amount,
            listPrice: pricingBatch[productId].minVariantPrice.amount,
            currencyIsoCode: pricingBatch[productId].maxVariantPrice.currencyCode,
        } : {
            unitPrice: '0',
            listPrice: '0',
            currencyIsoCode: 'USD',
        };

        const productWithPricing = mapPricingToProduct(details, pricingApiResponse);
        productWithPricing.variants = extractProductVariants(detailsData, pricingApiResponse);

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

/**
 * Fetches products based on a search query, sort key, and order from the SFDC API.
 * @param {Object} params - The parameters object.
 * @param {string} [params.query] - The search query.
 * @param {boolean} [params.reverse] - Whether to reverse the product order.
 * @param {string} [params.sortKey] - The key to sort products by.
 * @returns {Promise<Product[]>} An array of products.
 */
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