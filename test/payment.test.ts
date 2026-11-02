import { test } from "node:test";
import assert from "node:assert/strict";
import { availablePaymentMethods, selectPaymentMethod } from "../src/lib/payment";

test("payment options only enable methods explicitly supported by backend", () => {
  assert.deepEqual(availablePaymentMethods(["COD", "UNSUPPORTED", "COD"]), ["COD"]);
  for (const value of [null, undefined, "COD", {}, []]) assert.deepEqual(availablePaymentMethods(value), []);
});
test("payment selection survives refresh and falls back when availability changes", () => {
  assert.equal(selectPaymentMethod(["COD", "RAZORPAY"], "COD"), "COD");
  assert.equal(selectPaymentMethod(["RAZORPAY"], "COD"), "RAZORPAY");
  assert.equal(selectPaymentMethod([], "RAZORPAY"), "");
});
