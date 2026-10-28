import { Link } from "react-router-dom";
import PagePlaceholder from "@/components/shared/PagePlaceholder";

export default function PaymentCallbackPage() {
  return (
    <>
      <PagePlaceholder
        title="Confirming your payment"
        description="Payment verification will be connected to the Paystack API in the payment UI phase."
      />
      <div className="container-editorial pb-12">
        <Link className="text-brand-terracotta underline" to="/orders">
          View your orders
        </Link>
      </div>
    </>
  );
}