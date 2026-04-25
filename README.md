# Bemo - Invoice & Payment Management System

![Bemo Banner](https://via.placeholder.com/1200x400.png?text=Bemo+-+Professional+Invoicing) *(Note: Replace with actual project screenshot)*

**Bemo** is a high-end, full-stack web application tailored for freelancers and small business owners. It empowers users to create professional, beautifully designed invoices, send them to clients as secure shareable links, and seamlessly collect payments via Paystack. Bemo transforms the chaotic process of using spreadsheets and chat screenshots into a streamlined, automated, and authoritative workflow.

## 🌟 Key Features

*   **Professional Invoice Management:** Create, manage, and track invoices through various lifecycle states (Draft, Sent, Paid, Overdue, Cancelled). Automatically calculates subtotals, custom tax rates, and totals.
*   **Secure Public Links:** Share invoices with clients using secure, non-guessable UUID-based public links. Clients can view their invoice details without needing to log in.
*   **Integrated Paystack Payments:** Clients can pay invoices directly from their public link. A robust backend webhook integration (secured via HMAC SHA512) automatically verifies transactions and updates invoice statuses in real-time.
*   **Automated Email Notifications:** Automatically dispatches payment receipts to clients and notification alerts to the business owner upon successful transactions.
*   **Client Management Directory:** Maintain a centralized repository of client details, including company names, emails, addresses, and contact numbers.
*   **Rich Dashboard & Analytics:** Gain instant insights into your financial health with real-time analytics tracking total revenue, outstanding balances, and recent invoice activities.
*   **High-Quality PDF Exports:** Generate crisp, professional PDF versions of invoices for offline sharing and record-keeping.

## 🎨 Design Philosophy & UI/UX

Bemo is built with a meticulously crafted **"Digital Printed Ledger"** aesthetic. The goal is to eliminate generic SaaS patterns in favor of a minimalist, typography-driven design.

*   **Visual Identity:** Emphasizes negative space, crisp line work, and an authoritative, heritage-inspired professional look.
*   **Typography:** Leverages **Inter** for clean readability and **Outfit** for striking, modern headings.
*   **Color Palette:** A sophisticated neutral slate foundation complemented by a striking blue primary accent.
*   **Micro-interactions:** Utilizes *Framer Motion* to provide subtle, premium animations that elevate the user experience without feeling intrusive.
*   **Fully Responsive:** Flawless visual consistency across mobile, tablet, and desktop breakpoints.

## 🛠️ Technology Stack

### Frontend (`BemoFrontend/`)
*   **Core:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS v4
*   **State Management & Data Fetching:** Zustand, React Query (@tanstack/react-query)
*   **Routing:** React Router v7
*   **Animations & Visuals:** Framer Motion, Recharts, Lucide React
*   **Utilities:** Axios, date-fns, html2canvas, jsPDF

### Backend (`core/`)
*   **Core:** Python, Django 6.0.4
*   **API:** Django REST Framework (DRF)
*   **Authentication:** JWT (djangorestframework_simplejwt)
*   **Database:** PostgreSQL (psycopg2)
*   **Integrations:** Paystack API

## 📂 Project Architecture

### Backend Modules
The backend follows a modular Django app structure:
*   `accounts/`: Handles custom user models and JWT authentication.
*   `clients/`: Manages the client directory and profiles.
*   `invoices/`: Core invoice logic, item calculations, and UUID generation.
*   `payments/`: Handles Paystack API initialization and secure webhook processing.
*   `analytics/` & `reports/`: Aggregates financial data for dashboard visualization.
*   `business_profile/`: Manages the owner's business details and invoice prefix settings.

### Frontend Modules
Organized for scalability and separation of concerns:
*   `src/api/`: Typed Axios API client wrappers (auth, invoices, clients, analytics).
*   `src/components/ui/`: Reusable, styled UI primitives (Buttons, Inputs, Cards, Modals, Badges).
*   `src/pages/admin/`: Authenticated routes (Dashboard, Invoices, CreateInvoice, Clients, Reports, Settings).
*   `src/pages/public/`: Client-facing routes (PublicInvoice, PaymentConfirmation).
*   `src/store/`: Zustand state slices.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   PostgreSQL
*   Paystack Account (for API keys)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd core
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment Variables:
   Create a `.env` file based on `.env.example` and add your database credentials and Paystack keys (`PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`).
5. Run migrations:
   ```bash
   python manage.py migrate
   ```
6. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd BemoFrontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env` file and set your API base URL and Paystack public key:
   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_PAYSTACK_PUBLIC_KEY=your_public_key_here
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 🔒 Security Highlights
*   **No exposed primary keys:** Public invoices are accessed via unique UUID tokens.
*   **Secure Webhooks:** Paystack webhooks are strictly verified using HMAC SHA512 signatures to prevent spoofing.
*   **Protected Routes:** Admin routes are protected by robust JWT-based authentication.

---
*Designed and built for modern business professionals.*
