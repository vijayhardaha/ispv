import type { JSX } from 'react';

import { breadcrumbSchema } from '@vijayhardaha/schema-builder';
import { JsonLd } from '@vijayhardaha/schema-builder/react';
import type { Metadata } from 'next';

import { Container } from '@/components/ui/Container';
import { buildMetadata } from '@/lib/meta';
import { buildBreadcrumbs, globalSchema } from '@/lib/schema';
import { siteUrl } from '@/lib/seo';

const title = 'Terms of Service — Indian Students Protest Vault';
const description =
  'Terms of service for Indian Students Protest Vault. Understand the rules and guidelines for using this archive.';
const path = '/terms';
const rootUrl = siteUrl();

export const metadata: Metadata = buildMetadata({ title, description, path });

const schemaData = [
  ...globalSchema(),
  breadcrumbSchema({ rootUrl, items: buildBreadcrumbs(path, 'Terms of Service') }),
];

/**
 * Terms of Service page.
 *
 * @returns {JSX.Element} Rendered terms page.
 */
export default function TermsPage(): JSX.Element {
  return (
    <div>
      <JsonLd data={schemaData} />
      <div className="py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="font-mono text-[10px] tracking-widest text-yellow-500 uppercase">/ Terms</div>
            <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight uppercase md:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-zinc-500">Last updated: July 2026</p>

            <section className="mt-8 space-y-6 leading-relaxed text-zinc-800">
              <h2 className="font-display text-xl font-bold tracking-tight uppercase">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Indian Students Protest Vault, you agree to be bound by these Terms of Service. If
                you do not agree with any part of these terms, you should not use this site.
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">2. Description of Service</h2>
              <p>
                Indian Students Protest Vault is a non-partisan digital archive that indexes publicly shared Instagram
                reels related to student protests across India. We do not host, store, or distribute any video files.
                All content remains embedded from Instagram and is the property of its original creators.
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">3. User Conduct</h2>
              <p>When using this site, you agree not to:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>Use the site for any unlawful purpose or in violation of any applicable laws.</li>
                <li>Attempt to scrape, crawl, or otherwise extract data in an automated manner without permission.</li>
                <li>
                  Submit false or misleading information through the submission form, including spam or irrelevant
                  content.
                </li>
                <li>Interfere with the proper functioning of the site or its underlying infrastructure.</li>
              </ul>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">4. Intellectual Property</h2>
              <p>
                All videos indexed on this site remain the intellectual property of their original creators. The site
                itself, including its code, design, and text content, is protected by applicable copyright laws.
                Unauthorised reproduction or redistribution of the site&apos;s code or design is prohibited.
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">5. Third-Party Content</h2>
              <p>
                This site embeds content from Instagram. We are not responsible for the content, accuracy, or
                availability of embedded third-party content. All embedded content is subject to Instagram&apos;s terms
                of service and privacy policy.
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">6. Disclaimer of Warranties</h2>
              <p>
                This site is provided &quot;as is&quot; and &quot;as available&quot; without any warranties, express or
                implied. We do not guarantee that the site will be uninterrupted, secure, or error-free. The archive is
                maintained for educational and journalistic purposes.
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">7. Limitation of Liability</h2>
              <p>
                Indian Students Protest Vault and its operator shall not be liable for any damages arising out of or
                related to your use of the site, including but not limited to direct, indirect, incidental, or
                consequential damages.
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">8. Content Removal</h2>
              <p>
                If you are the original creator of a video indexed on this site and wish to have it removed, please DM{' '}
                <a
                  href="https://www.instagram.com/vegan.vijay/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline transition-colors hover:text-yellow-600"
                >
                  @vegan.vijay
                </a>{' '}
                on Instagram with the link and reason. Removal requests from video owners are prioritised and typically
                processed within 48 hours.
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">9. Modifications</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be posted on this page with an
                updated date. Continued use of the site after changes constitutes acceptance of the new terms.
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">10. Contact</h2>
              <p>
                For questions about these terms, DM{' '}
                <a
                  href="https://www.instagram.com/vegan.vijay/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline transition-colors hover:text-yellow-600"
                >
                  @vegan.vijay
                </a>{' '}
                on Instagram.
              </p>
            </section>
          </div>
        </Container>
      </div>
    </div>
  );
}
