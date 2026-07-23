/**
 * OG image generation route. Serves a default 1200×630 PNG for the entire site.
 * Cached on Vercel Edge for 7 days.
 *
 * Accessed at: /og or /og/preview.png
 */

import type { JSX } from 'react';

import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/**
 * Loads a Google Font as an ArrayBuffer for use with Satori.
 * Uses a browser-like User-Agent to receive woff2 URLs reliably.
 *
 * @param {string} family - Font family name.
 * @param {number} weight - Font weight.
 *
 * @returns {Promise<ArrayBuffer>} Font data as ArrayBuffer.
 */
async function loadFont(family: string, weight = 700): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&display=swap`;
  const css = await (
    await fetch(url, {
      cache: 'force-cache',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })
  ).text();
  const match = css.match(/url\(([^)]+)\)/);
  if (!match) {
    throw new Error(`Failed to load font: ${family}`);
  }
  return fetch(match[1], { cache: 'force-cache' }).then((r) => r.arrayBuffer());
}

/**
 * Generates the default OG image for the site.
 *
 * @returns {Promise<ImageResponse>} The OG image response.
 */
export async function GET(): Promise<ImageResponse> {
  const [poppinsBlack, poppinsBold, spaceGroteskRegular] = await Promise.all([
    loadFont('Poppins', 900),
    loadFont('Poppins', 700),
    loadFont('Space Grotesk', 400),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#0f0f0f',
          position: 'relative',
          fontFamily: '"Poppins", sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Saffron accent stripe on the left */}
        <div
          style={{
            display: 'flex',
            width: 24,
            height: '100%',
            background: 'linear-gradient(180deg, #fdc700 0%, #f59e0b 100%)',
            flexShrink: 0,
          }}
        />

        {/* Main content area */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', flex: 1 }}>
          {/* Top decorative line */}
          <div
            style={{ display: 'flex', width: 96, height: 4, background: '#fdc700', marginBottom: 32, borderRadius: 2 }}
          />

          {/* Main title */}
          <h1
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 64,
              fontWeight: 900,
              color: '#f5f5f5',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: 0,
              padding: 0,
            }}
          >
            <span>Indian Students</span>
            <span style={{ color: '#fdc700' }}>Protest Vault</span>
          </h1>

          {/* Tagline */}
          <p
            style={{
              display: 'flex',
              fontSize: 24,
              fontWeight: 400,
              color: '#a3a3a3',
              fontFamily: '"Space Grotesk", sans-serif',
              margin: '16px 0 0 0',
              padding: 0,
              letterSpacing: '0.02em',
            }}
          >
            A Peaceful Protest Archive
          </p>

          {/* Bottom decorative line */}
          <div
            style={{
              display: 'flex',
              width: 160,
              height: 2,
              background: '#fdc700',
              marginTop: 32,
              borderRadius: 1,
              opacity: 0.6,
            }}
          />
        </div>

        {/* Saffron accent stripe on the right */}
        <div
          style={{
            display: 'flex',
            width: 12,
            height: '100%',
            background: 'linear-gradient(180deg, #f59e0b 0%, #fdc700 100%)',
            flexShrink: 0,
          }}
        />

        {/* Saffron corner accent - bottom right */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 200,
            height: 200,
            borderTopLeftRadius: 160,
            background: 'rgba(253, 199, 0, 0.06)',
          }}
        />
      </div>
    ) as unknown as JSX.Element,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Poppins', data: poppinsBlack, weight: 900, style: 'normal' },
        { name: 'Poppins', data: poppinsBold, weight: 700, style: 'normal' },
        { name: 'Space Grotesk', data: spaceGroteskRegular, weight: 400, style: 'normal' },
      ],
      headers: { 'Cache-Control': 'public, max-age=604800, immutable' },
    }
  );
}
