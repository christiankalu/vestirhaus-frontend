import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowRight,
    Check,
    Clock3,
    PackageCheck,
    RefreshCw,
    ShieldCheck,
} from "lucide-react";

import {
    fetchOrderById,
    verifyOrderPayment,
} from "@/api/commerce";
import { formatPrice } from "@/utils/formatPrice";

function isPaymentVerified(result) {
    const payload = result?.data ?? result;
    const payment = payload?.payment ?? payload?.transaction ?? {};

    const status = String(
        payload?.payment_status ??
        payload?.transaction_status ??
        payment?.status ??
        payload?.status ??
        "",
    ).toLowerCase();

    return (
        payload?.verified === true ||
        payload?.is_paid === true ||
        payload?.paid === true ||
        payment?.verified === true ||
        ["success", "successful", "paid"].includes(status)
    );
}

function getOrderId(result) {
    const payload = result?.data ?? result;
    const order = payload?.order ?? payload?.order_details ?? {};

    return (
        order.id ??
        order.order_id ??
        payload?.order_id ??
        payload?.orderId ??
        null
    );
}

function getOrderObject(result) {
    const payload = result?.data ?? result;
    return payload?.order ?? payload?.order_details ?? null;
}

function getStatusMessage(result) {
    const payload = result?.data ?? result;

    return (
        payload?.message ??
        payload?.detail ??
        "Payment has not yet been confirmed by the payment verification service."
    );
}

function getItemName(item) {
    return (
        item.product?.name ??
        item.product_name ??
        item.name ??
        "Product"
    );
}

function getItemPrice(item) {
    return Number(
        item.line_total ??
        item.total_price ??
        Number(item.unit_price ?? item.price ?? 0) *
        Number(item.quantity ?? 1),
    );
}

export default function OrderSuccessPage() {
    const { reference } = useParams();

    const [status, setStatus] = useState("checking");
    const [paymentResult, setPaymentResult] = useState(null);
    const [order, setOrder] = useState(null);
    const [message, setMessage] = useState("");
    const [retryNumber, setRetryNumber] = useState(0);

    useEffect(() => {
        let active = true;

        async function verify() {
            setStatus("checking");
            setMessage("");

            if (!reference) {
                setStatus("error");
                setMessage("The payment reference is missing.");
                return;
            }

            try {
                const result = await verifyOrderPayment(reference);
                if (!active) return;

                setPaymentResult(result);

                if (!isPaymentVerified(result)) {
                    setStatus("pending");
                    setMessage(getStatusMessage(result));
                    return;
                }

                setStatus("success");

                let verifiedOrder = getOrderObject(result);
                const orderId = getOrderId(result);

                if (!verifiedOrder && orderId != null) {
                    try {
                        verifiedOrder = await fetchOrderById(orderId);
                    } catch {
                        // The payment can be verified even if order-detail retrieval
                        // has a temporary issue. Keep the verified payment result.
                    }
                }

                if (active) setOrder(verifiedOrder);
            } catch (err) {
                if (!active) return;

                setStatus("error");
                setMessage(
                    err?.response?.data?.detail ??
                    "We couldn't verify this payment right now. Your order has not been marked as paid by this page.",
                );
            }
        }

        verify();

        return () => {
            active = false;
        };
    }, [reference, retryNumber]);

    const orderItems = Array.isArray(order?.items)
        ? order.items
        : Array.isArray(order?.order_items)
            ? order.order_items
            : [];

    const orderTotal = Number(
        order?.total ??
            order?.grand_total ??
            order?.total_amount ??
            paymentResult?.amount_naira ??
            paymentResult?.order_total ??
            0,
    );

    const orderId =
        order?.id ??
        order?.order_id ??
        getOrderId(paymentResult);

    return (
        <main className="min-h-[65vh] bg-[#F7F0E6] px-5 py-16 text-[#211B18] sm:px-8 sm:py-24">
            <div className="mx-auto max-w-3xl">
                <div className="border border-[#211B18]/10 bg-[#FFFCF7] px-5 py-10 text-center sm:px-12 sm:py-14">
                    {status === "checking" && (
                        <>
                            <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#E9DFD2]">
                                <RefreshCw
                                    size={25}
                                    className="animate-spin text-[#A94F32]"
                                />
                            </div>
                            <h1 className="mt-6 font-serif text-3xl sm:text-4xl">
                                Confirming your payment…
                            </h1>
                            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#766B63]">
                                We're checking the transaction with our payment service.
                                Please don't submit another payment while verification is
                                in progress.
                            </p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="order-success-pop mx-auto grid size-[76px] place-items-center rounded-full bg-[#E4EBD9] text-[#526B40]">
                                <Check size={36} strokeWidth={2} />
                            </div>

                            <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.22em] text-[#62724E]">
                                Payment verified
                            </p>

                            <h1 className="mt-3 font-serif text-4xl tracking-[-0.05em] sm:text-5xl">
                                Thank you for your order.
                            </h1>

                            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#766B63]">
                                Your transaction has been verified. Thank you for shopping
                                with Vestirhaus; we look forward to getting your pieces to
                                you.
                            </p>

                            <div className="mx-auto mt-8 max-w-md border border-[#211B18]/10 bg-[#F7F0E6] p-5 text-left">
                                <div className="flex items-start justify-between gap-4">
                                    <span className="text-xs text-[#766B63]">
                                        Payment reference
                                    </span>
                                    <span className="max-w-[65%] break-all text-right text-xs font-medium">
                                        {reference}
                                    </span>
                                </div>

                                {orderId != null && (
                                    <div className="mt-4 flex items-start justify-between gap-4 border-t border-[#211B18]/10 pt-4">
                                        <span className="text-xs text-[#766B63]">Order number</span>
                                        <span className="text-xs font-medium">{orderId}</span>
                                    </div>
                                )}

                                {orderTotal > 0 && (
                                    <div className="mt-4 flex items-start justify-between gap-4 border-t border-[#211B18]/10 pt-4">
                                        <span className="text-xs text-[#766B63]">
                                            Order total
                                        </span>
                                        <span className="text-sm font-medium">
                                            {formatPrice(orderTotal)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {orderItems.length > 0 && (
                                <section className="mx-auto mt-7 max-w-md text-left">
                                    <h2 className="mb-3 font-serif text-xl">Order summary</h2>

                                    <div className="divide-y divide-[#211B18]/10 border-y border-[#211B18]/10">
                                        {orderItems.map((item, index) => (
                                            <div
                                                key={item.id ?? item.order_item_id ?? index}
                                                className="flex items-start justify-between gap-4 py-3"
                                            >
                                                <div>
                                                    <p className="text-sm">{getItemName(item)}</p>
                                                    <p className="mt-1 text-xs text-[#766B63]">
                                                        Quantity: {item.quantity ?? 1}
                                                    </p>
                                                </div>
                                                <p className="shrink-0 text-sm">
                                                    {formatPrice(getItemPrice(item))}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
                                <Link
                                    to="/shop"
                                    className="flex min-h-12 flex-1 items-center justify-center gap-2 bg-[#211B18] px-5 text-xs font-medium uppercase tracking-[0.1em] text-white hover:bg-[#A94F32]"
                                >
                                    Continue shopping <ArrowRight size={15} />
                                </Link>

                                <Link
                                    to={orderId != null ? `/orders/${orderId}` : "/orders"}
                                    className="flex min-h-12 flex-1 items-center justify-center gap-2 border border-[#211B18]/20 px-5 text-xs font-medium uppercase tracking-[0.1em] hover:border-[#A94F32] hover:text-[#A94F32]"
                                >
                                    <PackageCheck size={16} /> View order
                                </Link>
                            </div>

                            <p className="mt-6 inline-flex items-center justify-center gap-2 text-[10px] text-[#8B7D72]">
                                <ShieldCheck size={13} />
                                Order confirmation is based on backend payment verification.
                            </p>
                        </>
                    )}

                    {status === "pending" && (
                        <>
                            <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#F0E4CA] text-[#896B2E]">
                                <Clock3 size={27} />
                            </div>

                            <h1 className="mt-6 font-serif text-3xl sm:text-4xl">
                                Payment is not confirmed yet.
                            </h1>
                            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#766B63]">
                                {message} Your order may still be pending. Don't pay again
                                until you've checked the transaction status.
                            </p>

                            <button
                                type="button"
                                onClick={() => setRetryNumber((value) => value + 1)}
                                className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 bg-[#211B18] px-6 text-xs font-medium uppercase tracking-[0.12em] text-white hover:bg-[#A94F32]"
                            >
                                Check payment again <RefreshCw size={14} />
                            </button>

                            <p className="mt-5 text-xs text-[#8B7D72]">
                                Reference: <span className="break-all">{reference}</span>
                            </p>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#F3E0D9] text-[#A94F32]">
                                <RefreshCw size={25} />
                            </div>

                            <h1 className="mt-6 font-serif text-3xl sm:text-4xl">
                                We couldn't verify the payment.
                            </h1>
                            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#766B63]">
                                {message}
                            </p>

                            <button
                                type="button"
                                onClick={() => setRetryNumber((value) => value + 1)}
                                className="mt-7 inline-flex min-h-12 items-center gap-2 bg-[#211B18] px-6 text-xs font-medium uppercase tracking-[0.12em] text-white hover:bg-[#A94F32]"
                            >
                                Retry verification <RefreshCw size={14} />
                            </button>

                            <p className="mt-5 text-xs text-[#8B7D72]">
                                Payment reference: <span className="break-all">{reference}</span>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}