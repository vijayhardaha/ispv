import { getCategories, type DbCategory } from '@/lib/db';

let cache: DbCategory[] | null = null;

export async function ensureCategoryCache(): Promise<DbCategory[]> {
  if (!cache) {
    cache = await getCategories();
  }
  return cache;
}

export function getCategoryByValueSync(value: string): DbCategory | undefined {
  return cache?.find((c) => c.value === value);
}

export function getCategoryName(value: string): string {
  return cache?.find((c) => c.value === value)?.name ?? value;
}
