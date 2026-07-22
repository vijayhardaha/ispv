'use client';

import { useState, useEffect, useCallback, type JSX } from 'react';

import { CategoryFormModal } from '@/components/CategoryFormModal';
import { useToast } from '@/components/Toast';
import { createClient } from '@/lib/supabase';
import type { CategoryRecord } from '@/lib/types';

/**
 * Categories management page with CRUD operations.
 *
 * @returns {JSX.Element} Rendered categories page.
 */
export default function CategoriesPage(): JSX.Element {
  const [items, setItems] = useState<CategoryRecord[]>([]);
  const [editItem, setEditItem] = useState<CategoryRecord | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const load = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('slug');
    if (data) setItems(data);
  }, [supabase]);

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

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold uppercase">Categories</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="border-2 border-black bg-yellow-400 px-4 py-2 text-sm font-bold uppercase hover:bg-yellow-300"
        >
          + Add
        </button>
      </div>
      <div className="overflow-x-auto border-2 border-black bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-black bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-xs font-bold uppercase">Slug</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Value</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Label</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Color</th>
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
                  <td className="px-3 py-2 font-mono text-xs">{item.slug}</td>
                  <td className="px-3 py-2 font-mono text-xs">{item.value}</td>
                  <td className="px-3 py-2">{item.label}</td>
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
                      <button
                        onClick={() => setEditItem(item)}
                        className="border border-black px-2 py-1 text-xs font-bold uppercase hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
                        className="border border-black bg-red-50 px-2 py-1 text-xs font-bold text-red-600 uppercase hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
              <button
                onClick={() => setDeleteConfirm(null)}
                className="border-2 border-black px-4 py-2 text-sm font-bold uppercase hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="border-2 border-black bg-red-500 px-4 py-2 text-sm font-bold text-white uppercase hover:bg-red-600"
              >
                Delete
              </button>
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
    </div>
  );
}
