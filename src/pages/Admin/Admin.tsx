import { useAuth } from "../../hooks/useAuth";
import AdminDashboard from "../../components/Admin/AdminDashboard";
import AdminLogin from "../../components/Admin/AdminLogin";
import styles from "./Admin.module.css";

export default function Admin() {
  const {
    isAuthenticated,
    isAdmin,
    isLoading,
    logout,
    refreshAuth,
  } = useAuth();

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return <AdminLogin onLoginSuccess={refreshAuth} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}
