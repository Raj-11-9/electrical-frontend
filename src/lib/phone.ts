export function normalizeIndianPhone(value: string): string {
  const phone = value.trim();
  if (/^[0-9]{10}$/.test(phone)) return "+91" + phone;
  if (/^\+91[0-9]{10}$/.test(phone)) return phone;
  throw new Error("Enter exactly 10 digits for your India (+91) mobile number.");
}
