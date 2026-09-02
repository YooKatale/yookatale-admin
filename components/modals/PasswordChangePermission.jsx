"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "@components/ui/use-toast";
import { useUpdateAdminUserAccountMutation } from "@Slices/userApiSlice";

const PasswordChangePermission = ({ account, closeModal, onSaved }) => {
  const [reason, setReason] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [updateAccount] = useUpdateAdminUserAccountMutation();
  const { toast } = useToast();

  const submitHandler = async (event) => {
    event.preventDefault();
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      toast({
        variant: "destructive",
        title: "Reason required",
        description: "Provide a reason before allowing this user to change their password.",
      });
      return;
    }

    setLoading(true);
    try {
      await updateAccount({
        _id: account._id,
        passwordChangeAllowed: true,
        passwordChangeReason: trimmedReason,
      }).unwrap();
      toast({
        title: "Password change enabled",
        description: `${account.firstname} can now request a password change.`,
      });
      onSaved?.({ ...account, passwordChangeAllowed: true, passwordChangeReason: trimmedReason });
      closeModal(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not enable password change",
        description: error?.data?.message || "The server rejected this permission change.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <button
          type="button"
          aria-label="Close"
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-800"
          onClick={() => closeModal(false)}
        >
          <X size={22} />
        </button>
        <h2 className="pr-8 text-xl font-semibold text-slate-900">Allow password change</h2>
        <p className="mt-2 text-sm text-slate-600">
          {account.firstname} {account.lastname} will be allowed to change their password.
        </p>
        <form onSubmit={submitHandler} className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="permission-reason">Reason</Label>
            <Input
              id="permission-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Why is password change being enabled?"
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => closeModal(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Allow change
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangePermission;
