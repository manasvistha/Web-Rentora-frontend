"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { handleLogout } from "@/lib/actions/auth-actions";
import { getCurrentUser, getImageUrl } from "@/lib/utils/auth-utils";
import { getProfile } from "@/lib/api/auth";
import Link from "next/link";

type DashboardUser = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  username?: string;
  role?: string;
  profilePicture?: string;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      const cookieUser = getCurrentUser();
      if (!cookieUser || cookieUser.role !== "admin") {
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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "3rem",
              height: "3rem",
              border: "3px solid #e2e8f0",
              borderTopColor: "#4f46e5",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const name = user?.name || user?.username || "Admin";
  const email = user?.email || "";
  const role = user?.role || "admin";
  const avatar =
    getImageUrl(user?.profilePicture) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff`;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* ── Header ── */}
      <header
        style={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #e2e8f0",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "4rem",
          }}
        >
          {/* Logo */}
          <Link
            href="/admin/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
            }}
          >
            <img
              src="/Logo.png"
              alt="Rentora"
              style={{ height: "2.5rem", width: "auto" }}
            />
            <span
              style={{ fontSize: "1.25rem", fontWeight: "700", color: "#4f46e5" }}
            >
              Rentora Admin
            </span>
          </Link>

          {/* Profile */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowProfileMenu((p) => !p)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.375rem 0.625rem 0.375rem 0.375rem",
                borderRadius: "9999px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#fff",
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#cbd5e1")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#e2e8f0")
              }
            >
              <img
                src={avatar}
                alt={name}
                crossOrigin="anonymous"
                style={{
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "9999px",
                  objectFit: "cover",
                }}
              />
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: "600",
                  color: "#334155",
                }}
              >
                {name.split(" ")[0]}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transition: "transform 0.15s",
                  transform: showProfileMenu ? "rotate(180deg)" : "none",
                }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {showProfileMenu && (
              <>
                <div
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 40,
                  }}
                  onClick={() => setShowProfileMenu(false)}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 0.5rem)",
                    width: "14rem",
                    backgroundColor: "#fff",
                    borderRadius: "0.75rem",
                    border: "1px solid #e2e8f0",
                    boxShadow:
                      "0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
                    zIndex: 50,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "0.875rem 1rem",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: "600",
                        fontSize: "0.875rem",
                        color: "#1e293b",
                      }}
                    >
                      {name}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        marginTop: "0.125rem",
                      }}
                    >
                      {email}
                    </p>
                    <div
                      style={{
                        marginTop: "0.5rem",
                        display: "inline-block",
                        padding: "0.25rem 0.5rem",
                        backgroundColor: "#4f46e5",
                        color: "#fff",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                        borderRadius: "0.25rem",
                        textTransform: "capitalize",
                      }}
                    >
                      {role}
                    </div>
                  </div>
                  <div style={{ padding: "0.375rem" }}>
                    <Link
                      href="/user/profile"
                      onClick={() => setShowProfileMenu(false)}
                      style={{
                        display: "block",
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.8125rem",
                        color: "#334155",
                        textDecoration: "none",
                        borderRadius: "0.375rem",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f1f5f9")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      👤 My Profile
                    </Link>
                    <Link
                      href="/admin/users"
                      onClick={() => setShowProfileMenu(false)}
                      style={{
                        display: "block",
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.8125rem",
                        color: "#334155",
                        textDecoration: "none",
                        borderRadius: "0.375rem",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f1f5f9")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      👥 Manage Users
                    </Link>
                    <button
                      onClick={onLogout}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.8125rem",
                        color: "#ef4444",
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: "0.375rem",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#fef2f2")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Navigation Bar ── */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "1rem 1.5rem 0",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "1rem",
            border: "1px solid #e2e8f0",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <Link
              href="/admin/dashboard"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                backgroundColor: "#4f46e5",
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: "600",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#4338ca")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#4f46e5")
              }
            >
              📊 Dashboard
            </Link>
            <Link
              href="/admin/users"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                color: "#64748b",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: "600",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
            >
              👥 Users
            </Link>
            <Link
              href="/admin/properties"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                color: "#64748b",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: "600",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
            >
              🏠 Properties
            </Link>
          </nav>
        </div>
      </div>

      {/* ── Page Content ── */}
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "1.5rem 1.5rem 4rem",
        }}
      >
        {error && (
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "0.75rem 1rem",
              backgroundColor: "#fefce8",
              border: "1px solid #fde68a",
              borderRadius: "0.75rem",
              color: "#854d0e",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* ── Welcome Banner ── */}
        <div
          style={{
            padding: "2rem 2.5rem",
            borderRadius: "1rem",
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            color: "#fff",
            marginBottom: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                marginBottom: "0.375rem",
              }}
            >
              Welcome back, {name.split(" ")[0]}! 👋
            </h1>
            <p style={{ opacity: 0.85, fontSize: "0.9375rem" }}>
              Manage your platform and oversee operations.
            </p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                padding: "1rem 1.5rem",
                borderRadius: "0.75rem",
                textAlign: "center",
                minWidth: "100px",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div style={{ fontSize: "1.75rem", fontWeight: "700" }}>
                1,234
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.85, marginTop: "0.125rem" }}>
                Total Users
              </div>
            </div>
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                padding: "1rem 1.5rem",
                borderRadius: "0.75rem",
                textAlign: "center",
                minWidth: "100px",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div style={{ fontSize: "1.75rem", fontWeight: "700" }}>
                567
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.85, marginTop: "0.125rem" }}>
                Properties
              </div>
            </div>
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                padding: "1rem 1.5rem",
                borderRadius: "0.75rem",
                textAlign: "center",
                minWidth: "100px",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div style={{ fontSize: "1.75rem", fontWeight: "700" }}>
                89
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.85, marginTop: "0.125rem" }}>
                Active
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <section style={{ marginBottom: "3rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#1e293b",
                }}
              >
                Quick Actions
              </h2>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "#64748b",
                  marginTop: "0.125rem",
                }}
              >
                Manage your platform efficiently
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.25rem",
            }}
          >
            <Link
              href="/admin/users"
              style={{
                backgroundColor: "#fff",
                borderRadius: "1rem",
                padding: "2rem",
                border: "1px solid #e2e8f0",
                textDecoration: "none",
                transition: "all 0.2s ease",
                display: "block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px -4px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                  }}
                >
                  👥
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      color: "#1e293b",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Manage Users
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                    View, edit, and manage user accounts
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/properties"
              style={{
                backgroundColor: "#fff",
                borderRadius: "1rem",
                padding: "2rem",
                border: "1px solid #e2e8f0",
                textDecoration: "none",
                transition: "all 0.2s ease",
                display: "block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px -4px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                  }}
                >
                  🏠
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      color: "#1e293b",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Manage Properties
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                    Oversee property listings and approvals
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/analytics"
              style={{
                backgroundColor: "#fff",
                borderRadius: "1rem",
                padding: "2rem",
                border: "1px solid #e2e8f0",
                textDecoration: "none",
                transition: "all 0.2s ease",
                display: "block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px -4px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "#f59e0b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                  }}
                >
                  📊
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      color: "#1e293b",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Analytics
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                    View platform statistics and insights
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ── Recent Activity ── */}
        <section>
          <div style={{ marginBottom: "1.25rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "#1e293b",
              }}
            >
              Recent Activity
            </h2>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "#64748b",
                marginTop: "0.125rem",
              }}
            >
              Latest updates and notifications
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "1rem",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 0",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "9999px",
                    backgroundColor: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                  }}
                >
                  👤
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.875rem", color: "#1e293b", fontWeight: "500" }}>
                    New user registered: John Doe
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#64748b" }}>2 minutes ago</p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 0",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "9999px",
                    backgroundColor: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                  }}
                >
                  🏠
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.875rem", color: "#1e293b", fontWeight: "500" }}>
                    New property listed: Downtown Apartment
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#64748b" }}>15 minutes ago</p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 0",
                }}
              >
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "9999px",
                    backgroundColor: "#f59e0b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                  }}
                >
                  ⚙️
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.875rem", color: "#1e293b", fontWeight: "500" }}>
                    System maintenance completed
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#64748b" }}>1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}