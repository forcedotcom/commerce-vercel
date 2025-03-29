'use client';

import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  
  const handleLogout = async () => {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (response.ok) {
      // Redirect to login page after logout
      router.replace('/login');
      router.refresh(); // Ensure cookies are updated
    } else {
      console.error('Logout failed');
    }
  };

  return (
    <button
      aria-label="Logout"
      onClick={handleLogout}
      className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white mr-3"
    >
      <ArrowRightOnRectangleIcon className={clsx('h-4 transition-all ease-in-out hover:scale-110')} />
    </button>
  );
}
