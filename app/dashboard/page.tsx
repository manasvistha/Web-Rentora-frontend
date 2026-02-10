"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { handleLogout } from "@/lib/actions/auth-actions";
import { getCurrentUser, getImageUrl } from "@/lib/utils/auth-utils";
import { getProfile } from "@/lib/api/auth";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

type DashboardUser = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  username?: string;
  role?: string;
  profilePicture?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const fallbackAvatar = useMemo(() => {
    if (!user?.name) return "";
    const initials = user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=4f46e5&color=fff&size=128`;
  }, [user?.name]);

  useEffect(() => {
    const hydrate = async () => {
      const cookieUser = getCurrentUser();
      if (!cookieUser) {
        router.push("/login");
        return;
      }

      try {
        const profileRes = await getProfile();
        const payload = profileRes?.data || profileRes?.user || profileRes;
        setUser(payload || cookieUser);
      } catch (err: any) {
        setError(err?.message || "Failed to load user");
        setUser(cookieUser);
      } finally {
        setIsLoading(false);
      }
    };

    void hydrate();
  }, [router]);



  const onLogout = async () => {
    setShowProfileMenu(false);
    const result = await handleLogout();
    if (result.success) {
      router.push("/login");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const name = user?.name || user?.username || "User";
  const email = user?.email || "";
  const role = user?.role || "user";
  const avatar = getImageUrl(user?.profilePicture) || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff`;
  const isAdmin = role === "admin";

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: "250px" }}>
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#0f172a",
            color: "#e2e8f0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <header
            style={{
              backgroundColor: "#1e293b",
              borderBottom: "1px solid #475569",
              padding: "1rem 1.5rem",
              position: "sticky",
              top: 0,
              zIndex: 40,
            }}
          >
            <div
              style={{
                maxWidth: "80rem",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    backgroundColor: "#4f46e5",
                    borderRadius: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                  }}
                >
                  🏢
                </div>
                <h1 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Rentora</h1>
              </div>

              {/* Profile Dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    color: "inherit",
                    fontSize: "0.875rem",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#334155")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <img
                    src={avatar}
                    alt={name}
                    crossOrigin="anonymous"
                    style={{
                      width: "2.25rem",
                      height: "2.25rem",
                      borderRadius: "9999px",
                      border: "2px solid #4f46e5",
                    }}
                  />
                  <span style={{ display: "none", fontWeight: "500" }}>
                    {name}
                  </span>
                  <svg
                    style={{
                      width: "1rem",
                      height: "1rem",
                      color: "#94a3b8",
                      transition: "transform 0.2s",
                      transform: showProfileMenu ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showProfileMenu && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      marginTop: "0.5rem",
                      width: "14rem",
                      backgroundColor: "#334155",
                      borderRadius: "0.5rem",
                      border: "1px solid #475569",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
                      zIndex: 50,
                    }}
                  >
                    <div
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid #475569",
                      }}
                    >
                      <p style={{ fontWeight: "500" }}>{name}</p>
                      <p style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
                        {email}
                      </p>
                      <div
                        style={{
                          marginTop: "0.5rem",
                          display: "inline-block",
                          padding: "0.25rem 0.5rem",
                          backgroundColor: "rgba(79, 70, 229, 0.3)",
                          color: "#a5d6ff",
                          fontSize: "0.75rem",
                          fontWeight: "500",
                          borderRadius: "0.25rem",
                          textTransform: "capitalize",
                        }}
                      >
                        {role}
                      </div>
                    </div>
                    <div style={{ padding: "0.5rem 0" }}>
                      <Link
                        href="/user/profile"
                        onClick={() => setShowProfileMenu(false)}
                        style={{
                          display: "block",
                          padding: "0.5rem 1rem",
                          fontSize: "0.875rem",
                          color: "inherit",
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#475569")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        👤 My Profile
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin/users"
                          onClick={() => setShowProfileMenu(false)}
                          style={{
                            display: "block",
                            padding: "0.5rem 1rem",
                            fontSize: "0.875rem",
                            color: "inherit",
                            textDecoration: "none",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#475569")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "transparent")
                          }
                        >
                          👥 Manage Users
                        </Link>
                      )}
                      <button
                        onClick={onLogout}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "0.5rem 1rem",
                          fontSize: "0.875rem",
                          color: "#f87171",
                          backgroundColor: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#475569")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main
            style={{
              flex: 1,
              maxWidth: "80rem",
              margin: "0 auto",
              padding: "3rem 1.5rem",
              width: "100%",
            }}
          >
            {error && (
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  backgroundColor: "rgba(217, 119, 6, 0.2)",
                  border: "1px solid rgba(217, 119, 6, 0.5)",
                  borderRadius: "0.5rem",
                  color: "#fed7aa",
                  fontSize: "0.875rem",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {isAdmin ? (
              /* Admin Dashboard */
              <div>
                <div style={{ marginBottom: "2rem" }}>
                  <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                    Welcome back, {name.split(" ")[0]}!
                  </h2>
                  <p style={{ color: "#94a3b8" }}>Admin Dashboard</p>
                </div>

                {/* Stats Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1.5rem",
                    marginBottom: "2rem",
                  }}
                >
                  {[
                    { emoji: "👥", label: "Total Users", value: "—" },
                    { emoji: "📊", label: "Sessions", value: "—" },
                    { emoji: "✅", label: "Status", value: "Active", color: "#4ade80" },
                    { emoji: "🕐", label: "Last Updated", value: "Just now" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: "rgba(30, 41, 59, 0.6)",
                        border: "1px solid #475569",
                        borderRadius: "0.5rem",
                        padding: "1.5rem",
                        transition: "border-color 0.2s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = "#334155")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = "#475569")
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "1rem",
                        }}
                      >
                        <span style={{ fontSize: "1.875rem" }}>{stat.emoji}</span>
                        <span style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
                          {stat.label}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "1.875rem",
                          fontWeight: "bold",
                          color: stat.color || "#ffffff",
                        }}
                      >
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div
                  style={{
                    backgroundColor: "rgba(30, 41, 59, 0.6)",
                    border: "1px solid #475569",
                    borderRadius: "0.5rem",
                    padding: "1.5rem",
                  }}
                >
                  <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
                    Quick Actions
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    <Link
                      href="/admin/users"
                      style={{
                        padding: "0.75rem 1rem",
                        backgroundColor: "#4f46e5",
                        color: "white",
                        borderRadius: "0.5rem",
                        textDecoration: "none",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#4338ca")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#4f46e5")
                      }
                    >
                      <span>👥</span> View Users
                    </Link>
                    <Link
                      href="/admin/users/create"
                      style={{
                        padding: "0.75rem 1rem",
                        backgroundColor: "#a855f7",
                        color: "white",
                        borderRadius: "0.5rem",
                        textDecoration: "none",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#9333ea")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#a855f7")
                      }
                    >
                      <span>➕</span> Create User
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* User Dashboard */
              <div>
                <div style={{ marginBottom: "2rem" }}>
                  <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                    Welcome back, {name.split(" ")[0]}!
                  </h2>
                  <p style={{ color: "#94a3b8" }}>Your personal dashboard</p>
                </div>

                {/* Empty for now - just navigation */}
                <div
                  style={{
                    backgroundColor: "rgba(30, 41, 59, 0.6)",
                    border: "1px solid #475569",
                    borderRadius: "0.5rem",
                    padding: "2rem",
                    textAlign: "center",
                  }}
                >
                  <p style={{ color: "#94a3b8", fontSize: "1.125rem" }}>
                    Dashboard content coming soon...
                  </p>
                </div>
              </div>
            )}
          </main>

          {/* Footer */}
          <footer
            style={{
              maxWidth: "80rem",
              margin: "0 auto",
              padding: "1.5rem",
              marginTop: "3rem",
              textAlign: "center",
              fontSize: "0.875rem",
              color: "#64748b",
              borderTop: "1px solid #475569",
              width: "100%",
            }}
          >
            <p>© 2026 RentHub. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}