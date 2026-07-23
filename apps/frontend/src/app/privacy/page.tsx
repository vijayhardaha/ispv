import type { JSX } from 'react';

import { breadcrumbSchema } from '@vijayhardaha/schema-builder';
import { JsonLd } from '@vijayhardaha/schema-builder/react';
import type { Metadata } from 'next';

import { Container } from '@/components/ui/Container';
import { buildMetadata } from '@/utils/meta';
import { buildBreadcrumbs, globalSchema } from '@/utils/schema';
import { siteUrl } from '@/utils/seo';

const title = 'Privacy Policy — Indian Students Protest Vault';
const description =
  'Privacy policy for Indian Students Protest Vault. Learn about what data we collect, how we use it, and your rights.';
const path = '/privacy';
const rootUrl = siteUrl();

export const metadata: Metadata = buildMetadata({ title, description, path });

const schemaData = [...globalSchema(), breadcrumbSchema({ rootUrl, items: buildBreadcrumbs(path, 'Privacy Policy') })];

/**
 * Privacy Policy page.
 *
 * @returns {JSX.Element} Rendered privacy policy page.
 */
export default function PrivacyPage(): JSX.Element {
  return (
    <div>
      <JsonLd data={schemaData} />
      <div className="py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="font-mono text-[10px] tracking-widest text-yellow-500 uppercase">/ Privacy</div>
            <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight uppercase md:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-zinc-500">Last updated: July 2026</p>

            <section className="mt-8 space-y-6 leading-relaxed text-zinc-800">
              <h2 className="font-display text-xl font-bold tracking-tight uppercase">1. What We Collect</h2>
              <p>
                Indian Students Protest Vault does not require user accounts, logins, or personal information to browse
                the archive. We do not collect, store, or process any personal data from visitors.
              </p>
              <p>
                When you submit a video URL through our submission form, we only store the Instagram URL and any
                metadata you choose to provide (category, location, tags). We do not ask for or store your name, email
                address, or any other personal identifier.
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">2. Embedded Content</h2>
              <p>
                This site embeds videos directly from Instagram. When you view an embedded video, your browser connects
                directly to Instagram&apos;s servers. Instagram may set cookies and collect data according to their own
                privacy policy. We have no control over Instagram&apos;s data practices.
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">3. Analytics</h2>
              <p>
                This site uses Google Analytics to collect anonymous, aggregated data about page views and user
                interactions. This helps us understand which parts of the archive are most useful. Google Analytics does
                not identify individual users and we do not combine analytics data with any personal information.
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">4. Cookies</h2>
              <p>
                We do not set any first-party cookies. Third-party cookies may be set by Instagram (for embedded
                content) and Google Analytics. You can control cookie preferences through your browser settings.
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">5. Data Retention</h2>
              <p>
                Video submission metadata is retained indefinitely as part of the archive. If you wish to have a
                submission removed, please DM{' '}
                <a
                  href="https://www.instagram.com/vegan.vijay/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline transition-colors hover:text-yellow-600"
                >
                  @vegan.vijay
                </a>{' '}
                on Instagram with the relevant details.
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">6. Third-Party Services</h2>
              <p>This site uses the following third-party services:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>Instagram / Meta — video embedding</li>
                <li>Google Analytics — anonymous usage tracking</li>
                <li>Vercel — hosting and CDN</li>
              </ul>
              <p>
                Each service operates under its own privacy policy. We encourage you to review their policies for more
                information.
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">7. Your Rights</h2>
              <p>
                Depending on your jurisdiction, you may have rights regarding your data, including the right to access,
                correct, or request deletion. To exercise these rights, contact us through Instagram.
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">8. Changes</h2>
              <p>
                We may update this privacy policy from time to time. Changes will be posted on this page with an updated
                date.
              </p>

              <h2 className="font-display text-xl font-bold tracking-tight uppercase">9. Contact</h2>
              <p>
                For privacy-related questions, DM{' '}
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
