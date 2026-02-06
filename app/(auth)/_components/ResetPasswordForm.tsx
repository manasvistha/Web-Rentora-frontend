"use client";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/lib/api/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ResetPasswordSchema = z.object({
    newPassword: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must be less than 100 characters"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;

interface ResetPasswordFormProps {
    token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordDTO>({
        resolver: zodResolver(ResetPasswordSchema)
    });

    const onSubmit = async (data: ResetPasswordDTO) => {
        if (!token) {
            toast.error('Invalid or missing reset token');
            return;
        }

        try {
            const response = await resetPassword(token, data.newPassword);
            if (response.success) {
                toast.success('Password has been reset successfully! Please login with your new password.');
                router.push('/login');
            } else {
                toast.error(response.message || 'Failed to reset password');
            }
        } catch (error) {
            toast.error((error as Error).message || 'Failed to reset password');
        }
    };

    if (!token) {
        return (
            <div className="reset-password-container">
                <div className="reset-password-box">
                    <h1>Invalid Reset Link</h1>
                    <p>The password reset link is invalid or has expired.</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="reset-password-btn"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-password-container">
            <div className="reset-password-box">
                <h1>Reset Your Password</h1>
                <p>Enter your new password below.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="reset-password-form">
                    {/* New Password */}
                    <div className="form-row">
                        <label>New Password</label>
                        <div className="field">
                            <input
                                type="password"
                                placeholder="Enter your new password"
                                {...register("newPassword")}
                            />
                            {errors.newPassword && (
                                <p className="error-text">{errors.newPassword.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="form-row">
                        <label>Confirm Password</label>
                        <div className="field">
                            <input
                                type="password"
                                placeholder="Confirm your new password"
                                {...register("confirmPassword")}
                            />
                            {errors.confirmPassword && (
                                <p className="error-text">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="reset-password-btn"
                    >
                        {isSubmitting ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                <p className="signup-text">
                    <button
                        onClick={() => router.push('/login')}
                        className="text-teal-500 hover:underline"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        Back to Login
                    </button>
                </p>
            </div>
        </div>
    );
}