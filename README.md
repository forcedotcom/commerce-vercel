# Salesforce Vercel Integration

A high-performance, server-rendered Next.js App Router ecommerce application integrated with Salesforce Commerce Cloud.

This template uses React Server Components, Server Actions, `Suspense`, `useOptimistic`, and more.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fcommerce&project-name=commerce&repo-name=commerce&demo-title=Next.js%20Commerce&demo-url=https%3A%2F%2Fdemo.vercel.store&demo-image=https%3A%2F%2Fbigcommerce-demo-asset-ksvtgfvnd.vercel.app%2Fbigcommerce.png&env=COMPANY_NAME,SHOPIFY_REVALIDATION_SECRET,SHOPIFY_STORE_DOMAIN,SHOPIFY_STOREFRONT_ACCESS_TOKEN,SITE_NAME,TWITTER_CREATOR,TWITTER_SITE)

## About

This repository contains the integration between Salesforce Commerce Cloud and Vercel's Next.js Commerce template. It provides a foundation for building high-performance e-commerce applications using Next.js while leveraging Salesforce's powerful backend capabilities.

> **NOTE** This README contains detailed information about both the Salesforce integration and the underlying Next.js Commerce template.

## Providers

This implementation uses Salesforce Commerce Cloud as the primary commerce provider, while maintaining compatibility with the original Next.js Commerce template structure.

The original template supports various providers:

- Shopify (original template)
- [BigCommerce](https://github.com/bigcommerce/nextjs-commerce)
- [Ecwid by Lightspeed](https://github.com/Ecwid/ecwid-nextjs-commerce/)
- [Geins](https://github.com/geins-io/vercel-nextjs-commerce)
- [Medusa](https://github.com/medusajs/vercel-commerce)
- [Prodigy Commerce](https://github.com/prodigycommerce/nextjs-commerce)
- [Saleor](https://github.com/saleor/nextjs-commerce)
- [Shopware](https://github.com/shopwareLabs/vercel-commerce)
- [Swell](https://github.com/swellstores/verswell-commerce)
- [Umbraco](https://github.com/umbraco/Umbraco.VercelCommerce.Demo)
- [Wix](https://github.com/wix/nextjs-commerce)
- [Fourthwall](https://github.com/FourthwallHQ/vercel-commerce)

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js Commerce. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control your store.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app should now be running on [localhost:3000](http://localhost:3000/).

## Integration Guide

You can use the comprehensive integration guides for both:
- [Vercel and Shopify Integration](https://vercel.com/docs/integrations/ecommerce/shopify)
- [Salesforce Commerce Cloud Integration](https://developer.salesforce.com/docs/commerce/commerce-api/guide/get-started.html)
