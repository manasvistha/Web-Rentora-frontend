"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, getPropertyImageUrl } from "@/lib/utils/auth-utils";
import { getProperty, Property } from "@/lib/api/property";
import { createBooking } from "@/lib/api/booking";
import { checkIfFavorite, addFavorite, removeFavorite } from "@/lib/api/favorite";
import Link from "next/link";

// Icons (same as dashboard)
const IconMapPin = ({ color = "currentColor", size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
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
const IconArrowLeft = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);
const IconHeart = ({ size = 16, filled = false }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconShare = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
  </svg>
);

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const propertyId = params.id as string;

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchProperty = async () => {
      try {
        const prop = await getProperty(propertyId);
        setProperty(prop);
        
        // Check if this property is in user's favorites
        const isFav = await checkIfFavorite(propertyId);
        setIsFavorite(isFav);
      } catch (err) {
        setError("Property not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, router]);

  const handleBookProperty = async () => {
    if (!property) return;
    setIsBooking(true);
    try {
      await createBooking({ propertyId: property._id });
      alert("Booking request sent successfully!");
      // Optionally refresh or redirect
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || "Failed to book property");
    } finally {
      setIsBooking(false);
    }
  };

  const nextImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFavorite(propertyId);
        setIsFavorite(false);
      } else {
        await addFavorite(propertyId);
        setIsFavorite(true);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to update favorite");
    }
  };

  const canBook = property && property.status === "available" && property.owner?._id !== getCurrentUser()?.id;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fc", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Loading property...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fc", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#ef4444", fontSize: "1rem", marginBottom: 16 }}>{error || "Property not found"}</p>
          <Link href="/dashboard" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 600 }}>← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fc", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .image-carousel { position: relative; overflow: hidden; border-radius: 16px; height: 400px; }
        .image-stack { display: flex; transition: transform 0.3s ease; }
        .image-slide { min-width: 100%; height: 100%; background-size: cover; background-position: center; }
        .nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .nav-btn:hover { backhandleToggleFavorite} style={{ border: "none", background: "none", cursor: "pointer", color: isFavorite ? "#ef4444" : "#64748b", padding: "4px" }}>
              <IconHeart size={20} filled={isFavorite} />
            </button>
            <button style={{ border: "none", background: "none", cursor: "pointer", color: "#64748b", padding: "4px
      `}</style>

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "16px 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#0f172a" }}>
            <IconArrowLeft size={18} />
            <span style={{ fontWeight: 600 }}>Back</span>
          </Link>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={handleToggleFavorite} style={{ border: "none", background: "none", cursor: "pointer", color: isFavorite ? "#ef4444" : "#64748b" }}>
              <IconHeart size={20} filled={isFavorite} />
            </button>
            <button style={{ border: "none", background: "none", cursor: "pointer", color: "#64748b" }}>
              <IconShare size={20} />
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 28px" }}>
        {/* Image Carousel */}
        <div className="image-carousel">
          <div className="image-stack" style={{ transform: `translateX(-${currentImageIndex * 100}%)`, width: `${(property.images?.length || 1) * 100}%` }}>
            {property.images?.length ? property.images.map((img, index) => {
              const imageUrl = getPropertyImageUrl(img);
              return (
                <div key={index} className="image-slide" style={{ backgroundImage: `url('${imageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              );
            }) : (
              <div className="image-slide" style={{ background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '1rem' }}>No images</div>
            )}
          </div>
          {property.images && property.images.length > 1 && (
            <>
              <button className="nav-btn" style={{ left: 16 }} onClick={prevImage}>
                ‹
              </button>
              <button className="nav-btn" style={{ right: 16 }} onClick={nextImage}>
                ›
              </button>
              <div className="dots">
                {property.images.map((_, index) => (
                  <div key={index} className={`dot ${index === currentImageIndex ? 'active' : ''}`} onClick={() => setCurrentImageIndex(index)} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Property Info */}
        <div style={{ marginTop: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>{property.title}</h1>
              <p style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: "1rem", margin: 0 }}>
                <IconMapPin color="#ef4444" size={16} />
                {property.location}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "2rem", fontWeight: 700, color: "#4f46e5", margin: "0 0 4px", fontFamily: "'DM Mono', monospace" }}>${property.price.toLocaleString()}</p>
              <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>/month</p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconBed size={18} />
              <span style={{ fontWeight: 600 }}>{(property as any).bedrooms || 0} beds</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconBath size={18} />
              <span style={{ fontWeight: 600 }}>{(property as any).bathrooms || 0} baths</span>
            </div>
            <div style={{ padding: "4px 12px", background: property.status === "available" ? "#dcfce7" : "#fef3c7", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, color: property.status === "available" ? "#15803d" : "#92400e", textTransform: "capitalize" }}>
              {property.status}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#0f172a", margin: "0 0 16px" }}>Description</h2>
            <p style={{ fontSize: "1rem", color: "#4b5563", lineHeight: 1.6, margin: 0 }}>
              {property.description || "No description provided."}
            </p>
          </div>

          {/* Owner Info */}
          {property.owner && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#0f172a", margin: "0 0 16px" }}>Listed by</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px", background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#4f46e5", fontSize: "1.125rem" }}>
                  {property.owner.name?.charAt(0).toUpperCase() || "O"}
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: "#0f172a", margin: "0 0 4px" }}>{property.owner.name || "Owner"}</p>
                  <p style={{ color: "#64748b", margin: 0 }}>{property.owner.email || "—"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Book Button */}
          {canBook && (
            <div style={{ 
              position: "fixed", 
              bottom: 0, left: 0, right: 0, 
              background: "linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.8))",
              padding: "20px 28px",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "center",
              zIndex: 100
            }}>
              <div style={{ maxWidth: 1200, width: "100%" }}>
                <button
                  onClick={handleBookProperty}
                  disabled={isBooking}
                  style={{
                    width: "100%",
                    padding: "16px 32px",
                    borderRadius: 12,
                    border: "none",
                    background: isBooking ? "#a5b4fc" : "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                    color: "#fff",
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    cursor: isBooking ? "not-allowed" : "pointer",
                    boxShadow: isBooking ? "0 2px 8px rgba(0,0,0,0.1)" : "0 8px 24px rgba(79, 70, 229, 0.4)",
                    transition: "all 0.3s ease",
                    letterSpacing: "-0.01em",
                    textTransform: "uppercase",
                    transform: isBooking ? "scale(0.98)" : "scale(1)",
                  }}
                  onMouseEnter={e => {
                    if (!isBooking) {
                      e.currentTarget.style.boxShadow = "0 12px 32px rgba(79, 70, 229, 0.5)";
                      e.currentTarget.style.transform = "scale(1.02)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isBooking) {
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(79, 70, 229, 0.4)";
                      e.currentTarget.style.transform = "scale(1)";
                    }
                  }}
                >
                  {isBooking ? "⏳ Booking..." : "💫 Book this Property"}
                </button>
              </div>
            </div>
          )}
        </div>
        {canBook && <div style={{ height: 100 }} />}
      </div>
    </div>
  );
}