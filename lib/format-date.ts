/** Stały format daty (SSR + klient) — unika błędów hydracji. */
export function formatProfileDate(date: Date): string {
  return date.toLocaleString("pl-PL", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Europe/Warsaw",
  });
}
