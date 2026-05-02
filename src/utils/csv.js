/**
 * RFC-4180 CSV utilities.
 */

/**
 * Escape a single CSV cell value. Quotes the value if it contains a comma,
 * quote, CR, or LF; doubles any embedded quotes per RFC 4180.
 * Objects are JSON.stringify'd so any nested data still round-trips through CSV.
 */
export function csvEscape(v) {
  const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Build a CSV string from an array of header keys + an array of row objects.
 */
export function buildCsv(headers, rows) {
  const headerLine = headers.map(csvEscape).join(",");
  const bodyLines = rows.map((row) => headers.map((h) => csvEscape(row[h])).join(","));
  return [headerLine, ...bodyLines].join("\r\n");
}
