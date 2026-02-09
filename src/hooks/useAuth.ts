import { useState, useEffect } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://localhost:8090");

interface User {
  id: string;
  email: string;
  role?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for demo mode first
    const demoMode = localStorage.getItem("adminDemoMode");
    if (demoMode === "true") {
      setUser({
        id: "demo-user",
        email: localStorage.getItem("adminEmail") || "demo@admin.local",
        role: localStorage.getItem("adminRole") || "admin",
      });
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    // Check if user is authenticated with PocketBase
    const authToken = pb.authStore.token;
    if (authToken && pb.authStore.model) {
      setUser({
        id: pb.authStore.model.id,
        email: pb.authStore.model.email,
        role: pb.authStore.model.role || "user",
      });
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const isAdmin = user?.role === "admin";

  const logout = () => {
    // Clear demo mode
    localStorage.removeItem("adminDemoMode");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminRole");
    
    // Clear PocketBase auth
    pb.authStore.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshAuth = () => {
    // Check demo mode
    const demoMode = localStorage.getItem("adminDemoMode");
    if (demoMode === "true") {
      setUser({
        id: "demo-user",
        email: localStorage.getItem("adminEmail") || "demo@admin.local",
        role: localStorage.getItem("adminRole") || "admin",
      });
      setIsAuthenticated(true);
      return;
    }

    // Refresh from PocketBase
    if (pb.authStore.model) {
      setUser({
        id: pb.authStore.model.id,
        email: pb.authStore.model.email,
        role: pb.authStore.model.role || "user",
      });
      setIsAuthenticated(true);
    }
  };

  return { user, isAuthenticated, isAdmin, isLoading, logout, refreshAuth };
}
