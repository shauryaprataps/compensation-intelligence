export function normalizeLocation(location: string): string {
  const raw = location.trim();
  if (!raw) return raw;

  const upper = raw.toUpperCase();

  // Alias normalization
  if (upper === "BANGALORE" || upper === "BENGALURU") return "Bengaluru";
  if (upper === "NYC" || upper === "NEW YORK") return "New York";
  if (upper === "SF" || upper === "SAN FRANCISCO") return "San Francisco";

  // Normalize common formatting variations
  const collapsed = raw.replace(/\s+/g, " ");
  return collapsed;
}

