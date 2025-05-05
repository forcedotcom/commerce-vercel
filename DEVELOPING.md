# Development Guide

This guide will help you set up your development environment for working with the Commerce-Vercel project.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- [pnpm](https://pnpm.io/) (Package manager)
- [Git](https://git-scm.com/)

## Environment Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/forcedotcom/commerce-vercel.git
   cd commerce-vercel
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Set Up Environment Variables**
   
   Create a `.env` file in the root directory with the following variables:

   ```bash
   # API Version
   SFDC_COMMERCE_API_VERSION = v64.0

   # 15 digit store id
   SFDC_COMMERCE_WEBSTORE_ID = 0ZE000000000000

   # Store Name
   SFDC_COMMERCE_WEBSTORE_NAME = Commerce Store

   # 15 digit site id
   SFDC_COMMERCE_WEBSTORE_SITE_ID = 0DM000000000000

   # SFDC Commerce Store Site URL
   SFDC_COMMERCE_WEBSTORE_SITE_URL = https://abcd.my.site.com/abcdstore
   ```

   > **IMPORTANT**: Never commit your `.env` file to version control. It contains sensitive information.

4. **(Optional) Vercel Deployment Setup**

   If you have deployed or plan to deploy your application on Vercel, you can use the Vercel CLI to manage your environment variables:

   a. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

   b. Link with Vercel:
   ```bash
   vercel link
   ```
   This will create a `.vercel` directory and link your local instance with Vercel and GitHub accounts.

   c. Pull Environment Variables:
   ```bash
   vercel env pull
   ```
   This will download your environment variables from Vercel.

   > Note: Steps 4a-c are optional and only required if you're using Vercel for deployment. If you're developing locally, manually creating the `.env` file (step 3) is sufficient.

## Running Locally

1. **Start the Development Server**
   ```bash
   pnpm dev
   ```
   This will start the development server with Turbopack.

2. **Access the Application**
   
   Your app should now be running on [http://localhost:3000](http://localhost:3000)

## Development Workflow

1. **Create a New Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the coding standards in the [CONTRIBUTING.md](CONTRIBUTING.md) file
   - Ensure your code is well-documented
   - Add tests for new features

3. **Run Tests**
   ```bash
   pnpm test
   ```

4. **Format Your Code**
   ```bash
   pnpm prettier
   ```

## Building for Production

To create a production build:

```bash
pnpm build
```

To start the production server:

```bash
pnpm start
```

## Project Structure

- `/app` - Next.js application routes and pages
- `/components` - React components
- `/lib` - Utility functions and shared code
- `/public` - Static assets
- `/styles` - CSS and styling files

## Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Create production build
- `pnpm start` - Start production server
- `pnpm prettier` - Format code
- `pnpm prettier:check` - Check code formatting
- `pnpm test` - Run tests

## Troubleshooting

### Common Issues

1. **Environment Variables Missing**
   - Ensure all required environment variables are set in your `.env` file
   - Run `vercel env pull` to fetch the latest environment variables

2. **Build Errors**
   - Make sure all dependencies are installed: `pnpm install`
   - Clear the Next.js cache: `rm -rf .next`
   - Ensure you're using the correct Node.js version

3. **API Connection Issues**
   - Verify your Salesforce Commerce Cloud credentials
   - Check the API endpoint URLs in your environment variables
   - Ensure your network can reach the Salesforce Commerce Cloud endpoints

## Getting Help

If you run into issues:

1. Check the [Issues](https://github.com/forcedotcom/commerce-vercel/issues) page for similar problems
2. Join our [GitHub Discussions](https://github.com/forcedotcom/commerce-vercel/discussions)
3. Create a new issue if you can't find a solution

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Salesforce Commerce Cloud Documentation](https://developer.salesforce.com/docs/commerce/commerce-cloud)

## Comprehensive SFDC API Endpoint Reference

This project interacts with Salesforce Commerce Cloud (SFDC) using the following API endpoints:

| #  | API Name                                         | HTTP Method | Endpoint URL                                                                                                                                                                                                 | REST API Reference |
|----|--------------------------------------------------|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------|
| 1  | Get Parent Categories                            | GET         | {SFDC_COMMERCE_WEBSTORE_SITE_URL}/webruntime/api/services/data/{SFDC_COMMERCE_API_VERSION}/commerce/webstores/{SFDC_COMMERCE_WEBSTORE_ID}/product-categories/children                                      | [Commerce Webstore Product Categories Children](https://developer.salesforce.com/docs/atlas.en-us.chatterapi.meta/chatterapi/connect_resources_commerce_webstore_product_categories_children.htm) |
| 2  | Get child categories based on given parent category id | GET         | {SFDC_COMMERCE_WEBSTORE_SITE_URL}/webruntime/api/services/data/{SFDC_COMMERCE_API_VERSION}/commerce/webstores/{SFDC_COMMERCE_WEBSTORE_ID}/product-categories/children?parentProductCategoryId={PARENT_CATEGORY_ID} | [Commerce Webstore Product Category](https://developer.salesforce.com/docs/atlas.en-us.chatterapi.meta/chatterapi/connect_resources_commerce_webstore_product_category.htm) |
| 3  | Get product details based on given category id    | GET         | {SFDC_COMMERCE_WEBSTORE_SITE_URL}/webruntime/api/services/data/{SFDC_COMMERCE_API_VERSION}/commerce/webstores/{SFDC_COMMERCE_WEBSTORE_ID}/search/products?categoryId={CATEGORY_ID}&pageSize=10              | [Commerce Webstore Search Products](https://developer.salesforce.com/docs/atlas.en-us.chatterapi.meta/chatterapi/connect_resources_commerce_webstore_search_products.htm) |
| 4  | Get product pricing details based on given product ids | GET         | {SFDC_COMMERCE_WEBSTORE_SITE_URL}/webruntime/api/services/data/{SFDC_COMMERCE_API_VERSION}/commerce/webstores/{SFDC_COMMERCE_WEBSTORE_ID}/pricing/products?productIds={LIST_OF_PRODUCT_IDS}                 | [Commerce Webstore Pricing Products](https://developer.salesforce.com/docs/atlas.en-us.chatterapi.meta/chatterapi/connect_resources_commerce_webstore_pricing_products.htm) |
| 5  | Create a cart                                    | PUT         | {SFDC_COMMERCE_WEBSTORE_SITE_URL}/webruntime/api/services/data/{SFDC_COMMERCE_API_VERSION}/commerce/webstores/{SFDC_COMMERCE_WEBSTORE_ID}/carts/current                                                     | [Commerce Webstore Cart](https://developer.salesforce.com/docs/atlas.en-us.chatterapi.meta/chatterapi/connect_resources_commerce_webstore_cart.htm) |
| 6  | Get cart details                                 | GET         | {SFDC_COMMERCE_WEBSTORE_SITE_URL}/webruntime/api/services/data/{SFDC_COMMERCE_API_VERSION}/commerce/webstores/{SFDC_COMMERCE_WEBSTORE_ID}/carts/current                                                     | [Commerce Webstore Cart](https://developer.salesforce.com/docs/atlas.en-us.chatterapi.meta/chatterapi/connect_resources_commerce_webstore_cart.htm) |
| 7  | Get cart item details                            | GET         | {SFDC_COMMERCE_WEBSTORE_SITE_URL}/webruntime/api/services/data/{SFDC_COMMERCE_API_VERSION}/commerce/webstores/{SFDC_COMMERCE_WEBSTORE_ID}/carts/current/cart-items                                          | [Commerce Webstore Cart Items](https://developer.salesforce.com/docs/atlas.en-us.chatterapi.meta/chatterapi/connect_resources_commerce_webstore_cart_items.htm) |
| 8  | Add a item to cart                               | POST        | {SFDC_COMMERCE_WEBSTORE_SITE_URL}/webruntime/api/services/data/{SFDC_COMMERCE_API_VERSION}/commerce/webstores/{SFDC_COMMERCE_WEBSTORE_ID}/carts/current/cart-items                                          | [Commerce Webstore Cart Items](https://developer.salesforce.com/docs/atlas.en-us.chatterapi.meta/chatterapi/connect_resources_commerce_webstore_cart_items.htm) |
| 9  | Update cart item quantity                        | PATCH       | {SFDC_COMMERCE_WEBSTORE_SITE_URL}/webruntime/api/services/data/{SFDC_COMMERCE_API_VERSION}/commerce/webstores/{SFDC_COMMERCE_WEBSTORE_ID}/carts/current/cart-items/{CART_ITEM_ID}                           | [Commerce Webstore Cart Item](https://developer.salesforce.com/docs/atlas.en-us.chatterapi.meta/chatterapi/connect_resources_commerce_webstore_cart_item.htm) |
| 10 | Remove a item from cart                          | DELETE      | {SFDC_COMMERCE_WEBSTORE_SITE_URL}/webruntime/api/services/data/{SFDC_COMMERCE_API_VERSION}/commerce/webstores/{SFDC_COMMERCE_WEBSTORE_ID}/carts/current/cart-items/{CART_ITEM_ID}                           | [Commerce Webstore Cart Item](https://developer.salesforce.com/docs/atlas.en-us.chatterapi.meta/chatterapi/connect_resources_commerce_webstore_cart_item.htm) |
| 11 | Get product details based on given product id    | GET         | {SFDC_COMMERCE_WEBSTORE_SITE_URL}/webruntime/api/services/data/{SFDC_COMMERCE_API_VERSION}/commerce/webstores/{SFDC_COMMERCE_WEBSTORE_ID}/products/{PRODUCT_ID}                                            | [Commerce Webstore Product](https://developer.salesforce.com/docs/atlas.en-us.chatterapi.meta/chatterapi/connect_resources_commerce_webstore_product.htm) |

**Legend:**
- `{SFDC_COMMERCE_WEBSTORE_SITE_URL}` = Your Commerce Cloud site URL
- `{SFDC_COMMERCE_API_VERSION}` = API version (e.g., v64.0)
- `{SFDC_COMMERCE_WEBSTORE_ID}` = Your webstore ID
- `{PARENT_CATEGORY_ID}` = The parent category ID
- `{CATEGORY_ID}` = The category ID
- `{LIST_OF_PRODUCT_IDS}` = Comma-separated product IDs
- `{CART_ITEM_ID}` = The cart item ID
- `{PRODUCT_ID}` = The product ID

**Example URL:**
```
https://abcd.my.site.com/abcd/webruntime/api/services/data/v64.0/commerce/webstores/0ZE000000000000/product-categories/children
```