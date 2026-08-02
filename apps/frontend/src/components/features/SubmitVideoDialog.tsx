'use client';

import { type JSX, type ReactNode } from 'react';

import { Send, Link2, MapPin, Building2, LayoutGrid } from 'lucide-react';

import { TagArea } from '@/components/features/TagArea';
import { SuccessState } from '@/components/shared/SuccessState';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogBody,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Dropdown';
import { FieldLabel, Input } from '@/components/ui/Input';
import { CATEGORIES } from '@/constants/categories';
import { MAX_CATEGORIES, useSubmitVideoForm } from '@/hooks/useSubmitVideoForm';

/**
 * Dialog for submitting an Instagram reel URL to the protest archive.
 *
 * @param {object} props - Component properties.
 * @param {ReactNode} props.trigger - Element that opens the dialog.
 * @param {(open: boolean) => void} [props.onOpenChange] - Callback when dialog open state changes.
 *
 * @returns {JSX.Element} Rendered submit video dialog.
 */
export function SubmitVideoDialog({
  trigger,
  onOpenChange,
}: {
  trigger: ReactNode;
  onOpenChange?: (open: boolean) => void;
}): JSX.Element {
  const form = useSubmitVideoForm({ onOpenChange });

  return (
    <Dialog open={form.open} onOpenChange={form.setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent tone="white" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Submit a Reel</DialogTitle>
          <DialogDescription>
            Found a peaceful protest reel that should be in the archive? Drop the link here.
          </DialogDescription>
        </DialogHeader>

        {form.success ? (
          <DialogBody>
            <SuccessState title="Submitted!" message="We will review and add it shortly." />
          </DialogBody>
        ) : (
          <form onSubmit={form.handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <DialogBody className="min-h-0 flex-1 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <FieldLabel htmlFor="reel-url" required>
                  <Link2 className="h-3.5 w-3.5" /> Instagram Reel URL
                </FieldLabel>
                <Input
                  id="reel-url"
                  value={form.url}
                  onChange={(e) => {
                    form.setUrl(e.target.value);
                    if (form.error) {
                      form.setError(null);
                    }
                  }}
                  onBlur={form.handleBlur}
                  placeholder="https://www.instagram.com/reel/..."
                  invalid={!!form.error}
                  disabled={form.submitting}
                />
                {form.error && <p className="mt-1 text-xs font-semibold text-red-600">{form.error}</p>}
                {form.checkingUrl && <p className="mt-1 text-xs text-black/50">Checking archive…</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <FieldLabel htmlFor="reel-location">
                    <MapPin className="h-3.5 w-3.5" /> Location
                  </FieldLabel>
                  <Select value={form.location} onValueChange={form.setLocation} disabled={form.submitting}>
                    <SelectTrigger id="reel-location">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {form.locations.map((loc) => (
                        <SelectItem key={loc.slug} value={loc.name}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <FieldLabel htmlFor="reel-city">
                    <Building2 className="h-3.5 w-3.5" /> City
                  </FieldLabel>
                  <Input
                    id="reel-city"
                    value={form.city}
                    onChange={(e) => form.setCity(e.target.value.slice(0, 30))}
                    placeholder="e.g. Delhi, Mumbai, Bangalore"
                    maxLength={30}
                    disabled={form.submitting}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <FieldLabel htmlFor="reel-categories" className="flex w-full items-center justify-between">
                  <span className="inline-flex items-center gap-1">
                    <LayoutGrid className="h-3.5 w-3.5" /> Category
                  </span>
                  <span className="text-xs font-bold text-zinc-700">
                    {form.categories.length}/{MAX_CATEGORIES} selected
                  </span>
                </FieldLabel>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {CATEGORIES.map((cat) => {
                    const checked = form.categories.includes(cat.slug);
                    const atLimit = form.categories.length >= MAX_CATEGORIES && !checked;
                    return (
                      <Checkbox
                        key={cat.slug}
                        id={`reel-category-${cat.slug}`}
                        name="categories"
                        value={cat.slug}
                        label={cat.name}
                        checked={checked}
                        disabled={form.submitting || atLimit}
                        onChange={() => form.toggleCategory(cat.slug)}
                      />
                    );
                  })}
                </div>
                {form.categories.length >= MAX_CATEGORIES && (
                  <p className="mt-2 text-xs font-bold text-black/60">
                    Maximum {MAX_CATEGORIES} categories. Uncheck one to pick another.
                  </p>
                )}
              </div>

              <TagArea tags={form.tags} setTags={form.setTags} disabled={form.submitting} />
            </DialogBody>

            <DialogFooter className="shrink-0">
              <Button
                type="submit"
                variant="default"
                shadow
                loading={form.submitting}
                disabled={!form.canSubmit}
                className="w-full"
              >
                <Send className="size-4" /> {form.submitting ? 'Submitting…' : 'Submit Reel'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
