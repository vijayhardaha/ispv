'use client';

import { useState, useEffect, useCallback, Suspense, type JSX } from 'react';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { LocationFormModal } from '@/components/LocationFormModal';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';
import type { LocationRecord } from '@/lib/types';

/** Number of items per page for pagination. */
const PER_PAGE = 15;

/**
 * Locations management page with CRUD operations.
 *
 * @returns {JSX.Element} Rendered locations page.
 */
export default function LocationsPage(): JSX.Element {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading...</div>}>
      <LocationsPageContent />
    </Suspense>
  );
}

/**
 * Inner component that uses useSearchParams for URL-based pagination.
 *
 * @returns {JSX.Element} Rendered locations page.
 */
function LocationsPageContent(): JSX.Element {
  const [items, setItems] = useState<LocationRecord[]>([]);
  const [editItem, setEditItem] = useState<LocationRecord | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  const load = useCallback(async () => {
    const from = (page - 1) * PER_PAGE;
    const to = from + PER_PAGE - 1;
    const { data, count } = await supabase
      .from('locations')
      .select('*', { count: 'exact' })
      .order('label')
      .range(from, to);
    if (data) setItems(data);
    if (count !== null) setTotalCount(count);
  }, [supabase, page]);

  useEffect(() => {
    const timer = setTimeout(() => load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const goToPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(newPage));
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('locations').delete().eq('id', id);
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Location deleted', 'success');
      setDeleteConfirm(null);
      load();
    }
  };

  const totalPages = Math.min(Math.ceil(totalCount / PER_PAGE), 3);

  return (
    <section aria-labelledby="locations-heading">
      <header className="mb-6 flex items-center justify-between">
        <h1 id="locations-heading" className="text-3xl font-extrabold uppercase">
          Locations
        </h1>
        <Button onClick={() => setShowAdd(true)}>+ Add</Button>
      </header>
      <div className="overflow-x-auto border-2 border-black bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-black bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-xs font-bold uppercase">Value</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Name</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-8 text-center text-sm text-black/50">
                  No locations found
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-black/10 hover:bg-yellow-50">
                  <td className="px-3 py-2">{item.value}</td>
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button onClick={() => setEditItem(item)} variant="secondary" size="xs">
                        Edit
                      </Button>
                      <Button onClick={() => setDeleteConfirm(item.id)} variant="danger-ghost" size="xs">
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button disabled={page <= 1} onClick={() => goToPage(page - 1)} variant="secondary" size="sm">
            Prev
          </Button>
          <span className="text-xs font-bold">
            Page {page} of {totalPages}
          </span>
          <Button disabled={page >= totalPages} onClick={() => goToPage(page + 1)} variant="secondary" size="sm">
            Next
          </Button>
        </div>
      )}

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="w-full max-w-sm border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#18181b]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-lg font-extrabold uppercase">Delete Location?</h2>
            <p className="mb-4 text-sm text-black/70">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setDeleteConfirm(null)} variant="secondary">
                Cancel
              </Button>
              <Button onClick={() => deleteConfirm !== null && handleDelete(deleteConfirm)} variant="danger">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <LocationFormModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
      {editItem && (
        <LocationFormModal
          location={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => {
            setEditItem(null);
            load();
          }}
        />
      )}
    </section>
  );
}
