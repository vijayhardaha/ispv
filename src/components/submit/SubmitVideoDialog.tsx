import { useState, type JSX, type ReactNode } from 'react';

import { Send, Link2, Hash, CheckCircle2, X as XIcon } from 'lucide-react';

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
import { FieldLabel, Input, Textarea } from '@/components/ui/Input';
import { extractInstagramId } from '@/lib/utils';

/**
 * Props for the SubmitVideoDialog component.
 *
 * @type {SubmitVideoDialogProps}
 * @property {ReactNode} trigger - Element that opens the dialog when clicked.
 * @property {(open: boolean) => void} [onOpenChange] - Callback when dialog open state changes.
 */
interface SubmitVideoDialogProps {
  trigger: ReactNode;
  onOpenChange?: (open: boolean) => void;
}

const HASHTAG_SUGGESTIONS = [
  '#PeacefulProtest',
  '#India',
  '#MarchForJustice',
  '#CandleVigil',
  '#ProtestArt',
  '#Youth',
  '#Constitution',
  '#CitizensSpeak',
];

/**
 * Dialog for submitting an Instagram reel URL with hashtags to the archive.
 *
 * @param {SubmitVideoDialogProps} props - Dialog properties.
 *
 * @returns {JSX.Element} Rendered dialog with URL input and hashtag suggestions.
 */
export function SubmitVideoDialog({ trigger, onOpenChange }: SubmitVideoDialogProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleOpen = (o: boolean) => {
    setOpen(o);
    onOpenChange?.(o);
    if (!o) {
      setTimeout(() => {
        setError(null);
        setSuccess(false);
        setUrl('');
        setHashtags('');
      }, 200);
    }
  };

  const addHashtag = (tag: string) => {
    if (hashtags.split(/\s+/).includes(tag)) return;
    setHashtags((prev) => (prev.trim() + ' ' + tag).trim());
  };

  const removeHashtag = (tag: string) => {
    setHashtags((prev) =>
      prev
        .split(/\s+/)
        .filter((t) => t !== tag)
        .join(' ')
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!url.trim()) {
      setError('URL is required.');
      return;
    }
    if (!extractInstagramId(url)) {
      setError('Please paste a valid Instagram post or reel URL.');
      return;
    }
    setSuccess(true);
    setTimeout(() => handleOpen(false), 1500);
  };

  const currentTags = hashtags
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.startsWith('#'));

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent tone="default">
        <DialogHeader className="bg-orange-500">
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" /> Submit a Video
          </DialogTitle>
          <DialogDescription>
            Paste an Instagram reel or post URL. Add a few hashtags. That&apos;s it — we&apos;ll review and add it to
            the archive.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit}>
          <DialogBody className="space-y-5 bg-gray-100">
            <div className="space-y-2">
              <FieldLabel htmlFor="ig-url" required>
                <span className="inline-flex items-center gap-1">
                  <Link2 className="h-3.5 w-3.5" /> Instagram URL
                </span>
              </FieldLabel>
              <Input
                id="ig-url"
                type="url"
                placeholder="https://www.instagram.com/reel/XXXXXXX/"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                invalid={!!error}
                required
              />
              <p className="font-mono text-[10px] tracking-wider text-black/50 uppercase">
                Reel, post, or IGTV URL — must be public.
              </p>
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="ig-tags" hint="space separated">
                <span className="inline-flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5" /> Hashtags
                </span>
              </FieldLabel>
              <Textarea
                id="ig-tags"
                rows={2}
                placeholder="#PeacefulProtest #MarchForJustice #India"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
              />
              {currentTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {currentTags.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => removeHashtag(t)}
                      className="inline-flex items-center gap-1 border-2 border-black bg-orange-500 px-2.5 py-0.5 font-mono text-xs font-bold uppercase hover:bg-orange-500 hover:text-white"
                    >
                      {t} <XIcon className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}
              <div className="space-y-1.5">
                <p className="font-mono text-[10px] tracking-wider text-black/50 uppercase">Quick add:</p>
                <div className="flex flex-wrap gap-1.5">
                  {HASHTAG_SUGGESTIONS.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => addHashtag(t)}
                      className="inline-flex cursor-pointer items-center gap-1 border-2 border-black bg-white px-2.5 py-1 font-mono text-xs font-bold uppercase transition-all hover:-translate-y-px hover:bg-orange-500 hover:text-white"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="border-[3px] border-black bg-orange-500/20 px-3 py-2 font-mono text-xs font-bold text-orange-600 uppercase">
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 border-[3px] border-black bg-blue-600 px-3 py-2 font-mono text-xs font-bold text-white uppercase">
                <CheckCircle2 className="h-4 w-4" /> Submitted — thank you! Closing…
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="dark-outline" onClick={() => handleOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={success}>
              <Send className="h-4 w-4" /> Submit for Review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
