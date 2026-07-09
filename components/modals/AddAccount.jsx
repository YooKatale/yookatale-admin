"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, X } from "lucide-react";

import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "@components/ui/use-toast";
import {
  useRegisterMutation,
  useUpdateAdminUserAccountMutation,
} from "@Slices/userApiSlice";
import { Select } from "@chakra-ui/react";

const INITIAL_USER_STATE = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  gender: "",
  accountType: "",
};

const AddAccount = ({ closeModal, accountData, editmode, reloadAccounts }) => {
  const [isLoading, setLoading] = useState(false);
  const [User, setUser] = useState(INITIAL_USER_STATE);

  const { toast } = useToast();

  const [registerUser] = useRegisterMutation();
  const [updateUser] = useUpdateAdminUserAccountMutation();

  const resetForm = () => {
    setUser(INITIAL_USER_STATE);
  };

  const closeModalAndReset = useCallback(() => {
    resetForm();
    closeModal(false);
  }, [closeModal]);

  // Generic change handler shared by inputs and selects
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const getErrorMessage = (err) => {
    const { message } = err?.data || {};
    if (typeof message === "string") return message;
    if (typeof err?.data === "string") return err.data;
    if (typeof err?.error === "string") return err.error;
    return `Something went wrong while ${editmode ? "updating" : "saving"} the account.`;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Only include _id when editing an existing account
      const payload = editmode
        ? { ...User, _id: accountData._id }
        : { ...User };

      const res = await (editmode
        ? updateUser(payload).unwrap()
        : registerUser(payload).unwrap());

      if (res?.status === "Success") {
        const message =
          res?.message ||
          `Account ${editmode ? "updated" : "created"} successfully.${editmode ? "" : ` Credentials emailed to ${res?.data}.`
          }`;

        toast({
          title: "Success",
          description: message,
          variant: res?.message?.includes("email failed") ? "warning" : "default",
        });

        resetForm();
        reloadAccounts?.();
        closeModal(false);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editmode && accountData) {
      setUser({
        firstname: accountData.firstname || "",
        lastname: accountData.lastname || "",
        email: accountData.email || "",
        phone: accountData.phone || "",
        gender: accountData.gender || "",
        accountType: accountData.accountType || "",
      });
    }
  }, [editmode, accountData]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeModalAndReset();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeModalAndReset]);

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 px-4 py-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModalAndReset();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-account-title"
        className="relative m-auto w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <button
          type="button"
          aria-label="Close"
          className="absolute right-6 top-6 cursor-pointer text-slate-500 hover:text-slate-800"
          onClick={closeModalAndReset}
        >
          <X size={26} />
        </button>
        <div className="px-8 pt-8 pb-4 border-b border-slate-100">
          <p
            id="add-account-title"
            className="text-center text-2xl font-semibold tracking-tight text-slate-900"
          >
            {editmode ? "Edit User" : "Add New User"}
          </p>
        </div>
        <div className="px-8 pb-8 pt-4">
          <form onSubmit={submitHandler} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstname" className="text-sm font-medium text-slate-700">
                  Firstname
                </Label>
                <Input
                  type="text"
                  id="firstname"
                  placeholder="First name is required"
                  name="firstname"
                  value={User.firstname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname" className="text-sm font-medium text-slate-700">
                  Lastname
                </Label>
                <Input
                  type="text"
                  id="lastname"
                  placeholder="Last name is required"
                  name="lastname"
                  value={User.lastname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Email is required"
                  name="email"
                  value={User.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                  Phone
                </Label>
                <Input
                  type="tel"
                  id="phone"
                  placeholder="eg. 07-------"
                  name="phone"
                  value={User.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium text-slate-700">
                  Gender
                </Label>
                <Select
                  id="gender"
                  name="gender"
                  value={User.gender}
                  onChange={handleChange}
                  placeholder="Select gender"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountType" className="text-sm font-medium text-slate-700">
                  Account Type
                </Label>
                <Select
                  id="accountType"
                  name="accountType"
                  value={User.accountType}
                  onChange={handleChange}
                  placeholder="Select account type"
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="iam">IAM</option>
                  <option value="editor">Editor</option>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeModalAndReset}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editmode ? "Update User" : "Add User"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAccount;
