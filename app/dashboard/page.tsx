"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { handleLogout } from "@/lib/actions/auth-actions";
import { getCurrentUser } from "@/lib/utils/auth-utils";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user data from cookies
    const userData = getCurrentUser();
    if (!userData) {
      router.push("/login");
    } else {
      setUser(userData);
    }
    setIsLoading(false);
  }, [router]);

  const onLogout = async () => {
    const result = await handleLogout();
    if (result.success) {
      router.push("/login");
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#eeeeee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#eeeeee",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header with Logout */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            marginBottom: "2rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div>
            <h1 style={{ color: "#003b3b", fontSize: "28px", margin: 0 }}>
              Welcome to Rentora Dashboard!
            </h1>
            {user && (
              <p style={{ color: "#666", marginTop: "0.5rem" }}>
                Logged in as: {user.name} ({user.email})
              </p>
            )}
          </div>
          <button
            onClick={onLogout}
            style={{
              backgroundColor: "#dc2626",
              color: "white",
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#b91c1c";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#dc2626";
            }}
          >
            Logout
          </button>
        </div>

        {/* Dashboard Content */}
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ color: "#003b3b", marginBottom: "1rem" }}>
            Dashboard Overview
          </h2>
          <p style={{ color: "#666" }}>
            Your rental management dashboard. More features coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}
