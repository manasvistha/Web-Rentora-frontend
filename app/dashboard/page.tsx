"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { handleLogout } from "@/lib/actions/auth-actions";
import {getCurrentUser,getImageUrl,getPropertyImageUrl,} from "@/lib/utils/auth-utils";
import { getProfile } from "@/lib/api/auth";
import { getNotifications, markNotificationRead, markAllNotificationsRead, NotificationItem } from "@/lib/api/notification";
import { deleteProperty, getMyProperties, getProperties, Property, getProperty } from "@/lib/api/property";
import { createBooking } from "@/lib/api/booking";
import Link from "next/link";


type DashboardUser = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  username?: string;
  role?: string;
  profilePicture?: string;
};

type PropertyOwner = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
};

// Extend Property type to ensure owner has _id
type PropertyWithOwner = Property & { owner?: PropertyOwner };

// ── Icon components (Lucide-style, 20x20 strokes) ──────────────────────────
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconChevronDown = ({ open }: { open?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>
    <path d="M6 9l6 6 6-6"/>
  </svg>
);
const IconMapPin = ({ color = "currentColor", size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconBuilding = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
  </svg>
);
const IconTrend = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);
const IconSearch = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
);
const IconPlus = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const IconUser = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
  </svg>
);
const IconLogout = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconHome = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l9-7 9 7v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8z"/>
  </svg>
);
const IconArrow = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IconWarning = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconX = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconDot = ({ read }: { read: boolean }) => (
  <div style={{ width: 7, height: 7, borderRadius: "50%", background: read ? "#e2e8f0" : "#4f46e5", flexShrink: 0, marginTop: 2 }} />
);
const IconBed = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h18M3 6h18M5 12v6M19 12v6M3 6v6M21 6v6"/>
  </svg>
);
const IconBath = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 13h18a2 2 0 0 1-2 2v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3a2 2 0 0 1-2-2z"/>
    <path d="M5 13V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v8"/>
  </svg>
);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifPage, setNotifPage] = useState(1);
  const [notifTotal, setNotifTotal] = useState(0);
  const [notifPages, setNotifPages] = useState(1);
  const notifLimit = 20;
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'my-listings' | 'create' | 'messages' | 'account'>('dashboard');

  useEffect(() => {
    const hydrate = async () => {
      const cookieUser = getCurrentUser();
      if (!cookieUser) { router.push("/login"); return; }
      if (cookieUser.role === "admin") { router.push("/admin/dashboard"); return; }
      try {
        const profileRes = await getProfile();
        const payload = profileRes?.data || profileRes?.user || profileRes;
        setUser(payload || cookieUser);
        try {
          const notRes = await getNotifications(1, notifLimit);
          setNotifications(notRes?.data || []);
          setNotifTotal(notRes?.total || 0);
          setNotifPages(notRes?.pages || 1);
          setNotifPage(notRes?.page || 1);
        } catch {}
        const [myProps, allProps] = await Promise.all([getMyProperties(), getProperties()]);
        setMyProperties(myProps?.data || myProps || []);
        setAllProperties(allProps?.data || allProps || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load data");
        setUser(cookieUser);
      } finally {
        setIsLoading(false);
      }
    };
    void hydrate();
  }, [router]);

  useEffect(() => {
    const filtered = allProperties.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMinPrice = priceMin ? p.price >= parseFloat(priceMin) : true;
      const matchesMaxPrice = priceMax ? p.price <= parseFloat(priceMax) : true;
      return matchesSearch && matchesMinPrice && matchesMaxPrice;
    });
    setFilteredProperties(filtered);
  }, [allProperties, searchTerm, priceMin, priceMax]);

  const onLogout = async () => {
    setShowProfileMenu(false);
    const result = await handleLogout();
    if (result.success) router.push("/login");
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleNotifPage = async (page: number) => {
    try {
      const notRes = await getNotifications(page, notifLimit);
      setNotifications(notRes?.data || []);
      setNotifTotal(notRes?.total || 0);
      setNotifPages(notRes?.pages || 1);
      setNotifPage(notRes?.page || 1);
    } catch {}
  };

  const handleViewProperty = (propertyId: string) => {
    router.push(`/property/${propertyId}`);
  };

  const isOwnedByCurrentUser = (property?: PropertyWithOwner | null) => {
    if (!property?.owner || !user) return false;
    const ownerValue: any = property.owner;
    const ownerId = typeof ownerValue === "string" ? ownerValue : ownerValue._id;
    const ownerEmail = typeof ownerValue === "string" ? undefined : ownerValue.email;
    return (
      (!!user._id && ownerId === user._id) ||
      (!!user.email && ownerEmail === user.email)
    );
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      await deleteProperty(propertyId);
      setMyProperties(prev => prev.filter(property => property._id !== propertyId));
      setAllProperties(prev => prev.filter(property => property._id !== propertyId));
      setFilteredProperties(prev => prev.filter(property => property._id !== propertyId));
      if (selectedProperty?._id === propertyId) {
        setShowPropertyModal(false);
        setSelectedProperty(null);
      }
      alert("Property deleted successfully");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err?.message || "Failed to delete property";
      setError(errorMsg);
      alert("Error: " + errorMsg);
    }
  };

  const handleBookProperty = async (propertyId: string) => {
    try {
      setIsBooking(true);
      await createBooking({ propertyId });
      const updater = (items: Property[]) =>
        items.map(property =>
          property._id === propertyId ? { ...property, status: 'booked' as const } : property
        );

      setAllProperties(prev => updater(prev));
      setMyProperties(prev => updater(prev));
      setSelectedProperty(prev => prev && prev._id === propertyId ? { ...prev, status: 'booked' } : prev);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to book property");
    } finally {
      setIsBooking(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "36px", height: "36px", border: "2px solid #e2e8f0", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#94a3b8", fontSize: "0.8125rem", letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>Loading workspace…</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}} @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');`}</style>
        </div>
      </div>
    );
  }

  const name = user?.name || user?.username || "User";
  const email = user?.email || "";
  const avatar = getImageUrl(user?.profilePicture) || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&bold=true`;
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();
  const selectedPropertyWithOwner = selectedProperty as PropertyWithOwner | null;
  const canManageSelectedProperty = isOwnedByCurrentUser(selectedPropertyWithOwner);
  const canBookSelectedProperty = !!selectedProperty && !canManageSelectedProperty && ['available', 'approved'].includes(selectedProperty.status);

  // ── Property Card ──────────────────────────────────────────────────────────
  const PropertyCard = ({ property, showStatus, onClick, showManagementActions }: { property: PropertyWithOwner; showStatus?: boolean; onClick?: () => void; showManagementActions?: boolean }) => {
    const imgUrl = property.images?.length ? getPropertyImageUrl(property.images[0]) : null;
    const [hovered, setHovered] = useState(false);
    
    const canEdit = isOwnedByCurrentUser(property);

    // Make the entire card clickable, and also allow both 'View details' and 'Open' to trigger onClick
    // Add Edit and Delete buttons for user's own properties (My Listings)
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        style={{
          background: "#fff",
          borderRadius: "14px",
          overflow: "hidden",
          border: "1px solid",
          borderColor: hovered ? "#c7d2fe" : "#f0f0f0",
          cursor: onClick ? "pointer" : "default",
          transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
          transform: hovered ? "translateY(-3px)" : "none",
          boxShadow: hovered ? "0 16px 32px -8px rgba(79,70,229,0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ height: 188, background: "#f8f9fc", position: "relative", overflow: "hidden" }}>
          {imgUrl ? (
            <img src={imgUrl} alt={property.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s", transform: hovered ? "scale(1.04)" : "scale(1)" }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#c8d0e0" }}>
              <IconHome size={44} />
            </div>
          )}
          {showStatus && (
            <div style={{ position: "absolute", top: 12, left: 12 }}>
              <span style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 10px", borderRadius: "20px", background: property.status === "available" ? "#dcfce7" : "#fef3c7", color: property.status === "available" ? "#15803d" : "#92400e" }}>
                {property.status}
              </span>
            </div>
          )}
          {/* Price tag - clean dark design */}
          <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(15,23,42,0.88)", backdropFilter: "blur(10px)", borderRadius: "10px", padding: "8px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>${property.price.toLocaleString()}</span>
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginLeft: 2 }}>/mo</span>
          </div>
        </div>
        <div style={{ padding: "16px 18px 18px" }}>
          <h4 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#0f172a", margin: "0 0 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>
            {property.title}
          </h4>
          <p style={{ display: "flex", alignItems: "center", gap: 5, color: "#94a3b8", fontSize: "0.8125rem", margin: "0 0 12px", fontFamily: "'DM Sans', sans-serif" }}>
            <IconMapPin color="#ef4444" size={13} />{property.location}
          </p>
          {onClick && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #f4f4f5" }}>
              <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", textDecoration: "underline" }}>View details</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", fontWeight: 600, color: "#4f46e5", fontFamily: "'DM Sans', sans-serif", textDecoration: "underline" }}>
                Open <IconArrow size={13} />
              </span>
            </div>
          )}
          {/* Edit/Delete buttons for user's own properties */}
          {showManagementActions && canEdit && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); window.location.href = `/property/edit/${property._id}`; }}
                style={{ padding: "6px 14px", background: "#f3f4f6", color: "#4f46e5", border: "1px solid #c7d2fe", borderRadius: 7, fontWeight: 600, cursor: "pointer" }}
              >Edit</button>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); if (window.confirm('Are you sure you want to delete this property?')) handleDeleteProperty(property._id); }}
                style={{ padding: "6px 14px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 7, fontWeight: 600, cursor: "pointer" }}
              >Delete</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Stat Card ──────────────────────────────────────────────────────────────
  const StatCard = ({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent?: string }) => (
    <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: "14px", padding: "20px 22px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ width: 44, height: 44, borderRadius: "12px", background: accent || "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.5rem", fontWeight: 500, color: "#0f172a", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 3, letterSpacing: "0.03em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fc", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .notif-scroll::-webkit-scrollbar { width: 4px; }
        .notif-scroll::-webkit-scrollbar-track { background: transparent; }
        .notif-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        .modal-scroll::-webkit-scrollbar { width: 4px; }
        .modal-scroll::-webkit-scrollbar-track { background: transparent; }
        .modal-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
      `}</style>

      {/* ════════════════════════ HEADER ═════════════════════════════════════ */}
      <header style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 62 }}>

          {/* Logo */}
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <img src="/Logo.png" alt="Rentora" style={{ height: 32, width: "auto" }} />
            <span style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#4f46e5", letterSpacing: "-0.02em" }}>Rentora</span>
          </Link>

          {/* Search bar
          <div style={{ flex: 1, maxWidth: 340, margin: "0 32px", position: "relative" }}>
            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#c4c9d4", pointerEvents: "none" }}>
              <IconSearch size={15} />
            </div>
            <input
              placeholder="Search properties, locations…"
              style={{ width: "100%", height: 36, paddingLeft: 36, paddingRight: 14, background: "#f8f9fc", border: "1px solid #ebebeb", borderRadius: 9, fontSize: "0.8125rem", color: "#334155", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
              readOnly
            />
          </div> */}

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

            {/* ── Notification Bell ── */}
            <div style={{ position: "relative" }}>
              <button
                onClick={e => { e.stopPropagation(); setShowNotifications(s => !s); setShowProfileMenu(false); }}
                style={{ position: "relative", width: 38, height: 38, borderRadius: "10px", border: "1px solid #ebebeb", background: showNotifications ? "#f0f0ff" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f0f0ff"; e.currentTarget.style.borderColor = "#c7d2fe"; e.currentTarget.style.color = "#4f46e5"; }}
                onMouseLeave={e => { if (!showNotifications) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#ebebeb"; e.currentTarget.style.color = "#64748b"; } }}
                aria-label="Notifications"
              >
                <IconBell />
                {unreadCount > 0 && (
                  <span style={{ position: "absolute", top: -3, right: -3, minWidth: 17, height: 17, background: "#ef4444", color: "#fff", fontSize: "0.6875rem", fontWeight: 700, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", lineHeight: 1 }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 55 }} onClick={() => setShowNotifications(false)} />
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 360, background: "#fff", border: "1px solid #ebebeb", borderRadius: 16, boxShadow: "0 20px 48px -8px rgba(0,0,0,0.14)", zIndex: 60, overflow: "hidden", animation: "fadeIn 0.18s ease" }}>
                    <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid #f4f4f5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "#0f172a" }}>Notifications</span>
                        {unreadCount > 0 && <span style={{ marginLeft: 8, fontSize: "0.6875rem", background: "#eef2ff", color: "#4f46e5", borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>{unreadCount} new</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} style={{ background: "none", border: "none", cursor: "pointer", color: "#4f46e5", fontSize: "0.75rem", fontWeight: 600, padding: "4px 8px", borderRadius: 6, transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "#f0f0ff"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                            Mark all read
                          </button>
                        )}
                        <button onClick={() => setShowNotifications(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 2 }}>
                          <IconX size={15} />
                        </button>
                      </div>
                    </div>
                    <div className="notif-scroll" style={{ maxHeight: 360, overflowY: "auto" }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: "40px 20px", textAlign: "center" }}>
                          <div style={{ color: "#c8d0e0", marginBottom: 12 }}><IconBell /></div>
                          <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>You're all caught up</p>
                        </div>
                      ) : (
                        <>
                          {notifications.map(n => (
                            <div key={n._id}
                              onClick={() => handleMarkRead(n._id)}
                              style={{ padding: "14px 20px", borderBottom: "1px solid #fafafa", background: n.isRead ? "#fff" : "#fafbff", cursor: "pointer", transition: "background 0.12s" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#f8f9fc"}
                              onMouseLeave={e => e.currentTarget.style.background = n.isRead ? "#fff" : "#fafbff"}
                            >
                              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                <IconDot read={n.isRead} />
                                <div style={{ flex: 1 }}>
                                  <p style={{ margin: "0 0 4px", fontSize: "0.8125rem", color: "#334155", fontWeight: n.isRead ? 400 : 600, lineHeight: 1.5 }}>{n.message}</p>
                                  <span style={{ fontSize: "0.75rem", color: "#b0b8c8" }}>{new Date(n.createdAt).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {/* Pagination removed from notifications per UX request */}
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ── Divider ── */}
            <div style={{ width: 1, height: 22, background: "#ebebeb" }} />

            {/* ── Profile Button ── */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { setShowProfileMenu(p => !p); setShowNotifications(false); }}
                style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 12px 5px 5px", borderRadius: "10px", border: "1px solid #ebebeb", background: showProfileMenu ? "#f8f9fc" : "#fff", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f8f9fc"; e.currentTarget.style.borderColor = "#d4d4d8"; }}
                onMouseLeave={e => { if (!showProfileMenu) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#ebebeb"; } }}
              >
                <img src={avatar} alt={name} style={{ width: 28, height: 28, borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#0f172a" }}>{name.split(" ")[0]}</span>
                <span style={{ color: "#b0b8c8" }}><IconChevronDown open={showProfileMenu} /></span>
              </button>

              {showProfileMenu && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 55 }} onClick={() => setShowProfileMenu(false)} />
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 220, background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", boxShadow: "0 16px 40px -8px rgba(0,0,0,0.12)", zIndex: 60, overflow: "hidden", animation: "fadeIn 0.15s ease" }}>
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid #f4f4f5", background: "#fafafa" }}>
                      <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#0f172a", margin: "0 0 2px" }}>{name}</p>
                      <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</p>
                    </div>
                    <div style={{ padding: 6 }}>
                      <Link href="/user/profile" onClick={() => setShowProfileMenu(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", fontSize: "0.8125rem", color: "#334155", textDecoration: "none", borderRadius: 8, transition: "background 0.12s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f4f4f5"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <IconUser size={14} /> My Profile
                      </Link>
                      <button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", fontSize: "0.8125rem", color: "#ef4444", background: "transparent", border: "none", cursor: "pointer", borderRadius: 8, textAlign: "left", fontFamily: "'DM Sans', sans-serif", transition: "background 0.12s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <IconLogout size={14} /> Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════ TAB NAV ════════════════════════════════════ */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 28px" }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 6px", background: "#fff", borderRadius: 12, flexWrap: "wrap" }}>
            {([
              { key: 'dashboard', label: 'Dashboard', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
              { key: 'properties', label: 'Properties', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
              { key: 'my-listings', label: 'My Listings', icon: <IconBuilding size={15} /> },
              { key: 'create', label: 'List Property', icon: <IconPlus size={15} /> },
              { key: 'messages', label: 'Messages', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
              { key: 'account', label: 'My Account', icon: <IconUser size={15} /> },
            ] as const).map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10, border: "none", background: isActive ? "#4f46e5" : "transparent", color: isActive ? "#fff" : "#64748b", fontSize: "0.875rem", fontWeight: isActive ? 600 : 500, cursor: "pointer", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap"
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#4f46e5"; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; } }}
                >
                  {tab.icon} {tab.label}
                </button>
              );
            })}


          </nav>
        </div>
      </div>

      {/* ════════════════════════ PAGE ═══════════════════════════════════════ */}
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 28px 80px" }}>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 20, padding: "12px 16px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, color: "#92400e", fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#d97706" }}><IconWarning size={15} /></span>{error}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <>
           
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, marginBottom: 32, alignItems: "start" }}>
            
              <div style={{ animation: "slideUp 0.4s ease both" }}>
                <p style={{ fontSize: "0.8125rem", color: "#94a3b8", margin: "0 0 4px", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>{greeting}</p>
                <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.04em", lineHeight: 1.15 }}>
                  {name.split(" ")[0]} <span style={{ fontWeight: 300, color: "#94a3b8" }}></span>
                </h1>
                <p style={{ fontSize: "0.9375rem", color: "#64748b", margin: 0, fontWeight: 400 }}>
                  Here's what's happening in your workspace today.
                </p>
              </div>

              {/* Action button */}
              <div style={{ display: "flex", gap: 10, paddingTop: 4, animation: "slideUp 0.4s 0.1s ease both", opacity: 0, animationFillMode: "forwards" }}>
                <button
                  onClick={() => setActiveTab('create')}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#4f46e5", color: "#fff", borderRadius: 10, border: "none", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "-0.01em", transition: "background 0.15s, transform 0.15s", boxShadow: "0 1px 2px rgba(79,70,229,0.2), 0 4px 12px rgba(79,70,229,0.14)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#4338ca"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#4f46e5"; e.currentTarget.style.transform = "none"; }}>
                  <IconPlus size={15} /> New listing
                </button>
              </div>
            </div>

            {/* ── Stats Row ────────────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 40 }}>
              <StatCard label="My listings" value={myProperties.length} icon={<IconBuilding size={19} />} />
              <StatCard label="Available now" value={allProperties.filter(p => p.status === "available").length} icon={<IconTrend size={19} />} accent="#f0fdf4" />
              <StatCard label="Total market" value={allProperties.length} icon={<IconSearch size={18} />} accent="#fff7ed" />
              <StatCard label="Unread alerts" value={unreadCount} icon={<IconBell />} accent={unreadCount > 0 ? "#fef2f2" : "#eef2ff"} />
            </div>

            {/* ── Explore Properties (preview) ─────────────────────────────────── */}
            <section style={{ marginBottom: 52 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", margin: "0 0 3px", letterSpacing: "-0.02em" }}>Explore Rentals</h2>
                  <p style={{ fontSize: "0.8125rem", color: "#94a3b8", margin: 0 }}>Browse all available properties on the platform</p>
                </div>
                {allProperties.length > 6 && (
                  <button
                    onClick={() => setActiveTab('properties')}
                    style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#4f46e5", background: "transparent", border: "1px solid #c7d2fe", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8, transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#eef2ff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    View all <IconArrow size={12} />
                  </button>
                )}
              </div>

              {allProperties.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(285px, 1fr))", gap: 16 }}>
                  {allProperties.slice(0, 6).map(p => (
                    <PropertyCard key={p._id} property={p as PropertyWithOwner} onClick={() => handleViewProperty(p._id)} />
                  ))}
                </div>
              ) : (
                <EmptyState icon={<IconSearch size={36} />} headline="No properties yet" sub="Listings will appear here when added." />
              )}
            </section>

      
          </>
        )}

        {/* ══════════════════════ PROPERTIES TAB ═════════════════════════════ */}
        {activeTab === 'properties' && (
          <>
            <div style={{ marginBottom: 28, animation: "slideUp 0.35s ease" }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.03em" }}>All Properties</h1>
              <p style={{ fontSize: "0.9375rem", color: "#64748b", margin: 0 }}>Browse {filteredProperties.length} available listings</p>
            </div>

            {/* Search/filter bar */}
            <div style={{ marginBottom: 24, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 240, position: "relative" }}>
                <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}><IconSearch size={16} /></div>
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by title, location…" style={{ width: "100%", padding: "11px 14px 11px 42px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: "0.875rem", outline: "none", fontFamily: "'DM Sans', sans-serif", color: "#334155" }} />
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="Min price" type="number" style={{ width: 100, padding: "11px 14px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: "0.875rem", outline: "none", fontFamily: "'DM Sans', sans-serif", color: "#334155" }} />
                <span style={{ color: "#64748b", fontSize: "0.875rem" }}>to</span>
                <input value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="Max price" type="number" style={{ width: 100, padding: "11px 14px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: "0.875rem", outline: "none", fontFamily: "'DM Sans', sans-serif", color: "#334155" }} />
              </div>
            </div>

            {filteredProperties.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(285px, 1fr))", gap: 18 }}>
                {filteredProperties.map(p => (
                  <PropertyCard key={p._id} property={p as PropertyWithOwner} onClick={() => handleViewProperty(p._id)} />
                ))}
              </div>
            ) : (
              <EmptyState icon={<IconSearch size={36} />} headline="No properties found" sub="Try adjusting your search terms." />
            )}
          </>
        )}

        {/* ══════════════════════ MY LISTINGS TAB ═══════════════════════════ */}
        {activeTab === 'my-listings' && (
          <>
            <div style={{ marginBottom: 28, animation: "slideUp 0.35s ease" }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.03em" }}>My Listings</h1>
              <p style={{ fontSize: "0.9375rem", color: "#64748b", margin: 0 }}>Manage the properties you listed for rent</p>
            </div>

            {myProperties.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(285px, 1fr))", gap: 18 }}>
                {myProperties.map(p => (
                  <PropertyCard
                    key={p._id}
                    property={p as PropertyWithOwner}
                    showStatus
                    showManagementActions
                    onClick={() => handleViewProperty(p._id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<IconHome size={36} />}
                headline="No listings yet"
                sub="List your first property to get started."
                action={
                  <button
                    onClick={() => setActiveTab('create')}
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 16, padding: "9px 18px", background: "#4f46e5", color: "#fff", borderRadius: 9, border: "none", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#4338ca"}
                    onMouseLeave={e => e.currentTarget.style.background = "#4f46e5"}>
                    <IconPlus size={14} /> Add property
                  </button>
                }
              />
            )}
          </>
        )}

        {/* ══════════════════════ CREATE TAB ═════════════════════════════════ */}
        {activeTab === 'create' && (
          <div style={{ animation: "slideUp 0.35s ease" }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.03em" }}>List a Property</h1>
              <p style={{ fontSize: "0.9375rem", color: "#64748b", margin: 0 }}>Add your property to the marketplace</p>
            </div>

            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 32, maxWidth: 600 }}>
              <p style={{ fontSize: "0.9375rem", color: "#64748b", margin: "0 0 20px", lineHeight: 1.6 }}>
                To list a new property, you'll be redirected to the full property creation form where you can add all details, images, and pricing.
              </p>
              <Link
                href="/property/create"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "#4f46e5", color: "#fff", borderRadius: 10, textDecoration: "none", fontSize: "0.9375rem", fontWeight: 600, transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#4338ca"}
                onMouseLeave={e => e.currentTarget.style.background = "#4f46e5"}>
                <IconPlus size={16} /> Create Property Listing
              </Link>
            </div>
          </div>
        )}

        {/* ══════════════════════ MESSAGES TAB ═══════════════════════════════ */}
        {activeTab === 'messages' && (
          <div style={{ animation: "slideUp 0.35s ease" }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.03em" }}>Messages</h1>
              <p style={{ fontSize: "0.9375rem", color: "#64748b", margin: 0 }}>Your conversations with property owners and tenants</p>
            </div>

            <EmptyState
              icon={<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
              headline="No messages yet"
              sub="Conversations will appear here when you start chatting."
            />
          </div>
        )}

        {/* ══════════════════════ ACCOUNT TAB ════════════════════════════════ */}
        {activeTab === 'account' && (
          <div style={{ animation: "slideUp 0.35s ease" }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.03em" }}>My Account</h1>
              <p style={{ fontSize: "0.9375rem", color: "#64748b", margin: 0 }}>Manage your profile and settings</p>
            </div>

            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", maxWidth: 480 }}>
              {/* Profile header */}
              <div style={{ padding: 28, borderBottom: "1px solid #f4f4f5", display: "flex", alignItems: "center", gap: 18 }}>
                <img src={avatar} alt={name} style={{ width: 64, height: 64, borderRadius: 14, objectFit: "cover", border: "2px solid #e2e8f0" }} />
                <div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>{name}</h2>
                  <p style={{ fontSize: "0.875rem", color: "#94a3b8", margin: 0 }}>{email}</p>
                </div>
              </div>

              {/* Account info */}
              <div style={{ padding: "20px 28px" }}>
                {[
                  ["Username", user?.username || "—"],
                  ["Role", user?.role || "user"],
                  ["Properties Listed", myProperties.length.toString()],
                ].map(([k, v], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 2 ? "1px solid #f4f4f5" : "none" }}>
                    <span style={{ fontSize: "0.875rem", color: "#64748b" }}>{k}</span>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a", textTransform: "capitalize" }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ padding: "16px 28px 24px", display: "flex", gap: 12 }}>
                <Link
                  href="/user/profile"
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 16px", background: "#4f46e5", color: "#fff", borderRadius: 10, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600, transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#4338ca"}
                  onMouseLeave={e => e.currentTarget.style.background = "#4f46e5"}>
                  <IconUser size={15} /> Edit Profile
                </Link>
                <button
                  onClick={onLogout}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 16px", background: "#fef2f2", color: "#ef4444", borderRadius: 10, border: "1px solid #fecaca", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fef2f2"}>
                  <IconLogout size={15} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {showPropertyModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}
          onClick={() => setShowPropertyModal(false)}
        >
          <div
            style={{ background: "#fff", borderRadius: 18, maxWidth: 860, width: "100%", maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 64px -12px rgba(0,0,0,0.28)", overflow: "hidden", animation: "slideUp 0.22s ease" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ padding: "22px 28px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div>
                <h2 style={{ margin: "0 0 3px", fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
                  {loadingProperty ? "Loading…" : selectedProperty?.title || "Property Details"}
                </h2>
                {!loadingProperty && selectedProperty && (
                  <p style={{ margin: 0, fontSize: "0.8125rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: 5 }}>
                    <IconMapPin color="#ef4444" size={13} />{selectedProperty.location}
                  </p>
                )}
              </div>
              <button onClick={() => setShowPropertyModal(false)} style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid #ebebeb", background: "#fafafa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f4f4f5"; e.currentTarget.style.color = "#0f172a"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.color = "#64748b"; }}>
                <IconX size={15} />
              </button>
            </div>

            {/* Modal body */}
            <div className="modal-scroll" style={{ padding: "28px", overflowY: "auto", flex: 1 }}>
              {loadingProperty ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ width: 36, height: 36, border: "2px solid #e2e8f0", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 14px" }} />
                  <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>Loading property…</p>
                </div>
              ) : selectedProperty ? (
                <div>
                  {/* Images */}
                  {selectedProperty.images?.length > 0 && (
                    <div style={{ marginBottom: 28 }}>
                      <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 12px" }}>Gallery · {selectedProperty.images.length} photos</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                        {selectedProperty.images.map((img: string, i: number) => {
                          const url = getPropertyImageUrl(img);
                          return url ? (
                            <div key={i} style={{ borderRadius: 12, overflow: "hidden", height: 180, position: "relative", background: "#f8f9fc" }}>
                              <img src={url} alt={`Photo ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                              <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: "0.6875rem", padding: "3px 8px", borderRadius: 20, fontFamily: "'DM Mono', monospace" }}>{i + 1}</div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Details grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                    {/* Left */}
                    <div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 12px" }}>Property Details</p>
                      <div style={{ background: "#fafafa", borderRadius: 12, border: "1px solid #f0f0f0", overflow: "hidden" }}>
                        {[
                          ["Price", <span style={{ fontFamily: "'DM Mono', monospace", color: "#4f46e5", fontWeight: 500 }}>${selectedProperty.price.toLocaleString()}/mo</span>],
                          ["Status", <span style={{ textTransform: "capitalize" }}>{selectedProperty.status || "—"}</span>],
                          ["Bedrooms", (selectedProperty as any).bedrooms || "—"],
                          ["Bathrooms", (selectedProperty as any).bathrooms || "—"],
                          ["Location", selectedProperty.location],
                        ].map(([k, v], i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: i < 4 ? "1px solid #f0f0f0" : "none" }}>
                            <span style={{ fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 500 }}>{k as string}</span>
                            <span style={{ fontSize: "0.8125rem", color: "#334155", fontWeight: 500 }}>{v as React.ReactNode}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <div>
                        <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 12px" }}>Description</p>
                        <div style={{ background: "#fafafa", borderRadius: 12, border: "1px solid #f0f0f0", padding: "14px 16px" }}>
                          <p style={{ fontSize: "0.8125rem", color: "#4b5563", lineHeight: 1.65, margin: 0 }}>
                            {selectedProperty.description || "No description provided."}
                          </p>
                        </div>
                      </div>

                      {selectedProperty.owner && (
                        <div>
                          <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 12px" }}>Listed by</p>
                          <div style={{ background: "#fafafa", borderRadius: 12, border: "1px solid #f0f0f0", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#4f46e5", fontSize: "0.9375rem", flexShrink: 0, fontFamily: "'DM Mono', monospace" }}>
                              {(selectedProperty.owner.name || "O").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: "0.875rem", color: "#0f172a" }}>{selectedProperty.owner.name || "Owner"}</p>
                              <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{selectedProperty.owner.email || "—"}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                    {canBookSelectedProperty && (
                      <button
                        type="button"
                        onClick={() => void handleBookProperty(selectedProperty._id)}
                        disabled={isBooking}
                        style={{
                          padding: "10px 18px",
                          borderRadius: 10,
                          border: "none",
                          background: isBooking ? "#a5b4fc" : "#4f46e5",
                          color: "#fff",
                          fontWeight: 600,
                          cursor: isBooking ? "not-allowed" : "pointer",
                          fontFamily: "'DM Sans', sans-serif"
                        }}
                      >
                        {isBooking ? 'Booking...' : 'Book this property'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <p style={{ color: "#94a3b8" }}>Property not found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Empty State Helper ─────────────────────────────────────────────────────
function EmptyState({ icon, headline, sub, action }: { icon: React.ReactNode; headline: string; sub: string; action?: React.ReactNode }) {
  return (
    <div style={{ border: "1.5px dashed #e2e8f0", borderRadius: 16, padding: "52px 24px", textAlign: "center", background: "#fafafa" }}>
      <div style={{ color: "#c8d0e0", marginBottom: 14, display: "flex", justifyContent: "center" }}>{icon}</div>
      <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#64748b", margin: "0 0 4px" }}>{headline}</p>
      <p style={{ fontSize: "0.8125rem", color: "#b0bcc8", margin: 0 }}>{sub}</p>
      {action}
    </div>
  );
}