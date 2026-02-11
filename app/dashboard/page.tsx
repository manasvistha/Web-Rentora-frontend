"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { handleLogout } from "@/lib/actions/auth-actions";
import {
  getCurrentUser,
  getImageUrl,
  getPropertyImageUrl,
} from "@/lib/utils/auth-utils";
import { getProfile } from "@/lib/api/auth";
import { getMyProperties, getProperties, Property } from "@/lib/api/property";
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
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);

  useEffect(() => {
    const hydrate = async () => {
      const cookieUser = getCurrentUser();
      if (!cookieUser) {
        router.push("/login");
        return;
      }
      if (cookieUser.role === "admin") {
        router.push("/admin/dashboard");
        return;
      }
      try {
        const profileRes = await getProfile();
        const payload = profileRes?.data || profileRes?.user || profileRes;
        setUser(payload || cookieUser);
        const [myProps, allProps] = await Promise.all([
          getMyProperties(),
          getProperties(),
        ]);
        setMyProperties(myProps?.data || myProps || []);
        setAllProperties(allProps?.data || allProps || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load data");
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
    if (result.success) router.push("/login");
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

  const name = user?.name || user?.username || "User";
  const email = user?.email || "";
  const role = user?.role || "user";
  const avatar =
    getImageUrl(user?.profilePicture) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff`;

  const PropertyCard = ({
    property,
    showStatus,
    onClick,
  }: {
    property: Property;
    showStatus?: boolean;
    onClick?: () => void;
  }) => {
    const imgUrl = property.images?.length
      ? getPropertyImageUrl(property.images[0])
      : null;

    return (
      <div
        onClick={onClick}
        style={{
          backgroundColor: "#fff",
          borderRadius: "1rem",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          transition: "all 0.2s ease",
          cursor: onClick ? "pointer" : "default",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow =
            "0 12px 24px -4px rgba(0,0,0,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Image */}
        <div
          style={{
            height: "180px",
            backgroundColor: "#f1f5f9",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={property.title}
              crossOrigin="anonymous"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                e.currentTarget.parentElement!.innerHTML =
                  '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;background:#f1f5f9">🏠</div>';
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
              }}
            >
              🏠
            </div>
          )}
          {showStatus && (
            <span
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "#fff",
                backgroundColor:
                  property.status === "available" ? "#10b981" : "#f59e0b",
                textTransform: "capitalize",
              }}
            >
              {property.status}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "1rem 1.25rem" }}>
          <h4
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#1e293b",
              marginBottom: "0.375rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {property.title}
          </h4>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.8125rem",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              marginBottom: "0.75rem",
            }}
          >
            📍 {property.location}
          </p>
          <div
            style={{
              borderTop: "1px solid #f1f5f9",
              paddingTop: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.6875rem",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Monthly
              </span>
              <div
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#4f46e5",
                }}
              >
                ${property.price.toLocaleString()}
              </div>
            </div>
            {onClick && (
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "#4f46e5",
                  fontWeight: "500",
                }}
              >
                View →
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

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
            href="/dashboard"
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
              Rentora
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
        <Sidebar />
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
              Manage your rentals and discover new places to call home.
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
                {myProperties.length}
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.85, marginTop: "0.125rem" }}>
                My Listings
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
                {allProperties.length}
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.85, marginTop: "0.125rem" }}>
                Available
              </div>
            </div>
          </div>
        </div>

        {/* ── My Properties ── */}
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
                My Properties
              </h2>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "#64748b",
                  marginTop: "0.125rem",
                }}
              >
                Properties you&apos;ve listed for rent
              </p>
            </div>
            <Link
              href="/property/create"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1.25rem",
                backgroundColor: "#4f46e5",
                color: "#fff",
                borderRadius: "0.625rem",
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
              ➕ Add New Property
            </Link>
          </div>

          {myProperties.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {myProperties.map((p) => (
                <PropertyCard key={p._id} property={p} showStatus />
              ))}
            </div>
          ) : (
            <div
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "1rem",
                padding: "3rem 2rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🏠</div>
              <p
                style={{
                  fontSize: "1rem",
                  fontWeight: "500",
                  color: "#64748b",
                  marginBottom: "0.375rem",
                }}
              >
                No properties listed yet
              </p>
              <p style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                Click &quot;Add New Property&quot; to get started
              </p>
            </div>
          )}
        </section>

        {/* ── Explore Properties ── */}
        <section>
          <div style={{ marginBottom: "1.25rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "#1e293b",
              }}
            >
              Explore Available Rentals
            </h2>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "#64748b",
                marginTop: "0.125rem",
              }}
            >
              Find your next home
            </p>
          </div>

          {allProperties.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {allProperties.slice(0, 6).map((p) => (
                <PropertyCard
                  key={p._id}
                  property={p}
                  onClick={() => window.open(`/property/${p._id}`, "_blank")}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "1rem",
                padding: "3rem 2rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🔍</div>
              <p style={{ fontSize: "1rem", fontWeight: "500", color: "#64748b" }}>
                No properties available right now
              </p>
            </div>
          )}

          {allProperties.length > 6 && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Link
                href="/properties"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1.5rem",
                  border: "2px solid #4f46e5",
                  color: "#4f46e5",
                  borderRadius: "0.625rem",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#4f46e5";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#4f46e5";
                }}
              >
                View All Properties →
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}