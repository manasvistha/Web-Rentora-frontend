"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginData } from "../schema";
import { handleLogin } from "@/lib/actions/auth-actions";
import { useState } from "react";
import styles from "./login_form.module.css";
import z from "zod";
import { requestPasswordReset } from "@/lib/api/auth";
import { toast } from "react-toastify";

const RequestPasswordResetSchema = z.object({
    email: z.email()
});

type RequestPasswordResetDTO = z.infer<typeof RequestPasswordResetSchema>;

export default function LoginForm() {43433
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const forgotPasswordForm = useForm<RequestPasswordResetDTO>({
    resolver: zodResolver(RequestPasswordResetSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      console.log("Submitting login form:", data);
      const result = await handleLogin(data);
      console.log("Login result:", result);
      
      if (result.success) {
        const role = result?.data?.role;
        if (role === "admin") {
          router.push("/admin/users");
        } else {
          router.push("/dashboard");
        }
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

  const onForgotPasswordSubmit = async (data: RequestPasswordResetDTO) => {
    try {
      const response = await requestPasswordReset(data.email);
      if (response.success) {
        toast.success('Password reset link sent to your email.');
        setShowForgotPassword(false);
      } else {
        toast.error(response.message || 'Failed to request password reset.');
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to request password reset.');
    }
  };

  return (
    <div className="login-right">
      <div className={styles.switchContainer}>
        <span className={styles.switchLabel}>User</span>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
          <span className={styles.slider}></span>
        </label>
        <span className={styles.switchLabel}>Admin</span>
      </div>

      <div className="login-box" style={{ position: 'relative' }}>
        <h1>{showForgotPassword ? "Reset Password" : "Welcome to Rentora"}</h1>

        {!showForgotPassword && (
          <button 
            onClick={() => setShowForgotPassword(true)} 
            className="text-teal-500 hover:underline text-sm"
            style={{ 
              position: 'absolute', 
              bottom: '45px', 
              right: '10px', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Forgot Password?
          </button>
        )}

        {!showForgotPassword ? (
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

            <button 
              type="submit" 
              disabled={isLoading} 
              style={{ 
                marginTop: "8px",
                backgroundColor: "teal",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500"
              }}
            >
              {isLoading ? "Logging in..." : isAdmin ? "Login as Admin" : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="login-form">
            <div className="form-row">
              <label>Email</label>
              <div className="field">
                <input
                  type="email"
                  placeholder="Enter your email"
                  {...forgotPasswordForm.register("email")}
                />
                {forgotPasswordForm.formState.errors.email && (
                  <p className="error-text">{forgotPasswordForm.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <button type="submit" disabled={forgotPasswordForm.formState.isSubmitting} style={{ marginTop: "8px" }}>
              {forgotPasswordForm.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="signup-text">
          {!showForgotPassword ? (
            <>
              Don't have an account? <Link href="/register">Sign Up</Link>
            </>
          ) : (
            <button 
              onClick={() => setShowForgotPassword(false)} 
              className="text-teal-500 hover:underline"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Remember your password? Login
            </button>
          )}
        </p>
      </div>
    </div>
  );
}