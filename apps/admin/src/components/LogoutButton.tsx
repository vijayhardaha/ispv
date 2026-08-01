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
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes for the button.
 *
 * @returns {JSX.Element} Rendered logout button.
 */
export function LogoutButton({ className }: { className?: string }): JSX.Element {
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
      <Button
        type="button"
        variant="danger"
        className={className}
        onClick={() => setShowConfirm(true)}
        disabled={loggingOut}
      >
        {loggingOut ? 'Signing out...' : 'Logout'}
      </Button>

      {showConfirm && (
        <DeleteConfirmDialog
          label="Logout"
          action="delete"
          title="Logout?"
          message="You will be signed out of your admin account. You can sign back in anytime."
          confirmLabel="Logout"
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
