import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AccountPageHeader from "@/components/account/AccountPageHeader";
import FormField from "@/components/auth/FormField";
import { fetchProfile, saveProfile } from "@/api/account";
import { profileSchema } from "@/utils/authSchemas";
import { useAuthStore } from "@/store/authStore";

export default function ProfilePage() {
  const fetchCurrentUser = useAuthStore(
    (state) => state.fetchCurrentUser,
  );

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const profile = await fetchProfile();

        if (!active) return;

        reset({
          first_name: profile.first_name ?? "",
          last_name: profile.last_name ?? "",
          email: profile.email ?? "",
          phone: profile.phone ?? "",
        });
      } catch (error) {
        if (active) {
          setServerError(
            error?.response?.data?.detail ??
              "We couldn't load your profile.",
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
  }, [reset]);

  async function onSubmit(data) {
    setServerError("");
    setSuccess("");

    try {
      await saveProfile(data);

      if (fetchCurrentUser) {
        await fetchCurrentUser();
      }

      setSuccess("Your profile has been updated.");
    } catch (error) {
      setServerError(
        error?.response?.data?.detail ??
          error?.response?.data?.error ??
          "We couldn't save your changes.",
      );
    }
  }

  if (loading) {
    return <p className="animate-pulse text-sm text-[#766B63]">Loading profile…</p>;
  }

  return (
    <div>
      <AccountPageHeader
        title="My profile."
        description="Manage the personal details connected to your Vestirhaus account."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-2xl space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="First name"
            name="first_name"
            autoComplete="given-name"
            register={register}
            error={errors.first_name}
          />

          <FormField
            label="Last name"
            name="last_name"
            autoComplete="family-name"
            register={register}
            error={errors.last_name}
          />
        </div>

        <FormField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          register={register}
          error={errors.email}
        />

        <FormField
          label="Phone number"
          name="phone"
          type="tel"
          autoComplete="tel"
          register={register}
          error={errors.phone}
        />

        <p className="text-[10px] leading-5 text-[#8B7D72]">
          Changing your email may require verification before the new
          address can be used for signing in.
        </p>

        {serverError && (
          <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {serverError}
          </p>
        )}

        {success && (
          <p role="status" className="border border-[#62724E]/20 bg-[#62724E]/5 px-4 py-3 text-xs text-[#526B40]">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="vh-button vh-button--primary"
        >
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}