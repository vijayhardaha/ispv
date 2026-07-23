'use client';

import { useState, type JSX } from 'react';

import latinize from 'latinize';
import slugify from 'slugify';

import { useToast } from '@/components/Toast';
import { Field, Input, ModalActions, ModalOverlay, ModalTitle, Textarea } from '@/components/ui/Modal';
import { createClient } from '@/lib/supabase';
import type { LocationRecord } from '@/lib/types';

/**
 * Modal form for creating or editing a location.
 *
 * @param {{ location?: LocationRecord | null; onClose: () => void; onSaved: () => void }} props - Component properties.
 * @param {LocationRecord | null} [props.location] - Existing location to edit, or null for new.
 * @param {() => void} props.onClose - Callback to close the modal.
 * @param {() => void} props.onSaved - Callback after successful save.
 *
 * @returns {JSX.Element} Rendered modal form.
 */
export function LocationFormModal({
  location: item,
  onClose,
  onSaved,
}: {
  location?: LocationRecord | null;
  onClose: () => void;
  onSaved: () => void;
}): JSX.Element {
  const [name, setName] = useState(item?.name ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [seoTitle, setSeoTitle] = useState(item?.seo_title ?? '');
  const [seoDescription, setSeoDescription] = useState(item?.seo_description ?? '');
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const value = item?.value ?? slugify(latinize(name), { lower: true, strict: true });
    const payload = { value, name, description, seo_title: seoTitle, seo_description: seoDescription };
    if (item) {
      const { error } = await supabase.from('locations').update(payload).eq('id', item.id);
      if (error) {
        setLoading(false);
        toast(error.message, 'error');
        return;
      }
    } else {
      const { error } = await supabase.from('locations').insert(payload);
      if (error) {
        setLoading(false);
        toast(error.message, 'error');
        return;
      }
    }
    setLoading(false);
    toast(item ? 'Location updated' : 'Location created', 'success');
    onSaved();
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalTitle editing={!!item}>Location</ModalTitle>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
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
