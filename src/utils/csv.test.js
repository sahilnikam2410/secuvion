import { describe, it, expect } from "vitest";
import { csvEscape, buildCsv } from "./csv.js";

describe("csvEscape", () => {
  it("returns simple values unquoted", () => {
    expect(csvEscape("hello")).toBe("hello");
    expect(csvEscape(42)).toBe("42");
    expect(csvEscape(true)).toBe("true");
  });

  it("returns empty string for null/undefined", () => {
    expect(csvEscape(null)).toBe("");
    expect(csvEscape(undefined)).toBe("");
  });

  it("quotes values containing commas", () => {
    expect(csvEscape("a,b")).toBe('"a,b"');
  });

  it("quotes and doubles embedded quotes", () => {
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
  });

  it("quotes values with newlines (LF and CRLF)", () => {
    expect(csvEscape("line1\nline2")).toBe('"line1\nline2"');
    expect(csvEscape("a\r\nb")).toBe('"a\r\nb"');
  });

  it("JSON-stringifies object values", () => {
    expect(csvEscape({ ip: "1.2.3.4", ok: true })).toBe('"{""ip"":""1.2.3.4"",""ok"":true}"');
  });
});

describe("buildCsv", () => {
  it("produces RFC-4180 output with CRLF separators", () => {
    const csv = buildCsv(["name", "age"], [{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }]);
    expect(csv).toBe("name,age\r\nAlice,30\r\nBob,25");
  });

  it("escapes header and body cells", () => {
    const csv = buildCsv(["a,b", "c"], [{ "a,b": 'has "quote"', c: "fine" }]);
    expect(csv).toBe('"a,b",c\r\n"has ""quote""",fine');
  });

  it("handles missing fields as empty strings", () => {
    const csv = buildCsv(["x", "y"], [{ x: 1 }]);
    expect(csv).toBe("x,y\r\n1,");
  });
});
