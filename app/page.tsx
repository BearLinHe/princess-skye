"use client";

import Image from "next/image";
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
          <span className="brand-name">PRINCESS SKYE</span>
        </a>
        <span className="edition"><span className="tiny-diamond" /> A WORLD APART</span>
        <span className="age-badge">18<span>+</span></span>
      </header>

      <section className="hero" aria-label="Welcome to Princess Skye">
        <div className="hero-content">
          <div className="eyebrow"><span />{entered ? "YOU’VE ARRIVED" : "HER WORLD. HER RULES."}</div>
          <h1 className="title" ref={heading} tabIndex={-1}>
            <span className="princess">Princess</span>
            <span className="skye">Skye<span className="title-period">.</span></span>
          </h1>
          <p className="invitation" key={entered ? "welcome" : "invitation"}>{entered ? "Welcome to my world." : "Some worlds are worth surrendering to."}</p>

          <div className="entry-area" key={entered ? "entered" : "gate"}>
            {entered ? (
              <>
                <p className="coming-soon">The next chapter is coming.</p>
                <button className="back-button" onClick={() => setEntered(false)}><Arrow reverse /> Back to the entrance</button>
              </>
            ) : (
              <>
                <div className="entry-actions">
                  <button ref={enterButton} className="enter-button" onClick={() => setEntered(true)} aria-label="Enter — I confirm I am 18 or older"><span>ENTER</span><Arrow /></button>
                  <button className="exit-button" onClick={() => window.location.replace("about:blank")} aria-label="Exit this website"><span>EXIT</span><svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="m3 11 8-8M3 3h8v8" stroke="currentColor" strokeWidth="1" /></svg></button>
                </div>
                <p className="age-notice">By entering, you confirm that you are 18 or older.</p>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="vertical-note" aria-hidden="true">AN UNFORGETTABLE PRESENCE</div>
      <footer className="footer">
        <span>© {new Date().getFullYear()} PRINCESS SKYE</span>
        <span className="footer-signature">Exclusively, <i>Skye.</i></span>
        <span className="footer-right"><span className="tiny-diamond" /> {entered ? "WELCOME INSIDE" : "ADULTS ONLY · 18+"}</span>
      </footer>
    </main>
  );
}
