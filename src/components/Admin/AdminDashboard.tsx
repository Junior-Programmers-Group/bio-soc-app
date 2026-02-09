import { useState } from "react";
import ManagePlants from "./ManagePlants";
import ManageUsers from "./ManageUsers";
import Analytics from "./Analytics";
import styles from "./AdminDashboard.module.css";

type Tab = "overview" | "plants" | "users" | "analytics";

interface AdminDashboardProps {
  onLogout?: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div className={styles.dashboard}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <h2>Admin</h2>
        </div>
        
        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${activeTab === "overview" ? styles.active : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "plants" ? styles.active : ""}`}
            onClick={() => setActiveTab("plants")}
          >
            Plants
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "users" ? styles.active : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "analytics" ? styles.active : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>
        </nav>

        {onLogout && (
          <button className={styles.logoutBtn} onClick={onLogout}>
            Logout
          </button>
        )}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Admin Dashboard</h1>
        </div>

        <div className={styles.content}>
          {activeTab === "overview" && (
            <div className={styles.section}>
              <h2>Quick Actions</h2>
              <div className={styles.cardGrid}>
                <div className={styles.card}>
                  <h3>🌿 Manage Plants</h3>
                  <p>Add, edit, or remove plant records</p>
                  <button onClick={() => setActiveTab("plants")}>
                    Go to Plants
                  </button>
                </div>
                <div className={styles.card}>
                  <h3>👥 Manage Users</h3>
                  <p>View and manage user accounts</p>
                  <button onClick={() => setActiveTab("users")}>
                    Go to Users
                  </button>
                </div>
                <div className={styles.card}>
                  <h3>📊 Analytics</h3>
                  <p>View app statistics and reports</p>
                  <button onClick={() => setActiveTab("analytics")}>
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "plants" && <ManagePlants />}
          {activeTab === "users" && <ManageUsers />}
          {activeTab === "analytics" && <Analytics />}
        </div>
      </div>
    </div>
  );
}
