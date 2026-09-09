export type Space = { title: string; content: string };
export const SPACE_COUNT = 25;
export const defaultSpaces: Space[] = Array.from({ length: SPACE_COUNT }, (_, i) => ({
  title: i === 0 ? "Start" : i === SPACE_COUNT - 1 ? "Finish" : `Space ${String(i).padStart(2, "0")}`,
  content: i === 0 ? "Roll the dice to begin." : i === SPACE_COUNT - 1 ? "You made it. Well played." : "Add your own instruction here.",
}));
export type Choice = { label: string; weight: number };
export const defaultOptions: Choice[] = [1, 2, 3, 4, 2, 3, 1, 4].map((weight, i) => ({ label: `Your choice ${i + 1}`, weight }));
export function boardCoordinates(index: number) {
  const row = Math.floor(index / 5);
  return { row: 4 - row, col: row % 2 === 0 ? index % 5 : 4 - index % 5 };
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
