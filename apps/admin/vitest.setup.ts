import { vi } from 'vitest';

global.console = { ...console, log: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() };

// revalidateTag throws "Invariant: static generation store missing" when called
// outside a Next.js request context. Stub next/cache in tests so API route
// handlers that revalidate the dashboard cache can run under Vitest.
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T): T => fn,
}));
