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
import { getMyProperties, getProperties, Property, getProperty } from "@/lib/api/property";
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
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(false);

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

  const handleViewProperty = async (propertyId: string) => {
    setLoadingProperty(true);
    setShowPropertyModal(true);
    try {
      // Find property in local state first
      const property = allProperties.find(p => p._id === propertyId) || myProperties.find(p => p._id === propertyId);
      if (property) {
        setSelectedProperty(property);
      } else {
        // Fallback to API call if not found in local state
        const propertyData = await getProperty(propertyId);
        setSelectedProperty(propertyData);
      }
    } catch (err: any) {
      console.error("Failed to load property details", err);
      setShowPropertyModal(false);
    } finally {
      setLoadingProperty(false);
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

        {/* ── Explore Properties ── */}
        <section style={{ marginBottom: "3rem" }}>
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
                  onClick={() => handleViewProperty(p._id)}
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
      </main>

      {/* Property Details Modal */}
      {showPropertyModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
            backdropFilter: "blur(4px)"
          }}
          onClick={() => setShowPropertyModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              maxWidth: "900px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              display: "flex",
              flexDirection: "column"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "24px 32px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white"
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "600" }}>
                  {loadingProperty ? "Loading..." : selectedProperty?.title || "Property Details"}
                </h2>
                {!loadingProperty && selectedProperty && (
                  <p style={{ margin: "4px 0 0 0", opacity: 0.9, fontSize: "0.9rem" }}>
                    📍 {selectedProperty.location}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowPropertyModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "20px",
                  fontWeight: "bold",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ 
              padding: "32px", 
              overflow: "auto",
              flex: 1
            }}>
              {loadingProperty ? (
                <div style={{ 
                  textAlign: "center", 
                  padding: "60px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px"
                }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "4px solid #e5e7eb",
                      borderTopColor: "#667eea",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <p style={{ color: "#6b7280", margin: 0 }}>Loading property details...</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : selectedProperty ? (
                <div>
                  {/* Property Images Gallery */}
                  {selectedProperty.images && selectedProperty.images.length > 0 && (
                    <div style={{ marginBottom: "32px" }}>
                      <h3 style={{ 
                        marginBottom: "20px", 
                        color: "#1f2937", 
                        fontSize: "1.25rem",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        🖼️ Property Images ({selectedProperty.images.length})
                      </h3>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                          gap: "16px"
                        }}
                      >
                        {selectedProperty.images.map((image: string, index: number) => {
                          const imageUrl = getPropertyImageUrl(image);
                          return imageUrl ? (
                            <div
                              key={index}
                              style={{
                                position: "relative",
                                borderRadius: "12px",
                                overflow: "hidden",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                transition: "transform 0.2s, box-shadow 0.2s",
                                cursor: "pointer"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.02)";
                                e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                              }}
                            >
                              <img
                                src={imageUrl}
                                alt={`Property image ${index + 1}`}
                                style={{
                                  width: "100%",
                                  height: "200px",
                                  objectFit: "cover",
                                  display: "block"
                                }}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = "none";
                                  e.currentTarget.parentElement!.innerHTML = `
                                    <div style="width:100%;height:200px;display:flex;align-items:center;justify-content:center;font-size:3rem;background:#f3f4f6;border-radius:12px;">🏠</div>
                                  `;
                                }}
                              />
                              <div style={{
                                position: "absolute",
                                bottom: "8px",
                                right: "8px",
                                background: "rgba(0, 0, 0, 0.7)",
                                color: "white",
                                padding: "4px 8px",
                                borderRadius: "20px",
                                fontSize: "0.75rem",
                                fontWeight: "500"
                              }}>
                                {index + 1}
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Property Details Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                    {/* Left Column - Basic Info */}
                    <div>
                      <h3 style={{ 
                        marginBottom: "20px", 
                        color: "#1f2937", 
                        fontSize: "1.25rem",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        📋 Property Information
                      </h3>
                      <div style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        gap: "16px",
                        background: "#f8fafc",
                        padding: "20px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: "500", color: "#374151" }}>Price:</span>
                          <span style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1f2937" }}>
                            ${selectedProperty.price}/month
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: "500", color: "#374151" }}>Location:</span>
                          <span style={{ color: "#4b5563" }}>{selectedProperty.location}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: "500", color: "#374151" }}>Status:</span>
                          <span style={{ color: "#4b5563", textTransform: "capitalize" }}>{selectedProperty.status || "N/A"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: "500", color: "#374151" }}>Bedrooms:</span>
                          <span style={{ color: "#4b5563" }}>{(selectedProperty as any).bedrooms || "N/A"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: "500", color: "#374151" }}>Bathrooms:</span>
                          <span style={{ color: "#4b5563" }}>{(selectedProperty as any).bathrooms || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Description & Owner */}
                    <div>
                      <h3 style={{ 
                        marginBottom: "20px", 
                        color: "#1f2937", 
                        fontSize: "1.25rem",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        📝 Description
                      </h3>
                      <div style={{ 
                        background: "#f8fafc",
                        padding: "20px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        marginBottom: "24px"
                      }}>
                        <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
                          {selectedProperty.description || "No description available."}
                        </p>
                      </div>

                      {/* Owner Information */}
                      {selectedProperty.owner && (
                        <div>
                          <h3 style={{ 
                            marginBottom: "20px", 
                            color: "#1f2937", 
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                          }}>
                            👤 Owner Information
                          </h3>
                          <div style={{ 
                            background: "#f8fafc",
                            padding: "20px",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                              <div style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                background: "#667eea",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "600"
                              }}>
                                {(selectedProperty.owner.name || "O").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p style={{ fontWeight: "600", color: "#1f2937", margin: 0 }}>
                                  {selectedProperty.owner.name || "Owner"}
                                </p>
                                <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: 0 }}>
                                  {selectedProperty.owner.email || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <p style={{ color: "#6b7280" }}>Property details not found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}