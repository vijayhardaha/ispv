'use client';

import { useState, useEffect, useCallback, Suspense, type JSX } from 'react';

import { useSearchParams } from 'next/navigation';

import { LocationFormModal } from '@/components/LocationFormModal';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/ui/Button';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { usePagination } from '@/hooks/usePagination';
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
  const { page, goToPage } = usePagination();
  const searchParams = useSearchParams();
  const search = searchParams.get('q') || '';

  const load = useCallback(async () => {
    const from = (page - 1) * PER_PAGE;
    const to = from + PER_PAGE - 1;
    let query = supabase.from('locations').select('*', { count: 'exact' }).order('name');
    if (search) {
      query = query.or(`name.ilike.%${search}%,value.ilike.%${search}%,description.ilike.%${search}%`);
    }
    const { data, count } = await query.range(from, to);
    if (data) setItems(data);
    if (count !== null) setTotalCount(count);
  }, [supabase, page, search]);

  useEffect(() => {
    const timer = setTimeout(() => load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

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

  const totalPages = Math.ceil(totalCount / PER_PAGE);

  return (
    <section aria-labelledby="locations-heading">
      <header className="mb-6 flex items-center justify-between">
        <h1 id="locations-heading" className="text-3xl font-extrabold uppercase">
          Locations
        </h1>
        <Button onClick={() => setShowAdd(true)}>+ Add</Button>
      </header>

      <div className="mb-4">
        <SearchInput placeholder="Search locations…" />
      </div>

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

      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />

      {deleteConfirm && (
        <DeleteConfirmDialog
          label="Location"
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm)}
        />
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
