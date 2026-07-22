'use client';

import { useState, useEffect, useCallback, Suspense, type JSX } from 'react';

import { CategoryFormModal } from '@/components/CategoryFormModal';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { createClient } from '@/lib/supabase';
import type { CategoryRecord } from '@/lib/types';

/** Number of items per page for pagination. */
const PER_PAGE = 15;

/**
 * Categories management page with CRUD operations.
 *
 * @returns {JSX.Element} Rendered categories page.
 */
export default function CategoriesPage(): JSX.Element {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading...</div>}>
      <CategoriesPageContent />
    </Suspense>
  );
}

/**
 * Inner component that uses useSearchParams for URL-based pagination.
 *
 * @returns {JSX.Element} Rendered categories page.
 */
function CategoriesPageContent(): JSX.Element {
  const [items, setItems] = useState<CategoryRecord[]>([]);
  const [editItem, setEditItem] = useState<CategoryRecord | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();
  const { page, goToPage } = usePagination();

  const load = useCallback(async () => {
    const from = (page - 1) * PER_PAGE;
    const to = from + PER_PAGE - 1;
    const { data, count } = await supabase
      .from('categories')
      .select('*', { count: 'exact' })
      .order('value')
      .range(from, to);
    if (data) setItems(data);
    if (count !== null) setTotalCount(count);
  }, [supabase, page]);

  useEffect(() => {
    const timer = setTimeout(() => load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Category deleted', 'success');
      setDeleteConfirm(null);
      load();
    }
  };

  const totalPages = Math.ceil(totalCount / PER_PAGE);

  return (
    <section className="py-8" aria-labelledby="categories-heading">
      <header className="mb-6 flex items-center justify-between">
        <h1 id="categories-heading" className="text-3xl font-extrabold uppercase">
          Categories
        </h1>
        <Button onClick={() => setShowAdd(true)}>+ Add</Button>
      </header>
      <div className="overflow-x-auto border-2 border-black bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-black bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-xs font-bold uppercase">Value</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Name</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Color</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Description</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm text-black/50">
                  No categories found
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-black/10 hover:bg-yellow-50">
                  <td className="px-3 py-2">{item.value}</td>
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2">
                    <span
                      className="inline-block border border-black px-2 py-0.5 text-xs font-bold uppercase"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.color}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{item.description}</td>
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="w-full max-w-sm border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#18181b]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-lg font-extrabold uppercase">Delete Category?</h2>
            <p className="mb-4 text-sm text-black/70">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setDeleteConfirm(null)} variant="secondary">
                Cancel
              </Button>
              <Button onClick={() => handleDelete(deleteConfirm)} variant="danger">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <CategoryFormModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
      {editItem && (
        <CategoryFormModal
          category={editItem}
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
