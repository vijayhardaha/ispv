import { useState, type JSX, type ReactNode } from 'react';

import { Send, Link2, Hash, MapPin, Building2, CheckCircle2, X as XIcon } from 'lucide-react';

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
import { FieldLabel, Input, Textarea } from '@/components/ui/Input';
import { extractInstagramId } from '@/lib/instagram';

const LOCATIONS = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Delhi',
  'Gujarat',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

const SUGGESTED_HASHTAGS = [
  '#PeacefulProtest',
  '#Democracy',
  '#India',
  '#StudentVoices',
  '#Justice',
  '#CandlelightVigil',
];

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
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currentTags = Array.from(
    new Set(
      hashtags
        .split(/\s+/)
        .map((h) => h.trim())
        .filter(Boolean)
        .map((h) => {
          const match = h.match(/^#+(.+)/);
          return match ? `#${match[1]}` : h;
        })
    )
  );

  const handleOpen = (next: boolean) => {
    // Reset form with slight delay so dialog animation finishes
    if (!next)
      setTimeout(() => {
        setUrl('');
        setLocation('');
        setCity('');
        setHashtags('');
        setError(null);
        setSuccess(false);
      }, 200);
    setOpen(next);
    onOpenChange?.(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!extractInstagramId(url)) {
      setError('That does not look like a valid Instagram reel URL.');
      return;
    }

    // Mock: simulate submission
    setSuccess(true);
    setTimeout(() => handleOpen(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent tone="default">
        <DialogHeader>
          <DialogTitle>Submit a Reel</DialogTitle>
          <DialogDescription>
            Found a peaceful protest reel that should be in the archive? Drop the link here.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <DialogBody>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 className="h-14 w-14 text-green-600" />
              <p className="font-display mt-4 text-xl font-extrabold uppercase">Submitted!</p>
              <p className="mt-1 text-sm text-black/60">We will review and add it shortly.</p>
            </div>
          </DialogBody>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogBody className="space-y-4">
              <div className="space-y-1">
                <FieldLabel htmlFor="reel-url" required>
                  <Link2 className="h-3.5 w-3.5" /> Instagram Reel URL
                </FieldLabel>
                <Input
                  id="reel-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/..."
                  invalid={!!error}
                />
                {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <FieldLabel htmlFor="reel-location">
                    <MapPin className="h-3.5 w-3.5" /> Location
                  </FieldLabel>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger id="reel-location">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
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
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <FieldLabel htmlFor="reel-hashtags">
                  <Hash className="h-3.5 w-3.5" /> Hashtags
                </FieldLabel>
                <Textarea
                  id="reel-hashtags"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#PeacefulProtest #YourCity #Demo"
                  rows={2}
                />
              </div>

              {currentTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {currentTags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 border-2 border-black bg-gray-200 px-2 py-0.5 font-mono text-[10px] font-bold uppercase"
                    >
                      {t.startsWith('#') ? t : `#${t}`}
                      <button
                        type="button"
                        onClick={() =>
                          setHashtags(
                            hashtags
                              .split(/\s+/)
                              .filter((h) => h.trim() !== t)
                              .join(' ')
                          )
                        }
                        className="cursor-pointer hover:text-red-600"
                        aria-label={`Remove ${t}`}
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {SUGGESTED_HASHTAGS.filter((h) => !currentTags.includes(h)).length > 0 && (
                <div>
                  <p className="mb-1 font-mono text-[10px] font-bold tracking-widest text-black/50 uppercase">
                    Suggestions
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_HASHTAGS.filter((h) => !currentTags.includes(h)).map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHashtags(hashtags ? `${hashtags} ${h}` : h)}
                        className="inline-flex items-center gap-1 border-2 border-black bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase transition-colors hover:bg-yellow-400"
                      >
                        + {h}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="submit" variant="default" shadow>
                  <Send className="size-4" /> Submit Reel
                </Button>
              </DialogFooter>
            </DialogBody>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
