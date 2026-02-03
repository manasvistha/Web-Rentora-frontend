// Utility functions for authentication
"use client";

/**
 * Get current user from cookies (client-side only)
 */
export function getCurrentUser() {
  if (typeof window === "undefined") return null;

  try {
    const userDataCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_data="));

    if (!userDataCookie) return null;

    const userData = decodeURIComponent(userDataCookie.split("=")[1]);
    return JSON.parse(userData);
  } catch (error) {
    console.error("Error getting user from cookies:", error);
    return null;
  }
}

/**
 * Get auth token from cookies (client-side only)
 */
export function getAuthToken() {
  if (typeof window === "undefined") return null;

  try {
    const tokenCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="));

    if (!tokenCookie) return null;

    return tokenCookie.split("=")[1];
  } catch (error) {
    console.error("Error getting token from cookies:", error);
    return null;
  }
}

export function getUserData() {
  return getCurrentUser();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  const user = getCurrentUser();
  const token = getAuthToken();
  return !!(user && token);
}
/**
 * Construct full image URL from relative path or profile picture string
 * Backend stores profile picture as /public/profile-pictures/filename.jpg
 * This function converts it to a full URL usable in img src
 */
export function getImageUrl(profilePicture: string | null | undefined): string | null {
  if (!profilePicture) return null;
  
  // If it's already a full URL, return as is
  if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
    return profilePicture;
  }
  
  // Get the API base URL from environment
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  
  // Remove leading slash if present and append to base URL
  const path = profilePicture.startsWith('/') ? profilePicture : `/${profilePicture}`;
  
  return `${baseUrl}${path}`;
}