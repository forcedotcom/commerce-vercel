'use client';

import { ArrowRightOnRectangleIcon, UserIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

export function LogoutButton({ isGuestUser }: { isGuestUser: boolean | null }) {
  const router = useRouter();

  const handleLogout = async () => {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (response.ok) {
      // Redirect to login page after logout
      router.replace('/login');
      router.refresh(); // Ensure cookies are updated
    } else {
      console.log('Logout failed');
    }
  };

  const handleSignIn = async () => {
    router.push('/login');
  };

  return isGuestUser ? (
    <button
      aria-label="Log In"
      onClick={handleSignIn}
      className="relative mr-3 flex h-11 w-auto items-center justify-center rounded-md border border-neutral-200 px-4 text-black transition-colors dark:border-neutral-700 dark:text-white"
    >
      <UserIcon className={clsx('h-4 transition-all ease-in-out hover:scale-110')} />
    </button>
  ) : (
    // Show Logout button for authenticated users
    <button
      aria-label="Logout"
      onClick={handleLogout}
      className="relative mr-3 flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white"
    >
      <ArrowRightOnRectangleIcon
        className={clsx('h-4 transition-all ease-in-out hover:scale-110')}
      />
    </button>
  );
}
