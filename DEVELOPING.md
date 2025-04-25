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