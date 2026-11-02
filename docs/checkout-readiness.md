# Checkout readiness

The storefront, backend, and admin panel must use the same backend/database.
Both apps default to `http://127.0.0.1:4000/api`.

## Required configuration

In `electrical-backend/.env`, configure these locally; do not paste secrets into chat:

- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: an actual admin email and a password of at least 12 characters. Restart the backend after changing environment settings.
- `ENABLE_COD=true` enables cash on delivery.
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` enable online payments. Use Razorpay test-mode credentials for testing. Configure the provider webhook to your publicly reachable `/api/commerce/payments/webhook` backend endpoint. It must reach the backend, not the storefront proxy, which does not forward webhooks.
- `CHECKOUT_SHIPPING_PAISE` and `CHECKOUT_TAX_MODE` configure shipping and tax treatment. Current local settings are 5000 paise shipping and INCLUSIVE tax.

## Product setup

Sign in through the admin panel's Orders page, then open Inventory.
Use **Enable products for checkout** to select a variant and enter its real total stock and confirmed GST rate. GST applies to all variants of that product. Stock includes units already reserved for orders; the API refuses values below reserved quantities.

Imported source availability is not confirmed inventory. At verification time, all 112 imported products had missing GST rates and all 312 variants had no inventory record. No artificial stock or tax values were added.

## Order flow

Customers sign in before checkout. Prices, GST, shipping, payment availability, and stock are verified on the backend. Orders are persisted in PostgreSQL with stock reservations and idempotency protection.

Admin **Orders** shows the latest 100 persisted orders, payment method/status, customer details, line items, and delivery address. It refreshes every 15 seconds while visible, on window focus, and manually. This requires an administrator session; customer tokens cannot access it. COD orders have pending payment until collection; pending online payment does not mean payment succeeded.

## Verification completed

- Storefront TypeScript and 14 unit tests.
- Admin TypeScript.
- Backend build and 13 isolated commerce checks, including order persistence, admin access protection, stock/GST setup, reservation safety, customer history, tracking, and duplicate-submit behavior.
- Three payment verification checks and six Razorpay-flow checks, with simulated provider responses: payment creation, safe retries, capture verification, invalid-signature rejection, and webhook idempotency.
- Live local storefront/backend cookie and CSRF checks; temporary test account removed.

No real Razorpay charge or paid production order was made. A real COD order and Razorpay test checkout can only be verified after confirmed stock/GST, admin credentials, and provider configuration are supplied.
