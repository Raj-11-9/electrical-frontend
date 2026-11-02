"use client";
import { useId, useState } from "react";

export function PhoneInput({ name = "phone", disabled = false, defaultValue = "" }: { name?: string; disabled?: boolean; defaultValue?: string }) {
  const [number, setNumber] = useState(() => defaultValue.replace(/[^0-9]/g, "").slice(-10));
  const id = useId();
  return <span className="phone-number-field">
    <span className="phone-country-prefix" aria-label="India country code plus 91">IN +91</span>
    <input type="tel" autoComplete="tel-national" inputMode="numeric" required minLength={10} maxLength={10} pattern="[0-9]{10}" placeholder="10-digit mobile number" title="Enter exactly 10 digits. The +91 country code is added automatically." aria-describedby={id} value={number} disabled={disabled}
      onChange={event => setNumber(event.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
      onPaste={event => {
        const pasted = event.clipboardData.getData("text").trim();
        const digits = pasted.replace(/[^0-9]/g, "");
        if ((pasted.startsWith("+91") || digits.length === 12) && digits.startsWith("91") && digits.length === 12) { event.preventDefault(); setNumber(digits.slice(2)); }
      }} />
    <input type="hidden" name={name} value={number ? "+91" + number : ""} disabled={disabled} />
    <span id={id} className="phone-input-help">India (+91). Enter exactly 10 digits.</span>
  </span>;
}
