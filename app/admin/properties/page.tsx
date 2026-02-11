"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllProperties, updatePropertyStatus, deleteProperty } from "@/lib/api/admin";
import { handleLogout } from "@/lib/actions/auth-actions";
import { getCurrentUser } from "@/lib/utils/auth-utils";

type PropertyRow = {
  _id: string;
  title: string;
  location: string;
  price: number;
  status: string;
  owner: {
    name: string;
    email: string;
  };
  createdAt: string;
};

export default function AdminPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    setCurrentUser(user);

    fetchProperties();
  }, [router]);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllProperties();
      const data = res?.data || res || [];
      setProperties(data);
    } catch (err: any) {
      console.error("Failed to load properties", err);
      setError(err?.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (propertyId: string, newStatus: string) => {
    setUpdatingId(propertyId);
    try {
      await updatePropertyStatus(propertyId, newStatus);
      // Update local state
      setProperties(prev =>
        prev.map(prop =>
          prop._id === propertyId ? { ...prop, status: newStatus } : prop
        )
      );
    } catch (err: any) {
      console.error("Failed to update property status", err);
      setError(err?.message || "Failed to update property status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    setDeletingId(propertyId);
    try {
      await deleteProperty(propertyId);
      // Remove from local state
      setProperties(prev => prev.filter(prop => prop._id !== propertyId));
    } catch (err: any) {
      console.error("Failed to delete property", err);
      setError(err?.message || "Failed to delete property");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogoutClick = async () => {
    await handleLogout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f7f7", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <div>Loading properties...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f7f7f7", padding: "80px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <Link href="/admin" style={{ color: "#0f3d3d", textDecoration: "none", fontSize: 14 }}>
              ← Back to Dashboard
            </Link>
            <h1 style={{ fontSize: 30, color: "#0f3d3d", margin: "8px 0" }}>
              Manage Properties
            </h1>
          </div>

          {/* Profile Menu */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                padding: "8px 16px",
                background: "white",
                border: "1px solid #ddd",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <span>{currentUser?.name || "Admin"}</span>
              <span>▼</span>
            </button>

            {showProfileMenu && (
              <div style={{
                position: "absolute",
                top: "100%",
                right: 0,
                background: "white",
                border: "1px solid #ddd",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 1000,
                minWidth: 150
              }}>
                <button
                  onClick={handleLogoutClick}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "none",
                    background: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    color: "#dc2626"
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: 16,
            borderRadius: 8,
            marginBottom: 24
          }}>
            {error}
            <button
              onClick={() => setError(null)}
              style={{ marginLeft: 16, color: "#dc2626", textDecoration: "underline" }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Properties Table */}
        <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
          <div style={{ padding: 24, borderBottom: "1px solid #eee" }}>
            <h2 style={{ margin: 0, color: "#0f3d3d" }}>All Properties ({properties.length})</h2>
          </div>

          {properties.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "#666" }}>
              No properties found.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#0f3d3d" }}>Title</th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#0f3d3d" }}>Location</th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#0f3d3d" }}>Price</th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#0f3d3d" }}>Owner</th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#0f3d3d" }}>Status</th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#0f3d3d" }}>Created</th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#0f3d3d" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr key={property._id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "16px" }}>
                        <div style={{ fontWeight: 500 }}>{property.title}</div>
                      </td>
                      <td style={{ padding: "16px" }}>{property.location}</td>
                      <td style={{ padding: "16px" }}>${property.price}</td>
                      <td style={{ padding: "16px" }}>
                        <div>{property.owner?.name}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{property.owner?.email}</div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <select
                          value={property.status}
                          onChange={(e) => handleStatusUpdate(property._id, e.target.value)}
                          disabled={updatingId === property._id}
                          style={{
                            padding: "4px 8px",
                            border: "1px solid #ddd",
                            borderRadius: 4,
                            background: updatingId === property._id ? "#f5f5f5" : "white"
                          }}
                        >
                          <option value="available">Available</option>
                          <option value="assigned">Assigned</option>
                          <option value="booked">Booked</option>
                        </select>
                      </td>
                      <td style={{ padding: "16px" }}>
                        {new Date(property.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <button
                          onClick={() => handleDelete(property._id)}
                          disabled={deletingId === property._id}
                          style={{
                            padding: "6px 12px",
                            background: "#dc2626",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            cursor: deletingId === property._id ? "not-allowed" : "pointer",
                            opacity: deletingId === property._id ? 0.6 : 1
                          }}
                        >
                          {deletingId === property._id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}