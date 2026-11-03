import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Plus, Star, Trash2, X } from "lucide-react";

import AccountPageHeader from "@/components/account/AccountPageHeader";
import FormField from "@/components/auth/FormField";
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  setDefaultAddress,
  updateAddress,
} from "@/api/account";
import { addressSchema } from "@/utils/authSchemas";
import { NIGERIAN_STATES } from "@/utils/shipping";

const EMPTY_ADDRESS = {
  full_name: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postcode: "",
  country: "Nigeria",
  is_default: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addressSchema),
    mode: "onTouched",
    defaultValues: EMPTY_ADDRESS,
  });

  const isDefault = watch("is_default");

  async function loadAddresses() {
    setLoading(true);
    setError("");

    try {
      setAddresses(await fetchAddresses());
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
          "We couldn't load your saved addresses.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  function openAddForm() {
    setEditing(null);
    reset(EMPTY_ADDRESS);
    setFormOpen(true);
    setError("");
    setMessage("");
  }

  function openEditForm(address) {
    setEditing(address);

    reset({
      full_name: address.full_name ?? "",
      phone: address.phone ?? "",
      address_line_1: address.address_line_1 ?? address.address ?? "",
      address_line_2: address.address_line_2 ?? "",
      city: address.city ?? "",
      state: address.state ?? "",
      postcode: address.postcode ?? "",
      country: address.country ?? "Nigeria",
      is_default: Boolean(address.is_default),
    });

    setFormOpen(true);
    setError("");
    setMessage("");
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    reset(EMPTY_ADDRESS);
  }

  async function onSubmit(data) {
    setError("");
    setMessage("");

    try {
      if (editing) {
        await updateAddress(editing.id, data);
        setMessage("Your address has been updated.");
      } else {
        await createAddress(data);
        setMessage("Your new address has been saved.");
      }

      closeForm();
      await loadAddresses();
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
          "We couldn't save this address.",
      );
    }
  }

  async function handleDelete(address) {
    if (!window.confirm("Delete this saved address?")) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await deleteAddress(address.id);
      setAddresses((current) =>
        current.filter((item) => item.id !== address.id),
      );
      setMessage("Address deleted.");
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
          "We couldn't delete this address.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleSetDefault(address) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await setDefaultAddress(address.id);
      await loadAddresses();
      setMessage("Default delivery address updated.");
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
          "We couldn't update the default address.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <AccountPageHeader
        title="My addresses."
        description="Keep your delivery details ready for your next order."
      />

      {(error || message) && (
        <p
          role={error ? "alert" : "status"}
          className={[
            "mb-5 border px-4 py-3 text-xs leading-5",
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-[#62724E]/20 bg-[#62724E]/5 text-[#526B40]",
          ].join(" ")}
        >
          {error || message}
        </p>
      )}

      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex min-h-11 items-center gap-2 bg-[#211B18] px-4 text-xs font-medium uppercase tracking-[0.1em] text-white hover:bg-[#A94F32]"
        >
          <Plus size={15} /> Add address
        </button>
      </div>

      {loading ? (
        <p className="animate-pulse text-sm text-[#766B63]">
          Loading addresses…
        </p>
      ) : addresses.length === 0 ? (
        <div className="border border-dashed border-[#211B18]/20 py-14 text-center">
          <MapPin size={25} className="mx-auto text-[#A94F32]" />
          <h2 className="mt-4 font-serif text-2xl">
            No saved addresses.
          </h2>
          <p className="mt-2 text-xs text-[#766B63]">
            Add a delivery address to make future checkouts easier.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address.id}
              className="border border-[#211B18]/10 bg-[#FFFCF7] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#A94F32]" />
                  <p className="text-sm font-medium">
                    {address.full_name}
                  </p>
                </div>

                {address.is_default && (
                  <span className="bg-[#E5EBDD] px-2 py-1 text-[9px] uppercase tracking-[0.1em] text-[#526B40]">
                    Default
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-1 text-xs leading-5 text-[#766B63]">
                <p>{address.address_line_1 ?? address.address}</p>
                {address.address_line_2 && (
                  <p>{address.address_line_2}</p>
                )}
                <p>
                  {[
                    address.city,
                    address.state,
                    address.postcode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p>{address.country ?? "Nigeria"}</p>
                <p>{address.phone}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-4 border-t border-[#211B18]/10 pt-4">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => openEditForm(address)}
                  className="text-xs underline underline-offset-4 hover:text-[#A94F32]"
                >
                  Edit
                </button>

                {!address.is_default && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleSetDefault(address)}
                    className="inline-flex items-center gap-1 text-xs underline underline-offset-4 hover:text-[#A94F32]"
                  >
                    <Star size={12} /> Make default
                  </button>
                )}

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleDelete(address)}
                  className="inline-flex items-center gap-1 text-xs text-[#A94F32]"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {formOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#211B18]/50 p-0 sm:items-center sm:p-5">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="address-form-title"
            className="max-h-[92svh] w-full max-w-2xl overflow-y-auto bg-[#F7F0E6] p-5 sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[#A94F32]">
                  Delivery details
                </p>
                <h2
                  id="address-form-title"
                  className="font-serif text-3xl"
                >
                  {editing ? "Edit address." : "Add an address."}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close address form"
                className="grid size-10 place-items-center"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid gap-4 sm:grid-cols-2"
            >
              <FormField
                label="Recipient's full name"
                name="full_name"
                register={register}
                error={errors.full_name}
              />

              <FormField
                label="Phone number"
                name="phone"
                type="tel"
                register={register}
                error={errors.phone}
              />

              <div className="sm:col-span-2">
                <FormField
                  label="Street address"
                  name="address_line_1"
                  register={register}
                  error={errors.address_line_1}
                />
              </div>

              <div className="sm:col-span-2">
                <FormField
                  label="Apartment / landmark (optional)"
                  name="address_line_2"
                  register={register}
                  error={errors.address_line_2}
                />
              </div>

              <FormField
                label="City"
                name="city"
                register={register}
                error={errors.city}
              />

              <div>
                <label
                  htmlFor="address-state"
                  className="mb-2 block text-xs font-medium"
                >
                  State
                </label>
                <select
                  id="address-state"
                  {...register("state")}
                  className="min-h-[50px] w-full border border-[#211B18]/15 bg-[#FFFCF7] px-3 text-sm outline-none focus:border-[#A94F32]"
                >
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.state.message}
                  </p>
                )}
              </div>

              <FormField
                label="Postcode (optional)"
                name="postcode"
                register={register}
                error={errors.postcode}
              />

              <label className="flex items-center gap-3 text-xs sm:col-span-2">
                <input
                  type="checkbox"
                  checked={Boolean(isDefault)}
                  onChange={(event) =>
                    setValue("is_default", event.target.checked, {
                      shouldDirty: true,
                    })
                  }
                  className="size-4 accent-[#A94F32]"
                />
                Make this my default delivery address
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-[#211B18]/10 pt-5 sm:col-span-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="vh-button vh-button--secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-11 bg-[#211B18] px-6 text-xs font-medium uppercase tracking-[0.1em] text-white hover:bg-[#A94F32] disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Saving…"
                    : editing
                      ? "Save address"
                      : "Add address"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}