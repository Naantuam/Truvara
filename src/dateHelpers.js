// Date-only values (an expense "occurred on" a calendar date, no meaningful
// time-of-day) are stored as UTC-midnight ISO strings. Reading them back with
// plain `new Date(iso).toLocaleDateString()`/local extraction re-interprets
// that UTC midnight in the viewer's own timezone -- anyone west of UTC sees
// the previous calendar day. Both helpers below stay in UTC throughout so
// the displayed/edited date always matches what was actually stored.

export function formatDateOnly(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString(undefined, { timeZone: "UTC" });
}

export function toDateInputValue(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toISOString().slice(0, 10);
}
