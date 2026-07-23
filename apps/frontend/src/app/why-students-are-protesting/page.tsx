import type { JSX } from 'react';

import { breadcrumbSchema, webPageSchema } from '@vijayhardaha/schema-builder';
import { JsonLd } from '@vijayhardaha/schema-builder/react';
import type { Metadata } from 'next';

import { ClosingCtaSection } from '@/app/why-students-are-protesting/sections/ClosingCtaSection';
import { CoreDemandsSection } from '@/app/why-students-are-protesting/sections/CoreDemandsSection';
import { MovementHero } from '@/app/why-students-are-protesting/sections/MovementHero';
import { SourcesSection } from '@/app/why-students-are-protesting/sections/SourcesSection';
import { WhatIsSection } from '@/app/why-students-are-protesting/sections/WhatIsSection';
import { WhereSpreadSection } from '@/app/why-students-are-protesting/sections/WhereSpreadSection';
import { WhyDidBeginSection } from '@/app/why-students-are-protesting/sections/WhyDidBeginSection';
import { WhyThisArchiveExistsSection } from '@/app/why-students-are-protesting/sections/WhyThisArchiveExistsSection';
import { buildMetadata } from '@/lib/meta';
import { buildBreadcrumbs, globalSchema } from '@/lib/schema';
import { siteUrl } from '@/lib/seo';

const title = 'Why Students Are Protesting — Understanding the Movement';
const description =
  'Understand why Indian students are protesting — the origins, demands, timeline, and purpose behind the student movement documented in the Indian Students Protest Vault archive.';
const path = '/why-students-are-protesting';
const rootUrl = siteUrl();

export const metadata: Metadata = buildMetadata({ title, description, path, postfix: true });

const schemaData = [
  ...globalSchema(),
  webPageSchema({ rootUrl, path, breadcrumb: true }, { name: title, description }),
  breadcrumbSchema({ rootUrl, items: buildBreadcrumbs(path, 'Why Students Are Protesting') }),
];

/**
 * The Movement page — explains why students are protesting, the movement's origins,
 * demands, timeline, and how the archive documents it.
 *
 * @returns {JSX.Element} Rendered movement page.
 */
export default function MovementPage(): JSX.Element {
  return (
    <div>
      <JsonLd data={schemaData} />
      <MovementHero />
      <WhatIsSection />
      <WhyDidBeginSection />
      <CoreDemandsSection />
      <WhereSpreadSection />
      <WhyThisArchiveExistsSection />
      <SourcesSection />
      <ClosingCtaSection />
    </div>
  );
}
