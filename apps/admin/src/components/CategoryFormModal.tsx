'use client';

import { useState, type JSX } from 'react';

import { useToast } from '@/components/Toast';
import { createClient } from '@/lib/supabase';
import type { CategoryRecord } from '@/lib/types';

const COLORS = ['yellow', 'black', 'blue', 'red', 'green', 'white'];

export function CategoryFormModal({
  category,
  onClose,
  onSaved,
}: {
  category?: CategoryRecord | null;
  onClose: () => void;
  onSaved: () => void;
}): JSX.Element {
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [value, setValue] = useState(category?.value ?? '');
  const [label, setLabel] = useState(category?.label ?? '');
  const [color, setColor] = useState(category?.color ?? 'yellow');
  const [description, setDescription] = useState(category?.description ?? '');
  const [seoTitle, setSeoTitle] = useState(category?.seo_title ?? '');
  const [seoDescription, setSeoDescription] = useState(category?.seo_description ?? '');
  const supabase = createClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { slug, value, label, color, description, seo_title: seoTitle, seo_description: seoDescription };
    if (category) {
      const { error } = await supabase.from('categories').update(payload).eq('id', category.id);
      if (error) {
        toast(error.message, 'error');
        return;
      }
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) {
        toast(error.message, 'error');
        return;
      }
    }
    toast(category ? 'Category updated' : 'Category created', 'success');
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#18181b]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-extrabold uppercase">{category ? 'Edit' : 'Add'} Category</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full border-2 border-black px-3 py-2 text-sm"
                required
                disabled={!!category}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase">Value</label>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full border-2 border-black px-3 py-2 text-sm"
                required
                disabled={!!category}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Label</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Color</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm"
            >
              {COLORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border-2 border-black px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">SEO Title</label>
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">SEO Description</label>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
              className="w-full border-2 border-black px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-black px-4 py-2 text-sm font-bold uppercase hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border-2 border-black bg-yellow-400 px-4 py-2 text-sm font-bold uppercase hover:bg-yellow-300"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
