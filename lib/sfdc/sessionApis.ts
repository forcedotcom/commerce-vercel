import { SFDC_COMMERCE_WEBSTORE_API_URL, SFDC_COMMERCE_WEBSTORE_ID, SESSION_CONTEXT_URL } from 'lib/constants';
import { makeSfdcApiCall } from './sfdcApiUtil';
import { HttpMethod } from 'lib/sfdc/sfdcApiUtil';

/**
 * Fetches the session context details from the SFDC API to determine if the user is a guest.
 * @returns {Promise<boolean>} True if the user is a guest, otherwise false.
 */
export async function fetchSessionContextDetails(): Promise<boolean> {
  let isGuestUser = null;
  try {
    const endpoint =
      SFDC_COMMERCE_WEBSTORE_API_URL + '/' + SFDC_COMMERCE_WEBSTORE_ID + SESSION_CONTEXT_URL;
    const response = await makeSfdcApiCall(endpoint, HttpMethod.GET);
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    isGuestUser = data?.guestUser;
  } catch (error) {
    console.error(`Error fetching session context details :`, error);
  }
  return isGuestUser;
} 