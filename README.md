# SiHA Craft Studio — E-Commerce Boutique & Atelier

> **"Little Stitches, Handmade with Love"**  
> A complete, production-ready, full-stack e-commerce web platform for **SiHA Craft Studio**, handcrafted from scratch with an authentic pastel boutique aesthetic, React + Vite frontend, Django REST Framework backend, and MySQL Community Server database.

---

## 🌸 Table of Contents
1. [Brand Identity & Provided Logo](#-brand-identity--provided-logo)
2. [Technology Stack](#-technology-stack)
3. [MySQL Database & Workbench Setup](#-mysql-database--workbench-setup)
4. [Pastel Visual Design System](#-pastel-visual-design-system)
5. [Key Implemented Features](#-key-implemented-features)
   - [Hero Carousel with Floating Crochet Elements](#hero-carousel-with-floating-crochet-elements)
   - [Product Catalog, Variants & Real Inventory](#product-catalog-variants--real-inventory)
   - [Shopping Basket, Wishlist & Checkout](#shopping-basket-wishlist--checkout)
   - [Razorpay Checkout (Test Mode Integration)](#razorpay-checkout-test-mode-integration)
   - [Google Identity Authentication](#google-identity-authentication)
   - [Order Tracking with Admin Courier Links](#order-tracking-with-admin-courier-links)
   - [Online Crochet Classes & Google Meet Links](#online-crochet-classes--google-meet-links)
   - [Custom Crochet Orders & Quotation Workflow](#custom-crochet-orders--quotation-workflow)
   - [Customer Account Portal](#customer-account-portal)
   - [Artisan Admin Dashboard](#artisan-admin-dashboard)
   - [Complete Legal & Policy Pages](#complete-legal--policy-pages)
6. [Automated Verification & Test Results](#-automated-verification--test-results)
7. [Local Startup Instructions](#-local-startup-instructions)

---

## 🎨 Brand Identity & Provided Logo
- **Official Brand Name:** SiHA Craft Studio
- **Tagline:** Little Stitches, Handmade with Love
- **Logo Asset:** Handcrafted illustration featuring a feminine profile with flower, crochet hook, yarn strand, and burgundy lettering against a soft peach-pink circle.
- **Asset Locations:**
  - `frontend/public/images/siha-logo.png`
  - `frontend/public/favicon.ico` & `frontend/public/favicon.png`
  - Workspace master: `logo.jpeg`

---

## 💻 Technology Stack

### Frontend
- **Framework:** React 18, Vite 5
- **Styling:** Tailwind CSS 3.4 with custom pastel design tokens
- **Typography:** Google Fonts (`Playfair Display`, `Cormorant Garamond`, `Outfit`)
- **Routing:** React Router v6
- **HTTP Client:** Axios with bearer token interceptors
- **Icons:** Lucide React
- **Testing:** Vitest & React Testing Library

### Backend
- **Framework:** Python 3.11, Django 5.1, Django REST Framework 3.17
- **Database Driver:** PyMySQL (configured as MySQLdb) with `cryptography`
- **Authentication:** Custom token authentication + Django session auth
- **Payments:** Razorpay SDK (server-side order creation & HMAC-SHA256 signature verification)
- **Image Processing:** Pillow
- **Testing:** Django TestCase test suite running on live MySQL test schema

---

## 🗄️ MySQL Database & Workbench Setup

### Connection Parameters
- **Primary Database Schema:** `siha_craft_studio`
- **Application User:** `siha_app`
- **Local Application Password:** `SihaApp@2026!`
- **Host:** `127.0.0.1`
- **Port:** `3306`

### MySQL Workbench Configuration
To inspect the running application database directly in MySQL Workbench:
1. Open **MySQL Workbench**.
2. Click **+** to add a new connection.
3. Configure the following settings:
   - **Connection Name:** `SiHA Local MySQL`
   - **Hostname:** `127.0.0.1`
   - **Port:** `3306`
   - **Username:** `siha_app`
   - **Password:** Click *Store in Keychain / Vault* and enter `SihaApp@2026!`
   - **Default Schema:** `siha_craft_studio`
4. Click **Test Connection** to confirm connectivity.

### Verification Queries
In MySQL Workbench or command line:
```sql
SHOW DATABASES;
USE siha_craft_studio;
SHOW TABLES;

-- Inspect products and current stock
SELECT p.id, p.name, p.sku, p.price, inv.quantity 
FROM catalog_product p 
JOIN inventory_inventoryrecord inv ON p.id = inv.product_id;

-- Inspect orders and fulfillment
SELECT id, order_number, total_amount, payment_status, fulfillment_status, courier_name, tracking_number 
FROM orders_order;

-- Inspect crochet class sessions & Google Meet links
SELECT c.title, s.start_time, s.max_participants, s.google_meet_link 
FROM classes_crochetclass c 
JOIN classes_classsession s ON c.id = s.crochet_class_id;
```

---

## 🎀 Pastel Visual Design System
Centralized brand color palette in `frontend/tailwind.config.js`:
- **Blush Pink:** `#F8DDE0` (Dominant soft accent)
- **Pale Peach:** `#FFE8DF` (Warm background layers)
- **Warm Cream:** `#FFF9F3` (Dominant neutral canvas)
- **Soft Lavender:** `#EAE2F5` (Creative workshop accent)
- **Muted Sage Green:** `#DCE8D8` (Botanical floral accent)
- **Burgundy:** `#71313D` (Primary text, headings, buttons, icons)
- **Chocolate Brown:** `#55352E` (Secondary readable typography)
- **White:** `#FFFFFF` (Card surfaces & glassmorphism backdrops)

---

## ✨ Key Implemented Features

### Hero Carousel with Floating Crochet Elements
- 5 art-directed slides highlighting handmade plushies, floral bouquets, yarn supplies, custom orders, and classes.
- Layered 3D floating yarn balls, angled crochet hooks, curved yarn strands, and miniature crochet flowers.
- Autoplay, pause-on-hover/focus, keyboard accessible controls, slide indicators, and reduced-motion support.

### Product Catalog, Variants & Real Inventory
- Categories: Yarn & Thread, Hooks & Tools, Toys & Plushies, Bags & Purses, Flowers & Bouquets, Keychains & Gifts, Home Décor.
- Product search, category filtering, price sliders, in-stock toggles, and sorting (price, newest, popularity).
- Color & size variant selection with real-time price updates.
- Atomic database stock reservation and deduction upon verified purchase.

### Shopping Basket, Wishlist & Checkout
- Persistent cart for authenticated customers with automatic guest-cart merge upon login.
- Authoritative backend price and discount calculations (never trusting browser totals).
- Promotional coupons with backend validation (e.g. `WELCOME10`, `SIHALOVE`).

### Razorpay Checkout (Test Mode Integration)
- Server-side order creation in INR.
- Client-side checkout modal with branded burgundy theme.
- Server-side cryptographic HMAC-SHA256 signature verification.
- Verified webhook listener with idempotent duplicate event handling.

### Google Identity Authentication
- Google Identity Services token verification endpoint on Django backend.
- Email/password registration, login, logout, and password recovery.

### Order Tracking with Admin Courier Links
- Public and customer order tracking page.
- Step-by-step fulfillment status timeline (Pending Payment ➔ Confirmed ➔ Processing ➔ Ready to Ship ➔ Shipped ➔ Out for Delivery ➔ Delivered).
- Admin dashboard interface to assign courier name (Blue Dart, DTDC, India Post), tracking number, and paste live tracking URLs.

### Online Crochet Classes & Google Meet Links
- Workshop listings filtered by skill level (Beginner, Intermediate, All Levels).
- Scheduled sessions with participant capacity counters.
- Confidential Google Meet links revealed exclusively to confirmed enrolled students.
- Downloadable pattern PDFs and class resources.

### Custom Crochet Orders & Quotation Workflow
- Dedicated customization request form with reference photo upload (validated MIME type & 5MB limit).
- Admin review interface to propose price and estimated crafting days.
- One-click checkout conversion when customer accepts the quotation.

### Customer Account Portal
- Profile management and saved delivery addresses.
- Order history with tracking links.
- Class enrollments with direct Google Meet join buttons.
- Custom quotation review and acceptance.
- Wishlist collection.

### Artisan Admin Dashboard
- Live database statistics: verified revenue, total orders, low-stock alerts, pending quotes.
- Order shipment fulfillment management.
- Manual inventory adjustments with required audit reasons.
- Class scheduling and Google Meet link management.
- Coupon management and review moderation.

### Complete Legal & Policy Pages
- `/privacy-policy` — Compliant personal data, Razorpay, Google, and cookie disclosure.
- `/terms-and-conditions` — Natural handmade variation terms, pricing, and custom order rules.
- `/shipping-policy` — Processing times, domestic rates, and tracking info.
- `/refund-policy` — Cancellation, defective items, and refund processing terms.
- `/faq` — Care instructions, amigurumi safety, and workshop FAQs.
- `/contact` — Validated contact message form, WhatsApp, and studio coordinates.
- `/about` — Authentic SiHA Craft Studio slow handcraft story.
- `/cookie-preferences` — Granular consent controls.

---

## 🧪 Automated Verification & Test Results

### 1. Backend Automated Tests (Django & MySQL)
Command:
```bash
backend/venv/bin/python backend/manage.py test tests
```
**Result:**
- `Found 6 test(s)`
- `Creating test database for alias 'default' on MySQL...`
- `Ran 6 tests in 1.056s — OK`
- Verifies: User registration, login, catalog filtering, cart operations, stock limits, checkout calculations, order tracking retrieval, and admin authorization.

### 2. Frontend Automated Tests (Vitest & React Testing Library)
Command:
```bash
cd frontend && npm test
```
**Result:**
- `Test Files: 1 passed (1)`
- `Tests: 2 passed (2)`
- Verifies: Hero Carousel rendering, 5 slides, floating crochet elements, ProductCard badges, and responsive controls.

### 3. Production Build Validation
Command:
```bash
cd frontend && npm run build
```
**Result:**
- `✓ 1574 modules transformed.`
- `✓ built in 1.09s with zero errors.`

---

## 🚀 Local Startup Instructions

### Prerequisites
- macOS or Linux
- Python 3.11 (`python3.11`)
- Node.js v18+ & npm
- MySQL Community Server 8.0+ / 9.x running on port 3306

### Quick Run
Both servers are currently configured and running:
- **Frontend URL:** `http://127.0.0.1:5173/`
- **Backend API URL:** `http://127.0.0.1:8000/`

To start manually in separate terminals:

**Terminal 1 (Backend):**
```bash
cd /Users/kanishaa/Desktop/siha-craft-studio
backend/venv/bin/python backend/manage.py runserver 127.0.0.1:8000
```

**Terminal 2 (Frontend):**
```bash
cd /Users/kanishaa/Desktop/siha-craft-studio/frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

### Preconfigured Test Accounts
- **Administrator:** `admin@sihacraftstudio.com` | `Admin@Siha2026!`
- **Customer:** `customer@sihacraftstudio.com` | `Customer@Siha2026!`
