import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, CircleAlert, RefreshCw } from "lucide-react";

import AuthLayout from "@/components/auth/AuthLayout";
import { verifyEmailAddress } from "@/api/auth";

export default function VerifyEmailPage() {
  const { token } = useParams();

  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage("The verification link doesn't contain a valid token.");
        return;
      }

      try {
        const result = await verifyEmailAddress(token);

        if (!active) return;

        setStatus("success");
        setMessage(
          result?.detail ??
            result?.message ??
            "Your email address has been verified. You can now sign in.",
        );
      } catch (error) {
        if (!active) return;

        setStatus("error");
        setMessage(
          error?.response?.data?.detail ??
            error?.response?.data?.error ??
            "This verification link may be invalid or expired.",
        );
      }
    }

    verify();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <AuthLayout
      eyebrow="EMAIL VERIFICATION"
      title={
        status === "checking"
          ? "Verifying your email."
          : status === "success"
            ? "You're verified."
            : "Verification unsuccessful."
      }
      description={
        status === "checking"
          ? "We're confirming your email address."
          : message
      }
    >
      <div className="border border-[#211B18]/10 bg-[#FFFCF7] p-6">
        {status === "checking" && (
          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-[#A94F32]"
          />
        )}

        {status === "success" && (
          <CheckCircle2
            size={32}
            className="mx-auto text-[#62724E]"
          />
        )}

        {status === "error" && (
          <CircleAlert
            size={32}
            className="mx-auto text-[#A94F32]"
          />
        )}

        {status !== "checking" && (
          <p
            role="status"
            className="mt-4 text-center text-sm leading-6 text-[#766B63]"
          >
            {message}
          </p>
        )}

        {status === "success" && (
          <Link
            to="/login"
            className="mt-6 flex min-h-12 items-center justify-center bg-[#211B18] px-5 text-xs font-medium uppercase tracking-[0.12em] text-white hover:bg-[#A94F32]"
          >
            Continue to sign in
          </Link>
        )}

        {status === "error" && (
          <Link
            to="/login"
            className="mt-6 flex min-h-12 items-center justify-center border border-[#211B18]/20 px-5 text-xs font-medium uppercase tracking-[0.12em] hover:border-[#A94F32] hover:text-[#A94F32]"
          >
            Return to sign in
          </Link>
        )}
      </div>
    </AuthLayout>
  );
} 