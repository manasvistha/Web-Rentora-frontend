"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginData } from "../schema";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginData) => {
    console.log("Login Data:", data);
  };

  return (
    <div className="login-right">
      <h1>Welcome to Rentora</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <div>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            {...register("email")}
          />
          {errors.email && (
            <p style={{ color: "red", fontSize: "12px" }}>
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            {...register("password")}
          />
          {errors.password && (
            <p style={{ color: "red", fontSize: "12px" }}>
              {errors.password.message}
            </p>
          )}
        </div>

        <button type="submit">Login</button>
      </form>

      <p className="signup-text">
        Don’t have an account? <Link href="/register">Sign Up</Link>
      </p>
    </div>
  );
}
