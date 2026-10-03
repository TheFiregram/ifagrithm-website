"use client";

// Network admin: one password, the application queue, one button that
// approves and mails the congratulations with a card claim link.
// Look borrowed from the Student Connect admin, weight not included.

import { Fragment, useCallback, useEffect, useState } from "react";
import "./admin.css";

type Application = {
  id: number;
  created_at: string;
  full_name: string;
  x_handle: string;
  telegram: string;
  email: string;
  country: string;
  role: string;
  desks: string[];
  links: string;
  context: string;
  why: string;
  status: string;
  claim_token: string | null;
  serial: string;
};

export default function AdminConsole() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [apps, setApps] = useState<Application[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/applications", { cache: "no-store" });
    if (res.status === 401) { setAuthed(false); return; }
    if (!res.ok) { setError("Store unreachable — is the Contabo box up?"); setAuthed(true); return; }
    const data = await res.json();
    setApps(data.applications ?? []);
    setError("");
    setAuthed(true);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) { setError("Wrong password."); return; }
    setPassword("");
    load();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setApps([]);
    setAuthed(false);
  }

  async function approve(id: number) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Approve failed."); return; }
      setApps(rows => rows.map(r => r.id === id ? { ...r, status: "approved", claim_token: data.claim_url?.split("t=")[1] ?? r.claim_token } : r));
      setNotes(n => ({ ...n, [id]: data.mail_error
        ? `Approved. Mail failed — ${data.mail_error}`
        : data.mail?.skipped
        ? "Approved. Mail skipped — no Resend key on the store yet."
        : "Approved. Congratulations mail on its way." }));
    } catch {
      setError("Approve failed — store unreachable.");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: number) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Reject failed."); return; }
      setApps(rows => rows.map(r => r.id === id ? { ...r, status: "rejected", claim_token: null } : r));
      setNotes(n => ({ ...n, [id]: data.mail_error
        ? `Rejected. Mail failed — ${data.mail_error}`
        : data.mail?.skipped
        ? "Rejected. Mail skipped — no Resend key on the store yet."
        : "Rejected. Decline mail on its way." }));
    } catch {
      setError("Reject failed — store unreachable.");
    } finally {
      setBusyId(null);
    }
  }

  async function copyClaim(id: number) {
    const claimUrl = `${window.location.origin}/network?t=${apps.find(a => a.id === id)?.claim_token ?? ""}`;
    try {
      await navigator.clipboard.writeText(claimUrl);
      setNotes(n => ({ ...n, [id]: "Claim link copied." }));
    } catch {
      setNotes(n => ({ ...n, [id]: claimUrl }));
    }
  }

  if (authed === null) {
    return <div className="adm-wrap"><p className="adm-status">Checking session…</p></div>;
  }

  if (!authed) {
    return (
      <div className="adm-wrap">
        <form className="adm-login" onSubmit={login}>
          <p className="adm-eyebrow">IFAGRITHM · NETWORK ADMIN</p>
          <h1>Sign in</h1>
          <input
            type="password"
            value={password}
            autoFocus
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="Admin password"
            aria-label="Admin password"
          />
          <button className="adm-gold" type="submit" disabled={!password}>Enter</button>
          {error ? <p className="adm-error" role="alert">{error}</p> : null}
        </form>
      </div>
    );
  }

  return (
    <div className="adm-wrap">
      <header className="adm-head">
        <div>
          <p className="adm-eyebrow">IFAGRITHM · NETWORK ADMIN</p>
          <h1>Applications</h1>
        </div>
        <div className="adm-head-actions">
          <button className="adm-ghost" type="button" onClick={load}>Refresh</button>
          <button className="adm-ghost" type="button" onClick={logout}>Sign out</button>
        </div>
      </header>
      {error ? <p className="adm-error" role="alert">{error}</p> : null}

      {apps.length === 0 ? (
        <p className="adm-status">No applications yet.</p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Serial</th><th>Applicant</th><th>Reach</th><th>Role / desk</th>
                <th></th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(app => (
                <Fragment key={app.id}>
                  <tr data-status={app.status} className={openId === app.id ? "is-open" : ""}>
                    <td>
                      <span className="adm-serial">{app.serial}</span>
                      <span className="adm-dim">{new Date(app.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                    </td>
                    <td>
                      <span className="adm-strong">{app.full_name}</span>
                      <span className="adm-dim">{app.country}</span>
                    </td>
                    <td>
                      <span>{app.x_handle}</span>
                      <span>{app.telegram}</span>
                      <span>{app.email}</span>
                    </td>
                    <td>
                      <span className="adm-strong">{app.role === "scout" ? "Scout" : "Analyst"}</span>
                      <span>{app.desks.join(", ")}</span>
                    </td>
                    <td>
                      <button
                        className="adm-view"
                        type="button"
                        aria-expanded={openId === app.id}
                        onClick={() => setOpenId(current => current === app.id ? null : app.id)}
                      >
                        {openId === app.id ? "Hide" : "View"}
                      </button>
                    </td>
                    <td><span className={`adm-pill ${app.status}`}>{app.status}</span></td>
                    <td>
                      {app.status === "pending" ? (
                        <span className="adm-actions">
                          <button
                            className="adm-gold"
                            type="button"
                            disabled={busyId === app.id}
                            onClick={() => approve(app.id)}
                          >
                            {busyId === app.id ? "…" : "Approve"}
                          </button>
                          <button
                            className="adm-ghost"
                            type="button"
                            disabled={busyId === app.id}
                            onClick={() => reject(app.id)}
                          >
                            Reject
                          </button>
                        </span>
                      ) : app.status === "approved" ? (
                        <button className="adm-ghost" type="button" onClick={() => copyClaim(app.id)}>Copy claim link</button>
                      ) : null}
                      {notes[app.id] ? <span className="adm-note">{notes[app.id]}</span> : null}
                    </td>
                  </tr>
                  {openId === app.id ? (
                    <tr className="adm-expand">
                      <td colSpan={7}>
                        <div className="adm-expand-grid">
                          <section>
                            <h4>Proof of work</h4>
                            <p className="pre">{app.links}</p>
                            {app.context ? (
                              <>
                                <h4>Context</h4>
                                <p className="pre">{app.context}</p>
                              </>
                            ) : null}
                          </section>
                          <section>
                            <h4>Why IFAGRITHM</h4>
                            <p className="pre">{app.why}</p>
                          </section>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
