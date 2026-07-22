# Monorepo Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate 3 projects (frontend, admin, Chrome extension) into a Bun workspace monorepo with shared tooling.

**Architecture:** Single workspace root with `apps/frontend`, `apps/admin`, and `chrome-extension` as workspace members. Each workspace has its own ESLint config (Next.js requires it), shares Prettier and TypeScript base configs from root.

**Tech Stack:** Bun workspaces, Next.js 16, TypeScript 6, ESLint 10, Prettier 3

## Global Constraints

- Must use `git mv` for files moving from root → `apps/frontend/` to preserve history
- Root `package.json` is replaced (not moved from old root)
- Each Next.js workspace must have its own `eslint.config.mjs` in its project root
- Admin `tsconfig.json` must extend root `tsconfig.json` (not `@vijayhardaha/dev-config` directly)
- All deps remain in workspace-level `package.json` files (no hoisting assumptions)
- `bun.lock` stays at repo root as single lockfile

---

### Task 1: Move frontend into apps/frontend/

**Files:**

- Create: `apps/frontend/` directory
- Move: `src/`, `public/`, `next.config.ts`, `postcss.config.mjs`, `next-env.d.ts`, `components.json` → `apps/frontend/`
- Modify: `apps/frontend/package.json`

- [ ] **Step 1: Create apps/frontend/ and git mv existing files**

```bash
cd /Users/vijay/xoxo/apps/indian-students-protest
mkdir -p apps/frontend
git mv src apps/frontend/
git mv public apps/frontend/
git mv next.config.ts apps/frontend/
git mv postcss.config.mjs apps/frontend/
git mv next-env.d.ts apps/frontend/
git mv components.json apps/frontend/
```

- [ ] **Step 2: Merge root package.json into apps/frontend/package.json**

Read `apps/frontend/package.json` (currently the old root package.json that was moved). Update it:

```json
{
  "name": "@reel-vault/frontend",
  "version": "0.0.0",
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "lint": "eslint .",
    "lint:fix": "eslint --fix .",
    "tsc": "tsc --noEmit"
  },
  "author": { "name": "Vijay Hardaha", "url": "https://github.com/vijayhardaha/" },
  "license": "MIT",
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.20",
    "@radix-ui/react-dropdown-menu": "^2.1.21",
    "@radix-ui/react-select": "^2.3.4",
    "@radix-ui/react-slot": "^1.3.0",
    "@tailwindcss/postcss": "^4.3.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^1.25.0",
    "next": "^16.2.10",
    "postcss": "^8.5.20",
    "radix-ui": "^1.6.4",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "tailwind-merge": "^3.6.0",
    "tailwindcss": "^4.3.3",
    "tw-animate-css": "^1.4.0"
  },
  "devDependencies": {
    "@eslint/compat": "^2.1.0",
    "@eslint/js": "^10.0.1",
    "@prettier/plugin-xml": "^3.4.2",
    "@types/node": "^26.1.1",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@typescript-eslint/eslint-plugin": "^8.65.0",
    "@typescript-eslint/parser": "^8.65.0",
    "@vijayhardaha/dev-config": "^2.2.0",
    "eslint": "^10.7.0",
    "eslint-config-next": "^16.2.10",
    "eslint-config-prettier": "^10.1.8",
    "eslint-import-resolver-typescript": "^4.4.5",
    "eslint-plugin-import-x": "^4.17.1",
    "eslint-plugin-jsdoc": "^63.2.0",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "eslint-plugin-prettier": "^5.5.6",
    "eslint-plugin-react-hooks": "^7.1.1",
    "globals": "^17.7.0",
    "prettier": "^3.9.6",
    "prettier-plugin-tailwindcss": "^0.8.1",
    "typescript": "^6.0.3",
    "typescript-eslint": "^8.65.0"
  },
  "trustedDependencies": ["sharp", "unrs-resolver"]
}
```

Remove `format`/`format:check` scripts from frontend (root handles those).

Edit the file using Write.

- [ ] **Step 3: Create apps/frontend/eslint.config.mjs**

```js
import { createConfig } from "@vijayhardaha/dev-config/eslint/next";

export default createConfig();
```

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/
git rm --cached package.json  # unstage the old root package.json that was moved
git add apps/frontend/package.json
git commit -m "refactor: move frontend into apps/frontend/"
```

---

### Task 2: Set up workspace root

**Files:**

- Modify: `package.json` (root — replace with workspace root)
- Modify: `tsconfig.json` (root — make base config)
- Keep: `eslint.config.mjs`, `prettier.config.mjs` (modify eslint to be base)

- [ ] **Step 1: Replace root package.json**

```json
{
  "name": "reel-vault-monorepo",
  "private": true,
  "workspaces": ["apps/*", "chrome-extension"],
  "scripts": {
    "dev:frontend": "bun run --filter @reel-vault/frontend dev",
    "dev:admin": "bun run --filter @reel-vault/admin dev",
    "dev": "bun run dev:frontend & bun run dev:admin",
    "build": "bun run --filter @reel-vault/frontend build && bun run --filter @reel-vault/admin build",
    "lint": "bun run --filter @reel-vault/frontend lint && bun run --filter @reel-vault/admin lint",
    "lint:fix": "bun run --filter @reel-vault/frontend lint:fix && bun run --filter @reel-vault/admin lint:fix",
    "tsc": "bun run --filter @reel-vault/frontend tsc && bun run --filter @reel-vault/admin tsc",
    "format": "prettier --write --log-level error .",
    "format:check": "prettier --check ."
  }
}
```

- [ ] **Step 2: Update root tsconfig.json as base config**

Strip it down to a base that workspaces extend:

```json
{
  "extends": "@vijayhardaha/dev-config/tsconfig",
  "compilerOptions": { "strict": true, "skipLibCheck": true },
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json tsconfig.json
git commit -m "chore: set up workspace root with Bun workspaces"
```

---

### Task 3: Update admin workspace

**Files:**

- Modify: `apps/admin/package.json`
- Create: `apps/admin/eslint.config.mjs`
- Modify: `apps/admin/tsconfig.json`

- [ ] **Step 1: Update apps/admin/package.json**

Add `name`, `version`, `private`, and add `lint`/`lint:fix`/`tsc`/`format` scripts:

```json
{
  "name": "@reel-vault/admin",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "eslint .",
    "lint:fix": "eslint --fix .",
    "tsc": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^16.2.10",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "@supabase/supabase-js": "^2.49.0",
    "@supabase/ssr": "^0.6.0",
    "@vercel/blob": "^0.27.0",
    "lucide-react": "^1.25.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.8.0",
    "tailwindcss": "^4.3.3",
    "@tailwindcss/postcss": "^4.3.3",
    "postcss": "^8.5.0"
  }
}
```

- [ ] **Step 2: Create apps/admin/eslint.config.mjs**

Admin doesn't use the Next.js plugin directly — uses a clean TS/React config:

```js
import { createConfig } from "@vijayhardaha/dev-config/eslint/next";

export default createConfig();
```

(Keeps consistent with frontend config since `@vijayhardaha/dev-config` handles Next.js detection internally.)

- [ ] **Step 3: Update apps/admin/tsconfig.json to extend root**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/admin/package.json apps/admin/eslint.config.mjs apps/admin/tsconfig.json
git commit -m "chore: update admin workspace for monorepo"
```

---

### Task 4: Add chrome-extension package.json

**Files:**

- Create: `chrome-extension/package.json`

- [ ] **Step 1: Create chrome-extension/package.json**

```json
{ "name": "@reel-vault/extension", "version": "0.1.0", "private": true }
```

- [ ] **Step 2: Commit**

```bash
git add chrome-extension/package.json
git commit -m "chore: add chrome extension to workspace"
```

---

### Task 5: Update supporting files

**Files:**

- Modify: `AGENTS.md`
- Modify: `.gitignore`
- Modify: `.vscode/settings.json` (if exists)

- [ ] **Step 1: Update AGENTS.md paths**

Read `AGENTS.md` and update any references that assume files at root. Change paths that say `src/...` to `apps/frontend/src/...` where appropriate, or add a note that the frontend is now at `apps/frontend`.

Key changes needed:

- Project structure tree: mirror the new layout
- Commands section: add workspace-level dev commands

- [ ] **Step 2: Update .gitignore**

Remove any frontend-specific ignores that need to be relative. Add ignore for `.next/` in `apps/*/` patterns. Ensure `apps/admin/.next/` and `apps/frontend/.next/` are covered.

Read `.gitignore` first, then update.

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md .gitignore .vscode/
git commit -m "docs: update paths for monorepo structure"
```

---

### Task 6: Install dependencies and verify

**No new files.**

- [ ] **Step 1: Install dependencies from workspace root**

```bash
cd /Users/vijay/xoxo/apps/indian-students-protest
rm apps/admin/bun.lock  # remove standalone lockfile
bun install
```

Expected: single `bun.lock` at repo root, all workspace deps resolved.

- [ ] **Step 2: Run TypeScript check on both workspaces**

```bash
bun run tsc
```

Expected: Clean exit (no type errors). If there are pre-existing errors, note them.

- [ ] **Step 3: Run ESLint on both workspaces**

```bash
bun run lint
```

Expected: Clean exit or pre-existing lint warnings.

- [ ] **Step 4: Run format check**

```bash
bun run format:check
```

Expected: Clean or list of formatting issues.

- [ ] **Step 5: Commit final state**

```bash
git add bun.lock
git add -u  # any remaining changes
git commit -m "chore: install workspace deps and verify"
```

---

### Task 7: Cleanup stale root files

**Files:**

- Remove: `tsconfig.tsbuildinfo` (root — moved with frontend, stale reference)

- [ ] **Step 1: Remove stale root files**

```bash
cd /Users/vijay/xoxo/apps/indian-students-protest
git rm --ignore-unmatch tsconfig.tsbuildinfo
git rm --ignore-unmatch .prettierignore
```

Check `git status` for any other files that should have been moved or cleaned.

- [ ] **Step 2: Final verification**

```bash
bun run tsc
bun run lint
bun run format:check
```

- [ ] **Step 3: Commit cleanup**

```bash
git add -u
git commit -m "chore: clean up stale root files after monorepo migration"
```
