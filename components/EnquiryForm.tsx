"use client";

import { type FormEvent, useState } from "react";
import { Arrow } from "./Brand";
import { ENQUIRY_EMAIL, enquiryEmailUrl, enquiryGmailUrl, type Enquiry } from "../lib/enquiry";

const emptyEnquiry: Enquiry = { name: "", email: "", company: "", question: "" };

export default function EnquiryForm() {
  const [brief, setBrief] = useState<Enquiry>(emptyEnquiry);
  const [prepared, setPrepared] = useState<Enquiry | null>(null);
  const [status, setStatus] = useState("");

  function update(field: keyof Enquiry, value: string) {
    setBrief(current => ({ ...current, [field]: value }));
    setPrepared(null);
    setStatus("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    if (!brief.name.trim() || !brief.question.trim()) {
      setStatus("Complete your name and growth challenge.");
      return;
    }

    const enquiry = { name: brief.name.trim(), email: brief.email.trim(), company: brief.company.trim(), question: brief.question.trim() };
    setPrepared(enquiry);
    setStatus("Your email draft is ready. Review it and press Send in your email app. If it did not open, use an option below.");
    window.location.href = enquiryEmailUrl(enquiry);
  }

  return <form className="brief-form enter-item" onSubmit={submit}>
    <div className="form-row">
      <label htmlFor="brief-name">Name<input id="brief-name" name="name" autoComplete="name" required maxLength={200} placeholder="Your name" value={brief.name} onChange={event => update("name", event.target.value)} /></label>
      <label htmlFor="brief-email">Work email<input id="brief-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com" value={brief.email} onChange={event => update("email", event.target.value)} /></label>
    </div>
    <label htmlFor="brief-company">Company <span className="optional">(optional)</span><input id="brief-company" name="company" autoComplete="organization" maxLength={200} placeholder="Your team or product" value={brief.company} onChange={event => update("company", event.target.value)} /></label>
    <label htmlFor="brief-question">What growth challenges would you like to discuss?<textarea id="brief-question" name="question" required maxLength={4000} rows={3} placeholder="Tell us about your product, users, growth spending or partnership needs…" value={brief.question} onChange={event => update("question", event.target.value)} /></label>
    <button className="button button-primary" type="submit">Open email draft <Arrow /></button>
    <p className="form-helper">Opens a draft to {ENQUIRY_EMAIL} with your details. Review it and press Send in your email app.</p>
    <p className="form-status" role="status" aria-live="polite">{status}</p>
    {prepared ? <div className="enquiry-email-options" aria-label="Email options">
      <a className="enquiry-email" href={enquiryEmailUrl(prepared)}>Open draft again</a>
      <a className="enquiry-email" href={enquiryGmailUrl(prepared)} target="_blank" rel="noopener noreferrer">Open in Gmail</a>
    </div> : null}
  </form>;
}
