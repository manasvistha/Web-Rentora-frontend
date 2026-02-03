"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/api/admin";
import { handleLogout } from "@/lib/actions/auth-actions";
import { getCurrentUser } from "@/lib/utils/auth-utils";

export default function AdminCreateUserPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentUser] = useState(getCurrentUser());
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      if (username) formData.append("username", username);
      if (role) formData.append("role", role);
      if (photo) formData.append("photo", photo);

      await createUser(formData);

      setMessage("User created successfully");
      setName("");
      setEmail("");
      setUsername("");
      setPassword("");
      setRole("user");
      setPhoto(null);
      setPhotoPreview(null);

      // Go back to list
      router.push("/admin/users");
    } catch (err: any) {
      setError(err?.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onLogout = async () => {
    setShowProfileMenu(false);
    const result = await handleLogout();
    if (result.success) {
      router.push("/login");
    }
  };

  const HeaderMenu = () => (
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
            Create User
          </h1>
        </div>

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
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f7f7f7" }}>
      <HeaderMenu />
      <div style={{ padding: "80px 24px 24px" }}>
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          background: "white",
          borderRadius: 12,
          padding: 32,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <p style={{ marginBottom: 24, color: "#666" }}>
          Add a new user account with optional profile photo.
        </p>

        {message && (
          <div style={{ marginBottom: 16, color: "#0b7a3e" }}>{message}</div>
        )}
        {error && (
          <div style={{ marginBottom: 16, color: "#b00020" }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <label>Profile Photo (optional)</label>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                  fontSize: 12,
                }}
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  "No Image"
                )}
              </div>
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label>Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              required
              style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              type="email"
              required
              style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Optional username"
              style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Set a password"
              type="password"
              required
              style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>


          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: 8,
              padding: "12px 20px",
              background: "teal",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            {isSubmitting ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
