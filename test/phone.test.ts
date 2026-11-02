import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeIndianPhone } from "../src/lib/phone";

test("Indian phone numbers require ten national digits and normalize to +91", () => {
  assert.equal(normalizeIndianPhone("9876543210"), "+919876543210");
  assert.equal(normalizeIndianPhone("+919876543210"), "+919876543210");
  for (const invalid of ["", "123", "987654321", "98765432100", "+449876543210", "919876543210", "98765abc10"]) assert.throws(() => normalizeIndianPhone(invalid));
});
