import { CartProvider } from 'components/cart/cart-context';
import Footer from 'components/layout/footer';
import { Navbar } from 'components/layout/navbar';
import { WelcomeToast } from 'components/welcome-toast';
import { GeistSans } from 'geist/font/sans';
import { getCart, getCategories, Cart } from 'lib/sfdc';
import { ensureStartsWith } from 'lib/utils';
import { ReactNode, Suspense } from 'react';
import { Toaster } from 'sonner';
import './globals.css';
import { getCartIdFromCookie, getIsGuestUserFromCookie } from './api/auth/cookieUtils';
import Loading from './loading';

const { TWITTER_CREATOR, TWITTER_SITE, SITE_NAME } = process.env;
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000';
const twitterCreator = TWITTER_CREATOR ? ensureStartsWith(TWITTER_CREATOR, '@') : undefined;
const twitterSite = TWITTER_SITE ? ensureStartsWith(TWITTER_SITE, 'https://') : undefined;

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME!,
    template: `%s | ${SITE_NAME}`
  },
  robots: {
    follow: true,
    index: true
  },
  ...(twitterCreator &&
    twitterSite && {
      twitter: {
        card: 'summary_large_image',
        creator: twitterCreator,
        site: twitterSite
      }
    })
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const isGuestUser = await getIsGuestUserFromCookie();
  const categoriesPromise = getCategories();

  const cartPromise: Promise<Cart | undefined> = (await getCartIdFromCookie())
    ? getCart()
    : Promise.resolve(undefined);

  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="flex min-h-screen flex-col bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white">
        <CartProvider cartPromise={cartPromise}>
          <Suspense fallback={<div className="h-16 w-full animate-pulse bg-neutral-100" />}>
            <Navbar isGuestUser={isGuestUser} categoriesPromise={categoriesPromise} />
          </Suspense>
          <main className="flex-grow">
            <Suspense fallback={<Loading />}>{children}</Suspense>
            <Toaster closeButton />
            <WelcomeToast />
          </main>
          <Suspense fallback={<div className="h-16 w-full animate-pulse bg-neutral-100" />}>
            <Footer categoriesPromise={categoriesPromise} />
          </Suspense>
        </CartProvider>
      </body>
    </html>
  );
}
