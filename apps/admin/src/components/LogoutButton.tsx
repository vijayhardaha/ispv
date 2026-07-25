'use client';

import { useState, type JSX } from 'react';

import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/db';

/**
 * Logout button that signs out client-side and redirects to login.
 *
 * Uses the browser Supabase client to clear auth cookies directly,
 * avoiding stale session state in server-rendered layouts.
 *
 * @returns {JSX.Element} Rendered logout button.
 */
export function LogoutButton(): JSX.Element {
  const [loggingOut, setLoggingOut] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut().catch(() => {});
    window.location.href = '/login';
  };

  return (
    <Button type="button" variant="danger" onClick={handleLogout} disabled={loggingOut}>
      {loggingOut ? 'Signing out...' : 'Logout'}
    </Button>
  );
}
