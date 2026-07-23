'use client';

import { type ReactNode } from 'react';

import { Send, Link2, MapPin, Building2 } from 'lucide-react';

import { HashtagArea } from '@/components/features/HashtagArea';
import { SuccessState } from '@/components/shared/SuccessState';
import { Button } from '@/components/ui/Button';
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
import { useSubmitVideoForm } from '@/hooks/useSubmitVideoForm';

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
}) {
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
          <form onSubmit={form.handleSubmit}>
            <DialogBody className="space-y-4">
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
                    onPaste={(e) => {
                      e.preventDefault();
                      const text = e.clipboardData.getData('text').trim().slice(0, 30);
                      form.setCity(text);
                    }}
                    placeholder="e.g. Mumbai"
                    maxLength={30}
                    disabled={form.submitting}
                  />
                </div>
              </div>

              <HashtagArea hashtags={form.hashtags} setHashtags={form.setHashtags} disabled={form.submitting} />

              <p className="text-sm leading-relaxed text-black/80">
                Add keywords like{' '}
                <span className="font-bold text-black/90 underline decoration-yellow-400 decoration-2 underline-offset-2">
                  person names
                </span>
                ,{' '}
                <span className="font-bold text-black/90 underline decoration-yellow-400 decoration-2 underline-offset-2">
                  location names
                </span>
                , or{' '}
                <span className="font-bold text-black/90 underline decoration-yellow-400 decoration-2 underline-offset-2">
                  special keywords
                </span>{' '}
                so others can find this video easily.
              </p>

              <DialogFooter>
                <Button type="submit" variant="default" shadow loading={form.submitting}>
                  <Send className="size-4" /> {form.submitting ? 'Submitting…' : 'Submit Reel'}
                </Button>
              </DialogFooter>
            </DialogBody>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
