import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";
import { forgotPasswordSchema } from "@/utils/authSchemas";
import { requestPasswordReset } from "@/api/auth";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  async function onSubmit(data) {
    setMessage("");
    setServerError("");

    try {
      await requestPasswordReset(data.email);

      setMessage(
        "If an account exists for this email address, password reset instructions will be sent to it.",
      );
    } catch (error) {
      setServerError(
        error?.response?.data?.detail ??
          "We couldn't submit your request. Please try again.",
      );
    }
  }

  return (
    <AuthLayout
      eyebrow="ACCOUNT RECOVERY"
      title="Forgot your password?"
      description="It happens. Enter the email address associated with your account and we'll help you get back in."
      footer={
        <>
          Remembered your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#A94F32] underline underline-offset-4"
          >
            Return to sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          register={register}
          error={errors.email}
        />

        {serverError && (
          <p role="alert" className="text-xs text-red-600">
            {serverError}
          </p>
        )}

        {message && (
          <p role="status" className="border border-[#62724E]/20 bg-[#62724E]/5 px-4 py-3 text-xs leading-6 text-[#526B40]">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-[52px] w-full bg-[#211B18] px-5 text-xs font-medium uppercase tracking-[0.15em] text-white hover:bg-[#A94F32] disabled:opacity-60"
        >
          {isSubmitting ? "Sending request…" : "Send reset instructions"}
        </button>
      </form>
    </AuthLayout>
  );
}