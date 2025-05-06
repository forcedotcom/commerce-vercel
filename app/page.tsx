import { Carousel } from 'components/carousel';
import { ThreeItemGrid } from 'components/grid/three-items';
import { getProductsByCategories, getLimitedCategories, getCategories, Category, Product } from 'lib/sfdc';
import { Suspense } from 'react';
import Loading from './loading';

export const metadata = {
  description: 'High-performance ecommerce store built with Next.js, Vercel, and Salesforce.',
  openGraph: {
    type: 'website'
  }
};

export const revalidate = 3600; // Revalidate every hour

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <HomePageContent />
      </Suspense>
    </>
  );
}

// Separate the data fetching component
async function HomePageContent() {
  const categories: Category[] = await getCategories();
  const limitedCategories: Category[] = getLimitedCategories(categories);
  const products: Product[] = await getProductsByCategories({
    categories: limitedCategories,
    pageSize: 3
  });

  return (
    <>
      <Suspense fallback={<div className="h-[50vh] w-full animate-pulse bg-neutral-100" />}>
        <ThreeItemGrid products={products} />
      </Suspense>
      <Suspense fallback={<div className="h-[50vh] w-full animate-pulse bg-neutral-100" />}>
        <Carousel products={products} />
      </Suspense>
    </>
  );
}
