'use client';

import type { JSX } from 'react';

import { Hash, X as XIcon } from 'lucide-react';

import { FieldLabel, Textarea } from '@/components/ui/Input';

/**
 * Suggested hashtags shown when none are currently added.
 */
const SUGGESTED_HASHTAGS = [
  '#LaathiCharge',
  '#TearGas',
  '#FunnyMoment',
  '#Message',
  '#Speech',
  '#JantaMantar',
  '#AwesomeGenZ',
  '#GroundReporting',
  '#Highlights',
  '#Review',
  '#Experience',
];

/**
 * Parse a space-separated hashtag string into a unique list of cleaned tags.
 * Only words prefixed with `#` are treated as valid tags; plain text is ignored.
 * The `#` prefix is stripped for display.
 *
 * @param {string} input - Raw hashtag text input.
 *
 * @returns {string[]} Deduplicated array of tag strings (without `#` prefix).
 */
function parseHashtags(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(/\s+/)
        .map((h) => h.trim())
        .filter((h) => h.startsWith('#'))
        .map((h) => h.replace(/^#+/, ''))
    )
  );
}

/**
 * Hashtag input area with textarea, tag chips display, and suggestion buttons.
 *
 * @param {object} props - Component properties.
 * @param {string} props.hashtags - Current hashtag input string (space-separated).
 * @param {(val: string) => void} props.setHashtags - Callback to update hashtag string.
 * @param {boolean} [props.disabled] - Disables input, remove, and suggestion buttons.
 *
 * @returns {JSX.Element} Rendered hashtag input and suggestion area.
 */
export function HashtagArea({
  hashtags,
  setHashtags,
  disabled,
}: {
  hashtags: string;
  setHashtags: (val: string) => void;
  disabled?: boolean;
}): JSX.Element {
  const currentTags = parseHashtags(hashtags);
  const removeTag = (tag: string) => {
    setHashtags(
      hashtags
        .split(/\s+/)
        .filter((h) => h.trim().replace(/^#+/, '') !== tag)
        .join(' ')
    );
  };
  const addTag = (tag: string) => {
    setHashtags(hashtags ? `${hashtags} ${tag}` : tag);
  };

  return (
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
        disabled={disabled}
      />

      {currentTags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1">
          {currentTags.map((t) => (
            <span key={t} className="inline-flex items-center text-[10px] font-bold uppercase">
              <span className="h-6 border-2 border-r-0 border-black bg-gray-200 px-2 py-0.5">{t}</span>
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="flex h-6 w-6 cursor-pointer items-center justify-center border-2 border-black bg-red-400 text-white hover:bg-red-600 hover:text-white"
                aria-label={`Remove ${t}`}
                disabled={disabled}
              >
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {SUGGESTED_HASHTAGS.filter((h) => !currentTags.includes(h)).length > 0 && (
        <div>
          <p className="mb-1 text-[10px] font-bold tracking-widest text-black/50 uppercase">Suggestions</p>
          <div className="flex flex-wrap gap-1">
            {SUGGESTED_HASHTAGS.filter((h) => !currentTags.includes(h)).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => addTag(h)}
                className="inline-flex items-center gap-1 border-2 border-black bg-white px-2 py-0.5 text-[10px] font-bold uppercase transition-colors hover:bg-yellow-400"
                disabled={disabled}
              >
                + {h}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
