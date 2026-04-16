# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev      # Start development server
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

No test framework is configured yet.

## Architecture

**KotiKutz** is a barbershop booking website built with Next.js (App Router) + React 19 + Tailwind CSS 4 + TypeScript, with Supabase as the backend (auth + database).

### Routing

Uses the Next.js App Router (`src/app/`). `src/middleware.ts` runs on all `/admin/*` routes: redirects unauthenticated users and `customer`-role users to `/`, and injects `x-user-role`, `x-user-id`, and `x-user-location` request headers for use by admin pages.

**Client-facing:**
- `/` — Home page (hero, offers carousel, locations grid, popular services)
- `/about` — About page (hero, our story, what we do, team slider)
- `/services` — Services listing with category sidebar
- `/appointments` — Book / manage appointments (guests can view; booking requires auth)
- `/profile` — User profile (personal info, change password, recent activity, notifications)
- `/testimonials` — Customer testimonials with write-review modal
- `/auth/callback` — Handles Supabase invite and password-reset tokens; redirects to the appropriate page
- `/auth/set-password` — Customers set a new password after a forgot-password reset

**Admin (`/admin/*` — requires `employee`, `manager`, or `super_admin` role):**

Three-tier role hierarchy:
- `employee` — limited access; redirected to `/admin/appointments` on login
- `manager` — intermediate access (dashboard, services, offers, cancellation/change requests)
- `super_admin` — full access including staff, locations, content, customers, testimonials

Routes:
- `/admin` — redirects `employee` → `/admin/appointments`, all others → `/admin/dashboard`
- `/admin/dashboard` — Analytics, revenue, appointment stats
- `/admin/appointments` — View and manage all appointments
- `/admin/cancellation-requests` — Review pending cancellation requests
- `/admin/change-requests` — Review pending reschedule/change requests
- `/admin/customers` — Customer list (`super_admin` only)
- `/admin/staff` — Staff management (`super_admin` only; invite via email)
- `/admin/services` — Service CRUD
- `/admin/locations` — Location CRUD (`super_admin` only)
- `/admin/offers` — Offers/promotions CRUD
- `/admin/testimonials` — Testimonial moderation (`super_admin` only)
- `/admin/content` — CMS content management (`super_admin` only)
- `/admin/profile` — Admin profile page
- `/admin/set-password` — New staff set their password after accepting an invite email

### Auth Flow

- **Login / Signup / Forgot Password** — `AuthModal` (`src/components/auth/AuthModal.tsx`)
- **Staff invite** — super_admin creates account via `/admin/staff` → Supabase sends invite email → staff clicks link → `/auth/callback` → `/admin/set-password`
- **Forgot password** — customer requests reset via AuthModal → email → `/auth/callback` → `/auth/set-password`
- **Change password** — authenticated users via `ChangePasswordModal` on `/profile`
- **Auth context** — `src/contexts/AuthContext.tsx` provides `user`, `session`, `loading`, and `signOut()` app-wide

### API Routes (`src/app/api/`)

| Route | Purpose |
|---|---|
| `admin/analytics` | Dashboard stats and revenue data |
| `admin/appointments` | CRUD for appointments |
| `admin/cancellation-requests` | Manage cancellation requests |
| `admin/change-requests` | Manage reschedule/change requests |
| `admin/content` | CMS content CRUD |
| `admin/customers` | Customer list with gender and preferred_location_id; supports search, gender, location, phone, and joined-date filters on the frontend |
| `admin/locations` | Location CRUD |
| `admin/offers` | Offers CRUD |
| `admin/services` | Service CRUD |
| `admin/staff` | Staff CRUD + invite via `inviteUserByEmail` |
| `admin/testimonials` | Testimonial moderation |
| `admin/upload` | Image upload handler |
| `appointments` | Client-side appointment booking |
| `appointments/[id]` | Single appointment operations |
| `testimonials` | Public testimonials fetch |

### Key Components

**Layout (`src/components/`):**
- `ClientShell.tsx` — Conditionally renders `<Navbar>` and `<Footer>` based on route (hidden on `/admin/*`)
- `Navbar.tsx` — Main navigation with auth dropdown and mobile menu
- `Footer.tsx` — Footer with dynamic location links, contact info, and conditional nav (Login when logged out, My Profile when logged in)
- `SiteHero.tsx` — Reusable hero section with configurable title and buttons
- `LocationCard.tsx` — Location display card; accepts `image: string | null`, shows dark placeholder when no image
- `ServiceCard.tsx` — Service card for carousel/slider layouts; null-safe image
- `ServiceGridCard.tsx` — Service card for grid layouts; null-safe image
- `ServicesSlider.tsx` — Client-side carousel for services

**UI atoms (`src/components/ui/`):**
- `Button.tsx` — `primary`, `outline`, `dark`, `ghost` variants
- `TextInput.tsx` — Light-theme labeled input
- `DarkInput.tsx` — Dark-theme labeled input (admin and AuthModal)
- `AdminSelect.tsx` — Styled select with `light` and `dark` variants
- `Modal.tsx` — Base modal with `light` and `dark` themes
- `Spinner.tsx` — Loading spinner
- `Skeleton.tsx` — Skeleton loading placeholder
- `Dropdown.tsx` — Generic dropdown
- `SearchInput.tsx` — Search input field
- `StarRating.tsx` — Star rating display/input
- `Toggle.tsx` — Toggle switch

**Admin shared (`src/components/admin/`):**
- `AdminSidebar.tsx` — Role-aware nav sidebar; static on desktop (`lg+`), slide-in overlay drawer on mobile with backdrop
- `AdminTopbar.tsx` — Top bar with page title, role badge, and hamburger button (`lg:hidden`) that opens the sidebar
- `AdminModal.tsx` — Standardized modal wrapper for admin CRUD forms
- `AdminTable.tsx` — Reusable table with sorting; on mobile renders stacked cards (`mobileView="cards"`, default) or horizontal scroll (`mobileView="scroll"`); `mobileHero` flag on a `ColumnDef` renders that column's content at the top of each card (used for avatars/images)
- `TableImage.tsx` — Avatar/image cell with fallback initials

**Appointments (`src/components/appointments/`):**
- `BookAppointmentModal.tsx` — Multi-step booking modal
- `modal/Step1Details.tsx` through `Step4Confirm.tsx` — Booking steps
- `modal/StepIndicator.tsx` — Step progress indicator
- `RescheduleModal.tsx` — Reschedule existing appointment
- `CancelAppointmentModal.tsx` — Cancel appointment confirmation
- `AppointmentCard.tsx` — Single appointment display card
- `AppointmentTabs.tsx` — Upcoming / past tab switcher
- `StatsRow.tsx` — Appointment stats summary row

**Profile (`src/components/profile/`):**
- `ProfileSidebar.tsx` — Left sidebar with avatar, name, nav links
- `PersonalInfoForm.tsx` — Editable personal info with view/edit toggle
- `ChangePasswordModal.tsx` — Re-authenticate + update password modal
- `RecentActivity.tsx` — Recent appointments list
- `NotificationsCard.tsx` — Notification preferences

**Other:**
- `src/components/auth/AuthModal.tsx` — Login / signup / forgot-password modal
- `src/components/testimonials/TestimonialCard.tsx` — Testimonial display
- `src/components/testimonials/WriteReviewModal.tsx` — Submit review modal
- `src/components/home/` — `LocationsSection`, `OffersSection`, `PopularServicesSection`
- `src/components/about/` — `AboutHero`, `OurStory`, `WhatWeDo`, `TeamSlider`, `TeamMemberCard`
- `src/components/services/` — `CategoryList`, `ServicesSidebar`

### Backend / Lib

- `src/lib/supabase.ts` — Client-side Supabase client (anon key)
- `src/lib/supabase-admin.ts` — Server-side Supabase client (service role key, API routes only)
- `src/lib/admin-auth.ts` — `getAdminCaller()`, `requireRole()` helpers for API route auth
- `src/contexts/AuthContext.tsx` — App-wide auth state (`user`, `session`, `loading`, `signOut`)

### Database Notes

- `appointments.staff_id` → `staff.id` FK (`appointments_staff_id_fkey`) — required for PostgREST to resolve the `staff(...)` join in appointment queries. Added via migration; without it the query throws "Could not find a relationship between appointments and staff".
- `staff.id` → `profiles.id` FK (`staff_id_fkey`) — staff records share PK with profiles.
- `profiles.name` is a **generated column** (`ALWAYS GENERATED` as `TRIM(first_name || ' ' || last_name)`). Never write to it directly — update `first_name`/`last_name` instead.
- `handle_new_user` trigger fires on `auth.users` INSERT and creates a profile row. It reads `role` from `raw_user_meta_data` so that staff invites get the correct role on creation.

### Styling

Tailwind CSS 4 via `@tailwindcss/postcss`. Global CSS variables in `src/app/globals.css`:

| Token | Value | Usage |
|---|---|---|
| `brand-green` | `#00ff2a` | Accent, CTAs, hover states |
| `brand-dark` | `#0a0a0a` | Navbar, footer, overlays |
| `brand-blue` | `#0c8ce9` | Primary button background |
| `offers-bg` | `#e2e2e2` | Offers section background |
| `services-bg` | `#d9d9d9` | Services section background |

Use these as `bg-brand-green`, `text-brand-dark`, etc.

The `Algerian` font is used for display headings. The font file must be present at `/public/fonts/` for deployment.

Path alias `@/*` maps to `src/*`.

Always use `<Image>` from `next/image` instead of `<img>`. External image domains must be added to `next.config.ts` under `images.remotePatterns`. Currently configured:
- `lh3.googleusercontent.com` — Google OAuth profile photos
- `*.supabase.co` — Supabase Storage (uploaded images)
