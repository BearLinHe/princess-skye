import type { Metadata } from "next";
import GameRoom from "./room";
import "./games.css";
import "./immersive.css";

export const metadata: Metadata = { title: "The Playroom | Princess Skye" };
export default function Games() { return <GameRoom />; }
