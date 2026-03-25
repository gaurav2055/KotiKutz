# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test framework is configured yet.

## Architecture

**KotiKutz** is a barbershop booking website built with Next.js (App Router) + React 19 + Tailwind CSS 4 + TypeScript.

### Routing

Uses the Next.js App Router (`src/app/`). Current routes:
- `/` — Home page with hero, offers carousel, locations grid, and services slider
- `/about` — Stub (PageHeader only)
- `/services` — Stub (PageHeader only)
- `/appointments` — Stub (PageHeader only)
- `/profile` — Stub (empty)

### Component Hierarchy

- `src/app/layout.tsx` — Root layout; wraps all pages with `<Navbar>` and `<Footer>`
- `src/components/ui/Button.tsx` — Base button atom with `primary`, `outline`, and `ghost` variants
- `src/components/PageHeader.tsx` — Reusable full-width header used by About, Services, and Appointments pages
- Other components: `HomeHero`, `ServicesSlider` (client component with carousel state), `LocationCard`, `ServiceCard`

### Styling

Tailwind CSS 4 via `@tailwindcss/postcss`. Global CSS variables are defined in `src/app/globals.css` and registered as Tailwind theme tokens:

| Token | Value | Usage |
|---|---|---|
| `brand-green` | `#00ff2a` | Accent, CTAs, hover states |
| `brand-dark` | `#0a0a0a` | Navbar, footer, overlays |
| `brand-blue` | `#0c8ce9` | Primary button background |
| `offers-bg` | `#e2e2e2` | Offers section background |
| `services-bg` | `#d9d9d9` | Services section background |

Use these as `bg-brand-green`, `text-brand-dark`, etc.

Path alias `@/*` maps to `src/*`.

Always use `<Image>` from `next/image` instead of `<img>`. External image domains must be added to `next.config.ts` under `images.remotePatterns`. Currently configured: `www.figma.com` (temporary — images will move to `/public`).

### Known TODOs in Codebase

- **Images**: All images currently use temporary Figma API URLs (`figma.com/api/mcp/asset/...`) that expire after 7 days. They need to be downloaded and moved to `/public`.
- **Hardcoded data**: Service and location data is hardcoded in components; needs backend integration.
- **Unimplemented pages**: About, Services, Appointments (forms/content), and Profile are scaffolded but empty.
