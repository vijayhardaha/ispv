'use client';

import { type JSX } from 'react';

import { Hash, X as XIcon } from 'lucide-react';

import { FieldLabel, Textarea } from '@/components/ui/Input';
import { countWords, MAX_TAGS, MAX_WORDS, parseTags } from '@/lib/helpers/tags';

/**
 * Suggested tags shown when none are currently added.
 */
const SUGGESTED_TAGS = [
  'Laathi Charge',
  'Tear Gas',
  'Funny Moment',
  'Students Speech',
  'Jantar-Mantar',
  'Ground Reporting',
  'Highlights',
  'Review',
  'Experience',
  'Women Leadership',
];

/**
 * Tag input area with textarea, tag chips display, suggestion buttons, and validation.
 *
 * @param {object} props - Component properties.
 * @param {string} props.tags - Current tag input string (comma-separated).
 * @param {(val: string) => void} props.setTags - Callback to update tag string.
 * @param {boolean} [props.disabled] - Disables input, remove, and suggestion buttons.
 *
 * @returns {JSX.Element} Rendered tag input and suggestion area.
 */
export function TagArea({
  tags,
  setTags,
  disabled,
}: {
  tags: string;
  setTags: (val: string) => void;
  disabled?: boolean;
}): JSX.Element {
  const currentTags = parseTags(tags);
  const wordCount = countWords(currentTags);
  const atMaxTags = currentTags.length >= MAX_TAGS;
  const atMaxWords = wordCount >= MAX_WORDS;

  const removeTag = (tag: string) => {
    setTags(currentTags.filter((t) => t !== tag).join(', '));
  };

  const addTag = (tag: string) => {
    const newTags = [...currentTags, tag];
    const newWordCount = countWords(newTags);
    if (newTags.length <= MAX_TAGS && newWordCount <= MAX_WORDS) {
      setTags(newTags.join(', '));
    }
  };

  return (
    <div className="space-y-1">
      <FieldLabel htmlFor="reel-tags" className="flex w-full items-center justify-between">
        <span className="inline-flex items-center gap-1.5">
          <Hash className="size-3.5" /> Tags
        </span>
        <span className="text-xs font-bold text-zinc-700">
          {currentTags.length}/{MAX_TAGS} tags &middot; {wordCount}/{MAX_WORDS} words
        </span>
      </FieldLabel>
      <Textarea
        id="reel-tags"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="protest, students, New Delhi"
        rows={2}
        disabled={disabled}
      />

      {currentTags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1">
          {currentTags.map((t) => (
            <span key={t} className="inline-flex items-center text-[10px] font-bold uppercase">
              <span className="inline-flex h-6 items-center justify-center border-2 border-r-0 border-black bg-gray-200 px-2 py-0.5 leading-none">
                {t}
              </span>
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="flex h-6 w-6 cursor-pointer items-center justify-center border-2 border-black bg-red-400 text-white hover:bg-red-600 hover:text-white"
                aria-label={`Remove ${t}`}
                disabled={disabled}
              >
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {!atMaxTags && !atMaxWords && SUGGESTED_TAGS.length > 0 && (
        <div>
          <p className="mb-1 text-[10px] font-bold tracking-widest text-black/50 uppercase">Suggestions</p>
          <div className="flex flex-wrap gap-1">
            {SUGGESTED_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => addTag(t)}
                className="inline-flex items-center gap-1 border-2 border-black bg-white px-2 py-0.5 text-[10px] font-bold uppercase transition-colors hover:bg-yellow-400"
                disabled={disabled}
              >
                + {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
