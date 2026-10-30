import { beforeEach, describe, expect, it, vi } from "vitest";

const state = { me: "me", admins: 2, target: { id: "other", isAdmin: false } };
const updates: unknown[] = [];

vi.mock("../back-end/db", () => ({
  default: {
    authStore: { get record() { return { id: state.me }; } },
    collection: () => ({
      getList: vi.fn(async () => ({ totalItems: state.admins })),
      getOne: vi.fn(async () => state.target),
      update: vi.fn(async (_id: string, body: unknown) => { updates.push(body); return {}; }),
      delete: vi.fn(async () => undefined),
    }),
  },
}));

import { deleteUser, setUserAdmin } from "./userAdmin";

beforeEach(() => {
  state.admins = 2;
  state.target = { id: "other", isAdmin: false };
  updates.length = 0;
});

describe("setUserAdmin", () => {
  it("blocks changing your own access", async () => {
    await expect(setUserAdmin("me", false)).rejects.toThrow(/your own/);
    expect(updates).toHaveLength(0);
  });

  it("blocks removing the last admin", async () => {
    state.admins = 1;
    await expect(setUserAdmin("other", false)).rejects.toThrow(/only admin/);
  });

  it("grants and removes admin access otherwise", async () => {
    await setUserAdmin("other", true);
    await setUserAdmin("other", false);
    expect(updates).toEqual([{ isAdmin: true }, { isAdmin: false }]);
  });
});

describe("deleteUser", () => {
  it("blocks deleting yourself", async () => {
    await expect(deleteUser("me")).rejects.toThrow(/your own account/);
  });

  it("blocks deleting the last admin", async () => {
    state.admins = 1;
    state.target = { id: "other", isAdmin: true };
    await expect(deleteUser("other")).rejects.toThrow(/only admin/);
  });

  it("deletes an ordinary user", async () => {
    await expect(deleteUser("other")).resolves.toBeUndefined();
  });
});
