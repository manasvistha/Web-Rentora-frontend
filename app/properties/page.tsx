"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProperties, Property, searchProperties, getProperty } from "@/lib/api/property";
import { getPropertyImageUrl } from "@/lib/utils/auth-utils";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getProperties();
        setProperties(data?.data || data || []);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const data = await searchProperties({ location: searchQuery });
      setProperties(data?.data || data || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProperty = async (propertyId: string) => {
    setLoadingProperty(true);
    setShowPropertyModal(true);
    try {
      const propertyData = await getProperty(propertyId);
      setSelectedProperty(propertyData);
    } catch (err: any) {
      console.error("Failed to load property details", err);
      setShowPropertyModal(false);
    } finally {
      setLoadingProperty(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "2rem", height: "2rem", border: "4px solid #e2e8f0", borderTop: "4px solid #4f46e5", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }}></div>
          <p style={{ color: "#64748b" }}>Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", color: "#1e293b" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Properties</h1>
          <Link
            href="/property/create"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#4f46e5",
              color: "white",
              borderRadius: "0.25rem",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            List Property
          </Link>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "2rem", display: "flex", gap: "1rem" }}>
          <input
            type="text"
            placeholder="Search by location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: "0.5rem",
              border: "1px solid #e2e8f0",
              borderRadius: "0.25rem",
              fontSize: "0.875rem",
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "0.25rem",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Search
          </button>
        </div>

        {/* Properties Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {properties.map((property) => (
            <div
              key={property._id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onClick={() => handleViewProperty(property._id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
              }}
            >
              {property.images.length > 0 && getPropertyImageUrl(property.images[0]) && (
                <img
                  src={getPropertyImageUrl(property.images[0]) || ""}
                  alt={property.title}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    e.currentTarget.parentElement!.innerHTML += '<div style="width:100%;height:200px;display:flex;align-items:center;justify-content:center;font-size:3rem;background:#f3f4f6;">🏠</div>';
                  }}
                />
              )}
              <div style={{ padding: "1rem" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                  {property.title}
                </h3>
                <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                  📍 {property.location}
                </p>
                <p style={{ fontSize: "1rem", fontWeight: "600", color: "#1e293b", marginBottom: "0.5rem" }}>
                  ${property.price}/month
                </p>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                  {property.description.length > 100 ? `${property.description.substring(0, 100)}...` : property.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {properties.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <p style={{ color: "#64748b", fontSize: "1.125rem" }}>No properties found.</p>
          </div>
        )}
      </div>

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
                          <span style={{ fontWeight: "500", color: "#6b7280" }}>Title:</span>
                          <span style={{ fontWeight: "600", color: "#1f2937" }}>{selectedProperty.title}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: "500", color: "#6b7280" }}>Location:</span>
                          <span style={{ fontWeight: "600", color: "#1f2937" }}>📍 {selectedProperty.location}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: "500", color: "#6b7280" }}>Price:</span>
                          <span style={{ fontWeight: "600", color: "#059669", fontSize: "1.1rem" }}>${selectedProperty.price}/month</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: "500", color: "#6b7280" }}>Status:</span>
                          <span
                            style={{
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              textTransform: "capitalize",
                              backgroundColor:
                                selectedProperty.status === "available"
                                  ? "#d1fae5"
                                  : selectedProperty.status === "booked"
                                  ? "#fee2e2"
                                  : "#fef3c7",
                              color:
                                selectedProperty.status === "available"
                                  ? "#065f46"
                                  : selectedProperty.status === "booked"
                                  ? "#991b1b"
                                  : "#92400e"
                            }}
                          >
                            {selectedProperty.status}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: "500", color: "#6b7280" }}>Created:</span>
                          <span style={{ fontWeight: "600", color: "#1f2937" }}>
                            {new Date(selectedProperty.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {selectedProperty.owner && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: "500", color: "#6b7280" }}>Owner:</span>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontWeight: "600", color: "#1f2937" }}>{selectedProperty.owner.name}</div>
                              <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{selectedProperty.owner.email}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Description & Availability */}
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
                        marginBottom: "24px",
                        lineHeight: "1.6",
                        color: "#374151"
                      }}>
                        {selectedProperty.description || "No description provided for this property."}
                      </div>

                      {selectedProperty.availability && selectedProperty.availability.length > 0 && (
                        <div>
                          <h3 style={{ 
                            marginBottom: "16px", 
                            color: "#1f2937", 
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                          }}>
                            📅 Availability
                          </h3>
                          <div style={{ 
                            background: "#f8fafc",
                            padding: "20px",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0"
                          }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                              {selectedProperty.availability.map((avail: any, index: number) => (
                                <div key={index} style={{ 
                                  display: "flex", 
                                  alignItems: "center",
                                  gap: "12px",
                                  padding: "12px",
                                  background: "white",
                                  borderRadius: "8px",
                                  border: "1px solid #e2e8f0"
                                }}>
                                  <div style={{ 
                                    background: "#667eea",
                                    color: "white",
                                    borderRadius: "50%",
                                    width: "32px",
                                    height: "32px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.8rem",
                                    fontWeight: "600"
                                  }}>
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: "600", color: "#1f2937" }}>
                                      {new Date(avail.startDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })} - {new Date(avail.endDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </div>
                                    <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                                      {Math.ceil((new Date(avail.endDate).getTime() - new Date(avail.startDate).getTime()) / (1000 * 60 * 60 * 24))} days available
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  textAlign: "center", 
                  padding: "60px 20px",
                  color: "#dc2626",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px"
                }}>
                  <div style={{ fontSize: "3rem" }}>❌</div>
                  <div>
                    <h3 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>Failed to Load Property</h3>
                    <p style={{ margin: 0, color: "#6b7280" }}>Unable to load property details. Please try again.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}