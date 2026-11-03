import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, LockKeyhole } from "lucide-react";

import AccountPageHeader from "@/components/account/AccountPageHeader";
import FormField from "@/components/auth/FormField";
import {
  changePasswordSchema,
  deleteAccountSchema,
} from "@/utils/authSchemas";
import {
  changePassword,
  deleteAccount,
} from "@/api/account";
import { useAuthStore } from "@/store/authStore";

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: "onTouched",
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const deleteForm = useForm({
    resolver: zodResolver(deleteAccountSchema),
    mode: "onTouched",
    defaultValues: {
      current_password: "",
      confirmation: "",
    },
  });

  async function handlePasswordChange(data) {
    setPasswordMessage("");
    setPasswordError("");

    try {
      await changePassword(data);

      passwordForm.reset();

      setPasswordMessage("Your password has been changed successfully.");
    } catch (error) {
      setPasswordError(
        error?.response?.data?.detail ??
          error?.response?.data?.error ??
          "We couldn't change your password.",
      );
    }
  }

  async function handleAccountDeletion(data) {
    const confirmed = window.confirm(
      "This will permanently delete your account. Are you absolutely sure?",
    );

    if (!confirmed) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await deleteAccount(data.current_password);

      // The server should revoke tokens and delete the account.
      // The local logout action also clears the browser's auth state.
      try {
        await logout();
      } catch {
        // The account may already have been removed on the server.
      }

      navigate("/", {
        replace: true,
        state: {
          notice: "Your account deletion request was completed.",
        },
      });
    } catch (error) {
      setDeleteError(
        error?.response?.data?.detail ??
          error?.response?.data?.error ??
          "We couldn't delete your account.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <AccountPageHeader
        title="Account settings."
        description="Manage your sign-in security and account preferences."
      />

      {/* Password */}
      <section className="max-w-2xl border border-[#211B18]/10 bg-[#FFFCF7] p-5 sm:p-7">
        <div className="mb-6 flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center bg-[#F0E8DC]">
            <LockKeyhole size={18} className="text-[#A94F32]" />
          </div>
          <div>
            <h2 className="font-serif text-2xl">Change password</h2>
            <p className="mt-1 text-xs leading-5 text-[#766B63]">
              Choose a strong password that you don't use for other accounts.
            </p>
          </div>
        </div>

        <form
          onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
          className="space-y-5"
        >
          <FormField
            label="Current password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            register={passwordForm.register}
            error={passwordForm.formState.errors.current_password}
          />

          <FormField
            label="New password"
            name="new_password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            register={passwordForm.register}
            error={passwordForm.formState.errors.new_password}
          />

          <FormField
            label="Confirm new password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            register={passwordForm.register}
            error={passwordForm.formState.errors.confirm_password}
          />

          {passwordError && (
            <p role="alert" className="text-xs text-red-600">
              {passwordError}
            </p>
          )}

          {passwordMessage && (
            <p role="status" className="text-xs text-[#526B40]">
              {passwordMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={passwordForm.formState.isSubmitting}
            className="min-h-11 bg-[#211B18] px-6 text-xs font-medium uppercase tracking-[0.12em] text-white hover:bg-[#A94F32] disabled:opacity-60"
          >
            {passwordForm.formState.isSubmitting
              ? "Updating…"
              : "Update password"}
          </button>
        </form>
      </section>

      {/* Delete account */}
      <section className="mt-8 max-w-2xl border border-red-200 bg-red-50/50 p-5 sm:p-7">
        <div className="mb-5 flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center bg-red-100">
            <AlertTriangle size={18} className="text-red-700" />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-red-900">
              Delete account
            </h2>
            <p className="mt-1 text-xs leading-6 text-red-800/75">
              This is a permanent action. Your account access and saved
              customer data may be removed according to the applicable
              retention requirements. Existing financial and transaction
              records may need to be retained where required by law.
            </p>
          </div>
        </div>

        <form
          onSubmit={deleteForm.handleSubmit(handleAccountDeletion)}
          className="space-y-4"
        >
          <FormField
            label="Current password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            register={deleteForm.register}
            error={deleteForm.formState.errors.current_password}
          />

          <FormField
            label="Type DELETE to confirm"
            name="confirmation"
            placeholder="DELETE"
            register={deleteForm.register}
            error={deleteForm.formState.errors.confirmation}
          />

          {deleteError && (
            <p role="alert" className="text-xs text-red-700">
              {deleteError}
            </p>
          )}

          <button
            type="submit"
            disabled={deleting || deleteForm.formState.isSubmitting}
            className="min-h-11 border border-red-700 px-6 text-xs font-medium uppercase tracking-[0.12em] text-red-800 transition hover:bg-red-700 hover:text-white disabled:opacity-50"
          >
            {deleting ? "Deleting account…" : "Permanently delete account"}
          </button>
        </form>
      </section>
    </div>
  );
}