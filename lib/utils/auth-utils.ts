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

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  const user = getCurrentUser();
  const token = getAuthToken();
  return !!(user && token);
}
