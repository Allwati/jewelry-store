# Lumière Jewelry Store — Setup Guide

## Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Cloudinary account (free tier works)

---

## 1. Install Dependencies

```bash
cd jewelry-store
npm install
```

---

## 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/jewelry_store"
JWT_SECRET="generate-with: openssl rand -base64 32"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 3. Database Setup

### Create the database
```bash
createdb jewelry_store
# or in psql: CREATE DATABASE jewelry_store;
```

### Run migrations
```bash
npm run db:migrate
```

### Seed with demo data
```bash
npm run db:seed
```

This creates:
- Admin account: phone `+1234567890`, password `Admin@123456`
- 5 categories: Rings, Necklaces, Earrings, Bracelets, Brooches
- 8 demo products with images

---

## 4. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 5. Admin Dashboard

Visit: http://localhost:3000/admin/login

Login with:
- Phone: `+1234567890`
- Password: `Admin@123456`

---

## 6. Key URLs

| URL | Description |
|-----|-------------|
| `/` | Home page |
| `/products` | Product listing |
| `/product/[slug]` | Product detail |
| `/buy/[slug]` | **Direct order page** (no login required) |
| `/cart` | Shopping cart |
| `/checkout` | Cart checkout |
| `/login` | Customer login |
| `/register` | Customer registration |
| `/orders` | Customer orders |
| `/profile` | Customer profile |
| `/admin` | Admin dashboard |
| `/admin/products` | Manage products |
| `/admin/orders` | Manage orders |
| `/admin/customers` | View customers |

---

## 7. Direct Order Link System

Each product has a special direct order URL:
```
/buy/[product-slug]
```

Example: `/buy/diamond-solitaire-ring`

When a customer visits this link:
1. Product info is displayed
2. They fill in name, phone, address
3. Order is created instantly
4. No account required
5. If their phone matches an account, order is linked

To get a direct order link for any product:
- Admin: Go to product edit page, click "Buy Link"
- Product page: Click the "Copy" button in the Direct Order Link section
- Share with customers via WhatsApp, email, etc.

---

## 8. Production Deployment

### Build
```bash
npm run build
npm run start
```

### Run migrations in production
```bash
npm run db:migrate:prod
```

### Environment
Set `NODE_ENV=production` and all required env vars on your hosting platform.

Recommended: Vercel (Next.js), Supabase or Neon (PostgreSQL)

---

## 9. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (jose) + bcrypt |
| Styling | TailwindCSS + Radix UI |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Images | Cloudinary |
| Icons | Lucide React |
| Toasts | Sonner |

---

## 10. Project Structure

```
jewelry-store/
├── app/
│   ├── (auth)/          # Login & Register pages
│   ├── (shop)/          # Customer-facing pages
│   │   ├── page.tsx     # Home
│   │   ├── products/    # Product listing
│   │   ├── product/     # Product detail
│   │   ├── buy/         # Direct order pages ⭐
│   │   ├── cart/        # Cart
│   │   ├── checkout/    # Checkout
│   │   ├── orders/      # User orders
│   │   └── profile/     # User profile
│   ├── admin/           # Admin dashboard
│   │   ├── page.tsx     # Dashboard stats
│   │   ├── products/    # Product CRUD
│   │   ├── orders/      # Order management
│   │   └── customers/   # Customer list
│   └── api/             # API routes
├── components/
│   ├── ui/              # Base UI components (Shadcn-style)
│   ├── admin/           # Admin components
│   ├── shop/            # Shop components
│   └── shared/          # Navbar, Footer, etc.
├── lib/
│   ├── db.ts            # Prisma client
│   ├── auth.ts          # JWT utilities
│   ├── cloudinary.ts    # Image uploads
│   ├── utils.ts         # Helpers
│   ├── services/        # Business logic
│   └── validations/     # Zod schemas
├── store/               # Zustand stores
├── types/               # TypeScript types
└── prisma/
    ├── schema.prisma    # Database schema
    └── seed.ts          # Demo data
```
