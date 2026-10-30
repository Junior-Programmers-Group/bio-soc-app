import { useState } from "react";
import { ClientResponseError } from "pocketbase";
import pb from "../../back-end/db";
import { errorMessage } from "../../services/errors";
import styles from "./AdminLogin.module.css";

const loginErrorMessage = (err: unknown): string => {
  if (err instanceof ClientResponseError && err.status === 400) {
    return "Incorrect email or password.";
  }
  return errorMessage(err, "Login failed. Please try again.");
};

// Logging in stores the session; useAdminSession (see App.tsx) then shows the dashboard.
export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);

      if (!authData.record.isAdmin) {
        pb.authStore.clear();
        setError("This account does not have admin access.");
      }
    } catch (err) {
      setError(loginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.logo}>
          <img src="/logo-biosoc.png" alt="BioSoc Logo" />
        </div>

        <h1 className={styles.title}>BioSoc Eco-Tagging</h1>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}