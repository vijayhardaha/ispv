'use client';

import { useState, type JSX } from 'react';

import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';

/**
 * Login page with email and password authentication form.
 *
 * @returns {JSX.Element} Rendered login form.
 */
export default function LoginPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <article className="w-full max-w-sm border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#18181b]">
        <h1 className="font-display mb-6 text-center text-2xl font-extrabold uppercase">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-bold uppercase">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-bold uppercase">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              required
            />
          </div>
          {error && <p className="text-xs font-bold text-red-600 uppercase">{error}</p>}
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </article>
    </main>
  );
}
