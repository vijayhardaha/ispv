'use client';

import { useState, type JSX } from 'react';

import latinize from 'latinize';
import slugify from 'slugify';

import { useToast } from '@/components/Toast';
import { Field, Input, ModalActions, ModalOverlay, ModalTitle, Select, Textarea } from '@/components/ui/Modal';
import { COLORS } from '@/constants/colors';
import { createClient } from '@/lib/supabase';
import type { CategoryRecord } from '@/lib/types';

/**
 * Modal form for creating or editing a category.
 *
 * @param {{ category?: CategoryRecord | null; onClose: () => void; onSaved: () => void }} props - Component properties.
 * @param {CategoryRecord | null} [props.category] - Existing category to edit, or null for new.
 * @param {() => void} props.onClose - Callback to close the modal.
 * @param {() => void} props.onSaved - Callback after successful save.
 *
 * @returns {JSX.Element} Rendered modal form.
 */
export function CategoryFormModal({
  category,
  onClose,
  onSaved,
}: {
  category?: CategoryRecord | null;
  onClose: () => void;
  onSaved: () => void;
}): JSX.Element {
  const [name, setName] = useState(category?.name ?? '');
  const [color, setColor] = useState(category?.color ?? 'yellow');
  const [description, setDescription] = useState(category?.description ?? '');
  const [seoTitle, setSeoTitle] = useState(category?.seo_title ?? '');
  const [seoDescription, setSeoDescription] = useState(category?.seo_description ?? '');
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const value = category?.value ?? slugify(latinize(name), { lower: true, strict: true });
    const payload = { value, name, color, description, seo_title: seoTitle, seo_description: seoDescription };
    if (category) {
      const { error } = await supabase.from('categories').update(payload).eq('id', category.id);
      if (error) {
        setLoading(false);
        toast(error.message, 'error');
        return;
      }
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) {
        setLoading(false);
        toast(error.message, 'error');
        return;
      }
    }
    setLoading(false);
    toast(category ? 'Category updated' : 'Category created', 'success');
    onSaved();
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalTitle editing={!!category}>Category</ModalTitle>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>

        <Field label="Color">
          <Select value={color} onChange={(e) => setColor(e.target.value)}>
            {COLORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>

        <Field label="SEO Title">
          <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </Field>

        <Field label="SEO Description">
          <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
        </Field>

        <ModalActions onClose={onClose} loading={loading} />
      </form>
    </ModalOverlay>
  );
}
