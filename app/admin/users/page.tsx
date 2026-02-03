"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUsers, deleteUser } from "@/lib/api/admin";
import { handleLogout } from "@/lib/actions/auth-actions";
import { getCurrentUser } from "@/lib/utils/auth-utils";
import { API } from "@/lib/api/endpoints";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  username?: string;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getUsers();
        const data = res?.data || res?.users || res || [];
        const normalized: UserRow[] = (data as any[]).map((u) => ({
          id: u.id || u._id,
          name: u.name || "",
          email: u.email || "",
          role: u.role || "user",
          username: u.username,
        }));
        setUsers(normalized);
      } catch (err: any) {
        console.error("Failed to load users", err);
        setError(err?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    void fetchUsers();
  }, []);

  const onLogout = async () => {
    setShowProfileMenu(false);
    const result = await handleLogout();
    if (result.success) {
      router.push("/login");
    }
  };

  const handleDelete = async (id: string) => {
    const user = users.find((u) => u.id === id);
    const confirmDelete = window.confirm(
      `Delete ${user?.name || "this user"}? This cannot be undone.`
    );
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      console.error("Failed to delete user", err);
      setError(err?.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f7f7f7" }}>
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
            <button
              onClick={() => router.back()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                background: "transparent",
                border: "1px solid #475569",
                borderRadius: "0.5rem",
                cursor: "pointer",
                color: "#e2e8f0",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#64748b")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#475569")}
            >
              ← Back
            </button>
            <h1 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#e2e8f0", margin: 0 }}>
              Admin - Users
            </h1>
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
                color: "#e2e8f0",
                fontSize: "0.875rem",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#334155")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div
                style={{
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "9999px",
                  background: "#4f46e5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {currentUser?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <span style={{ display: "none", fontWeight: "500" }}>
                {currentUser?.name || "Admin"}
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
                  <p style={{ fontWeight: "500", color: "#e2e8f0", margin: 0 }}>
                    {currentUser?.name || "Admin"}
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "#94a3b8", margin: "0.25rem 0 0 0" }}>
                    {currentUser?.email}
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
                    admin
                  </div>
                </div>
                <div style={{ padding: "0.5rem 0" }}>
                  <Link
                    href="/dashboard"
                    onClick={() => setShowProfileMenu(false)}
                    style={{
                      display: "block",
                      padding: "0.5rem 1rem",
                      fontSize: "0.875rem",
                      color: "#e2e8f0",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#475569")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    📊 Dashboard
                  </Link>
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
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#475569")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
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
      <div style={{ padding: "80px 24px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <h2 style={{ fontSize: 28, color: "#0f3d3d", margin: 0 }}>Users</h2>
            <p style={{ color: "#666", margin: "0.5rem 0 0 0" }}>Manage users from a single place.</p>
          </div>
          <Link
            href="/admin/users/create"
            style={{
              padding: "10px 16px",
              background: "teal",
              color: "white",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            Create User
          </Link>
        </div>

        {error && (
          <div style={{ marginBottom: 16, color: "#b00020" }}>{error}</div>
        )}

        <div
          style={{
            background: "white",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f0f5f5" }}>
              <tr>
                <th style={{ textAlign: "left", padding: 16 }}>User</th>
                <th style={{ textAlign: "left", padding: 16 }}>Email</th>
                <th style={{ textAlign: "left", padding: 16 }}>Role</th>
                <th style={{ textAlign: "left", padding: 16 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: 16 }}>Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 16 }}>No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} style={{ borderTop: "1px solid #eee" }}>
                    <td style={{ padding: 16 }}>{user.name || user.username || user.email}</td>
                    <td style={{ padding: 16 }}>{user.email}</td>
                    <td style={{ padding: 16, textTransform: "capitalize" }}>{user.role}</td>
                    <td style={{ padding: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <Link
                        href={`/admin/users/${user.id}`}
                        style={{ color: "teal", textDecoration: "none" }}
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/users/${user.id}/edit`}
                        style={{ color: "#0f3d3d", textDecoration: "none" }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#b00020",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        {deletingId === user.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
