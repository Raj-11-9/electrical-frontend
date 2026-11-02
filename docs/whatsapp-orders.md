# WhatsApp order confirmation setup

The backend queues new order notifications in PostgreSQL in the same transaction as the order. Its worker checks every 10 seconds, retries failures with backoff, and resumes after restarts. Repeated provider deliveries may produce duplicate messages; confirming them changes only PENDING orders to CONFIRMED. Payment status remains separate. Shipping and delivery are later fulfillment actions.

## Backend environment

Add these to `electrical-backend/.env` locally, then restart the backend. Secrets belong only in the backend.

```dotenv
WHATSAPP_OWNER_NUMBER=919294924996
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_APP_SECRET=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_API_VERSION=
WHATSAPP_ORDER_TEMPLATE=srv_new_order
WHATSAPP_TEMPLATE_LANGUAGE=en
```

The owner number is the recipient. PHONE_NUMBER_ID identifies the Cloud API business sender, which must be able to message that recipient. In Meta's API Setup, obtain the sender ID and access token, and use an API version supported by your app. Generate a strong private verify token. Use the Meta app secret for webhook signature checks.

Create an approved template named `srv_new_order` in the configured language with three body variables in this order: order number, buyer/address/items summary, total. Add one **quick reply** button at index 0 labelled **Confirm order**. Example body: `New order {{1}}. Delivery and items: {{2}}. Total: {{3}}.` The summary is capped at 800 characters; the persisted order remains the complete record. Obtain any required recipient opt-in and verify delivery under your Meta account's template rules.

Configure the Meta webhook callback as `https://YOUR-PUBLIC-BACKEND/api/commerce/whatsapp/webhook`, use the same verify token, and subscribe to `messages`. This endpoint belongs on the backend, not the storefront proxy. It requires publicly reachable HTTPS. Confirmation accepts signed callbacks from the configured recipient and sender ID with the matching original message context.

Reference: [Meta's interactive template request](https://www.postman.com/meta/whatsapp-business-platform/request/lwtlz1k/send-message-template-interactive).

## Verification before going live

Use a controlled test order. Check that its Notification record goes from PENDING to SENT, the message reaches +91 9294924996, and tapping Confirm order changes the order to CONFIRMED. Checkout refreshes its order every 15 seconds while visible. Replay the callback and verify that the state does not move again. Confirm payment remains unchanged. No live message has been sent during implementation.

Addresses are stored against the signed-in account through POST `/api/commerce/addresses`, loaded through `/api/commerce/me`, and require explicit selection before order submission. Editing is restricted to an address owned by that account. First-time buyers save their address before placing an order; returning buyers can continue, edit, or add another address. Browser autocomplete is available on the address form.

Local verification: `npm run typecheck`, `npm test`, `npm run build`, and `node .implementation/run-whatsapp-tests.cjs` in the storefront; `tsc --noEmit -p tsconfig.json` in the backend. The integration test runner uses the sibling backend source and checks address ownership, PIN validation, raw-body signatures, owner-only confirmation, and notification deduplication. Live provider delivery and database-backed checkout require the configured running backend and Meta setup above.
