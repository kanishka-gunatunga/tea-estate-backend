export function buildMapsLink(location: string, mapsLink?: string | null): string | null {
  if (mapsLink?.trim()) {
    return mapsLink.trim();
  }

  if (!location.trim()) {
    return null;
  }

  return `https://maps.google.com/?q=${encodeURIComponent(location.trim())}`;
}
