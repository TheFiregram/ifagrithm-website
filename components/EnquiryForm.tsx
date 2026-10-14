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
      setStatus("Complete your name and what you'd like to discuss.");
      return;
    }

    const enquiry = { name: brief.name.trim(), email: brief.email.trim(), company: brief.company.trim(), question: brief.question.trim() };
    setPrepared(enquiry);
    setStatus("Your request is ready as an email draft. Send it to request a call. We will need to agree on a time; no booking is confirmed yet.");
    window.location.href = enquiryEmailUrl(enquiry);
  }

  return <form className="brief-form enter-item" onSubmit={submit}>
    <div className="form-row">
      <label htmlFor="brief-name">Name<input id="brief-name" name="name" autoComplete="name" required maxLength={200} placeholder="Your name" value={brief.name} onChange={event => update("name", event.target.value)} /></label>
      <label htmlFor="brief-email">Work email<input id="brief-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com" value={brief.email} onChange={event => update("email", event.target.value)} /></label>
    </div>
    <label htmlFor="brief-company">Company <span className="optional">(optional)</span><input id="brief-company" name="company" autoComplete="organization" maxLength={200} placeholder="Your team or product" value={brief.company} onChange={event => update("company", event.target.value)} /></label>
    <label htmlFor="brief-question">What would you like to discuss on the call?<textarea id="brief-question" name="question" required maxLength={4000} rows={3} placeholder="Your business challenge or the decision you need to make…" value={brief.question} onChange={event => update("question", event.target.value)} /></label>
    <button className="button button-primary" type="submit">Prepare call request <Arrow /></button>
    <p className="form-helper">Opens an email request to {ENQUIRY_EMAIL}. Review and send it so the team can arrange a call. Sending a request does not confirm a booking.</p>
    <p className="form-status" role="status" aria-live="polite">{status}</p>
    {prepared ? <div className="enquiry-email-options" aria-label="Email options">
      <a className="enquiry-email" href={enquiryEmailUrl(prepared)}>Open draft again</a>
      <a className="enquiry-email" href={enquiryGmailUrl(prepared)} target="_blank" rel="noopener noreferrer">Open in Gmail</a>
    </div> : null}
  </form>;
}
