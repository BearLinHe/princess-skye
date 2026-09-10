export type Space = { title: string; content: string };
export const SPACE_COUNT = 25;
export const defaultSpaces: Space[] = Array.from({ length: SPACE_COUNT }, (_, i) => ({
  title: i === 0 ? "Start" : i === SPACE_COUNT - 1 ? "Finish" : `Space ${String(i).padStart(2, "0")}`,
  content: i === 0 ? "Roll the dice to begin." : i === SPACE_COUNT - 1 ? "You made it. Well played." : "Add your own instruction here.",
}));
export type Choice = { label: string; weight: number };
export const defaultOptions: Choice[] = [1, 2, 3, 4, 2, 3, 1, 4].map((weight, i) => ({ label: `Your choice ${i + 1}`, weight }));
export const BOARD_COLUMNS = 9;
export const BOARD_ROWS = 5;
export const MOBILE_BOARD_COLUMNS = 5;
export const MOBILE_BOARD_ROWS = 7;
// 25 existing spaces keep their IDs and saved content along an inward-turning trail.
const trail: [number, number][] = [
  [4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6],[4,7],[4,8],
  [3,8],[2,8],[1,8],[0,8],
  [0,7],[0,6],[0,5],[0,4],[0,3],[0,2],[0,1],[0,0],
  [1,0],[2,0],[2,1],[2,2],
];
const mobileTrail: [number, number][] = [
  [6,0],[6,1],[6,2],[6,3],[6,4],
  [5,4],[4,4],[3,4],[2,4],[1,4],[0,4],
  [0,3],[0,2],[0,1],[0,0],
  [1,0],[2,0],[3,0],[4,0],
  [4,1],[4,2],[4,3],[3,3],[2,3],[2,2],
];
export function boardCoordinates(index: number, mobile = false) {
  const [row, col] = (mobile ? mobileTrail : trail)[index];
  return { row, col };
}
export function boardDirection(index: number, mobile = false) {
  if (index === SPACE_COUNT - 1) return "✧";
  const here = boardCoordinates(index, mobile), next = boardCoordinates(index + 1, mobile);
  return next.col > here.col ? "→" : next.col < here.col ? "←" : next.row > here.row ? "↓" : "↑";
}
export function puppyFacesRight(index: number, mobile = false) {
  for (let i = Math.min(index, SPACE_COUNT - 2); i >= 0; i--) {
    const direction = boardDirection(i, mobile);
    if (direction === "→" || direction === "←") return direction === "→";
  }
  return true;
}
export function destination(position: number, dice: number) { return Math.min(SPACE_COUNT - 1, position + dice); }
export function sectors(options: Choice[]) {
  const total = options.reduce((sum, option) => sum + option.weight, 0);
  let start = 0;
  return options.map(option => { const sweep = option.weight / total * 360; const sector = { start, end: start + sweep, center: start + sweep / 2, percent: option.weight / total * 100 }; start += sweep; return sector; });
}
export function chooseWeighted(options: Choice[], random: number) {
  const target = random * options.reduce((sum, option) => sum + option.weight, 0);
  let sum = 0;
  for (let i = 0; i < options.length; i++) { sum += options[i].weight; if (target < sum) return i; }
  return options.length - 1;
}
export function wheelRotation(previous: number, center: number) {
  return previous + 1800 + ((360 - center - previous % 360 + 360) % 360);
}
export function readConfig(value: unknown): { spaces: Space[]; options: Choice[] } | null {
  if (!value || typeof value !== "object") return null;
  const { spaces, options } = value as { spaces?: unknown; options?: unknown };
  if (!Array.isArray(spaces) || spaces.length !== SPACE_COUNT || !spaces.every(s => s && typeof s.title === "string" && s.title.trim() && s.title.length <= 28 && typeof s.content === "string" && s.content.trim() && s.content.length <= 400)) return null;
  if (!Array.isArray(options) || options.length < 2 || options.length > 12 || !options.every(s => s && typeof s.label === "string" && s.label.trim() && s.label.length <= 48 && Number.isInteger(s.weight) && s.weight >= 1 && s.weight <= 100)) return null;
  return { spaces, options };
}
