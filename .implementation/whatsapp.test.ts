import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { validWhatsAppSignature, confirmationNumber, WhatsAppService, queueWhatsAppOrder } from "../../electrical-backend/src/whatsapp";
import { CommerceService } from "../../electrical-backend/src/commerce";

test("address edits are scoped to the authenticated account", async () => {
  let filter: any;
  const service = new CommerceService({ address: { updateMany: async (args: any) => { filter = args.where; return { count: 0 }; } } } as any);
  service.ready = async () => {};
  service.user = async () => "signed-in-user";
  await assert.rejects(() => service.saveAddress({ id: "another-users-address", fullName: "Buyer", phone: "9999999999", line1: "Street", city: "City", state: "State", pinCode: "123456" }, {}), /Address not found/);
  assert.deepEqual(filter, { id: "another-users-address", userId: "signed-in-user" });
});
test("address save rejects invalid postal codes before database writes", async () => {
  const service = new CommerceService({} as any);
  service.ready = async () => {};
  service.user = async () => "signed-in-user";
  await assert.rejects(() => service.saveAddress({ fullName: "Buyer", phone: "9999999999", line1: "Street", city: "City", state: "State", pinCode: "bad" }, {}), /six digits/);
});

test("signature authenticates the exact raw bytes", () => {
  const raw = Buffer.from('{"entry":[]}');
  const sig = "sha256=" + createHmac("sha256", "secret").update(raw).digest("hex");
  assert.equal(validWhatsAppSignature(raw, sig, "secret"), true);
  assert.equal(validWhatsAppSignature(Buffer.from("{}"), sig, "secret"), false);
  assert.equal(validWhatsAppSignature(raw, sig, ""), false);
});
test("only explicit confirmation button payloads identify orders", () => {
  assert.equal(confirmationNumber({ type: "button", button: { payload: "confirm:SRV-ABC-123" } }), "SRV-ABC-123");
  assert.equal(confirmationNumber({ type: "text", text: { body: "confirm:SRV-ABC-123" } }), null);
});
test("confirmation requires owner and message context and only changes pending orders", async () => {
  process.env.WHATSAPP_OWNER_NUMBER = "919294924996";
  process.env.WHATSAPP_PHONE_NUMBER_ID = "phone";
  process.env.WHATSAPP_APP_SECRET = "secret";
  const updates: any[] = [];
  const service = new WhatsAppService({ notification: { findFirst: async () => ({ orderId: "order" }) }, order: { updateMany: async (args: any) => { updates.push(args); return { count: 1 }; } } } as any);
  const send = async (from: string, context = "provider-id") => {
    const body = { entry: [{ changes: [{ value: { metadata: { phone_number_id: "phone" }, messages: [{ type: "button", from, context: { id: context }, button: { payload: "confirm:SRV-ABC-123" } }] } }] }] };
    const rawBody = Buffer.from(JSON.stringify(body));
    return service.receive({ body, rawBody, headers: { "x-hub-signature-256": "sha256=" + createHmac("sha256", "secret").update(rawBody).digest("hex") } });
  };
  await send("unauthorized"); await send("919294924996", "");
  assert.equal(updates.length, 0);
  await send("919294924996");
  assert.deepEqual(updates[0], { where: { id: "order", status: "PENDING" }, data: { status: "CONFIRMED" } });
});
test("notification uses durable dedupe and order-specific confirmation", async () => {
  process.env.WHATSAPP_OWNER_NUMBER = "919294924996";
  process.env.WHATSAPP_ORDER_TEMPLATE = "srv_new_order";
  let queued: any;
  await queueWhatsAppOrder({ notification: { upsert: async (job: any) => { queued = job; } } }, { id: "order", number: "SRV-ABC-123", customerSnapshot: { name: "Buyer", phone: "+919999999999" }, deliveryAddress: { line1: "Street", city: "City", pinCode: "123456" }, items: [{ name: "Lamp", quantity: 2 }], total: 250 });
  assert.equal(queued.where.dedupeKey, "whatsapp-order:order");
  assert.equal(queued.create.payload.template.components[1].parameters[0].payload, "confirm:SRV-ABC-123");
});
