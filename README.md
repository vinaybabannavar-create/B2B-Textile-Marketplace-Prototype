# FabricMart — B2B Textile Marketplace Prototype

FabricMart is a fully responsive, state-of-the-art B2B Textile Sourcing Engine connecting **Buyers** (garment makers, fashion brands, boutique retailers) and **Suppliers** (fabric mills, wholesalers, converters).

This application was engineered as a feature-rich prototype, focusing on product-level flow, modern UX, technical weave audits, 3D physics visualizers, and AI-driven conversational workflows.

---

## 🌟 Key Product Features

### 📌 Module 1: Buyer Experience
1. **Interactive Marketplace Catalog**: Search, sort, and filter by categories, price range, stock availability, and weave parameters.
2. **Weave & Fiber Auditing (Zoom Magnifier)**: Interactive hover magnifier lens (up to 4.0x magnification) allowing buyers to inspect thread count and yarn details.
3. **3D Drape & Physics Simulation**: Visual interactive Three.js component depicting fabric physics drape, wave frequency, and light refraction based on GSM weight.
4. **AI conversational Onboarding**: Chat-guided profile builder capturing business type, procurement volume, categories, and monthly budget.
5. **AI Sourcing Assistant**: 
   - Voice commands via browser Web Speech API.
   - Natural Language Query processing (e.g. *"Show lightweight cotton denim under $15"*).
   - Side-by-side spec comparison matrix for 2-3 selected fabrics.
6. **Wholesale Cart & B2B Checkout**: Integrated MOQ volume warnings, swatch shipping calculations, and mock corporate credit terms (`Escrow Net 30`, `Letter of Credit L/C`, `Wire Transfer`).
7. **Active Tracker Stepper**: Real-time status updates tracking orders through the supply chain phases:
   `Pending` ➔ `Accepted` ➔ `Preparing` ➔ `Ready for Dispatch` ➔ `Completed`.

### 📌 Module 2: Supplier Experience
1. **Mill Analytics Dashboard**: Interactive widgets visualizing catalog size, active order volumes, low-stock alerts, and total revenue pipeline.
2. **Supplier Onboarding**: Guided setup of business address, business type, offered fabric lines, and mill MOQ.
3. **Technical Inventory CRUD**: Management system to publish new listings, edit values, upload photos, and toggle stock availability.
4. **AI Description Generator**: Built-in AI copywriting tool generating professional B2B marketing product sheets.
5. **Production Order Pipeline**: Direct action buttons to advance purchase orders through dye lot preparation, packing, and completed dispatch statuses.

---

## 💻 Tech Stack
- **Frontend**: React.js, Tailwind CSS, Lucide icons, Three.js (WebGL Canvas), Canvas-Confetti.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Mongoose with automated **In-Memory JSON DB Store fallback** (runs out of the box with zero external database server setup required).
- **Tooling**: Vite Bundler.

---

## 🚀 Quick Start Guide

### 1. Backend Server
```bash
cd server
npm install
npm start
```
*Port `5000`*

### 2. Frontend Development Server
```bash
cd client
npm install
npm run dev
```
*Port `3000`*
