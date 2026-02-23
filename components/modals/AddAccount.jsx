"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
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

const AddAccount = ({ closeModal, accountData, editmode, reloadAccounts }) => {
  const [isLoading, setLoading] = useState(false);
  const [User, setUser] = useState({
    _id: "",
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    gender: "",
    accountType: "",
  });

  const router = useRouter();
  const { toast } = useToast();
  const { userInfo } = useSelector((state) => state.auth);

  const [registerUser] = useRegisterMutation();
  const [updateUser] = useUpdateAdminUserAccountMutation();

  const resetForm = () => {
    setUser({
      _id: "",
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      gender: "",
      accountType: "",
    });
  };

  const closeModalAndReset = () => {
    resetForm();
    closeModal(false);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const payload = { ...User };
      const res = await (editmode
        ? updateUser(payload).unwrap()
        : registerUser(payload).unwrap());

      if (res?.status === "Success") {
        const message =
          res?.message ||
          `Account ${editmode ? "edited" : "created"} successfully.${
            editmode ? "" : ` Credentials emailed to ${res?.data}.`
          }`;

        toast({
          title: "Success",
          description: message,
          variant: res?.message?.includes("email failed") ? "warning" : "default",
        });

        console.log("Account operation response:", res);

        resetForm();
        reloadAccounts?.();
        closeModal(false);
        router.push("/accounts");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err?.data?.message ||
          err?.data ||
          err?.error ||
          "Something went wrong while saving the account.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editmode && accountData) {
      setUser((prev) => ({
        ...prev,
        _id: accountData._id,
        firstname: accountData.firstname || "",
        lastname: accountData.lastname || "",
        email: accountData.email || "",
        phone: accountData.phone || "",
        gender: accountData.gender || "",
        accountType: accountData.accountType || "",
      }));
    }
  }, [editmode, accountData]);

  return (
    <>
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 px-4 py-8">
        <div className="relative m-auto w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <div
            className="absolute right-6 top-6 cursor-pointer text-slate-500 hover:text-slate-800"
            onClick={closeModalAndReset}
          >
            <X size={26} />
          </div>
          <div className="px-8 pt-8 pb-4 border-b border-slate-100">
            <p className="text-center text-2xl font-semibold tracking-tight text-slate-900">
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
                    placeholder="Firstname is required"
                    name="firstname"
                    value={User.firstname}
                    onChange={(e) =>
                      setUser({ ...User, [e.target.name]: e.target.value })
                    }
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
                    placeholder="Lastname is required"
                    name="lastname"
                    value={User.lastname}
                    onChange={(e) =>
                      setUser({ ...User, [e.target.name]: e.target.value })
                    }
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
                    onChange={(e) =>
                      setUser({ ...User, [e.target.name]: e.target.value })
                    }
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
                    onChange={(e) =>
                      setUser({ ...User, [e.target.name]: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium text-slate-700">
                    Gender
                  </Label>
                  <Select
                    name="gender"
                    value={User.gender}
                    onChange={(e) =>
                      setUser({ ...User, gender: e.target.value })
                    }
                    placeholder="Select gender"
                  >
                    <option value="" disabled>
                      Select gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountType" className="text-sm font-medium text-slate-700">
                    Account Type
                  </Label>
                  <Select
                    name="accountType"
                    value={User.accountType}
                    onChange={(e) =>
                      setUser({ ...User, accountType: e.target.value })
                    }
                    placeholder="Select account type"
                  >
                    <option value="" disabled>
                      Select account type
                    </option>
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
    </>
  );
};

export default AddAccount;
