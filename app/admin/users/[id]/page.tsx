import Link from "next/link";

export default function AdminUserDetailsPage({
  params,
}: {
  params: { id: string };
}) {
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
        <h1 style={{ fontSize: 28, marginBottom: 12, color: "#0f3d3d" }}>
          User Details
        </h1>
        <p style={{ marginBottom: 24, color: "#666" }}>
          Displaying data for user ID: <strong>{params.id}</strong>
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <Link
            href={`/admin/users/${params.id}/edit`}
            style={{
              padding: "10px 16px",
              background: "teal",
              color: "white",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            Edit User
          </Link>
          <Link
            href="/admin/users"
            style={{
              padding: "10px 16px",
              background: "#e6eeee",
              color: "#0f3d3d",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            Back to Users
          </Link>
        </div>
      </div>
    </div>
  );
}
