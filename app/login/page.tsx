'use client';
import { useState } from 'react';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    setLoading(false);

    if (res.ok) {
      window.location.href = '/';
    } else {
      const data = await res.json();
      setError(data.error || 'Login failed');
    }
  };

  return (
    <div className="my-login-page flex min-h-[calc(100vh-6rem)] items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-lg border-[4px] border-gray-400 bg-white p-8 shadow-2xl dark:bg-neutral-900">
        <h1 className="mb-2 text-center text-3xl font-bold text-[#029CE3]">Login</h1>
        <p className="mb-6 text-center text-gray-600">
          Authenticate to access your Vercel integrated Salesforce Commerce Webstore.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#029CE3]"
            />
          </div>
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#029CE3]"
            />
          </div>
          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-lg bg-[#029CE3] py-3 text-white transition hover:bg-[#0280C4]"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
}
