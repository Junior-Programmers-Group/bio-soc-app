import { describe, expect, it } from "vitest";
import { ClientResponseError } from "pocketbase";
import { errorMessage, isNotFound } from "./errors";

const serverError = (status: number, data: object = {}) =>
  new ClientResponseError({ status, data: { message: "raw server text", data } });

describe("errorMessage", () => {
  it("explains an unreachable server", () => {
    expect(errorMessage(serverError(0))).toMatch(/can't reach the server/i);
  });

  it("explains permission and session problems", () => {
    expect(errorMessage(serverError(401))).toMatch(/log in again/i);
    expect(errorMessage(serverError(403))).toMatch(/permission/i);
  });

  it("lists the fields the server rejected", () => {
    const err = serverError(400, { commonName: { message: "Cannot be blank." } });
    expect(errorMessage(err)).toBe("commonName: Cannot be blank.");
  });

  it("keeps the message of our own errors", () => {
    expect(errorMessage(new Error("This is the only admin."))).toBe("This is the only admin.");
  });

  it("falls back for unknown values", () => {
    expect(errorMessage("boom", "fallback text")).toBe("fallback text");
  });
});

describe("isNotFound", () => {
  it("is true only for a 404 from the server", () => {
    expect(isNotFound(serverError(404))).toBe(true);
    expect(isNotFound(serverError(500))).toBe(false);
    expect(isNotFound(new Error("404"))).toBe(false);
  });
});
