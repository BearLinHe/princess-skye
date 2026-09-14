"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Game = "board" | "wheel";
type Phase = "idle" | "cover" | "reveal";
type Scene = { game: Game; selected: Game; phase: Phase; direction: "forward" | "backward" };
const initial: Scene = { game: "board", selected: "board", phase: "idle", direction: "forward" };

export function useGameTransition() {
  const [scene, setScene] = useState<Scene>(initial);
  const current = useRef(initial);
  const update = useCallback((next: Scene) => { current.current = next; setScene(next); }, []);

  const advance = useCallback((phase: Exclude<Phase, "idle">) => {
    const state = current.current;
    if (state.phase !== phase) return;
    if (phase === "cover") {
      // Change content only once the stage is fully covered. A rapid click
      // during closing selects the latest request without restarting the wipe.
      update({ ...state, game: state.selected, phase: "reveal" });
    } else if (state.selected !== state.game) {
      update({ ...state, phase: "cover", direction: state.selected === "wheel" ? "forward" : "backward" });
    } else {
      update({ ...state, phase: "idle" });
    }
  }, [update]);

  const request = useCallback((next: Game) => {
    const state = current.current;
    if (state.selected === next) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      update({ ...state, game: next, selected: next, phase: "idle" });
      return;
    }
    update({ ...state, selected: next, ...(state.phase === "idle" ? {
      phase: "cover" as const, direction: next === "wheel" ? "forward" as const : "backward" as const,
    } : {}) });
  }, [update]);

  useEffect(() => {
    const phase = scene.phase;
    if (phase === "idle") return;
    // Animation events normally advance the sequence. This also releases
    // controls if animations are cancelled or a background tab throttles them.
    const fallback = setTimeout(() => advance(phase), phase === "cover" ? 650 : 900);
    return () => clearTimeout(fallback);
  }, [scene.phase, scene.direction, advance]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function settle() {
      if (!motion.matches) return;
      const state = current.current;
      update({ ...state, game: state.selected, phase: "idle" });
    }
    motion.addEventListener("change", settle);
    return () => motion.removeEventListener("change", settle);
  }, [update]);

  return { ...scene, switching: scene.phase !== "idle", request, advance };
}
