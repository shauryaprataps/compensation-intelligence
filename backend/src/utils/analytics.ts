export function mean(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

export function percentile(values: number[], target: number) {
  if (!values.length) return 0;
  const belowOrEqual = values.filter((value) => value <= target).length;
  return Math.round((belowOrEqual / values.length) * 100);
}
