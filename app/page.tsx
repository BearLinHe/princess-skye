"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function Arrow({ reverse = false }: { reverse?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 28 16" fill="none" className={reverse ? "arrow reverse" : "arrow"}><path d="M1 8h25M19 1l7 7-7 7" stroke="currentColor" strokeWidth="1.2" /></svg>;
}

export default function Home() {
  const [entered, setEntered] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const enterButton = useRef<HTMLButtonElement>(null);
  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) { initialRender.current = false; return; }
    if (entered) heading.current?.focus();
    else enterButton.current?.focus();
  }, [entered]);

  return (
    <main className={`landing ${entered ? "is-entered" : ""}`}>
      <div className="photograph" aria-hidden="true">
        <Image src="/images/princess-skye.png" alt="" fill priority sizes="100vw" quality={90} />
      </div>
      <div className="photo-shade" aria-hidden="true" />
      <div className="edge-frame" aria-hidden="true" />

      <header className="masthead">
        <a className="brand" href="/" aria-label="Princess Skye home">
          <span className="monogram" aria-hidden="true">P<span>S</span></span>
        </a>
        <span className="age-badge">18<span>+</span></span>
      </header>

      <section className="hero" aria-label="Welcome to Princess Skye">
        <div className="hero-content">
          <h1 className="title" ref={heading} tabIndex={-1}>
            <span className="princess">Princess</span>
            <span className="skye">Skye<span className="title-period">.</span></span>
          </h1>

          <div className="entry-area" key={entered ? "entered" : "gate"}>
            {entered ? (
              <>
                <Link href="/games" className="enter-button" style={{ marginBottom: 20 }}>PLAYROOM <Arrow /></Link>
                <button className="back-button" onClick={() => setEntered(false)}><Arrow reverse /> Back</button>
              </>
            ) : (
              <>
                <div className="entry-actions">
                  <button ref={enterButton} className="enter-button" onClick={() => { try { sessionStorage.setItem("skye-adult", "yes"); } catch {} setEntered(true); }} aria-label="Enter — I confirm I am 18 or older"><span>ENTER</span><Arrow /></button>
                  <button className="exit-button" onClick={() => window.location.replace("about:blank")} aria-label="Exit this website"><span>EXIT</span><svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="m3 11 8-8M3 3h8v8" stroke="currentColor" strokeWidth="1" /></svg></button>
                </div>
                <p className="age-notice">By entering, you confirm you’re 18+.</p>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} PRINCESS SKYE</span>
      </footer>
    </main>
  );
}
