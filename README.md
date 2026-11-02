# Electrical storefront

Next.js App Router, TypeScript, Tailwind CSS. This is Phase 1 of the electrical commerce project.

Run npm ci, copy .env.example to .env.local, then npm run dev. Port 3000. Both applications use electrical-backend at localhost:4000/api. Full Docker instructions and phase boundaries are in ../electrical-backend/README.md. Run npm run build for verification.

Published SRV product prices and specifications are displayed from the imported public catalogue. Checkout uses live backend stock, tax, shipping and enabled payment methods. It never marks an online payment paid until the backend verifies it.
SRV branding and public catalogue data are imported at the user’s request. Source/import details: ../electrical-backend/docs/SRV-IMPORT.md.

## Checkout configuration

Set `API_URL` in `.env.local` to the running backend API (default `http://localhost:4000/api`). In the backend environment, configure `CHECKOUT_SHIPPING_PAISE`, `CHECKOUT_TAX_MODE` (`INCLUSIVE` or `EXCLUSIVE`) and product stock/tax data. Enable `ENABLE_COD=true` to accept cash-on-delivery orders, or configure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` for online payments. Keep secrets in the backend environment. Restart the backend after configuration changes.

Verify checkout using Razorpay test credentials first: place an order, complete payment, confirm the backend reports `PAID`, then check tracking. Also close the payment window and use Complete payment to resume the same saved order. Refresh order status reconciles interrupted verification; it does not assume a payment succeeded. Live payment collection requires live credentials and the backend webhook configured with Razorpay.
