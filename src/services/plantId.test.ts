import { describe, expect, it } from "vitest";
import { parsePlantId } from "./plantId";

const ID = "4qj2xv035uo50ut";

describe("parsePlantId", () => {
  it("reads the id from a tag URL", () => {
    expect(parsePlantId(`https://flora.nddu.edu.ph/discover/plants/${ID}`)).toBe(ID);
  });

  it("ignores a query string or trailing slash after the id", () => {
    expect(parsePlantId(`https://x.test/discover/plants/${ID}?utm=1`)).toBe(ID);
    expect(parsePlantId(`https://x.test/discover/plants/${ID}/`)).toBe(ID);
  });

  it("accepts a bare id and surrounding spaces", () => {
    expect(parsePlantId(`  ${ID}  `)).toBe(ID);
  });

  it("rejects text that is not a Flora tag", () => {
    expect(parsePlantId("hello world")).toBeNull();
    expect(parsePlantId("https://example.com")).toBeNull();
    expect(parsePlantId("")).toBeNull();
  });

  it("rejects ids of the wrong length", () => {
    expect(parsePlantId("https://x.test/discover/plants/short")).toBeNull();
    expect(parsePlantId(`https://x.test/discover/plants/${ID}EXTRA`)).toBeNull();
  });

  it("never lets query syntax through", () => {
    expect(parsePlantId('qr_code="x" || true')).toBeNull();
  });
});
