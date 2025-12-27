"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginData } from "../schema";

export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginData) => {
    console.log("Login Data:", data);
    alert("Login successful!");
    router.push("/dashboard");
  };

  return (
    <div className="login-right">
      <h1>Welcome to Rentora</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
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

        <button type="submit">Login</button>
      </form>

      <p className="signup-text">
        Don’t have an account? <Link href="/register">Sign Up</Link>
      </p>
    </div>
  );
}
