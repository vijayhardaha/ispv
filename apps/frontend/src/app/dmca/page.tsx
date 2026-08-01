import type { JSX } from 'react';

import { breadcrumbSchema } from '@vijayhardaha/schema-builder';
import { JsonLd } from '@vijayhardaha/schema-builder/react';
import type { Metadata } from 'next';

import { Container } from '@/components/ui/Container';
import { buildMetadata, buildBreadcrumbs, globalSchema, siteUrl } from '@/lib/seo';

// ── DMCA page config ───────────────────────────────────────────────────────

/** Site URL used in JSON-LD schemas. */
const ROOT_URL = siteUrl();

const PAGE_TITLE = 'DMCA — Indian Students Protest Vault';
const PAGE_DESCRIPTION =
  'DMCA copyright takedown notice policy for Indian Students Protest Vault. Learn how to submit a removal request for copyrighted content.';
const PAGE_PATH = '/dmca';

/** JSON-LD schemas for the DMCA page. */
const PAGE_SCHEMA = [
  ...globalSchema(),
  breadcrumbSchema({ rootUrl: ROOT_URL, items: buildBreadcrumbs(PAGE_PATH, 'DMCA') }),
];

// ── Page metadata ──────────────────────────────────────────────────────────

/** SEO metadata for the DMCA page, rendered server-side via next/js. */
export const metadata: Metadata = buildMetadata({ title: PAGE_TITLE, description: PAGE_DESCRIPTION, path: PAGE_PATH });

/**
 * DMCA / Copyright Takedown notice page.
 *
 * @returns {JSX.Element} Rendered DMCA page.
 */
export default function DmcaPage(): JSX.Element {
  return (
    <div>
      <JsonLd data={PAGE_SCHEMA} />
      <div className="py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="font-mono text-[10px] tracking-widest text-yellow-500 uppercase">/ DMCA</div>
            <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight uppercase md:text-5xl">
              DMCA Copyright Takedown Notice
            </h1>

            <section className="mt-8 space-y-6 leading-relaxed text-zinc-800">
              <p>
                Indian Students Protest Vault respects the intellectual property rights of others. We respond to valid
                copyright infringement notices submitted in accordance with the Digital Millennium Copyright Act (DMCA).
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">Filing a Takedown Notice</h2>
              <p>
                If you believe that your copyrighted work has been used on this site in a way that constitutes copyright
                infringement, please submit a DMCA notice containing the following information:
              </p>
              <ul className="list-inside list-disc space-y-2">
                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                <li>
                  Identification of the material that is claimed to be infringing, including the Instagram URL or direct
                  link to the content on this site.
                </li>
                <li>Your contact information including name, email address, and phone number (if available).</li>
                <li>A statement that you have a good faith belief that use of the material is not authorised.</li>
                <li>
                  A statement, under penalty of perjury, that the information in the notice is accurate and that you are
                  the copyright owner or authorised to act on the owner&apos;s behalf.
                </li>
                <li>Your physical or electronic signature.</li>
              </ul>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">Submitting a Notice</h2>
              <p>
                Send your DMCA takedown notice by sending a direct message on Instagram to{' '}
                <a
                  href="https://www.instagram.com/vegan.vijay/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline transition-colors hover:text-yellow-600"
                >
                  @vegan.vijay
                </a>
                . Please include all the required information listed above in your first message. We review all notices
                within 48 hours.
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">Counter-Notification</h2>
              <p>
                If you believe that material you submitted was removed in error, you may send a counter-notification
                containing your contact information, identification of the removed material, and a statement under
                penalty of perjury that you have a good faith belief the material was removed by mistake. Submit
                counter-notifications to the same Instagram contact above.
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">Repeat Infringers</h2>
              <p>
                We reserve the right to disable or remove content from users who are repeat infringers of copyright.
              </p>
            </section>
          </div>
        </Container>
      </div>
    </div>
  );
}
