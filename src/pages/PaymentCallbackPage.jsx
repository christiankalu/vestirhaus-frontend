import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function PaymentCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const reference =
    searchParams.get("reference") ??
    searchParams.get("trxref") ??
    "";

  useEffect(() => {
    if (!reference) return;

    navigate(
      `/order-success/${encodeURIComponent(reference)}`,
      { replace: true },
    );
  }, [reference, navigate]);

  if (reference) {
    return (
      <main className="min-h-[55vh] bg-[#F7F0E6] px-5 py-20 text-center text-[#211B18]">
        <RefreshCw
          size={28}
          className="mx-auto animate-spin text-[#A94F32]"
        />
        <h1 className="mt-6 font-serif text-3xl">
          Checking your payment…
        </h1>
        <p className="mt-3 text-sm text-[#766B63]">
          We'll confirm the transaction with the payment service.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-[55vh] bg-[#F7F0E6] px-5 py-20 text-center text-[#211B18]">
      <h1 className="font-serif text-3xl">Reference not found.</h1>
      <p className="mt-3 text-sm text-[#766B63]">
        We couldn't read the payment reference from the return URL.
      </p>
      <Link
        to="/cart"
        className="mt-7 inline-flex items-center gap-2 border-b border-[#211B18] pb-2 text-xs"
      >
        <ArrowLeft size={14} /> Return to your bag
      </Link>
    </main>
  );
}