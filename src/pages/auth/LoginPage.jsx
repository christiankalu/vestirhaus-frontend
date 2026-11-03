import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";
import { loginSchema } from "@/utils/authSchemas";
import { useAuthStore } from "@/store/authStore";

function getSafeReturnDestination(destination) {
  if (!destination?.pathname) return "/account";

  const path = destination.pathname;

  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/account";
  }

  return `${path}${destination.search ?? ""}${destination.hash ?? ""}`;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const login = useAuthStore((state) => state.login);

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: location.state?.email ?? "",
      password: "",
    },
  });

  async function onSubmit(data) {
    setServerError("");

    try {
      await login(data);

      const destination = getSafeReturnDestination(
        location.state?.from,
      );

      navigate(destination, { replace: true });
    } catch (error) {
      setServerError(
        error?.response?.data?.detail ??
          error?.response?.data?.error ??
          "We couldn't sign you in. Check your email and password.",
      );
    }
  }

  return (
    <AuthLayout
      eyebrow="YOUR VESTIRHAUS ACCOUNT"
      title="Welcome back."
      description="Sign in to continue your journey, keep track of your orders, and save the pieces you love."
      footer={
        <>
          New to Vestirhaus?{" "}
          <Link
            to="/register"
            state={location.state}
            className="font-semibold text-[#A94F32] underline underline-offset-4"
          >
            Create an account
          </Link>
        </>
      }
    >
      {location.state?.message && (
        <p className="mb-5 border border-[#A94F32]/20 bg-[#A94F32]/5 px-4 py-3 text-xs leading-5 text-[#A94F32]">
          {location.state.message}
        </p>
      )}

      {location.state?.notice && (
        <p role="status" className="mb-5 text-xs leading-5 text-[#62724E]">
          {location.state.notice}
        </p>
      )}

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

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="field-password"
              className="text-xs font-medium"
            >
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-[11px] text-[#A94F32] underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <input
              id="field-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
              className="min-h-[50px] w-full border border-[#211B18]/15 bg-[#FFFCF7] px-4 pr-12 text-sm outline-none transition focus:border-[#A94F32]"
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
            <p role="alert" className="mt-1.5 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {serverError && (
          <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-[52px] w-full bg-[#211B18] px-5 text-xs font-medium uppercase tracking-[0.15em] text-white transition hover:bg-[#A94F32] disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? "Signing you in…" : "Sign in"}
        </button>
      </form>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-[#211B18]/10" />
        <span className="text-[9px] uppercase tracking-[0.15em] text-[#8B7D72]">
          Or continue with
        </span>
        <span className="h-px flex-1 bg-[#211B18]/10" />
      </div>

      <button
        type="button"
        disabled
        title="Social sign-in is not connected yet."
        className="flex min-h-[50px] w-full items-center justify-center gap-3 border border-[#211B18]/15 bg-transparent text-xs text-[#766B63] opacity-70"
      >
        <span className="font-semibold">G</span>
        Continue with Google
        <span className="text-[9px] uppercase tracking-wider">
          Coming soon
        </span>
      </button>
    </AuthLayout>
  );
}