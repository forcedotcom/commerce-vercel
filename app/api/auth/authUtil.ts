import { cookies } from 'next/headers';
import { SFDC_AUTH_TOKEN_KEY } from '../../../lib/constants';

export async function getSfdcAuthToken(): Promise<string | undefined> {
    return (await cookies()).get(SFDC_AUTH_TOKEN_KEY)?.value || undefined;
}

export async function deleteSfdcAuthToken(): Promise<void> {
    (await cookies()).delete(SFDC_AUTH_TOKEN_KEY);
}
