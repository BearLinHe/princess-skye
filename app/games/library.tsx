"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readConfig, type Space, type Choice } from "./rules";
type Config = { spaces: Space[]; options: Choice[] };
type SavedGame = { id: string; name: string; config: Config; version: number; updated_at: string };
type Props = { config: Config; disabled: boolean; dirty: boolean; onAdmin: (admin: boolean) => void; onLoad: (config: Config) => void; onSaved: () => void };
export default function GameLibrary({ config, disabled, dirty, onAdmin, onLoad, onSaved }: Props) {
  const [games, setGames] = useState<SavedGame[]>([]);
  const [selected, setSelected] = useState("");
  const [name, setName] = useState("Skye’s game");
  const [admin, setAdmin] = useState(false);
  const [working, setWorking] = useState(true);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  // Initialization deliberately runs once; callbacks read no mutable parent state.
  useEffect(() => {
    const controller = new AbortController();
    async function initialize() {
      try {
        const [sessionResponse, gamesResponse] = await Promise.all([fetch("/api/admin/session", { cache: "no-store", signal: controller.signal }), fetch("/api/games", { cache: "no-store", signal: controller.signal })]);
        if (!sessionResponse.ok || !gamesResponse.ok) throw new Error("unavailable");
        const session = await sessionResponse.json(); const data = await gamesResponse.json();
        if (controller.signal.aborted) return;
        setAdmin(session.admin === true); onAdmin(session.admin === true);
        setGames(data.games);
        if (data.games.length) { const first = data.games[0]; setSelected(first.id); setName(first.name); onLoad(first.config); }
      } catch { if (!controller.signal.aborted) { setFailed(true); setMessage("Saved games could not be loaded. Refresh to try again."); } }
      finally { if (!controller.signal.aborted) setWorking(false); }
    }
    initialize(); return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const current = games.find(game => game.id === selected);
  const hasChanges = dirty || (current ? name !== current.name : true);
  function load(game: SavedGame) {
    if (hasChanges && admin && !window.confirm("Discard unsaved changes and load this game?")) return;
    setSelected(game.id); setName(game.name); onLoad(game.config); setMessage("Saved game loaded.");
  }
  async function persist(asNew: boolean) {
    if (working || disabled) return;
    if (!name.trim()) { setMessage("Give your game a name."); return; }
    setWorking(true); setMessage("");
    try {
      const response = await fetch(!asNew && current ? `/api/games/${current.id}` : "/api/games", { method: !asNew && current ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, config, version: current?.version }), signal: AbortSignal.timeout(20000) });
      const data = await response.json();
      if (!response.ok) { if (response.status === 401) { setAdmin(false); onAdmin(false); } setMessage(data.error || "Save failed. Your draft is still here."); return; }
      setGames(prev => { const index = prev.findIndex(game => game.id === data.game.id); return index < 0 ? [...prev, data.game] : prev.map(game => game.id === data.game.id ? data.game : game); });
      setSelected(data.game.id); setName(data.game.name); onSaved(); setMessage("Saved online. Ready on your other devices.");
    } catch { setMessage("Connection lost. Your draft is still here; please try saving again."); }
    finally { setWorking(false); }
  }
  return <section className="game-library" aria-label="Saved games"><div className="library-title"><span className="room-kicker">{admin ? "SKYE’S LIBRARY" : "CHOOSE YOUR GAME"}</span><span className="library-status">{working ? "Connecting…" : failed ? "Unavailable" : admin && hasChanges ? "Unsaved changes" : current ? "Saved online" : "No saved games yet"}</span></div><div className="library-controls">
    <label className="library-picker"><span className="sr-only">Saved game</span><select value={selected} disabled={working || disabled || !games.length} onChange={event => { const game = games.find(g => g.id === event.target.value); if (game) load(game); }}><option value="" disabled>Select a saved game</option>{games.map(game => <option key={game.id} value={game.id}>{game.name}</option>)}</select></label>
    {admin ? <><label className="library-name"><span className="sr-only">Game name</span><input aria-label="Game name" maxLength={80} value={name} disabled={working || disabled} onChange={e => setName(e.target.value)} placeholder="Game name" /></label><button className="game-primary" disabled={working || disabled || failed || !hasChanges} onClick={() => persist(false)}>{working ? "Saving…" : "Save game"}</button><button className="game-secondary" disabled={working || disabled || failed} onClick={() => persist(true)}>Save as new</button></> : <Link href="/games/admin" className="game-link">Skye’s sign-in ↗</Link>}
    </div>
    {admin && <p className="field-help">Each saved game includes the board and the wheel.</p>}
    {admin && <div className="library-tools"><button className="game-link" disabled={working || disabled} onClick={() => {
      if (hasChanges && !window.confirm("Replace this draft with the earlier browser draft?")) return;
      try { const stored = localStorage.getItem("skye-playroom-v1"); const parsed = stored && readConfig(JSON.parse(stored)); if (!parsed) { setMessage("No earlier browser draft found."); return; } onLoad(parsed); setSelected(""); setName("Imported game"); setMessage("Browser draft imported. Select Save game to store it online."); } catch { setMessage("The browser draft could not be read."); }
    }}>Import browser draft</button>{current && <button className="game-link" disabled={working || disabled} onClick={async () => {
      if (hasChanges && !window.confirm("Discard this draft and reload the online version?")) return;
      setWorking(true);
      try { const response = await fetch("/api/games", { cache: "no-store", signal: AbortSignal.timeout(20000) }); if (!response.ok) throw new Error(); const data = await response.json(); setGames(data.games); const game = data.games.find((g: SavedGame) => g.id === selected); if (game) { setName(game.name); onLoad(game.config); setMessage("Latest online version loaded."); } } catch { setMessage("Unable to reload. Your draft is unchanged."); } finally { setWorking(false); }
    }}>Reload saved version</button>}<button className="game-link" disabled={working || disabled} onClick={async () => {
      if (hasChanges && !window.confirm("Leave without saving changes?")) return;
      setWorking(true);
      try { const response = await fetch("/api/admin/session", { method: "DELETE", signal: AbortSignal.timeout(20000) }); if (!response.ok) throw new Error(); window.location.assign("/games"); } catch { setMessage("Sign-out failed. Please try again."); setWorking(false); }
    }}>Sign out</button></div>}
    {message && <p className="save-note" role="status">{message}</p>}
  </section>;
}
