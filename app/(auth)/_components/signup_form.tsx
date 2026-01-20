"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterData } from "@/lib/authSchema";
import { handleRegister } from "@/lib/actions/auth-actions";
import { useState } from "react";

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      console.log("Submitting registration form:", data);
      // Call server action with form data
      const result = await handleRegister(data);
      console.log("Registration result:", result);

      if (result.success) {
        // Cookies are automatically set on server
        router.push("/dashboard");
      } else {
        const errorMsg = result.message || "Registration failed";
        console.log("Registration failed:", errorMsg);
        setErrorMessage(errorMsg);
      }
    } catch (error: any) {
      console.error("Registration catch error:", error);
      const errorMsg = error.message || "An error occurred";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-right">
      <h1>Sign Up</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        {errorMessage && (
          <div className="error-text" style={{ marginBottom: "1rem", color: "red" }}>
            {errorMessage}
          </div>
        )}

        {/* Full Name */}
        <div className="form-row">
          <label>Full Name</label>
          <div className="field">
            <input
              type="text"
              placeholder="Enter your full name"
              {...register("name")}
            />
            {errors.name && (
              <p className="error-text">{errors.name.message}</p>
            )}
          </div>
        </div>

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

        {/* Confirm Password */}
        <div className="form-row">
          <label>Confirm Password</label>
          <div className="field">
            <input
              type="password"
              placeholder="Confirm your password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="error-text">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="signup-text">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
