/**
 * Convierte enlaces compartidos de Google Drive en una URL que <img> puede
 * cargar. Los enlaces normales de imágenes se devuelven sin cambios.
 */
export function toImageUrl(value: string | null | undefined): string {
  const input = value?.trim() || '';
  if (!input) return '';

  try {
    const url = new URL(input);
    if (url.hostname !== 'drive.google.com' && url.hostname !== 'www.drive.google.com') {
      return input;
    }

    const fileMatch = url.pathname.match(/^\/file\/d\/([^/]+)/);
    const id = fileMatch?.[1] || url.searchParams.get('id');
    if (!id) return input;

    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1000`;
  } catch {
    return input;
  }
}
