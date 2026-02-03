import Link from "next/link";

const dummyUsers = [
  { id: "u-1001", name: "Admin One", email: "admin@rentora.com", role: "admin" },
  { id: "u-1002", name: "User Two", email: "user2@rentora.com", role: "user" },
  { id: "u-1003", name: "User Three", email: "user3@rentora.com", role: "user" },
];

export default function AdminUsersPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f7f7f7", padding: "80px 24px" }}>
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
            <h1 style={{ fontSize: 28, color: "#0f3d3d" }}>Admin Users</h1>
            <p style={{ color: "#666" }}>Manage users from a single place.</p>
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
              {dummyUsers.map((user) => (
                <tr key={user.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: 16 }}>{user.name}</td>
                  <td style={{ padding: 16 }}>{user.email}</td>
                  <td style={{ padding: 16 }}>{user.role}</td>
                  <td style={{ padding: 16, display: "flex", gap: 12 }}>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
