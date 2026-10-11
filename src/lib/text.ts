// Judul sertifikat di admin kadang ditulis kapital semua ("FULLSTACK INTENSIVE BOOTCAMP")
// atau memakai tanda pisah sebagai pemisah ("FRONTEND - REACT"). Dirapikan sebelum ditampilkan.
export function tidyTitle(title: string) {
  let text = title.trim().replace(/\s+[-–—]\s+/g, " · ");
  if (text === text.toUpperCase()) {
    text = text.toLowerCase().replace(/(^|[\s/(·])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());
  }
  return text;
}
