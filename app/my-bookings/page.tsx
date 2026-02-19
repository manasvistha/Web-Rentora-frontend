"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMyBookings, Booking } from "@/lib/api/booking";
import { getCurrentUser } from "@/lib/utils/auth-utils";

const getStatusStyle = (status: Booking["status"]) => {
  if (status === "approved") return { background: "#dcfce7", color: "#166534" };
  if (status === "rejected") return { background: "#fee2e2", color: "#991b1b" };
  return { background: "#fef3c7", color: "#92400e" };
};

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const load = async () => {
      try {
        const data = await getMyBookings();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err?.response?.data?.error || err?.message || "Failed to load your bookings");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "32px 20px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <Link href="/dashboard" style={{ color: "#4f46e5", textDecoration: "none", fontSize: 14 }}>← Back to Dashboard</Link>
            <h1 style={{ margin: "8px 0 0", color: "#0f172a" }}>My Bookings</h1>
          </div>
        </div>

        {loading && <div style={{ background: "#fff", padding: 20, borderRadius: 12 }}>Loading bookings...</div>}
        {error && <div style={{ background: "#fee2e2", color: "#991b1b", padding: 14, borderRadius: 10 }}>{error}</div>}

        {!loading && !error && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
            {bookings.length === 0 ? (
              <div style={{ padding: 24, color: "#64748b" }}>No booking requests yet.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ textAlign: "left", padding: 12 }}>Property</th>
                    <th style={{ textAlign: "left", padding: 12 }}>Location</th>
                    <th style={{ textAlign: "left", padding: 12 }}>Price</th>
                    <th style={{ textAlign: "left", padding: 12 }}>Status</th>
                    <th style={{ textAlign: "left", padding: 12 }}>Requested</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const property = typeof booking.property === "string" ? null : booking.property;
                    const badge = getStatusStyle(booking.status);
                    return (
                      <tr key={booking._id} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: 12 }}>{property?.title || "Property"}</td>
                        <td style={{ padding: 12 }}>{property?.location || "-"}</td>
                        <td style={{ padding: 12 }}>{property?.price ? `$${property.price}` : "-"}</td>
                        <td style={{ padding: 12 }}>
                          <span style={{ ...badge, borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>
                            {booking.status}
                          </span>
                        </td>
                        <td style={{ padding: 12 }}>{new Date(booking.createdAt).toLocaleString()}</td>
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
