import { describe, expect, it } from 'vitest';

import { buildMetadata } from '../meta';

describe('buildMetadata', () => {
  it('builds metadata with defaults', () => {
    const meta = buildMetadata({ title: '', description: '' }) as any;
    expect(meta).toBeDefined();
    expect(meta.title).toBeDefined();
    expect(meta.description).toBeDefined();
    expect(meta.metadataBase).toBeDefined();
    expect(meta.alternates.canonical).toBe('http://localhost:3000');
  });

  it('builds metadata with title, description, and postfix', () => {
    const meta = buildMetadata({
      title: 'Custom Title',
      description: 'Custom Description',
      path: '/custom',
      postfix: true,
    }) as any;

    expect(meta.title).toContain('Custom Title');
    expect(meta.title).toContain('|');
    expect(meta.description).toBe('Custom Description');
    expect(meta.alternates.canonical).toBe('http://localhost:3000/custom');
  });

  it('builds metadata without postfix when postfix is false', () => {
    const meta = buildMetadata({ title: 'Plain Title', description: 'Plain Description', postfix: false }) as any;

    expect(meta.title).toBe('Plain Title');
  });
});
