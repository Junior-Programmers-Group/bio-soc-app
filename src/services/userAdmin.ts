import pb from "../back-end/db";
import type { RecordModel } from "pocketbase";

export interface UserRecord extends RecordModel {
  email: string;
  verified: boolean;
  /** The one flag that grants admin access (login screen and server rules both use it). */
  isAdmin?: boolean;
}

const countAdmins = async (): Promise<number> => {
  const result = await pb.collection("users").getList(1, 1, {
    filter: "isAdmin = true",
    fields: "id",
    requestKey: null,
  });
  return result.totalItems;
};

/** Every user, A to Z. Throws if the list cannot be loaded. */
export async function getUsers(): Promise<UserRecord[]> {
  return pb.collection("users").getFullList<UserRecord>({ sort: "email", requestKey: null });
}

/** Give or take away admin access. You cannot change your own, or remove the last admin. */
export async function setUserAdmin(userId: string, makeAdmin: boolean): Promise<UserRecord> {
  if (userId === pb.authStore.record?.id) {
    throw new Error("You can't change your own admin access. Ask another admin to do it.");
  }
  if (!makeAdmin && (await countAdmins()) <= 1) {
    throw new Error("This is the only admin. Make someone else an admin first.");
  }
  return pb.collection("users").update<UserRecord>(userId, { isAdmin: makeAdmin });
}

/** Delete a user. You cannot delete yourself or the last admin. */
export async function deleteUser(userId: string): Promise<void> {
  if (userId === pb.authStore.record?.id) {
    throw new Error("You can't delete your own account.");
  }
  const target = await pb.collection("users").getOne<UserRecord>(userId, { requestKey: null });
  if (target.isAdmin && (await countAdmins()) <= 1) {
    throw new Error("This is the only admin and can't be deleted.");
  }
  await pb.collection("users").delete(userId);
}

/** Create an account. Allowed for admins by the `users` create rule on the server. */
export async function createUser(input: { email: string; name?: string; password: string }): Promise<UserRecord> {
  return pb.collection("users").create<UserRecord>({
    email: input.email.trim(),
    name: (input.name ?? "").trim(),
    password: input.password,
    passwordConfirm: input.password,
    emailVisibility: true,
  });
}
