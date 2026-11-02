"use client";
import { useState } from "react";
import { commerce } from "./customer-account";

type Address = { id: string; fullName: string; phone: string; line1: string; line2?: string; city: string; state: string; pinCode: string };
const fields = [["line1", "Street address", "address-line1"], ["line2", "Address line 2 (optional)", "address-line2"], ["city", "City", "address-level2"], ["state", "State", "address-level1"], ["pinCode", "PIN code", "postal-code"]] as const;
export function CheckoutAddresses({ initialAddresses, busy, onReady }: { initialAddresses: Address[]; busy: boolean; onReady: (ready: boolean) => void }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [selected, setSelected] = useState<Address | null>(initialAddresses[0] || null);
  const [editing, setEditing] = useState<Address | null>(null);
  const [showEditor, setShowEditor] = useState(!initialAddresses.length);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  return <fieldset disabled={busy || saving} className="checkout-addresses">
    <legend>Delivery address</legend>
    {!showEditor && <>
      {addresses.map(address => <label className="payment-choice" key={address.id}>
        <input type="radio" name="deliveryAddressId" value={address.id} checked={selected?.id === address.id} onChange={() => { setSelected(address); setConfirmed(false); onReady(false); }} />
        <span><strong>{address.fullName}</strong><small>{[address.line1, address.line2, address.city, address.state, address.pinCode].filter(Boolean).join(", ")}</small></span>
      </label>)}
      <div className="payment-actions">
        <button type="button" className="button primary" disabled={!selected} onClick={() => { setConfirmed(true); onReady(true); }}>Continue with this address</button>
        <button type="button" className="button outline" disabled={!selected} onClick={() => { setEditing(selected); setShowEditor(true); setConfirmed(false); onReady(false); }}>Edit address</button>
        <button type="button" className="button outline" onClick={() => { setEditing(null); setShowEditor(true); setConfirmed(false); onReady(false); }}>Add another address</button>
      </div>
      {confirmed && <p role="status">Delivery address selected.</p>}
      {selected && fields.map(([name]) => <input type="hidden" name={name} value={selected[name] || ""} key={name} />)}
    </>}
    {showEditor && <>
      <div className="form-grid" key={editing?.id || "new"}>
        {fields.map(([name, label, auto]) => <label key={name}>{label}<input name={name} defaultValue={editing?.[name] || ""} autoComplete={auto} required={name !== "line2"} maxLength={name === "pinCode" ? 6 : 150} pattern={name === "pinCode" ? "[0-9]{6}" : undefined} inputMode={name === "pinCode" ? "numeric" : undefined} /></label>)}
      </div>
      <div className="payment-actions"><button type="button" className="button primary" onClick={async event => {
        const form = event.currentTarget.form;
        if (!form) return;
        const controls = Array.from(form.elements).filter((element): element is HTMLInputElement => element instanceof HTMLInputElement && ["name", "email", "line1", "line2", "city", "state", "pinCode"].includes(element.name) || element instanceof HTMLInputElement && element.type === "tel");
        for (const control of controls) if (!control.reportValidity()) return;
        const data = Object.fromEntries(new FormData(form));
        setSaving(true); setError("");
        try {
          const address = await commerce("addresses", { id: editing?.id, fullName: data.name, phone: data.phone, ...Object.fromEntries(fields.map(([name]) => [name, data[name]])) });
          setAddresses(previous => [address, ...previous.filter(a => a.id !== address.id)]);
          setSelected(address); setShowEditor(false); setConfirmed(true); onReady(true);
        } catch (e) { setError((e as Error).message); }
        finally { setSaving(false); }
      }}>{saving ? "Saving address…" : "Save & continue with this address"}</button>
      {!!addresses.length && <button type="button" className="button outline" onClick={() => { setShowEditor(false); setError(""); }}>Cancel</button>}</div>
    </>}
    {error && <p role="alert" className="form-error">{error}</p>}
  </fieldset>;
}
