import type { JSX } from 'react';

import { CheckCircle2 } from 'lucide-react';

/**
 * Success confirmation screen with check icon, title, and message.
 *
 * @param {object} props - Component properties.
 * @param {string} props.title - Heading text displayed below the check icon.
 * @param {string} props.message - Supporting description below the title.
 *
 * @returns {JSX.Element} Rendered success state.
 */
export function SuccessState({ title, message }: { title: string; message: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <CheckCircle2 className="h-14 w-14 text-green-600" />
      <p className="font-display mt-4 text-xl font-extrabold uppercase">{title}</p>
      <p className="mt-1 text-sm text-black/60">{message}</p>
    </div>
  );
}
