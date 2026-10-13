/** Nomor Indonesia ke format wa.me (62...). */
export function waNumber(phone: string | null) {
  if (!phone) return null;
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  return d.length >= 9 ? d : null;
}

export const waLink = (phone: string | null, text: string) => {
  const n = waNumber(phone);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
};
