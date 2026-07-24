import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';
export const preferredRegion = 'iad1';
export const revalidate = 86400;

/**
 * Generates dynamic Open Graph preview image response.
 * Uses the yellow and black brutalist colour palette from the frontend.
 *
 * @returns {Promise<ImageResponse>} Dynamic OG image response.
 */
export async function GET(): Promise<ImageResponse> {
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f4f6',
        border: '6px solid #000',
        fontFamily: '"Space Grotesk", "Poppins", sans-serif',
        padding: 48,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{ width: 32, height: 32, background: '#facc15', border: '3px solid #000' }} />
        <div style={{ width: 32, height: 32, background: '#facc15', border: '3px solid #000' }} />
        <div style={{ width: 32, height: 32, background: '#facc15', border: '3px solid #000' }} />
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          textAlign: 'center',
          color: '#000',
          maxWidth: 900,
        }}
      >
        Indian Students Protest Vault
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 600,
          textAlign: 'center',
          color: '#525252',
          marginTop: 16,
          maxWidth: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
        }}
      >
        A Peaceful Protest Archive
      </div>
      <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
        {['#Archived', '#StudentProtests', '#India'].map((tag) => (
          <div
            key={tag}
            style={{
              padding: '8px 16px',
              border: '3px solid #000',
              background: '#000',
              color: '#f3f4f6',
              fontSize: 20,
              fontWeight: 700,
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
