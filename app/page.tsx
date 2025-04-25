import { Carousel } from 'components/carousel';
import { ThreeItemGrid } from 'components/grid/three-items';
import Footer from 'components/layout/footer';
import { getCollectionProducts } from 'lib/sfdc';
import { Product } from 'lib/sfdc/types';

export const metadata = {
  description: 'High-performance ecommerce store built with Next.js, Vercel, and Salesforce.',
  openGraph: {
    type: 'website'
  }
};

export default async function HomePage() {
  const products: Product[] = await getCollectionProducts({
    collection: 'hidden-homepage-featured-items'
  });
  return (
    <>
      <ThreeItemGrid products={products}/>
      <Carousel products={products}/>
      <Footer />
    </>
  );
}
