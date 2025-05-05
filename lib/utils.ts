import { ReadonlyURLSearchParams } from 'next/navigation';

export const createUrl = (pathname: string, params: URLSearchParams | ReadonlyURLSearchParams) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? '?' : ''}${paramsString}`;

  return `${pathname}${queryString}`;
};

export const ensureStartsWith = (stringToCheck: string, startsWith: string) =>
  stringToCheck.startsWith(startsWith) ? stringToCheck : `${startsWith}${stringToCheck}`;

export const validateEnvironmentVariables = () => {
  const requiredEnvironmentVariables = [
    'SFDC_COMMERCE_API_VERSION',
    'SFDC_COMMERCE_WEBSTORE_ID',
    'SFDC_COMMERCE_WEBSTORE_NAME',
    'SFDC_COMMERCE_WEBSTORE_SITE_ID',
    'SFDC_COMMERCE_WEBSTORE_SITE_URL'
  ];
  const missingEnvironmentVariables = [] as string[];

  requiredEnvironmentVariables.forEach((envVar) => {
    if (!process.env[envVar]) {
      missingEnvironmentVariables.push(envVar);
    }
  });

  if (missingEnvironmentVariables.length) {
    throw new Error(
      `The following environment variables are missing. Your site will not work without them.\n\n${missingEnvironmentVariables.join('\n')}\n`
    );
  }

  if (
    process.env.SFDC_COMMERCE_WEBSTORE_SITE_URL?.includes('[') ||
    process.env.SFDC_COMMERCE_WEBSTORE_SITE_URL?.includes(']')
  ) {
    throw new Error(
      'Your `SFDC_COMMERCE_WEBSTORE_SITE_URL` environment variable includes brackets (ie. `[` and / or `]`). Your site will not work with them there. Please remove them.'
    );
  }
};
