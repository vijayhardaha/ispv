'use client';

import { useRef, useState, type JSX, type SubmitEvent } from 'react';

import { Box } from '@/components/ui/Box';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Modal';
import { createClient } from '@/lib/supabase';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

/**
 * Login page with email and password authentication form.
 *
 * @returns {JSX.Element} Rendered login form.
 */
export default function LoginPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attempts = useRef(0);
  const lockedUntil = useRef(0);
  const supabase = createClient();

  const handleLogin = async (e: SubmitEvent) => {
    e.preventDefault();

    const now = Date.now();
    if (now < lockedUntil.current) {
      const remaining = Math.ceil((lockedUntil.current - now) / 1000);
      setError(`Too many attempts. Try again in ${remaining}s`);
      return;
    }

    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (authError) {
      attempts.current += 1;
      if (attempts.current >= MAX_ATTEMPTS) {
        lockedUntil.current = now + LOCKOUT_MS;
        attempts.current = 0;
        setError('Too many attempts. Try again in 60s');
      } else {
        setError('Invalid email or password');
      }
    } else {
      attempts.current = 0;
      window.location.href = '/';
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Box className="w-full max-w-sm p-6">
        <h1 className="font-display mb-6 text-center text-2xl font-extrabold uppercase">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-bold uppercase">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-bold uppercase">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              required
            />
          </div>
          {error && <p className="text-xs font-bold text-red-600 uppercase">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            {loading ? 'Signing In…' : 'Sign In'}
          </Button>
        </form>
      </Box>
    </main>
  );
}
