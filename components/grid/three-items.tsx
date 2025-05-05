import { GridTileImage } from 'components/grid/tile';
import { Product } from 'lib/sfdc';
import Link from 'next/link';

function ThreeItemGridItem({
  item,
  size,
  priority
}: {
  item: Product;
  size: 'full' | 'half';
  priority?: boolean;
}) {
  return (
    <div
      className={size === 'full' ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-1'}
    >
      <Link className="relative block aspect-square h-full w-full" href={`/product/${item.handle}`}>
        <GridTileImage
          src={item.featuredImage?.url}
          fill
          sizes={
            size === 'full' 
              ? '(min-width: 768px) 66vw, 100vw' 
              : '(min-width: 768px) 33vw, 100vw'
          }
          priority={priority}
          alt={item.title}
          label={{
            position: size === 'full' ? 'center' : 'bottom',
            title: item.title as string,
            amount: item.priceRange?.maxVariantPrice.amount,
            currencyCode: item.priceRange?.maxVariantPrice.currencyCode
          }}
        />
      </Link>
    </div>
  );
}

export type ThreeItemGridProducts = { products: Product[] };

export async function ThreeItemGrid({ products }: ThreeItemGridProducts) {
  // Collections that start with `hidden-*` are hidden from the search pag

  if (products == null) return null

  if (!products[0] || !products[1] || !products[2]) return null;

  const [firstProduct, secondProduct, thirdProduct] = products;

  return (
    <section className="mx-auto grid max-w-screen-2xl gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2 lg:max-h-[calc(100vh-200px)]">
      <ThreeItemGridItem size="full" item={firstProduct} priority={true} />
      <ThreeItemGridItem size="half" item={secondProduct} priority={true} />
      <ThreeItemGridItem size="half" item={thirdProduct} />
    </section>
  );
}
