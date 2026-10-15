import { useCallback, useEffect, useState } from "react";
import pb from "../../../back-end/db";
import { getUsers, setUserAdmin, deleteUser } from "../../../services/userAdmin";
import type { UserRecord } from "../../../services/userAdmin";
import { errorMessage } from "../../../services/errors";
import styles from "./ManageUsers.module.css";

export default function ManageUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentUserId = pb.authStore.record?.id;

  const loadUsers = useCallback(async () => {
    try {
      setError("");
      setUsers(await getUsers());
    } catch (err) {
      setError(errorMessage(err, "Failed to fetch users"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAdminToggle = async (user: UserRecord) => {
    const makeAdmin = !user.isAdmin;
    const question = makeAdmin
      ? `Give ${user.email || "this user"} admin access? They will be able to add, edit and delete plants and manage users.`
      : `Remove admin access from ${user.email || "this user"}?`;
    if (!confirm(question)) return;

    try {
      setError("");
      await setUserAdmin(user.id, makeAdmin);
      await loadUsers();
    } catch (err) {
      setError(errorMessage(err, "Failed to update admin access"));
    }
  };

  const handleDeleteUser = async (user: UserRecord) => {
    if (!confirm(`Delete ${user.email || "this user"}? This cannot be undone.`)) return;

    try {
      setError("");
      await deleteUser(user.id);
      await loadUsers();
    } catch (err) {
      setError(errorMessage(err, "Failed to delete user"));
    }
  };

  if (loading) return <div className={styles.loading}>Loading users...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Users</h2>
        <span className={styles.count}>{users.length} Total Users</span>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Admin access</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.noData}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isYou = user.id === currentUserId;
                return (
                  <tr key={user.id}>
                    <td>
                      {user.email || <em>hidden</em>}
                      {isYou && " (you)"}
                    </td>
                    <td>
                      <button
                        onClick={() => handleAdminToggle(user)}
                        className={styles.roleSelect}
                        disabled={isYou}
                        title={isYou ? "You can't change your own admin access" : undefined}
                      >
                        {user.isAdmin ? "Admin - remove" : "User - make admin"}
                      </button>
                    </td>
                    <td>
                      <span
                        className={
                          user.verified ? styles.verified : styles.unverified
                        }
                      >
                        {user.verified ? "✓ Yes" : "✗ No"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className={styles.deleteBtn}
                        disabled={isYou}
                        title={isYou ? "You can't delete your own account" : undefined}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
