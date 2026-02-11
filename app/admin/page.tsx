import Link from "next/link";

const quickLinks = [
  { label: "Manage Users", href: "/admin/users" },
  { label: "Manage Properties", href: "/admin/properties" },
  { label: "Create User", href: "/admin/users/create" },
  { label: "View Profile", href: "/user/profile" },
];

export default function AdminDashboardPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f7f7f7", padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <h1 style={{ fontSize: 30, color: "#0f3d3d", marginBottom: 8 }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "#666", marginBottom: 24 }}>
            Welcome back. Manage users and platform settings from here.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 32,
            }}
          >
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: 20,
                  background: "#f0f5f5",
                  borderRadius: 12,
                  textDecoration: "none",
                  color: "#0f3d3d",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {link.label}
                <span style={{ fontSize: 18 }}>→</span>
              </Link>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                border: "1px solid #eee",
              }}
            >
              <h3 style={{ marginBottom: 8, color: "#0f3d3d" }}>User Oversight</h3>
              <p style={{ color: "#666" }}>
                Track recent signups and maintain user access.
              </p>
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                border: "1px solid #eee",
              }}
            >
              <h3 style={{ marginBottom: 8, color: "#0f3d3d" }}>System Health</h3>
              <p style={{ color: "#666" }}>
                Monitor platform performance and security status.
              </p>
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                border: "1px solid #eee",
              }}
            >
              <h3 style={{ marginBottom: 8, color: "#0f3d3d" }}>Quick Actions</h3>
              <p style={{ color: "#666" }}>
                Create users, assign roles, and manage content quickly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
