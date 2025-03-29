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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="hidden w-1/2 flex-col items-center justify-center bg-[#029CE3] p-10 text-white md:flex">
          <h2 className="text-3xl font-bold">Welcome Back!</h2>
          <p className="mt-4 text-center">Unlock the Best of Salesforce Commerce on Vercel.</p>
        </div>
        <div className="w-full p-8 md:w-1/2">
          <h2 className="mb-2 text-center text-2xl font-bold text-[#029CE3]">
            Login
          </h2>
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
            <div className="mt-6">
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-lg bg-[#029CE3] py-3 text-white transition hover:bg-[#0280C4]"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
          {error && <p className="mt-4 text-center text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
