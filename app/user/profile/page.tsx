"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import { getProfile, updateProfile } from "@/lib/api/auth";
import { getCurrentUser, getImageUrl } from "@/lib/utils/auth-utils";

type ProfileUser = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  username?: string;
  role?: string;
  profilePicture?: string;
};

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
  const [user, setUser] = useState<ProfileUser | null>(null);

  const fallbackAvatar = useMemo(() => {
    const displayName = user?.name || "User";
    const initials = displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=4f46e5&color=fff&size=128`;
  }, [user?.name]);

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
        setUser(user);
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

  const displayName = user?.name || user?.username || "User";
  const displayEmail = user?.email || "";
  const displayRole = user?.role || "user";
  const avatar = getImageUrl(user?.profilePicture) || fallbackAvatar;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
      }}
    >
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
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                backgroundColor: "#4f46e5",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
              }}
            >
              🏢
            </div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Rentora</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "500",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#4338ca")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#4f46e5")
              }
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "3rem 1.5rem",
          width: "100%",
        }}
      >
        {error && (
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "1rem",
              backgroundColor: "rgba(217, 119, 6, 0.2)",
              border: "1px solid rgba(217, 119, 6, 0.5)",
              borderRadius: "0.5rem",
              color: "#fed7aa",
              fontSize: "0.875rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Profile Display */}
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            My Profile
          </h2>
          <p style={{ color: "#94a3b8" }}>View and manage your account information</p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(30, 41, 59, 0.6)",
              border: "1px solid #475569",
              borderRadius: "0.5rem",
              padding: "2rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <img
                src={avatar}
                alt={displayName}
                crossOrigin="anonymous"
                style={{
                  width: "6rem",
                  height: "6rem",
                  borderRadius: "9999px",
                  border: "4px solid #4f46e5",
                }}
              />
              <div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {displayName}
                </h3>
                <p style={{ color: "#94a3b8" }}>{displayEmail}</p>
                <div
                  style={{
                    marginTop: "0.75rem",
                    display: "inline-block",
                    padding: "0.25rem 0.75rem",
                    backgroundColor: "rgba(79, 70, 229, 0.3)",
                    color: "#a5d6ff",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    borderRadius: "0.25rem",
                    textTransform: "capitalize",
                  }}
                >
                  {displayRole}
                </div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div
            style={{
              backgroundColor: "rgba(30, 41, 59, 0.6)",
              border: "1px solid #475569",
              borderRadius: "0.5rem",
              padding: "1.5rem",
            }}
          >
            <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
              Account Info
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.875rem" }}>
              <div>
                <p style={{ color: "#94a3b8" }}>Email</p>
                <p style={{ fontWeight: "500", marginTop: "0.25rem" }}>
                  {displayEmail}
                </p>
              </div>
              <div>
                <p style={{ color: "#94a3b8" }}>Username</p>
                <p style={{ fontWeight: "500", marginTop: "0.25rem" }}>
                  {user?.username || "—"}
                </p>
              </div>
              <div>
                <p style={{ color: "#94a3b8" }}>Member Since</p>
                <p style={{ fontWeight: "500", marginTop: "0.25rem" }}>
                  {user?.id ? new Date().toLocaleDateString() : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Section */}
        <div
          style={{
            backgroundColor: "rgba(30, 41, 59, 0.6)",
            border: "1px solid #475569",
            borderRadius: "0.5rem",
            padding: "2rem",
          }}
        >
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
            Edit Profile
          </h3>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
            Update your account details and profile photo.
          </p>

          {message && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem",
                backgroundColor: "rgba(34, 197, 94, 0.2)",
                border: "1px solid rgba(34, 197, 94, 0.5)",
                borderRadius: "0.5rem",
                color: "#bbf7d0",
                fontSize: "0.875rem",
              }}
            >
              ✅ {message}
            </div>
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
                background: "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "3px solid #4f46e5",
              }}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : currentPhoto && getImageUrl(currentPhoto) ? (
                <img
                  src={getImageUrl(currentPhoto)!}
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
                <span style={{ color: "#9ca3af", fontSize: 12 }}>No Photo</span>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ color: "#e5e7eb", fontWeight: "500" }}>Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #4b5563",
                backgroundColor: "#1f2937",
                color: "#e5e7eb",
                fontSize: "0.875rem"
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ color: "#e5e7eb", fontWeight: "500" }}>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              type="email"
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #4b5563",
                backgroundColor: "#1f2937",
                color: "#e5e7eb",
                fontSize: "0.875rem"
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ color: "#e5e7eb", fontWeight: "500" }}>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter a username"
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #4b5563",
                backgroundColor: "#1f2937",
                color: "#e5e7eb",
                fontSize: "0.875rem"
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ color: "#e5e7eb", fontWeight: "500" }}>New Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              type="password"
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #4b5563",
                backgroundColor: "#1f2937",
                color: "#e5e7eb",
                fontSize: "0.875rem"
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ color: "#e5e7eb", fontWeight: "500" }}>Profile Photo</label>
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
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #4b5563",
                backgroundColor: "#1f2937",
                color: "#e5e7eb",
                fontSize: "0.875rem"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            style={{
              marginTop: 8,
              padding: "12px 20px",
              backgroundColor: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: "500",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#4338ca")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#4f46e5")
            }
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "1.5rem",
          marginTop: "3rem",
          textAlign: "center",
          fontSize: "0.875rem",
          color: "#64748b",
          borderTop: "1px solid #475569",
          width: "100%",
        }}
      >
        <p>© 2026 RentHub. All rights reserved.</p>
      </footer>
    </div>
  );
}
