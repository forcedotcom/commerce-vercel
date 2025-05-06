import {
  CHILD_CATEGORIES_URL,
  PARENT_CATEGORIES_URL,
  SFDC_COMMERCE_WEBSTORE_API_URL,
  SFDC_COMMERCE_WEBSTORE_ID,
} from 'lib/constants';
import {
  Category,
  Collection,
} from './types';
import { makeSfdcApiCall } from './sfdcApiUtil';
import { cache } from 'react';
import { HttpMethod } from 'lib/sfdc/sfdcApiUtil';

// In-memory cache with TTL for getCategories
let categoriesCache: { data: Category[] | null; generatedAt: number } = { data: null, generatedAt: 0 };
const CATEGORIES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms

async function fetchParentCategories(): Promise<Category[]> {
  let results: Category[] = [];
  try {
    const endpoint =
      SFDC_COMMERCE_WEBSTORE_API_URL + '/' + SFDC_COMMERCE_WEBSTORE_ID + PARENT_CATEGORIES_URL;

    const response = await makeSfdcApiCall(endpoint, HttpMethod.GET);
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    results = extractParentCategories(data);
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
          categoryId: id, categoryName: fields.Name, numberOfProducts: fields.NumberOfProducts, path: `search/${id}`
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
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      return extractChildCategories(data, parent.categoryId, parent.categoryName || '');
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
        numberOfProducts: fields.NumberOfProducts,
        path: `search/${id}`
      });
    }
  });
  return Array.from(uniqueCategories.values());
}

/**
 * Returns a cached, sorted list of categories with products.
 * @returns {Promise<Category[]>} Sorted categories with products.
 */
export const getCategories = cache(async function getCategories(): Promise<Category[]> {
  const now = Date.now();
  if (categoriesCache.data && now - categoriesCache.generatedAt < CATEGORIES_CACHE_TTL) {
    return categoriesCache.data;
  }

  // get parent categories
  const parentCategories = await fetchParentCategories();

  // get child categories
  const childCategories = await fetchChildCategories(parentCategories);

  const allcategories = parentCategories.concat(childCategories);

  const sortedCategories = allcategories.sort((a, b) =>
    a.categoryName.localeCompare(b.categoryName)
  );

  categoriesCache = { data: sortedCategories, generatedAt: now };
  return sortedCategories;
});

/**
 * Returns a limited set of categories such that the total number of products does not exceed maxProducts.
 * This is used to limit the number of products displayed on the home page to increase the performance.
 * @param {Category[]} categories - The list of categories to filter.
 * @param {number} [maxProducts=10] - The maximum number of products to include.
 * @returns {Category[]} The limited set of categories.
 */
export function getLimitedCategories(categories: Category[], maxProducts = 3): Category[] {
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

/**
 * Fetches a single collection (category) by its handle or ID.
 * @param {string} handle - The category handle or ID.
 * @returns {Promise<Collection | undefined>} The collection object, or undefined if not found.
 */
export async function getCollection(handle: string): Promise<Collection | undefined> {
  return undefined;
}