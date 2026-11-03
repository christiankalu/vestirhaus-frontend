import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PaystackPop from "@paystack/inline-js";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    LockKeyhole,
    ShieldCheck,
    Truck,
} from "lucide-react";

import {
    createCheckoutOrder,
    fetchCart,
    initializeOrderPayment,
} from "@/api/commerce";
import { useAuthStore } from "@/store/authStore";
import { 
    formatPrice,
    fromKobo,
    formatKoboPrice,
} from "@/utils/formatPrice";
import {
    getShippingEstimate,
    NIGERIAN_STATES,
} from "@/utils/shipping";

const INITIAL_ADDRESS = {
    full_name: "",
    email: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postcode: "",
};

function amount(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function getOrderId(order) {
    return order?.id ?? order?.order_id ?? order?.pk ?? null;
}

function getItems(cart) {
    return Array.isArray(cart?.items) ? cart.items : [];
}

function getName(item) {
    return (
        item.product?.name ??
        item.product_name ??
        item.name ??
        "Product"
    );
}

function getImage(item) {
    return (
        item.product?.primary_image ??
        item.product?.image_url ??
        item.product?.image ??
        item.product_image ??
        item.image ??
        ""
    );
}

function getUnitPrice(item) {
    return amount(
        item.unit_price ??
        item.variant?.price ??
        item.product?.price ??
        item.price,
    );
}

function getLineTotal(item) {
    return amount(
        item.line_total ??
        item.total_price ??
        getUnitPrice(item) * amount(item.quantity ?? 1),
    );
}

function getVariantLabel(item) {
    const variant = item.variant ?? item.product_variant ?? {};

    const size =
        typeof variant.size === "object"
            ? variant.size?.name
            : variant.size;

    const color =
        typeof variant.color === "object"
            ? variant.color?.name
            : variant.color;

    return [size ?? item.size, color ?? item.color]
        .filter(Boolean)
        .join(" / ");
}

function getOrderTotals(cart, order, shippingEstimate) {
    const items = getItems(cart);

    const rawSubtotal = amount(
        order?.subtotal ??
        cart?.subtotal ??
        items.reduce((sum, item) => sum + getLineTotal(item), 0),
    );

    const rawDiscount = amount(
        order?.discount ??
        order?.discount_amount ??
        cart?.discount ??
        cart?.discount_amount,
    );

    const serverShipping =
        order?.shipping_fee ??
        order?.shipping_cost ??
        null;

    const rawTotal =
        order?.total ??
        order?.grand_total ??
        order?.total_amount ??
        order?.amount ??
        null;

    // API monetary amounts are in kobo.
    const subtotal = fromKobo(rawSubtotal);
    const discount = fromKobo(rawDiscount);

    // A local shipping estimate is already in naira.
    // A server shipping amount is in kobo.
    const shippingFee =
        serverShipping != null
        ? fromKobo(serverShipping)
        : Number(shippingEstimate ?? 0);

    return {
        subtotal,
        discount,
        shippingFee,
        total:
        rawTotal != null
            ? fromKobo(rawTotal)
            : Math.max(0, subtotal - discount + shippingFee),
    };
}

function TextField({
    label,
    name,
    value,
    onChange,
    required = false,
    type = "text",
    autoComplete,
    placeholder,
}) {
    return (
        <div>
            <label
                htmlFor={`checkout-${name}`}
                className="mb-2 block text-xs font-medium"
            >
                {label}
                {required && <span className="ml-1 text-[#A94F32]">*</span>}
            </label>

            <input
                id={`checkout-${name}`}
                name={name}
                type={type}
                value={value}
                onChange={(event) => onChange(name, event.target.value)}
                required={required}
                autoComplete={autoComplete}
                placeholder={placeholder}
                className="min-h-12 w-full border border-[#211B18]/20 bg-[#FFFCF7] px-3 py-3 text-sm outline-none transition focus:border-[#A94F32]"
            />
        </div>
    );
}

function StepIndicator({ step }) {
    const steps = [
        { number: 1, label: "Shipping" },
        { number: 2, label: "Review" },
        { number: 3, label: "Payment" },
    ];

    return (
        <ol className="grid grid-cols-3" aria-label="Checkout progress">
            {steps.map((item, index) => {
                const complete = step > item.number;
                const active = step === item.number;

                return (
                    <li
                        key={item.number}
                        className={[
                            "relative flex flex-col items-center gap-2 text-center",
                            index < steps.length - 1
                                ? "after:absolute after:left-[calc(50%+21px)] after:right-[calc(-50%+21px)] after:top-5 after:h-px after:bg-[#211B18]/15"
                                : "",
                        ].join(" ")}
                    >
                        <span
                            className={[
                                "relative z-10 grid size-10 place-items-center rounded-full border text-xs",
                                active
                                    ? "border-[#A94F32] bg-[#A94F32] text-white"
                                    : complete
                                        ? "border-[#62724E] bg-[#62724E] text-white"
                                        : "border-[#211B18]/20 bg-[#F7F0E6] text-[#766B63]",
                            ].join(" ")}
                        >
                            {complete ? <Check size={16} /> : item.number}
                        </span>

                        <span
                            className={[
                                "text-[10px] uppercase tracking-[0.12em] sm:text-xs",
                                active ? "font-semibold text-[#211B18]" : "text-[#8B7D72]",
                            ].join(" ")}
                        >
                            {item.label}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

function OrderSummary({ cart, order, shippingEstimate }) {
    const items = getItems(cart);
    const totals = getOrderTotals(cart, order, shippingEstimate);

    return (
        <section className="border border-[#211B18]/10 bg-[#F1E9DE] p-5 sm:p-6">
            <h2 className="font-serif text-2xl">Your order</h2>

            <div className="mt-5 divide-y divide-[#211B18]/10">
                {items.map((item, index) => (
                    <div
                        key={item.id ?? item.cart_item_id ?? index}
                        className="flex gap-3 py-4 first:pt-0 last:pb-0"
                    >
                        <div className="relative size-[66px] shrink-0 overflow-hidden bg-[#E4D8CA]">
                            {getImage(item) && (
                                <img
                                    src={getImage(item)}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            )}
                            <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#211B18] text-[9px] text-white">
                                {item.quantity ?? 1}
                            </span>
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{getName(item)}</p>
                            {getVariantLabel(item) && (
                                <p className="mt-1 text-xs text-[#766B63]">
                                    {getVariantLabel(item)}
                                </p>
                            )}
                            <p className="mt-2 text-xs">
                                {formatKoboPrice(getLineTotal(item))}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5 space-y-4 border-t border-[#211B18]/10 pt-5 text-sm">
                <SummaryRow
                    label="Subtotal"
                    value={formatPrice(totals.subtotal)}
                />

                <SummaryRow
                    label="Discount"
                    value={`−${formatPrice(totals.discount)}`}
                />

                <SummaryRow
                    label="Shipping estimate"
                    value={formatPrice(totals.shippingFee)}
                />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[#211B18]/15 pt-5">
                <span className="text-sm font-medium">Total</span>
                <span className="text-xl font-medium">
                    {formatPrice(totals.total)}
                </span>
            </div>

            {order && (
                <p className="mt-3 text-[10px] leading-5 text-[#766B63]">
                    Order pricing has been calculated by the server.
                </p>
            )}

            {!order && (
                <p className="mt-3 text-[10px] leading-5 text-[#766B63]">
                    Shipping is an estimate until the order is created. Your confirmed
                    total will come from the server.
                </p>
            )}
        </section>
    );
}

function SummaryRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-[#766B63]">{label}</span>
            <span className="text-right">{value}</span>
        </div>
    );
}

export default function CheckoutPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cartError, setCartError] = useState("");
    const [step, setStep] = useState(1);
    const [address, setAddress] = useState({
        ...INITIAL_ADDRESS,
        email: user?.email ?? "",
        full_name:
            [user?.first_name, user?.last_name].filter(Boolean).join(" "),
    });
    const [saveAddress, setSaveAddress] = useState(false);
    const [order, setOrder] = useState(null);
    const [savingOrder, setSavingOrder] = useState(false);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    useEffect(() => {
        let active = true;

        async function load() {
            setLoading(true);
            setCartError("");

            try {
                const latest = await fetchCart();
                if (active) setCart(latest);
            } catch (err) {
                if (active) {
                    setCartError(
                        err?.response?.data?.detail ??
                        "Your cart couldn't be loaded.",
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        load();

        return () => {
            active = false;
        };
    }, []);

    const items = getItems(cart);

    useEffect(() => {
        if (!loading && !cartError && items.length === 0) {
            navigate("/cart", { replace: true });
        }
    }, [loading, cartError, items.length, navigate]);

    const shippingEstimate = useMemo(
        () => (address.state ? getShippingEstimate(address.state) : null),
        [address.state],
    );

    function updateAddress(name, value) {
        setAddress((current) => ({ ...current, [name]: value }));

        // If the address changes after an order was created, the old order
        // must not be reused for payment.
        setOrder(null);
    }

    function handleAddressSubmit(event) {
        event.preventDefault();
        setError("");
        setNotice("");
        setStep(2);
    }

    async function handlePayNow() {
        if (!items.length) {
            setError("Your cart is empty.");
            return;
        }

        setPaying(true);
        setError("");
        setNotice("");

        try {
            // Create the order only once per address configuration. Retrying
            // payment initialization can reuse this pending order.
            let activeOrder = order;

            if (!activeOrder) {
                setSavingOrder(true);

                activeOrder = await createCheckoutOrder({
                    address: {
                        ...address,
                        country: "Nigeria",
                    },
                    saveAddress: Boolean(user && saveAddress),
                });

                setOrder(activeOrder);
                setSavingOrder(false);
            }

            const orderId = getOrderId(activeOrder);

            if (orderId == null) {
                throw new Error(
                    "The backend response did not include an order ID. Check the order creation response.",
                );
            }

            const payment = await initializeOrderPayment(orderId);

            const accessCode =
                payment?.access_code ??
                payment?.accessCode ??
                payment?.data?.access_code;

            const authorizationUrl =
                payment?.authorization_url ??
                payment?.authorizationUrl ??
                payment?.data?.authorization_url;

            const initializedReference =
                payment?.reference ??
                payment?.data?.reference;

            if (accessCode) {
                const popup = new PaystackPop();

                popup.resumeTransaction(accessCode, {
                    onSuccess: (transaction) => {
                        const reference =
                            transaction?.reference ?? initializedReference;

                        setPaying(false);

                        if (!reference) {
                            setError(
                                "Paystack returned no reference. Check the payment response and verify the transaction with the backend.",
                            );
                            return;
                        }

                        // The success page verifies payment with Django. A popup
                        // callback alone does not prove the order has been paid.
                        navigate(
                            `/order-success/${encodeURIComponent(reference)}`,
                        );
                    },

                    onCancel: () => {
                        setPaying(false);
                        setNotice(
                            "Payment was cancelled. Your order has not been confirmed as paid.",
                        );
                    },

                    onError: (paystackError) => {
                        setPaying(false);
                        setError(
                            paystackError?.message ??
                            "Paystack couldn't open the payment form. Please try again.",
                        );
                    },
                });

                return;
            }

            // Fallback: use Paystack's hosted page if the backend provides a
            // URL but not an access code. Ensure its callback URL points to
            // the frontend's /payment/callback route.
            if (authorizationUrl) {
                window.location.assign(authorizationUrl);
                return;
            }

            throw new Error(
                "The payment initialization response contained neither an access code nor an authorization URL.",
            );
        } catch (err) {
            setError(
                err?.response?.data?.detail ??
                err?.response?.data?.error ??
                err?.message ??
                "We couldn't start your payment. Please try again.",
            );
            setPaying(false);
            setSavingOrder(false);
        }
    }

    if (loading) {
        return (
            <main className="mx-auto min-h-[60vh] max-w-6xl px-5 py-20 sm:px-8">
                <p className="animate-pulse text-sm text-[#766B63]">
                    Preparing your checkout…
                </p>
            </main>
        );
    }

    if (cartError) {
        return (
            <main className="mx-auto max-w-3xl px-5 py-20 text-center">
                <h1 className="font-serif text-3xl">Checkout couldn't load.</h1>
                <p className="mt-3 text-sm text-[#766B63]">{cartError}</p>
                <Link
                    to="/cart"
                    className="mt-6 inline-block border-b border-[#211B18] pb-2 text-xs"
                >
                    Return to cart
                </Link>
            </main>
        );
    }

    if (items.length === 0) return null;

    return (
        <main className="min-h-screen bg-[#F7F0E6] text-[#211B18]">
            <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
                <Link
                    to="/cart"
                    className="mb-8 inline-flex items-center gap-2 text-xs text-[#766B63] hover:text-[#A94F32]"
                >
                    <ArrowLeft size={14} /> Back to bag
                </Link>

                <div className="mb-10 max-w-2xl">
                    <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#A94F32]">
                        Your order, your way
                    </p>
                    <h1 className="font-serif text-5xl tracking-[-0.06em] sm:text-6xl">
                        Checkout<span className="text-[#A94F32]">.</span>
                    </h1>
                </div>

                <div className="mx-auto mb-10 max-w-2xl sm:mb-12">
                    <StepIndicator step={step} />
                </div>

                {(error || notice) && (
                    <div
                        role={error ? "alert" : "status"}
                        className={[
                            "mx-auto mb-6 max-w-2xl border px-4 py-3 text-sm",
                            error
                                ? "border-red-300 bg-red-50 text-red-800"
                                : "border-[#A94F32]/20 bg-white/50 text-[#766B63]",
                        ].join(" ")}
                    >
                        {error || notice}
                    </div>
                )}

                <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-12">
                    {/* Step form */}
                    <section className="min-w-0">
                        {step === 1 && (
                            <form onSubmit={handleAddressSubmit}>
                                <div className="mb-7">
                                    <h2 className="font-serif text-3xl">Shipping address</h2>
                                    <p className="mt-2 text-sm leading-6 text-[#766B63]">
                                        Where should we deliver your Vestirhaus pieces?
                                    </p>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <TextField
                                        label="Full name"
                                        name="full_name"
                                        value={address.full_name}
                                        onChange={updateAddress}
                                        required
                                        autoComplete="name"
                                    />

                                    <TextField
                                        label="Email address"
                                        name="email"
                                        type="email"
                                        value={address.email}
                                        onChange={updateAddress}
                                        required
                                        autoComplete="email"
                                    />

                                    <TextField
                                        label="Phone number"
                                        name="phone"
                                        type="tel"
                                        value={address.phone}
                                        onChange={updateAddress}
                                        required
                                        autoComplete="tel"
                                        placeholder="+234…"
                                    />

                                    <div className="sm:col-span-2">
                                        <TextField
                                            label="Street address"
                                            name="address_line_1"
                                            value={address.address_line_1}
                                            onChange={updateAddress}
                                            required
                                            autoComplete="address-line1"
                                            placeholder="House number, street, estate"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <TextField
                                            label="Apartment, suite or landmark (optional)"
                                            name="address_line_2"
                                            value={address.address_line_2}
                                            onChange={updateAddress}
                                            autoComplete="address-line2"
                                        />
                                    </div>

                                    <TextField
                                        label="City / town"
                                        name="city"
                                        value={address.city}
                                        onChange={updateAddress}
                                        required
                                        autoComplete="address-level2"
                                    />

                                    <div>
                                        <label
                                            htmlFor="checkout-state"
                                            className="mb-2 block text-xs font-medium"
                                        >
                                            State <span className="text-[#A94F32]">*</span>
                                        </label>
                                        <select
                                            id="checkout-state"
                                            name="state"
                                            value={address.state}
                                            onChange={(event) =>
                                                updateAddress("state", event.target.value)
                                            }
                                            required
                                            autoComplete="address-level1"
                                            className="min-h-12 w-full border border-[#211B18]/20 bg-[#FFFCF7] px-3 py-3 text-sm outline-none focus:border-[#A94F32]"
                                        >
                                            <option value="">Select state</option>
                                            {NIGERIAN_STATES.map((state) => (
                                                <option key={state} value={state}>
                                                    {state}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <TextField
                                        label="Postcode"
                                        name="postcode"
                                        value={address.postcode}
                                        onChange={updateAddress}
                                        required
                                        autoComplete="postal-code"
                                    />

                                    <div className="flex items-start gap-3 border border-[#211B18]/10 bg-white/35 p-4 sm:col-span-2">
                                        <Truck
                                            size={18}
                                            className="mt-0.5 shrink-0 text-[#A94F32]"
                                        />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Estimated shipping: {" "}
                                                {shippingEstimate == null
                                                    ? "Select a state"
                                                    : formatPrice(shippingEstimate)
                                                }
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-[#766B63]">
                                                Select your delivery state to view an estimate. Your
                                                final shipping amount will be confirmed when the
                                                server creates the order.
                                            </p>
                                        </div>
                                    </div>

                                    {user && (
                                        <label className="flex items-start gap-3 text-sm sm:col-span-2">
                                            <input
                                                type="checkbox"
                                                checked={saveAddress}
                                                onChange={(event) =>
                                                    setSaveAddress(event.target.checked)
                                                }
                                                className="mt-1 size-4 accent-[#A94F32]"
                                            />
                                            <span>
                                                Save this address to my account
                                                <span className="mt-1 block text-xs text-[#766B63]">
                                                    The address will be saved using your account's
                                                    address endpoint.
                                                </span>
                                            </span>
                                        </label>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="mt-8 flex min-h-[54px] w-full items-center justify-center gap-3 bg-[#211B18] px-6 text-xs font-medium uppercase tracking-[0.13em] text-white transition hover:bg-[#A94F32] sm:w-auto sm:min-w-[250px]"
                                >
                                    Continue to review <ArrowRight size={16} />
                                </button>
                            </form>
                        )}

                        {step === 2 && (
                            <div>
                                <div className="mb-7">
                                    <h2 className="font-serif text-3xl">Review your order</h2>
                                    <p className="mt-2 text-sm leading-6 text-[#766B63]">
                                        Check your delivery details and items before proceeding
                                        to payment.
                                    </p>
                                </div>

                                <section className="border border-[#211B18]/10 p-5 sm:p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <h3 className="font-medium">Deliver to</h3>
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="text-xs underline underline-offset-4 hover:text-[#A94F32]"
                                        >
                                            Edit address
                                        </button>
                                    </div>

                                    <div className="mt-4 space-y-1.5 text-sm leading-6 text-[#766B63]">
                                        <p className="font-medium text-[#211B18]">
                                            {address.full_name}
                                        </p>
                                        <p>{address.address_line_1}</p>
                                        {address.address_line_2 && (
                                            <p>{address.address_line_2}</p>
                                        )}
                                        <p>
                                            {address.city}, {address.state} {address.postcode}
                                        </p>
                                        <p>Nigeria</p>
                                        <p>{address.phone}</p>
                                        <p>{address.email}</p>
                                    </div>
                                </section>

                                <div className="mt-6 border border-[#211B18]/10 p-5 sm:p-6">
                                    <h3 className="font-medium">Items in your bag</h3>
                                    <div className="mt-4 divide-y divide-[#211B18]/10">
                                        {items.map((item, index) => (
                                            <div
                                                key={item.id ?? item.cart_item_id ?? index}
                                                className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm">{getName(item)}</p>
                                                    {getVariantLabel(item) && (
                                                        <p className="mt-1 text-xs text-[#766B63]">
                                                            {getVariantLabel(item)}
                                                        </p>
                                                    )}
                                                    <p className="mt-1 text-xs text-[#766B63]">
                                                        Qty: {item.quantity ?? 1}
                                                    </p>
                                                </div>
                                                <p className="shrink-0 text-sm font-medium">
                                                    {formatPrice(getLineTotal(item))}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        to="/cart"
                                        className="mt-5 inline-block text-xs underline underline-offset-4"
                                    >
                                        Change cart items
                                    </Link>
                                </div>

                                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="min-h-[52px] border border-[#211B18]/20 px-5 text-xs font-medium uppercase tracking-[0.1em]"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        className="flex min-h-[52px] flex-1 items-center justify-center gap-3 bg-[#211B18] px-5 text-xs font-medium uppercase tracking-[0.1em] text-white hover:bg-[#A94F32]"
                                    >
                                        Continue to payment <ArrowRight size={15} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <div className="mb-7">
                                    <h2 className="font-serif text-3xl">Payment</h2>
                                    <p className="mt-2 text-sm leading-6 text-[#766B63]">
                                        Complete your order through Paystack's secure checkout.
                                    </p>
                                </div>

                                <div className="border border-[#211B18]/10 bg-white/35 p-5 sm:p-7">
                                    <div className="flex items-start gap-4">
                                        <div className="grid size-11 shrink-0 place-items-center bg-[#E9DFD2]">
                                            <LockKeyhole size={19} className="text-[#A94F32]" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium">
                                                Pay securely with Paystack
                                            </h3>
                                            <p className="mt-2 text-sm leading-6 text-[#766B63]">
                                                Your payment is handled by Paystack. Vestirhaus
                                                receives a verified payment result from the backend
                                                before confirming your order.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex gap-3 border-t border-[#211B18]/10 pt-5">
                                        <ShieldCheck
                                            size={17}
                                            className="mt-0.5 shrink-0 text-[#62724E]"
                                        />
                                        <p className="text-xs leading-5 text-[#766B63]">
                                            Your final payable amount will be calculated by the
                                            server. A successful popup callback alone is not
                                            sufficient to confirm payment.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        disabled={paying || savingOrder}
                                        onClick={() => {
                                            setStep(2);
                                            setError("");
                                        }}
                                        className="vh-button vh-button--secondary"
                                    >
                                        Back
                                    </button>

                                    <button
                                        type="button"
                                        disabled={paying || savingOrder}
                                        onClick={handlePayNow}
                                        className="vh-button vh-button--accent vh-button--full"
                                    >
                                        {savingOrder
                                            ? "Creating order…"
                                            : paying
                                                ? "Opening Paystack…"
                                                : "Pay now"}
                                        {!paying && <ArrowRight size={16} />}
                                    </button>
                                </div>

                                <p className="mt-4 text-center text-[10px] leading-5 text-[#8B7D72]">
                                    Do not close your browser until Paystack has completed or
                                    cancelled the payment.
                                </p>
                            </div>
                        )}
                    </section>

                    {/* Summary remains visible on larger screens */}
                    <aside className="lg:sticky lg:top-28">
                        <OrderSummary
                            cart={cart}
                            order={order}
                            shippingEstimate={shippingEstimate}
                        />
                    </aside>
                </div>
            </div>
        </main>
    );
}