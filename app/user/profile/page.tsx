"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import { getCurrentUser } from "@/lib/utils/auth-utils";

export default function UserProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.id) {
      setUserId(user.id);
      setName(user.name || "");
      setEmail(user.email || "");
      setUsername(user.username || "");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      if (name) formData.append("name", name);
      if (email) formData.append("email", email);
      if (username) formData.append("username", username);
      if (password) formData.append("password", password);
      if (photo) formData.append("photo", photo);

      const response = await axios.put(API.AUTH.UPDATE_USER(userId), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = response.data?.data;
      if (updatedUser) {
        document.cookie = `user_data=${encodeURIComponent(
          JSON.stringify(updatedUser)
        )}; path=/;`;
      }

      setMessage("Profile updated successfully");
      setPassword("");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to update profile"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f7f7f7", padding: "80px 24px" }}>
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
        <h1 style={{ fontSize: 28, marginBottom: 8, color: "#0f3d3d" }}>
          User Profile
        </h1>
        <p style={{ marginBottom: 24, color: "#666" }}>
          Update your account details and profile photo.
        </p>

        {message && (
          <div style={{ marginBottom: 16, color: "#0b7a3e" }}>{message}</div>
        )}
        {error && (
          <div style={{ marginBottom: 16, color: "#b00020" }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <label>Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              type="email"
              style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter a username"
              style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label>New Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              type="password"
              style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label>Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
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
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
