export default {
  images: {
    domains: ['s3.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'alpinecommerce32.my.site.com',
        pathname: '/**',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  }
};