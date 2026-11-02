"use client";
import { useState } from "react";
import { MessageCircle, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { tradeEnquiry, enquiryLinks, type TradeDetails } from "@/lib/enquiry";
import { PhoneInput } from "./phone-input";
export function EnquiryForm() {
  const [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const links = enquiryLinks(
    message,
    undefined,
    undefined,
    "Product enquiry",
  );
  return (
    <div className="enquiry-workspace">
      <form
        className="trade-enquiry-form"
        onChange={() => {
          setMessage("");
          setError("");
        }}
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const details = Object.fromEntries(
            [
              "name",
              "company",
              "email",
              "phone",
              "city",
              "gstin",
              "requirements",
            ].map((key) => [key, String(form.get(key) || "")]),
          ) as TradeDetails;
          try {
            setMessage(tradeEnquiry(details));
            setError("");
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <div className="form-grid">
          <label>
            Your name <span>*</span>
            <input name="name" autoComplete="name" required maxLength={100} />
          </label>
          <label>
            Company name (optional)
            <input name="company" autoComplete="organization" maxLength={150} />
          </label>
          <label>
            Email address <span>*</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={150}
            />
          </label>
          <label>
            Phone number <span>*</span>
            <PhoneInput />
          </label>
          <label>
            City / delivery location
            <input name="city" autoComplete="address-level2" maxLength={150} />
          </label>
          <label>
            GSTIN (optional)
            <input name="gstin" maxLength={15} autoCapitalize="characters" />
          </label>
        </div>
        <label>
          Your requirements <span>*</span>
          <textarea
            name="requirements"
            rows={5}
            required
            maxLength={2500}
            placeholder="Tell us which products you’re interested in, quantities and where you’d like them delivered."
          />
        </label>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button className="button primary" type="submit">
          Prepare your enquiry
          <ArrowRight size={17} />
        </button>
        <p className="enquiry-hint">
          Your details stay in this page until you choose WhatsApp or email.
          Preparing an enquiry does not submit it or create an account.
        </p>
      </form>
      {message && (
        <section className="enquiry-preview" aria-label="Prepared enquiry">
          <div className="eyebrow">
            <CheckCircle2 size={16} />
            YOUR ENQUIRY IS READY
          </div>
          <h2>Choose how to send it.</h2>
          <pre>{message}</pre>
          <div className="product-actions">
            <a className="button primary" href={links.whatsapp}>
              <MessageCircle size={17} />
              Open WhatsApp
            </a>
            <a className="button outline" href={links.email}>
              <Mail size={17} />
              Open email
            </a>
          </div>
          <p className="enquiry-hint">
            Review the message in your chosen app, then press Send. Our team will help with product details and your order.
          </p>
        </section>
      )}
    </div>
  );
}
