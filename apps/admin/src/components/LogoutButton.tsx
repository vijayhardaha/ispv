'use client';

import { useState, type JSX } from 'react';

import { Button } from '@/components/ui/Button';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { createClient } from '@/lib/db';

/**
 * Logout button that signs out client-side and redirects to login.
 *
 * Shows a confirmation dialog before signing out.
 * Uses the browser Supabase client to clear auth cookies directly,
 * avoiding stale session state in server-rendered layouts.
 *
 * @returns {JSX.Element} Rendered logout button.
 */
export function LogoutButton(): JSX.Element {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const supabase = createClient();

  const handleConfirm = async () => {
    setLoggingOut(true);
    setShowConfirm(false);
    await supabase.auth.signOut().catch(() => {});
    window.location.href = '/login';
  };

  return (
    <>
      <Button type="button" variant="danger" onClick={() => setShowConfirm(true)} disabled={loggingOut}>
        {loggingOut ? 'Signing out...' : 'Logout'}
      </Button>

      {showConfirm && (
        <DeleteConfirmDialog
          label="Session"
          action="delete"
          message="Are you sure you want to logout?"
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
