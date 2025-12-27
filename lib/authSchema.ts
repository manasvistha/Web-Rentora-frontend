import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email must include @"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginData = z.infer<typeof loginSchema>;
export const signupSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Email must include @"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignupData = z.infer<typeof signupSchema>;
