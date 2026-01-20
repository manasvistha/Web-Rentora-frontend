// server side processing of authentication actions
"use server";
import { register, login } from "../api/auth";
import { cookies } from "next/headers";

export const handleRegister = async (formData: any) => {
    try {
        // Transform data to match backend API expectations
        const registerData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            confirmPass: formData.confirmPassword || formData.password // Backend expects 'confirmPass'
        };
        
        // Call API to register user
        const result = await register(registerData);

        console.log("Register result:", result);
        console.log("Result type:", typeof result);
        console.log("Result keys:", Object.keys(result || {}));

        // Check if the response indicates success
        // Backend might return just data without explicit success field
        if (result && (result.success || result.token || result.data || result.id || Object.keys(result).length > 0)) {
            // Set cookies to store authentication data
            const cookieStore = await cookies();
            
            // Store auth token (httpOnly for security)
            if (result.token) {
                cookieStore.set('auth_token', result.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7 // 7 days
                });
            }

            // Store user data (non-httpOnly for client access if needed)
            if (result.data) {
                cookieStore.set('user_data', JSON.stringify(result.data), {
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7 // 7 days
                });
            }

            return {
                success: true,
                message: "Registration successful",
                data: result.data || result
            };
        }

        return {
            success: false,
            message: result?.message || "Registration failed"
        };
    } catch (err: Error | any) {
        console.error("Registration error:", err);
        console.error("Registration error details:", {
            message: err.message,
            status: err.status,
            data: err.data
        });
        
        const errorMessage = err.message || err?.data?.message || "Registration failed";
        
        return {
            success: false,
            message: errorMessage
        };
    }
};

export const handleLogin = async (formData: any) => {
    try {
        // Call API to login user
        const result = await login(formData);

        console.log("Login result:", result);
        console.log("Result type:", typeof result);
        console.log("Result keys:", Object.keys(result || {}));

        // Check if the response indicates success
        // Backend might return just data without explicit success field
        if (result && (result.success || result.token || result.data || result.id || Object.keys(result).length > 0)) {
            // Set cookies to store authentication data
            const cookieStore = await cookies();
            
            // Store auth token (httpOnly for security)
            if (result.token) {
                cookieStore.set('auth_token', result.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7 // 7 days
                });
            }

            // Store user data (non-httpOnly for client access if needed)
            if (result.data) {
                cookieStore.set('user_data', JSON.stringify(result.data), {
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7 // 7 days
                });
            }

            return {
                success: true,
                message: "Login successful",
                data: result.data || result
            };
        }

        return {
            success: false,
            message: result?.message || "Login failed"
        };
    } catch (err: Error | any) {
        console.error("Login error:", err);
        console.error("Login error details:", {
            message: err.message,
            status: err.status,
            data: err.data
        });
        
        const errorMessage = err.message || err?.data?.message || "Login failed";
        
        return {
            success: false,
            message: errorMessage
        };
    }
};

export const handleLogout = async () => {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('auth_token');
        cookieStore.delete('user_data');
        return {
            success: true,
            message: "Logged out successfully"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Logout failed"
        };
    }
};