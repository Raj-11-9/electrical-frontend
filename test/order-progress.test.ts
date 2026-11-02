import { test } from "node:test";
import assert from "node:assert/strict";
import { orderProgress } from "../src/lib/order-progress";
test("order progress follows fulfillment rather than payment and excludes cancelled orders",()=>{
  assert.equal(orderProgress("PENDING"),0);assert.equal(orderProgress("CONFIRMED"),1);assert.equal(orderProgress("SHIPPED"),2);assert.equal(orderProgress("DELIVERED"),3);assert.equal(orderProgress("CANCELLED"),-1);assert.equal(orderProgress("PAID"),-1);
});
