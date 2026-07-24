import type { JSX, ReactNode } from 'react';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Tag, type TagVariant } from '@/components/ui/Tag';

/**
 * Reusable section header with tag, heading, description, and a "View all" link.
 *
 * @param {object} props - Component properties.
 * @param {TagVariant} props.tagVariant - Colour variant for the tag badge.
 * @param {string} props.tagText - Text displayed inside the tag badge.
 * @param {ReactNode} [props.tagIcon] - Optional icon rendered inside the tag.
 * @param {ReactNode} props.heading - Section heading text or JSX.
 * @param {string} [props.description] - Optional description paragraph.
 * @param {string} [props.descriptionClassName] - Additional classes for the description paragraph.
 * @param {string} props.href - URL the "View all" button links to.
 * @param {string} [props.buttonText] - Label for the action button.
 * @param {ReactNode} [props.buttonIcon] - Optional icon before the button label.
 * @param {string} [props.className] - Additional classes for the outer container.
 *
 * @returns {JSX.Element} Rendered section header.
 */
export function SectionHeader({
  tagVariant,
  tagText,
  tagIcon,
  heading,
  description,
  descriptionClassName,
  href,
  buttonText = 'View all',
  buttonIcon,
  className,
}: {
  tagVariant: TagVariant;
  tagText: string;
  tagIcon?: ReactNode;
  heading: ReactNode;
  description?: string;
  descriptionClassName?: string;
  href: string;
  buttonText?: string;
  buttonIcon?: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <div
      className={`mb-6 flex w-full flex-col gap-4 border-b-2 border-zinc-900 pb-6 md:flex-row md:items-end md:justify-between ${className ? ` ${className}` : ''}`}
    >
      <div>
        <Tag variant={tagVariant} text={tagText} icon={tagIcon} />
        <h2 className="text-4xl font-bold tracking-tighter uppercase md:text-5xl">{heading}</h2>
        {description && (
          <p className={`mt-2 text-zinc-700${descriptionClassName ? ` ${descriptionClassName}` : ''}`}>{description}</p>
        )}
      </div>
      <div className="mt-2 flex shrink-0 justify-start md:justify-end">
        <Link href={href}>
          <Button variant="default-outline" size="sm">
            {buttonIcon}
            {buttonText} <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
