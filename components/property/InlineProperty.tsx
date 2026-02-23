"use client";

import Link from "next/link";
import React from "react";
import { getPropertyImageUrl } from "@/lib/utils/auth-utils";

type Props = {
  property: any;
  onClick?: (id: string) => void;
};

function resolveImage(img: any) {
  if (!img) return null;
  if (typeof img === 'string') return getPropertyImageUrl(img);
  if (img.url) return getPropertyImageUrl(img.url);
  if (img.path) return getPropertyImageUrl(img.path);
  if (img.filename) return getPropertyImageUrl(img.filename);
  if (img.originalname) return getPropertyImageUrl(img.originalname);
  if (img.name) return getPropertyImageUrl(img.name);
  return null;
}

export default function InlineProperty({ property, onClick }: Props) {
  if (!property) return <span>Property</span>;
  const firstImage = property.images && property.images.length ? property.images[0] : null;
  const imgUrl = resolveImage(firstImage);
  console.log("InlineProperty: resolved image url ->", imgUrl, { firstImage, propertyId: property._id });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick && property._id) onClick(property._id);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick ? handleClick : undefined}>
      <div style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden", background: "#f3f4f6", flex: "0 0 56px" }}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={property.title || "Property"}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={(e) => { 
              console.error("Failed to load property image:", imgUrl, e);
              (e.currentTarget as HTMLImageElement).style.display = "none"; 
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏠</div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <Link href={`/property/${property._id}`} style={{ color: "#0f172a", fontWeight: 700, textDecoration: "none" }}>
          {property.title || "Property"}
        </Link>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
          {property.location ? <span style={{ marginRight: 8 }}>{property.location}</span> : null}
          {typeof property.price === "number" ? <span>${Number(property.price).toLocaleString()}/month</span> : null}
        </div>
      </div>
    </div>
  );
}
