# TiliGo - Kosovo Food & Delivery App

## Overview

pnpm workspace monorepo using TypeScript. TiliGo is a Wolt-like food & delivery mobile app for Kosovo, entirely in Albanian language, built with Expo React Native + Express API.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Mobile framework**: Expo (React Native) with Expo Router
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (port 8080)
│   └── tiligo/             # Expo React Native app (TiliGo)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
└── package.json            # Workspace root
```

## TiliGo App — Screen Map

### Customer (no registration needed)
- `(tabs)/index.tsx` — Home: stores list, categories, promo banner
- `(tabs)/search.tsx` — Search: filter stores by name/category
- `(tabs)/cart.tsx` — Shopping cart with order summary
- `(tabs)/profile.tsx` — Profile: role switching, settings
- `store/[id].tsx` — Store detail + product list
- `checkout.tsx` — Checkout form (name, phone, address)
- `order-success.tsx` — Order confirmation screen

### Store/Business
- `store-auth.tsx` — Login/Register with business number (NRB), no email
- `store-dashboard.tsx` — Orders management + product management

### Delivery Driver
- `delivery-auth.tsx` — Login/Register with ID number, no email
- `delivery-dashboard.tsx` — Available orders + active deliveries

### Shared
- `notifications.tsx` — Push notification center

## API Routes (api-server)
- `GET /api/stores` — List stores (filter by category/search)
- `POST /api/stores` — Register store
- `POST /api/stores/login` — Store login
- `GET /api/stores/:id/products` — Products for a store
- `POST /api/orders` — Create order
- `PATCH /api/orders/:id/status` — Update order status
- `POST /api/delivery/register` — Register driver
- `POST /api/delivery/login` — Driver login
- `GET /api/delivery/:driverId/orders` — Available orders for driver
- `POST /api/delivery/:driverId/accept/:orderId` — Accept delivery
- `GET /api/delivery/:driverId/active` — Driver's active deliveries
- `GET /api/notifications/:userId` — Get notifications
- `PATCH /api/notifications/:id/read` — Mark notification read
- `POST /api/seed` — Seed demo data (5 stores, 40 products)

## Demo Data
- 5 demo stores (Pizzeria Prishtina, Burger House Pristina, SuperMarket Albi, Kafeja Orient, Farmacia Plus)
- 8 products per store (40 total)
- Business numbers: DEMO-001 to DEMO-005, password: demo123
- DB seed endpoint called automatically on app load

## Color Scheme
- Primary Blue: #1565C0
- Primary Green: #2E7D32
- Accent Blue: #1E88E5
- Background: #F8FAFB

## Key Design Decisions
- Language: Albanian (sq) only
- No email login — stores use business number (NRB), drivers use ID number
- Customers order without registration
- Push notification ready (expo-notifications installed)
- Haptic feedback on interactions
- Rotating promo banners on home screen
- Real store images from Unsplash via seed data
