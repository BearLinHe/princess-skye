"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePageNavigation } from "./components/route-transition";

function EntryArrow() {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M7 25 25 7M7 7h18v18" stroke="currentColor" strokeWidth="1.25" /></svg>;
}

export default function Home() {
  const navigate = usePageNavigation();
  const router = useRouter();
  useEffect(() => { router.prefetch("/games"); }, [router]);

  function enter() {
    try { sessionStorage.setItem("skye-adult", "yes"); } catch {}
    navigate("/games");
  }

  return <main className="campaign">
    <div className="campaign-photo"><Image src="/images/princess-skye.png" alt="Princess Skye in black boots with signature red soles" fill preload unoptimized sizes="100vw" /></div>
    <header className="campaign-header">
      <a className="campaign-wordmark" href="/" aria-label="Princess Skye home"><span>Princess</span><i>Skye.</i></a>
      <span className="campaign-header-note">THE PRIVATE PLAYROOM</span>
      <span className="campaign-age">18+</span>
    </header>
    <section className="campaign-composition" aria-label="Welcome to Princess Skye">
      <div className="campaign-intro"><span>HER WORLD.</span><p>Your <i>next move.</i></p></div>
      <div className="campaign-identity"><h1>Skye</h1></div>
      <div className="campaign-entry">
        <button className="campaign-enter" onClick={enter} aria-label="Enter — I confirm I am 18 or older"><EntryArrow /><span>Enter</span></button>
        <div className="campaign-consent"><p>By entering, you confirm<br />you are 18 or older.</p><button onClick={() => window.location.replace("about:blank")}>Exit <span aria-hidden="true">↗</span></button></div>
      </div>
    </section>
    <footer className="campaign-footer"><span>© {new Date().getFullYear()} PRINCESS SKYE</span><span aria-hidden="true">S / P</span></footer>
  </main>;
}
