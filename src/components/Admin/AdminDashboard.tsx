import { useState } from "react";
import ManagePlants from "./plant-management/ManagePlants";
import ManageUsers from "./user-management/ManageUsers";
import Analytics from "./analytics/Analytics";
import styles from "./AdminDashboard.module.css";
import Taxonomy from "./taxonomy/Taxonomy";

type Tab = "overview" | "plants" | "users" | "analytics" | "taxonomy";

interface AdminDashboardProps {
  onLogout?: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  return (
    <div className={styles.dashboard}>
      {/* SIDEBAR */}
      <aside className={`${styles.sidebar} ${menuOpen ? styles.open : ""}`}>
        <div className={styles.sidebarBrand}>
          <h2>
            <img className={styles.logo} src="/Logo.png" alt="BioSoc Logo" />
            BioSoc Admin
          </h2>
        </div>

        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${activeTab === "overview" ? styles.active : ""}`}
            onClick={() => { setActiveTab("overview"); handleNavClick(); }}
          >
            <i className="bi bi-speedometer2"></i>
            Overview
          </button>

          <button
            className={`${styles.navItem} ${activeTab === "plants" ? styles.active : ""}`}
            onClick={() => { setActiveTab("plants"); handleNavClick(); }}
          >
            <i className="bi bi-tree"></i>
            Plants
          </button>

          <button
            className={`${styles.navItem} ${activeTab === "users" ? styles.active : ""}`}
            onClick={() => { setActiveTab("users"); handleNavClick(); }}
          >
            <i className="bi bi-people"></i>
            Users
          </button>

          <button
            className={`${styles.navItem} ${activeTab === "analytics" ? styles.active : ""}`}
            onClick={() => { setActiveTab("analytics"); handleNavClick(); }}
          >
            <i className="bi bi-bar-chart-line"></i>
            Analytics
          </button>

          <button
            className={`${styles.navItem} ${activeTab === "taxonomy" ? styles.active : ""}`}
            onClick={() => { setActiveTab("taxonomy"); handleNavClick(); }}
          >
            <i className="bi bi-tags"></i>
            Taxonomy
          </button>
        </nav>

        {onLogout && (
          <button className={styles.logoutBtn} onClick={() => { onLogout(); handleNavClick(); }}>
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>
        )}
      </aside>


      {/* MAIN */}
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Admin Dashboard</h1>
          {/* HAMBURGER MENU BUTTON */}
          <button 
            className={`${styles.hamburger} ${menuOpen ? styles.active : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>
        </div>

        {/* MOBILE NAV DROPDOWN */}
        <nav className={`${styles.nav} ${menuOpen ? styles.open : ""}`}>
          <button
            className={`${styles.navItem} ${activeTab === "overview" ? styles.active : ""}`}
            onClick={() => { setActiveTab("overview"); handleNavClick(); }}
          >
            <i className="bi bi-speedometer2"></i>
            Overview
          </button>

          <button
            className={`${styles.navItem} ${activeTab === "plants" ? styles.active : ""}`}
            onClick={() => { setActiveTab("plants"); handleNavClick(); }}
          >
            <i className="bi bi-tree"></i>
            Plants
          </button>

          <button
            className={`${styles.navItem} ${activeTab === "users" ? styles.active : ""}`}
            onClick={() => { setActiveTab("users"); handleNavClick(); }}
          >
            <i className="bi bi-people"></i>
            Users
          </button>

          <button
            className={`${styles.navItem} ${activeTab === "analytics" ? styles.active : ""}`}
            onClick={() => { setActiveTab("analytics"); handleNavClick(); }}
          >
            <i className="bi bi-bar-chart-line"></i>
            Analytics
          </button>

          <button
            className={`${styles.navItem} ${activeTab === "taxonomy" ? styles.active : ""}`}
            onClick={() => { setActiveTab("taxonomy"); handleNavClick(); }}
          >
            <i className="bi bi-tags"></i>
            Taxonomy
          </button>

          {onLogout && (
            <button className={styles.navItem} onClick={() => { onLogout(); handleNavClick(); }}>
              <i className="bi bi-box-arrow-right"></i>
              Logout
            </button>
          )}
        </nav>

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
                <div className={styles.card}>
                  <h3>
                    <i className="bi bi-tag"></i>
                    Taxonomy
                  </h3>
                  <p>Add and Modify Taxonomy</p>
                  <button onClick={() => setActiveTab("taxonomy")}>
                    Taxonomy
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "plants" && <ManagePlants />}
          {activeTab === "users" && <ManageUsers />}
          {activeTab === "analytics" && <Analytics />}
          {activeTab === "taxonomy" && <Taxonomy />}
        </div>
      </main>

    </div>
  );
}
