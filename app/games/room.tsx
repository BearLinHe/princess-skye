"use client";

import Link from "next/link";
import Image from "next/image";
import GameLibrary from "./library";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BOARD_COLUMNS, BOARD_ROWS, MOBILE_BOARD_COLUMNS, MOBILE_BOARD_ROWS, boardDirection, puppyFacesRight, boardCoordinates, defaultOptions, defaultSpaces, destination, readConfig, wheelRotation, sectors, chooseWeighted, type Choice, type Space } from "./rules";

const STORAGE = "skye-playroom-v1";
const dieFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const colors = ["#752637", "#302b29", "#98764e", "#463335", "#621e30", "#4c4540", "#866549", "#352a31", "#773d47", "#4b3c31", "#9b7c58", "#542c37"];

export default function GameRoom() {
  const [access, setAccess] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [game, setGame] = useState<"board" | "wheel">("board");
  const [spaces, setSpaces] = useState(defaultSpaces);
  const [options, setOptions] = useState(defaultOptions);
  const [position, setPosition] = useState(0);
  const [selected, setSelected] = useState(0);
  const [draft, setDraft] = useState<Space>(defaultSpaces[0]);
  const [editing, setEditing] = useState(false);
  const [optionDraft, setOptionDraft] = useState(defaultOptions);
  const [dice, setDice] = useState(1);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [angle, setAngle] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [announcement, setAnnouncement] = useState("Roll to begin.");
  const [storageReady, setStorageReady] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);
  const editorDialog = useRef<HTMLDialogElement>(null);
  const menu = useRef<HTMLDetailsElement>(null);
  const editorTitle = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { setAccess(sessionStorage.getItem("skye-adult") === "yes"); } catch { setAccess(false); }
    setStorageReady(true);
    return () => timers.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (editing && canEdit) { editorDialog.current?.showModal(); if (game === "board") editorTitle.current?.focus(); }
    else editorDialog.current?.close();
  }, [editing, selected, game, canEdit]);

  function later(fn: () => void, ms: number) { timers.current.push(setTimeout(fn, ms)); }
  function setRunning(value: boolean) { busyRef.current = value; setBusy(value); }
  function save(nextSpaces: Space[], nextOptions: Choice[]) {
    if (!canEdit) return;
    setSpaces(nextSpaces); setOptions(nextOptions); setDirty(true);
    try { localStorage.setItem(STORAGE, JSON.stringify({ spaces: nextSpaces, options: nextOptions })); setNote("Draft updated. Use Save game to save online."); }
    catch { setNote("Draft updated. Use Save game to keep your changes."); }
  }
  function selectSpace(index: number) {
    if (busyRef.current) return;
    setPreview(index);
    if (!canEdit) return;
    setSelected(index); setDraft({ ...spaces[index] }); setEditing(true); setNote("");
  }
  function roll() {
    if (busyRef.current || position === 24) return;
    setPreview(null); setEditing(false); setRunning(true); setNote("");
    const value = Math.floor(Math.random() * 6) + 1;
    const end = destination(position, value);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reduced ? 30 : 340;
    setAnnouncement("Rolling…");
    if (!reduced) for (let i = 0; i < 6; i++) later(() => setDice(Math.floor(Math.random() * 6) + 1), i * 80);
    later(() => {
      setDice(value); setAnnouncement(`Rolled ${value}. Moving ${end - position} spaces.`);
      for (let step = 1; step <= end - position; step++) later(() => {
        const next = position + step; setPosition(next);
        if (next === end) { setRunning(false); setAnnouncement(`${next === 24 ? "Finish! " : ""}${spaces[next].title}. ${spaces[next].content}`); }
      }, step * delay);
    }, reduced ? 0 : 580);
  }
  function spin() {
    if (busyRef.current) return;
    setPreview(null); setEditing(false); setRunning(true); setWinner(null); setNote("");
    const index = chooseWeighted(options, Math.random());
    setAngle(wheelRotation(angle, sectors(options)[index].center));
    setAnnouncement("Spinning…");
    later(() => { setWinner(options[index].label); setAnnouncement(`Selected: ${options[index].label}`); setRunning(false); }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 30 : 4500);
  }
  function switchGame(next: "board" | "wheel") {
    if (busyRef.current) return;
    setPreview(null); if (menu.current) menu.current.open = false; setGame(next); setEditing(false); setNote(""); setAnnouncement(next === "board" ? "Roll to begin." : "Spin to choose.");
  }
  function resetBoard() { if (!busyRef.current) { setPreview(null); setPosition(0); setDice(1); setEditing(false); setAnnouncement("Back at the start."); } }
  const shownSpace = spaces[preview ?? position];
  const coordinates = boardCoordinates(position);
  const mobileCoordinates = boardCoordinates(position, true);
  const mobileTrailPoints = spaces.map((_, index) => { const cell = boardCoordinates(index, true); return `${(cell.col + .5) * 1000 / MOBILE_BOARD_COLUMNS},${(cell.row + .5) * 1000 / MOBILE_BOARD_ROWS}`; });
  const trailPoints = spaces.map((_, index) => { const cell = boardCoordinates(index); return `${(cell.col + .5) * 1000 / BOARD_COLUMNS},${(cell.row + .5) * 1000 / BOARD_ROWS}`; });
  const slices = sectors(options);
  const gradient = slices.map((slice, i) => `${colors[i]} ${slice.start}deg ${slice.end}deg`).join(",");

  if (access !== true) return <main className="room access-screen"><Link href="/" className="room-wordmark">Princess <i>Skye.</i></Link><div className="access-card"><span className="room-kicker">18+ ONLY</span><h1>The Playroom</h1><p>By entering, you confirm you’re 18+.</p><button className="game-primary" disabled={access === null} onClick={() => { try { sessionStorage.setItem("skye-adult", "yes"); } catch {} setAccess(true); }}>Enter the playroom <span>↗</span></button><Link className="game-link" href="/">Back</Link></div></main>;

  return <main className="room immersive-room">
    <div className="playroom-photo" aria-hidden="true"><Image src="/images/skye-playroom.png" alt="" fill unoptimized /></div>
    <header className="playroom-nav">
      <Link href="/" className="room-wordmark">Princess <i>Skye.</i></Link>
      <details className="playroom-menu" ref={menu}>
        <summary aria-label="Open game menu">{dirty ? <span className="unsaved-dot" aria-label="Unsaved changes" /> : null}<span aria-hidden="true">☰</span></summary>
        <div className="menu-content">
          <div className="game-switch" aria-label="Choose a game"><button aria-pressed={game === "board"} disabled={busy || editing} onClick={() => switchGame("board")}>Puppy Steps</button><button aria-pressed={game === "wheel"} disabled={busy || editing} onClick={() => switchGame("wheel")}>The Wheel</button></div>
    <GameLibrary config={{ spaces, options }} disabled={busy || editing} dirty={dirty} onAdmin={setCanEdit} onSaved={() => setDirty(false)} onLoad={config => { setSpaces(config.spaces); setOptions(config.options); setDraft(config.spaces[0]); setOptionDraft(config.options); setPosition(0); setPreview(null); setSelected(0); setAngle(0); setWinner(null); setEditing(false); setDirty(false); setNote(""); }} />
          {canEdit && game === "wheel" && <button className="game-secondary" disabled={busy} onClick={() => { setOptionDraft(options.map(o => ({ ...o }))); setEditing(true); }}>Edit choices</button>}
          <Link href="/" className="game-link">Leave ↗</Link>
        </div>
      </details>
    </header>
    <section className={`immersive-stage ${game === "board" ? "photo-board" : "immersive-wheel"}`} aria-label={game === "board" ? "Puppy Steps board" : "The Wheel"}>
      {game === "board" ? <>
          <div className="puppy-board">
            <svg className="board-trail desktop-trail" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><polyline points={trailPoints.join(" ")} className="trail-track" /><polyline points={trailPoints.slice(0, position + 1).join(" ")} className="trail-complete" /></svg>
            <svg className="board-trail mobile-trail" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><polyline points={mobileTrailPoints.join(" ")} className="trail-track" /><polyline points={mobileTrailPoints.slice(0, position + 1).join(" ")} className="trail-complete" /></svg>
            {spaces.map((space, index) => { const cell = boardCoordinates(index); const mobileCell = boardCoordinates(index, true); return <button key={index} style={{ "--cell-row": cell.row + 1, "--cell-col": cell.col + 1, "--mobile-row": mobileCell.row + 1, "--mobile-col": mobileCell.col + 1 } as CSSProperties} className={`board-space ${/^Space \d+$/.test(space.title) ? "untitled-space" : ""} ${position === index ? "current" : ""} ${index < position ? "visited" : ""} ${index === 0 || index === 24 ? "endpoint" : ""} ${index === 24 ? "finish-space" : ""} ${editing && selected === index ? "selected-space" : ""}`} disabled={busy} onClick={() => selectSpace(index)} aria-label={`${canEdit ? "Edit space" : "Space"} ${index}: ${space.title}`} aria-current={position === index ? "step" : undefined}><span className="space-number">{String(index).padStart(2, "0")} <span className="desktop-direction">{boardDirection(index)}</span><span className="mobile-direction">{boardDirection(index, true)}</span></span><span className="space-emblem" aria-hidden="true">{index === 0 ? "✧" : index === 24 ? "♛" : "◇"}</span><span className="space-title">{/^Space \d+$/.test(space.title) ? (space.content === defaultSpaces[index].content ? "" : space.content) : space.title}</span></button>; })}
            <div className={`puppy-token ${busy ? "crawling" : ""}`} style={{ "--token-left": `${coordinates.col * 100 / BOARD_COLUMNS}%`, "--token-top": `${coordinates.row * 100 / BOARD_ROWS}%`, "--mobile-left": `${mobileCoordinates.col * 100 / MOBILE_BOARD_COLUMNS}%`, "--mobile-top": `${mobileCoordinates.row * 100 / MOBILE_BOARD_ROWS}%`, "--face": puppyFacesRight(position) ? -1 : 1, "--mobile-face": puppyFacesRight(position, true) ? -1 : 1 } as CSSProperties} aria-hidden="true"><span>🐕</span></div>
          </div>
      </> : <><div className="wheel-stage"><div className="wheel-pointer" aria-hidden="true" /><div className="prize-wheel" style={{ background: `conic-gradient(${gradient})`, transform: `rotate(${angle}deg)` }} aria-hidden="true">{options.map((option, i) => <div className="wheel-label" key={i} style={{ transform: `rotate(${slices[i].center}deg)` }}><span>{slices[i].percent >= 8 ? option.label.slice(0, 20) : i + 1}</span></div>)}</div><div className="wheel-center" aria-hidden="true">S<span>✧</span></div></div></>}
    </section>
    <section className="play-dock" aria-label="Game controls">
      <div className="dock-instruction" aria-live="polite">
        {game === "board" ? <><span className="dock-label">{preview !== null && preview !== position ? `SPACE ${String(preview).padStart(2, "0")}` : position === 24 ? "FINISH" : ""}</span>{!/^Space \d+$/.test(shownSpace.title) && <h2>{shownSpace.title}</h2>}<p>{shownSpace.content === "Add your own instruction here." ? "" : shownSpace.content}</p>{preview !== null && preview !== position && <button className="game-link" onClick={() => setPreview(null)}>Back to current space</button>}</> : <><h2>{winner || "The Wheel"}</h2>{busy && <p>Spinning…</p>}</>}
      </div>
      <div className="dock-actions">
        {game === "board" && <div className={`dock-die ${busy ? "rolling" : ""}`} aria-label={`Dice: ${dice}`}><span aria-hidden="true">{dieFaces[dice - 1]}</span></div>}
        <button className="game-primary roll-button" disabled={busy} onClick={game === "board" ? position === 24 ? resetBoard : roll : spin}>{busy ? "…" : game === "board" ? position === 24 ? "Play again" : "Roll" : "Spin"}<span aria-hidden="true">↗</span></button>
        {game === "board" && <button className="reset-button" aria-label="Start again" title="Start again" disabled={busy} onClick={resetBoard}>↺</button>}
      </div>
      {dirty && canEdit && <button className="draft-shortcut" onClick={() => { if (menu.current) { menu.current.open = true; menu.current.scrollIntoView({ behavior: "smooth", block: "start" }); menu.current.querySelector<HTMLButtonElement>(".library-controls .game-primary")?.focus(); } }}>Unsaved changes · Save ↗</button>}
    </section>
    <dialog ref={editorDialog} className="space-dialog game-panel" aria-label={game === "board" ? "Edit space" : "Edit wheel choices"} onCancel={() => { setEditing(false); setNote(""); }}>
      {editing && canEdit && <>
<form onSubmit={event => { event.preventDefault(); if (game === "board") { if (!draft.title.trim() || !draft.content.trim()) { setNote("Add a title and instruction."); return; } save(spaces.map((s, i) => i === selected ? { title: draft.title.trim(), content: draft.content.trim() } : s), options); } else { if (optionDraft.some(o => !o.label.trim() || !Number.isInteger(o.weight) || o.weight < 1 || o.weight > 100)) { setNote("Add a name and a whole-number weight from 1 to 100."); return; } save(spaces, optionDraft.map(o => ({ label: o.label.trim(), weight: o.weight }))); setWinner(null); setAngle(0); } setEditing(false); }}>
          <span className="room-kicker">MAKE IT YOURS</span><h2>{game === "board" ? `Space ${String(selected).padStart(2, "0")}` : "Your choices"}</h2>
          {game === "board" ? <><label className="field-label" htmlFor="space-title">Title</label><input ref={editorTitle} id="space-title" maxLength={28} required value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} /><label className="field-label" htmlFor="space-content">Instruction</label><textarea id="space-content" rows={6} maxLength={400} required value={draft.content} onChange={e => setDraft({ ...draft, content: e.target.value })} /><p className="field-help">Shown when your puppy lands here.</p></> : <><div className="choice-fields">{optionDraft.map((option, i) => <div className="choice-row" key={i}><label>Choice {i + 1}<input aria-label={`Choice ${i + 1}`} maxLength={48} required value={option.label} onChange={e => setOptionDraft(optionDraft.map((o, n) => n === i ? { ...o, label: e.target.value } : o))} /></label><label>Weight<input aria-label={`Weight ${i + 1}`} type="number" min={1} max={100} step={1} required value={option.weight || ""} onChange={e => setOptionDraft(optionDraft.map((o, n) => n === i ? { ...o, weight: Number(e.target.value) } : o))} /></label><button type="button" className="remove-choice" disabled={optionDraft.length <= 2} aria-label={`Remove choice ${i + 1}`} onClick={() => setOptionDraft(optionDraft.filter((_, n) => n !== i))}>×</button></div>)}</div><button type="button" className="game-secondary" disabled={optionDraft.length >= 12} onClick={() => setOptionDraft([...optionDraft, { label: "", weight: 1 }])}>+ Add choice</button><p className="field-help">2–12 choices. Weight 1–100 sets slice size and probability.</p></>}
          <div className="editor-actions"><button className="game-primary" type="submit" disabled={!storageReady}>Apply changes <span>↗</span></button><button type="button" className="game-secondary" onClick={() => { setEditing(false); setNote(""); }}>Cancel</button></div>
        </form>
        {note && <p className="save-note" role="status">{note}</p>}
      </>}
    </dialog>
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
  </main>;
}
