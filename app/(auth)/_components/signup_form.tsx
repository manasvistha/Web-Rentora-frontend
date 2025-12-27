"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupData } from "@/lib/authSchema";

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: SignupData) => {
    console.log("Signup Data:", data);
  };

  return (
    <div className="login-right">
      <h1>Sign Up</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
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

        <button type="submit">Create Account</button>
      </form>

      <p className="signup-text">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
