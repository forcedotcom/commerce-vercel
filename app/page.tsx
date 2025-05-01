import { Carousel } from 'components/carousel';
import { ThreeItemGrid } from 'components/grid/three-items';
import Footer from 'components/layout/footer';
import { getCollectionProducts } from 'lib/sfdc';
import { Product } from 'lib/sfdc/types';
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
      <Footer />
    </>
  );
}

// Separate the data fetching component
async function HomePageContent() {
  const products: Product[] = await getCollectionProducts({
    collection: 'hidden-homepage-featured-items'
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
