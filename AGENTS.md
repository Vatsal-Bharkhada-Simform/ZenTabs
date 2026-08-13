<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Development Instructions

## Development Philosophy

This project follows **iterative feature development**. Each phase is built, tested, and signed off before the next begins. No phase starts until the prior one is approved by the user.

```
Build → Dev Test → Refine → User Sign-off → Next Phase
```

## Design System Rules

Two skills govern all UI work in this project:
- `/high-end-visual-design` — premium agency-tier aesthetics, Double-Bezel cards, spring physics motion, Bento layout
- `/minimalist-ui` — warm monochrome palette, editorial typography, `1px solid #EAEAEA` borders, no heavy shadows

**Always read both SKILL.md files before touching any UI file.**

### Design Direction Per Surface

| Surface | Direction |
|---|---|
| Landing Page (`/`) | Minimalist — warm bone bg, massive Manrope heading, glass pill nav (kept minimal), asymmetric bento layout. **No serif fonts.** |
| Auth Pages (`/login`, `/register`) | Soft Structuralism — clean, centered, minimal friction |
| Dashboard / App Shell | Premium Utilitarian Minimalism — warm bone bg `#F7F6F3`, `#EAEAEA` borders, flat bento cards |

### Banned Patterns (Both Skills Combined)

- ❌ Fonts: Inter, Roboto, Arial, Open Sans
- ❌ Icons: Generic Lucide, Feather, FontAwesome thick-stroked
- ❌ Shadows: `shadow-md`, `shadow-lg`, `shadow-xl`, `rgba(0,0,0,0.3)` drop shadows
- ❌ Motion: `linear`, `ease-in-out` transitions; instant state changes
- ❌ Layout: Edge-to-edge sticky navbars; Bootstrap-style symmetric grids
- ❌ Colors: Neon, gradients (except subtle ambient), oversaturated
- ❌ Copy: "Elevate", "Seamless", "Unleash", "Next-Gen", "Game-changer", "Delve"
- ❌ Emojis anywhere in markup or content

## Font Stack

Loaded via `next/font/google` in `lib/fonts.ts`:
- **Body / UI** (primary sans): `Manrope`
- **Metadata / code**: `Space Mono`

> No serif fonts. The editorial feel comes from typographic weight contrast and spacing, not font category.

## Design Token Source of Truth

All tokens are CSS custom properties defined in `app/globals.css`.  
**Never** hard-code hex values or spacing units in component files — always reference a `--color-*` or `--space-*` variable.

## Component Architecture

Primitive components live in `components/ui/`. Feature components live in `components/features/`.

### Primitive rules:
- Accept a `variant` prop — never style-switch via ad-hoc `className` overrides
- Use the Double-Bezel pattern for all card-like containers (outer shell + inner core)
- Use `transform` and `opacity` exclusively for animations — never `top/left/width/height`
- `backdrop-blur` only on `position: fixed` or `position: sticky` elements

## CSS Rules

This project uses **Tailwind CSS v4** (`@import "tailwindcss"` in globals.css — no `tailwind.config.js` needed).

- Global CSS custom properties are defined in `app/globals.css` under `:root`
- Tailwind utilities supplement tokens; they do not replace them
- CSS Modules are allowed for highly component-specific styles
- Never use `@apply` for design tokens — use CSS variables directly

## File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Page | `page.tsx` | `app/(app)/dashboard/page.tsx` |
| Layout | `layout.tsx` | `app/(app)/layout.tsx` |
| Primitive component | `PascalCase.tsx` | `components/ui/Button.tsx` |
| Feature component | `PascalCase.tsx` | `components/features/BookmarkCard.tsx` |
| Server action | `camelCase.ts` | `lib/actions/bookmarks.ts` |
| Prisma client | `prisma.ts` | `lib/prisma.ts` |
| Auth config | `auth.ts` | `auth.ts` (root) |

## API & Data Access Rules

- **Server Components** fetch data directly via Prisma — no `fetch()` to own API routes
- **Client Components** use Server Actions for mutations, `fetch()` to Route Handlers for complex queries
- **Route Handlers** (`app/api/**`) validate session with `auth()` from `auth.ts` before any DB access
- Always use `prisma.$transaction` for multi-step writes (e.g., create bookmark + log visit)
- Soft-delete = set `deletedAt = new Date()`. Hard-delete = `prisma.model.delete()`

## Phase Gate Checklist

Before marking any phase complete:

- [ ] All new routes render without console errors
- [ ] No TypeScript errors (`pnpm build` passes or `tsc --noEmit` passes)
- [ ] Design tokens used — no hard-coded hex or spacing
- [ ] No banned fonts, icons, or shadows present
- [ ] Animations use only `transform` / `opacity`
- [ ] `backdrop-blur` only on fixed/sticky elements
- [ ] Mobile layout collapses gracefully at `< 768px`
- [ ] User has visually approved the feature
