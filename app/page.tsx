import { Carousel } from 'components/carousel';
import { ThreeItemGrid } from 'components/grid/three-items';
import { getCollectionProducts, getLimitedCategories, getMenu } from 'lib/sfdc';
import { Category, Product } from 'lib/sfdc/types';
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
  const categories: Category[] = await getMenu();
  const limitedCategories: Category[] = getLimitedCategories(categories);
  const products: Product[] = await getCollectionProducts({
    categories: limitedCategories
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
