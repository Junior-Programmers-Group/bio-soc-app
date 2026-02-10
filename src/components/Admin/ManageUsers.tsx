import { useEffect, useState } from "react";
import { getUsers, updateUserRole, deleteUser } from "../../services/adminService";
import type { UserRecord } from "../../services/adminService";
import styles from "./ManageUsers.module.css";

export default function ManageUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setError("");
      await updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        setError("");
        await deleteUser(userId);
        fetchUsers();
      } catch (err: any) {
        setError(err.message || "Failed to delete user");
      }
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
              <th>Role</th>
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
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role || "user"}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className={styles.roleSelect}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                    </select>
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
                      onClick={() => handleDeleteUser(user.id)}
                      className={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
