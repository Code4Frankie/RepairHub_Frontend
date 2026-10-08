# RepairHub — Frontend (React + Vite + Tailwind)

The customer flow (17 screens) for RepairHub, built against the real `repairhub-api`
backend — every endpoint, field name, and status enum here was read directly from that
repo's models/controllers/validators, not guessed.

## ⚠️ Design status — read this first

This was built **before** the team's Figma file (`figma.com/design/orAUZeW4pHVGIFejPLTjWP`)
could be opened — Figma blocks automated/robot access, so it couldn't be fetched
programmatically. Everything here uses an interim design system instead:

- **Real:** the brand blue (`#0061F2`) is sampled directly from the actual logo file.
- **Placeholder:** everything else — the "steel + paper ticket" card style, Space
  Grotesk/IBM Plex fonts, spacing, the amber accent color — is a stand-in, not from Figma.

**To align this to Figma:** export the key frames as PNG (or share the hex codes /
font names / spacing values from the design file) and every token lives in one place —
`tailwind.config.js` (`colors`, `fontFamily`) plus the small `@layer components` block
in `src/index.css` (`.ticket`, `.stamp`, `.chip`, `.badge-*`, `.btn-*`). Swapping those
updates every one of the 17 pages at once — no page has its own hardcoded colors.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL to your running backend
npm run dev             # http://localhost:5173
```

Requires the `repairhub-api` backend running (locally or deployed) and reachable at
whatever `VITE_API_BASE_URL` points to.

## Structure

```
src/
├── main.jsx              # entry — Router + AuthProvider + ToastProvider
├── App.jsx                # route table
├── index.css               # Tailwind directives + the swappable design tokens
├── lib/
│   ├── api.js               # fetch wrapper — adds JWT, unwraps {success,data,message}
│   ├── AuthContext.jsx       # session state + <ProtectedRoute>
│   ├── ToastContext.jsx      # toast notifications
│   └── format.js             # formatters + status badge maps (mirror the API's enums exactly)
├── components/
│   ├── Shell.jsx             # top bar + bottom tab nav wrapper, used by every page
│   ├── Field.jsx              # form field wrapper (label/hint/error) + Input/Select/Textarea
│   └── ui.jsx                 # Badge, Ticket, Chip, Avatar, EmptyState, SkeletonCards, Stamp
└── pages/                   # one file per screen, 17 total (see table below)
```

## Screens

| Page | Route | Covers |
|---|---|---|
| Login | `/login` | Auth |
| Register | `/register` | Auth (customer role) |
| Home | `/home` | Categories, top-rated technicians |
| Search | `/search` | Browse/filter technicians |
| Technician | `/technician/:id` | Profile, reviews |
| New request | `/request-new` | Create repair request (photo upload, geolocation) |
| My requests | `/requests` | List + status filter |
| Request detail | `/request/:id` | Quotation comparison, accept flow |
| Booking | `/booking/:quotationId` | Schedule appointment |
| My jobs | `/jobs` | Active jobs list |
| Job detail | `/job/:id` | Tracking timeline, confirm completion |
| Payment | `/payment/:jobId` | Paystack / wallet / cash |
| Payment callback | `/payment/callback` | Post-Paystack-checkout verification |
| Warranty | `/warranty/:jobId` | Certificate + file a claim |
| Review | `/review/:jobId` | Star rating + tags + comment |
| Notifications | `/notifications` | List, mark read |
| Profile | `/profile` | Edit details, address, password, logout |

## Known scope boundaries

- **Customer flow only** — technician/service-center/admin screens aren't built here.
  `ProtectedRoute` redirects any non-customer account back to login.
- **Notifications don't deep-link** — clicking one marks it read but doesn't navigate,
  since `refId` can point to a job, request, quotation, or warranty record depending on
  `type`, and guessing wrong would be worse than not linking.
- **Paystack callback** — `PAYSTACK_CALLBACK_URL` on the backend needs to point at
  `<your-deployed-frontend-url>/payment/callback` for the redirect-back flow to work;
  until then, the wallet and cash payment methods work end-to-end without any extra config.

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```
