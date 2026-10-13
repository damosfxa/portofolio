/** Tanggal lokal (zona waktu perangkat) dalam format YYYY-MM-DD, opsional digeser beberapa hari. */
export function localDate(addDays = 0, from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + addDays);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
