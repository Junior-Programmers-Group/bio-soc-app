import { useEffect, useState } from "react";
import { getAnalyticsData } from "../../../services/adminService";
import styles from "./Analytics.module.css";

interface AnalyticsData {
  totalPlants: number;
  totalUsers: number;
  verifiedUsers: number;
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAnalyticsData();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading analytics...</div>;

  if (error)
    return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h2>Analytics Dashboard</h2>

      <div className={styles.statsGrid}>
        <div className={styles.stat}>
          <div className={styles.icon}>🌿</div>
          <div className={styles.content}>
            <p className={styles.label}>Total Plants</p>
            <p className={styles.value}>{analytics?.totalPlants || 0}</p>
          </div>
        </div>

        <div className={styles.stat}>
          <div className={styles.icon}>👥</div>
          <div className={styles.content}>
            <p className={styles.label}>Total Users</p>
            <p className={styles.value}>{analytics?.totalUsers || 0}</p>
          </div>
        </div>

        <div className={styles.stat}>
          <div className={styles.icon}>✓</div>
          <div className={styles.content}>
            <p className={styles.label}>Verified Users</p>
            <p className={styles.value}>{analytics?.verifiedUsers || 0}</p>
          </div>
        </div>

        <div className={styles.stat}>
          <div className={styles.icon}>📊</div>
          <div className={styles.content}>
            <p className={styles.label}>Engagement Rate</p>
            <p className={styles.value}>
              {analytics?.totalUsers
                ? (
                    ((analytics.verifiedUsers || 0) / analytics.totalUsers) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      <button onClick={fetchAnalytics} className={styles.refreshBtn}>
        🔄 Refresh
      </button>
    </div>
  );
}
