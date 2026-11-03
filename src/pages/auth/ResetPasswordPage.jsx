import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";
import { resetPasswordSchema } from "@/utils/authSchemas";
import { confirmPasswordReset } from "@/api/auth";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(data) {
    setServerError("");

    try {
      await confirmPasswordReset(token, data);

      navigate("/login", {
        replace: true,
        state: {
          notice: "Your password has been reset. Sign in using your new password.",
        },
      });
    } catch (error) {
      setServerError(
        error?.response?.data?.detail ??
          error?.response?.data?.error ??
          "This reset link may be invalid or expired. Request a new one.",
      );
    }
  }

  return (
    <AuthLayout
      eyebrow="SECURE YOUR ACCOUNT"
      title="Choose a new password."
      description="Create a new password for your Vestirhaus account."
      footer={
        <Link
          to="/login"
          className="font-semibold text-[#A94F32] underline underline-offset-4"
        >
          Return to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          label="New password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          register={register}
          error={errors.password}
        />

        <FormField
          label="Confirm new password"
          name="confirm_password"
          type="password"
          placeholder="Enter your new password again"
          autoComplete="new-password"
          register={register}
          error={errors.confirm_password}
        />

        {serverError && (
          <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !token}
          className="min-h-[52px] w-full bg-[#211B18] px-5 text-xs font-medium uppercase tracking-[0.15em] text-white hover:bg-[#A94F32] disabled:opacity-60"
        >
          {isSubmitting ? "Updating password…" : "Reset password"}
        </button>
      </form>
    </AuthLayout>
  );
}