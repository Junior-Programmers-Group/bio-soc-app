import { useCallback, useEffect, useState } from "react";
import { getAnalyticsData, type AnalyticsData } from "../../../services/analytics";
import { errorMessage } from "../../../services/errors";
import styles from "./Analytics.module.css";

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleFetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setAnalytics(await getAnalyticsData());
    } catch (err) {
      setError(errorMessage(err, "Failed to fetch analytics"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleFetchAnalytics();
  }, [handleFetchAnalytics]);

  if (loading) return <div className={styles.loading}>Loading analytics...</div>;

  if (error)
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={handleFetchAnalytics} className={styles.refreshBtn}>
          Try again
        </button>
      </div>
    );

  return (
    <div className={styles.container}>
      <h2>Analytics Dashboard</h2>

      <div className={styles.statsGrid}>
        <div className={styles.stat}>
          <div className={styles.icon}></div>
          <div className={styles.content}>
            <p className={styles.label}>Total Plants</p>
            <p className={styles.value}>{analytics?.totalPlants || 0}</p>
          </div>
        </div>

        <div className={styles.stat}>
          <div className={styles.icon}></div>
          <div className={styles.content}>
            <p className={styles.label}>Total Users</p>
            <p className={styles.value}>{analytics?.totalUsers || 0}</p>
          </div>
        </div>

        <div className={styles.stat}>
          <div className={styles.icon}></div>
          <div className={styles.content}>
            <p className={styles.label}>Verified Users</p>
            <p className={styles.value}>{analytics?.verifiedUsers || 0}</p>
          </div>
        </div>

        <div className={styles.stat}>
          <div className={styles.icon}></div>
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

      <button onClick={handleFetchAnalytics} className={styles.refreshBtn}>
         Refresh
      </button>
    </div>
  );
}
