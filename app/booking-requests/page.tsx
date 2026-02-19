"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Booking, getOwnerBookingRequests, updateBookingStatus } from "@/lib/api/booking";
import { getCurrentUser } from "@/lib/utils/auth-utils";

const getStatusStyle = (status: Booking["status"]) => {
  if (status === "approved") return { background: "#dcfce7", color: "#166534" };
  if (status === "rejected") return { background: "#fee2e2", color: "#991b1b" };
  return { background: "#fef3c7", color: "#92400e" };
};

export default function BookingRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      const data = await getOwnerBookingRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to load booking requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }
    void loadRequests();
  }, [router]);

  const handleStatus = async (bookingId: string, status: "approved" | "rejected") => {
    setActioningId(bookingId);
    try {
      const updated = await updateBookingStatus(bookingId, status);
      setRequests((prev) => prev.map((item) => (item._id === bookingId ? updated : item)));
    } catch (err: any) {
      alert(err?.response?.data?.error || err?.message || "Failed to update booking status");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "32px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <Link href="/dashboard" style={{ color: "#4f46e5", textDecoration: "none", fontSize: 14 }}>← Back to Dashboard</Link>
            <h1 style={{ margin: "8px 0 0", color: "#0f172a" }}>Booking Requests</h1>
          </div>
        </div>

        {loading && <div style={{ background: "#fff", padding: 20, borderRadius: 12 }}>Loading requests...</div>}
        {error && <div style={{ background: "#fee2e2", color: "#991b1b", padding: 14, borderRadius: 10 }}>{error}</div>}

        {!loading && !error && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
            {requests.length === 0 ? (
              <div style={{ padding: 24, color: "#64748b" }}>No booking requests for your properties yet.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ textAlign: "left", padding: 12 }}>Property</th>
                    <th style={{ textAlign: "left", padding: 12 }}>Tenant</th>
                    <th style={{ textAlign: "left", padding: 12 }}>Message</th>
                    <th style={{ textAlign: "left", padding: 12 }}>Status</th>
                    <th style={{ textAlign: "left", padding: 12 }}>Requested</th>
                    <th style={{ textAlign: "left", padding: 12 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((booking) => {
                    const property = typeof booking.property === "string" ? null : booking.property;
                    const tenant = typeof booking.user === "string" ? null : booking.user;
                    const badge = getStatusStyle(booking.status);
                    const pending = booking.status === "pending";
                    return (
                      <tr key={booking._id} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: 12 }}>{property?.title || "Property"}</td>
                        <td style={{ padding: 12 }}>{tenant?.name || tenant?.email || "User"}</td>
                        <td style={{ padding: 12 }}>{booking.message || "-"}</td>
                        <td style={{ padding: 12 }}>
                          <span style={{ ...badge, borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>
                            {booking.status}
                          </span>
                        </td>
                        <td style={{ padding: 12 }}>{new Date(booking.createdAt).toLocaleString()}</td>
                        <td style={{ padding: 12, display: "flex", gap: 8 }}>
                          <button
                            disabled={!pending || actioningId === booking._id}
                            onClick={() => handleStatus(booking._id, "approved")}
                            style={{
                              border: "none",
                              background: pending ? "#16a34a" : "#9ca3af",
                              color: "#fff",
                              borderRadius: 8,
                              padding: "6px 10px",
                              cursor: pending ? "pointer" : "not-allowed",
                            }}
                          >
                            Approve
                          </button>
                          <button
                            disabled={!pending || actioningId === booking._id}
                            onClick={() => handleStatus(booking._id, "rejected")}
                            style={{
                              border: "none",
                              background: pending ? "#dc2626" : "#9ca3af",
                              color: "#fff",
                              borderRadius: 8,
                              padding: "6px 10px",
                              cursor: pending ? "pointer" : "not-allowed",
                            }}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
