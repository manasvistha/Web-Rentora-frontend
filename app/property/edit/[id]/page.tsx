"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProperty, updateProperty } from "@/lib/api/property";

export default function EditPropertyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("id") || "";
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    availabilityStart: "",
    availabilityEnd: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const data = await getProperty(propertyId);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          location: data.location || "",
          price: data.price?.toString() || "",
          bedrooms: data.bedrooms?.toString() || "",
          bathrooms: data.bathrooms?.toString() || "",
          availabilityStart: data.availability?.[0]?.startDate || "",
          availabilityEnd: data.availability?.[0]?.endDate || "",
        });
      } catch (err) {
        setError("Failed to load property");
      } finally {
        setLoading(false);
      }
    };
    if (propertyId) fetchProperty();
  }, [propertyId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await updateProperty(propertyId, {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        price: Number(formData.price),
        availability: [{
          startDate: formData.availabilityStart,
          endDate: formData.availabilityEnd,
        }],
      });
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to update property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h1>Edit Property</h1>
          {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
            <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Title" required style={{ width: "100%", marginBottom: 12 }} />
            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" required style={{ width: "100%", marginBottom: 12 }} />
            <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Location" required style={{ width: "100%", marginBottom: 12 }} />
            <input name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="Price" required style={{ width: "100%", marginBottom: 12 }} />
            <input name="bedrooms" type="number" value={formData.bedrooms} onChange={handleInputChange} placeholder="Bedrooms" style={{ width: "100%", marginBottom: 12 }} />
            <input name="bathrooms" type="number" value={formData.bathrooms} onChange={handleInputChange} placeholder="Bathrooms" style={{ width: "100%", marginBottom: 12 }} />
            <input name="availabilityStart" type="date" value={formData.availabilityStart} onChange={handleInputChange} required style={{ width: "100%", marginBottom: 12 }} />
            <input name="availabilityEnd" type="date" value={formData.availabilityEnd} onChange={handleInputChange} required style={{ width: "100%", marginBottom: 12 }} />
            <button type="submit" disabled={loading} style={{ background: "#4f46e5", color: "#fff", padding: 12, borderRadius: 6, border: "none", width: "100%" }}>{loading ? "Saving..." : "Save Changes"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
