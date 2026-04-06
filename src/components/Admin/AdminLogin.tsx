import { useState } from "react";
import pb from "../../back-end/db";
import styles from "./AdminLogin.module.css";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
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

      // ✅ Check admin flag from your PocketBase schema
      if (!authData.record.isAdmin) {
        setError("You do not have admin privileges.");
        pb.authStore.clear();
        setLoading(false);
        return;
      }

      // ✅ Login successful
      setLoading(false);
      onLoginSuccess();

    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.logo}>
          <img src="/Logo.png" alt="BioSoc Logo" />
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