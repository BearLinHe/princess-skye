"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePageNavigation } from "./components/route-transition";

export default function Home() {
  const navigate = usePageNavigation();
  const router = useRouter();
  useEffect(() => { router.prefetch("/games"); }, [router]);

  return <main className="campaign">
    <header className="campaign-header"><a href="/" aria-label="Princess Skye home">PS<span aria-hidden="true">✦</span></a><span>A WORLD OF HER OWN</span><span>18+</span></header>
    <div className="campaign-photo"><Image src="/images/princess-skye.png" alt="Princess Skye in black boots with signature red soles" fill priority unoptimized sizes="100vw" /></div>
    <div className="campaign-caption" aria-hidden="true"><span>THE PRIVATE WORLD</span><span>OF PRINCESS SKYE</span></div>
    <section className="campaign-identity" aria-label="Princess Skye">
      <p>Princess</p><h1>Skye<span>.</span></h1>
    </section>
    <div className="campaign-entry">
      <div className="entry-heading">Her world.<br /><i>Your move.</i></div>
      <button className="campaign-enter" onClick={() => { try { sessionStorage.setItem("skye-adult", "yes"); } catch {} navigate("/games"); }} aria-label="Enter — I confirm I am 18 or older"><span>Enter the playroom</span><span className="entry-arrow" aria-hidden="true">↗</span></button>
      <div className="campaign-consent"><p>By entering, you confirm you are 18+.</p><button onClick={() => window.location.replace("about:blank")}>Exit ↗</button></div>
    </div>
    <footer className="campaign-footer"><span>© {new Date().getFullYear()} PRINCESS SKYE</span><span>HER RULES. YOUR NEXT MOVE.</span></footer>
  </main>;
}
