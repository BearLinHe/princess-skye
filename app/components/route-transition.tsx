"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";

const Navigation = createContext<(href: string) => void>(() => {});

export function RouteTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState("idle");
  const locked = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const previous = useRef(pathname);
  const clearTimers = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const navigate = useCallback((href: string) => {
    if (locked.current || href === pathname) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { router.push(href); return; }
    locked.current = true;
    setPhase("cover");
    router.prefetch(href);
    timers.current.push(setTimeout(() => router.push(href), 480));
    // Never leave the interface blocked if a route fails to load.
    timers.current.push(setTimeout(() => { setPhase("idle"); locked.current = false; }, 8000));
  }, [pathname, router]);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    if (!locked.current) return;
    clearTimers();
    timers.current.push(setTimeout(() => setPhase("reveal"), 80));
    timers.current.push(setTimeout(() => {
      setPhase("idle"); locked.current = false;
      const main = document.querySelector("main");
      main?.setAttribute("tabindex", "-1");
      main?.focus({ preventScroll: true });
    }, 850));
  }, [pathname, clearTimers]);

  return <Navigation.Provider value={navigate}>
    {children}
    <div className={`route-curtain route-${phase}`} aria-hidden="true"><div className="curtain-brand"><span>PRINCESS</span><i>Skye.</i></div></div>
    <span className="navigation-status" role="status">{phase === "cover" ? "Opening…" : ""}</span>
  </Navigation.Provider>;
}

export const usePageNavigation = () => useContext(Navigation);

export function TransitionLink(props: ComponentProps<typeof Link>) {
  const navigate = usePageNavigation();
  return <Link {...props} onNavigate={(event) => {
    props.onNavigate?.(event);
    if (typeof props.href === "string" && props.href.startsWith("/")) { event.preventDefault(); navigate(props.href); }
  }} />;
}
