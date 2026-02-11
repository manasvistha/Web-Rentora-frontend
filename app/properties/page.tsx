"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProperties, Property, searchProperties } from "@/lib/api/property";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
              }}
              onClick={() => window.open(`/property/${property._id}`, '_blank')}
            >
              {property.images.length > 0 && (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
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
    </div>
  );
}