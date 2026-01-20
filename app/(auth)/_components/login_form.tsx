"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginData } from "../schema";
import { handleLogin } from "@/lib/actions/auth-actions";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      console.log("Submitting login form:", data);
      const result = await handleLogin(data);
      console.log("Login result:", result);
      
      if (result.success) {
        router.push("/dashboard");
      } else {
        const errorMsg = result.message || "Login failed";
        console.log("Login failed:", errorMsg);
        setErrorMessage(errorMsg);
      }
    } catch (error: any) {
      console.error("Login catch error:", error);
      const errorMsg = error.message || "An error occurred";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-right">
      <h1>Welcome to Rentora</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        {errorMessage && (
          <div className="error-text" style={{ marginBottom: "1rem" }}>
            {errorMessage}
          </div>
        )}
        
        {/* Email */}
        <div className="form-row">
          <label>Email</label>
          <div className="field">
            <input
              type="email"
              placeholder="Enter your email"
              {...register("email")}
            />
            {errors.email && (
              <p className="error-text">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="form-row">
          <label>Password</label>
          <div className="field">
            <input
              type="password"
              placeholder="Enter your password"
              {...register("password")}
            />
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}
          </div>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="signup-text">
        Don’t have an account? <Link href="/register">Sign Up</Link>
      </p>
    </div>
  );
}
