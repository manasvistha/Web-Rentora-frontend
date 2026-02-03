"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import { getProfile, updateProfile } from "@/lib/api/auth";
import { getCurrentUser, getImageUrl } from "@/lib/utils/auth-utils";

export default function UserProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      // seed from cookie immediately so the UI is not blank
      const cookieUser = getCurrentUser();
      if (cookieUser?.id) {
        setUserId(cookieUser.id);
        setName(cookieUser.name || "");
        setEmail(cookieUser.email || "");
        setUsername(cookieUser.username || "");
      }

      try {
        const profile = await getProfile();
        const user = profile?.data || profile?.user || profile;
        if (user?.id || user?._id) {
          const id = user.id || user._id;
          setUserId(id);
          setName(user.name || "");
          setEmail(user.email || "");
          setUsername(user.username || "");
          setCurrentPhoto(user.profilePicture || null);
          document.cookie = `user_data=${encodeURIComponent(
            JSON.stringify({
              id,
              name: user.name,
              email: user.email,
              username: user.username,
              role: user.role,
              profilePicture: user.profilePicture,
            })
          )}; path=/;`;
        }
      } catch (err: any) {
        console.error("Failed to load profile", err);
        setError(
          err?.response?.data?.message || err?.message || "Failed to load profile"
        );
      }
    };

    void init();
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

      const response = await updateProfile(userId, formData);

      const updatedUser = response?.data || response?.user;
      if (updatedUser) {
        setCurrentPhoto(updatedUser.profilePicture || currentPhoto);
        document.cookie = `user_data=${encodeURIComponent(
          JSON.stringify(updatedUser)
        )}; path=/;`;
      }

      setMessage("Profile updated successfully");
      setPassword("");
      setPhoto(null);
      setPhotoPreview(null);
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
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
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <button
            onClick={() => router.back()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              background: "transparent",
              border: "1px solid #ccc",
              borderRadius: "0.5rem",
              cursor: "pointer",
              color: "#666",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            ← Back
          </button>
          <h1 style={{ fontSize: 28, margin: 0, color: "#0f3d3d" }}>
            User Profile
          </h1>
        </div>
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
          {/* Profile Photo Preview */}
          <div style={{ display: "grid", gap: 8, textAlign: "center" }}>
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: "50%",
                overflow: "hidden",
                margin: "0 auto",
                background: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "3px solid #008080",
              }}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : currentPhoto ? (
                <img
                  src={getImageUrl(currentPhoto) || ""}
                  alt="Current"
                  crossOrigin="anonymous"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    const imageUrl = getImageUrl(currentPhoto);
                    console.error("Failed to load image:", currentPhoto, "Resolved URL:", imageUrl);
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span style={{ color: "#999", fontSize: 12 }}>No Photo</span>
              )}
            </div>
          </div>

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
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPhoto(file);
                  const reader = new FileReader();
                  reader.onloadend = () => setPhotoPreview(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
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
