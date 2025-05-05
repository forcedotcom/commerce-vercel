// Build-time environment variable validation
const requiredEnvironmentVariables = [
  'SFDC_COMMERCE_API_VERSION',
  'SFDC_COMMERCE_WEBSTORE_ID',
  'SFDC_COMMERCE_WEBSTORE_NAME',
  'SFDC_COMMERCE_WEBSTORE_SITE_ID',
  'SFDC_COMMERCE_WEBSTORE_SITE_URL'
];
const missingEnvironmentVariables = requiredEnvironmentVariables.filter(envVar => !process.env[envVar]);

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

export default {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'alpinecommerce32.my.site.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        pathname: '/**',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  }
};