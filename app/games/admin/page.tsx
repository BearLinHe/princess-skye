"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "../games.css";
export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <main className="room access-screen"><Link href="/" className="room-wordmark">Princess <i>Skye.</i></Link><form className="access-card admin-login" onSubmit={async event => {
    event.preventDefault(); if (busy) return; setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }), signal: AbortSignal.timeout(20000) });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Unable to sign in."); return; }
      setPassword(""); router.replace("/games");
    } catch { setError("Unable to connect. Please try again."); }
    finally { setBusy(false); }
  }}><span className="room-kicker">FOR SKYE ONLY</span><h1>Your playroom.</h1><label className="field-label" htmlFor="admin-password">Password</label><input id="admin-password" type="password" autoComplete="current-password" required maxLength={256} value={password} onChange={event => setPassword(event.target.value)} /><button className="game-primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}<span>↗</span></button>{error && <p role="alert" className="save-note">{error}</p>}<Link href="/games" className="game-link">Back to the games</Link></form></main>;
}
