import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";
import { registerSchema } from "@/utils/authSchemas";
import { registerAccount } from "@/api/auth";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(data) {
    setServerError("");

    try {
      await registerAccount(data);

      navigate("/login", {
        replace: true,
        state: {
          email: data.email,
          notice:
            "Your account has been created. Check your email for a verification link before signing in, if email verification is enabled.",
        },
      });
    } catch (error) {
      const data = error?.response?.data;

      if (data && typeof data === "object") {
        const messages = Object.entries(data)
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(" ")
              : typeof value === "string"
                ? value
                : "";

            return message ? `${field}: ${message}` : "";
          })
          .filter(Boolean);

        setServerError(
          messages.join(" ") ||
            "We couldn't create your account. Check your details.",
        );
      } else {
        setServerError(
          "We couldn't create your account. Please try again.",
        );
      }
    }
  }

  return (
    <AuthLayout
      eyebrow="BECOME PART OF THE STORY"
      title="Create an account."
      description="Join Vestirhaus to keep track of your orders, save your favourite pieces, and make future shopping easier."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#A94F32] underline underline-offset-4"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Full name"
          name="full_name"
          placeholder="Your first and last name"
          autoComplete="name"
          register={register}
          error={errors.full_name}
        />

        <FormField
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          register={register}
          error={errors.email}
        />

        <FormField
          label="Phone number"
          name="phone"
          type="tel"
          placeholder="08012345678"
          autoComplete="tel"
          register={register}
          error={errors.phone}
        />

        <div>
          <label
            htmlFor="register-password"
            className="mb-2 block text-xs font-medium"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("password")}
              className="min-h-[50px] w-full border border-[#211B18]/15 bg-[#FFFCF7] px-4 pr-12 text-sm outline-none focus:border-[#A94F32]"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-3 grid place-items-center text-[#766B63]"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
          <p className="mt-2 text-[10px] text-[#8B7D72]">
            Use at least 8 characters.
          </p>
        </div>

        <FormField
          label="Confirm password"
          name="confirm_password"
          type="password"
          placeholder="Enter your password again"
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
          disabled={isSubmitting}
          className="mt-2 min-h-[52px] w-full bg-[#211B18] px-5 text-xs font-medium uppercase tracking-[0.15em] text-white transition hover:bg-[#A94F32] disabled:opacity-60"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-[10px] leading-5 text-[#8B7D72]">
          By creating an account, you agree to the Vestirhaus Terms and
          Privacy Policy.
        </p>
      </form>
    </AuthLayout>
  );
}