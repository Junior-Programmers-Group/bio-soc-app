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
      
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <h2>
            <img className={styles.logo} src="/Logo.png" alt="BioSoc Logo" />
            BioSoc Admin
          </h2>
        </div>

        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${activeTab === "overview" ? styles.active : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <i className="bi bi-speedometer2"></i>
            Overview
          </button>

          <button
            className={`${styles.navItem} ${activeTab === "plants" ? styles.active : ""}`}
            onClick={() => setActiveTab("plants")}
          >
            <i className="bi bi-tree"></i>
            Plants
          </button>

          <button
            className={`${styles.navItem} ${activeTab === "users" ? styles.active : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <i className="bi bi-people"></i>
            Users
          </button>

          <button
            className={`${styles.navItem} ${activeTab === "analytics" ? styles.active : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <i className="bi bi-bar-chart-line"></i>
            Analytics
          </button>
        </nav>

        {onLogout && (
          <button className={styles.logoutBtn} onClick={onLogout}>
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>
        )}
      </aside>


      {/* MAIN */}
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Admin Dashboard</h1>
        </div>

        <div className={styles.content}>
          
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className={styles.section}>
              <h2>Quick Actions</h2>

              <div className={styles.cardGrid}>

                <div className={styles.card}>
                  <h3>
                    <i className="bi bi-tree"></i>
                    Manage Plants
                  </h3>
                  <p>Add, edit, or remove plant records</p>
                  <button onClick={() => setActiveTab("plants")}>
                    Go to Plants
                  </button>
                </div>

                <div className={styles.card}>
                  <h3>
                    <i className="bi bi-people"></i>
                    Manage Users
                  </h3>
                  <p>View and manage user accounts</p>
                  <button onClick={() => setActiveTab("users")}>
                    Go to Users
                  </button>
                </div>

                <div className={styles.card}>
                  <h3>
                    <i className="bi bi-bar-chart"></i>
                    Analytics
                  </h3>
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
      </main>

    </div>
  );
}
