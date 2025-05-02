import LogoSquare from 'components/logo-square';
import { Category } from 'lib/sfdc/types';
import Link from 'next/link';
import { Suspense, lazy } from 'react';
import MobileMenu from './mobile-menu';
import Search, { SearchSkeleton } from './search';
import { LogoutButton } from './LogoutButton';
import { SFDC_COMMERCE_WEBSTORE_NAME } from 'lib/constants';

const LazyCartModal = lazy(() => import('components/cart/modal'));

export async function Navbar({ isGuestUser, menuPromise }: { isGuestUser: boolean | null; menuPromise: Promise<Category[]> }) {
  let menu = await menuPromise;
  menu = menu?.slice(0, 3);
  return (
    <nav className="relative flex items-center justify-between p-4 lg:px-6">
      <div className="block flex-none md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={menu} />
        </Suspense>
      </div>
      <div className="flex w-full items-center">
        <div className="flex w-full md:w-1/3">
          <Link
            href="/"
            prefetch={true}
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6"
          >
            <LogoSquare />
            <div className="ml-2 flex-none text-sm font-medium uppercase md:hidden lg:block">
              {SFDC_COMMERCE_WEBSTORE_NAME}
            </div>
          </Link>
          {menu.length ? (
            <ul className="hidden gap-6 text-sm md:flex md:items-center">
              {menu.map((item: Category) => (
                <li key={item.categoryName}>
                  <Link
                    href={`/${item.path}`}
                    prefetch={true}
                    className="text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
                  >
                    {item.categoryName}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="hidden justify-center md:flex md:w-1/3">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>
        <div className="flex justify-end md:w-1/3">
          <LogoutButton isGuestUser={isGuestUser} />
          {isGuestUser !== null && (
            <Suspense fallback={<div className="h-11 w-11" />}>
              <LazyCartModal />
            </Suspense>
          )}
        </div>
      </div>
    </nav>
  );
}
