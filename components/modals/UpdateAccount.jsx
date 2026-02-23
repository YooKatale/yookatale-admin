"use client";

import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useToast } from "@components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Select } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useAccountUpdateMutation } from "@Slices/userApiSlice";

const UpdateAccount = ({ closeModal }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isLoading, setLoading] = useState(false);
  const [User, setUser] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    phone: "",
    gender: "",
    accountType: "",
    password: "",
    currPassword: "",
  });

  const router = useRouter();
  const [updateUser] = useAccountUpdateMutation();
  const { toast } = useToast();

  useEffect(() => {
    if (userInfo) {
      setUser({
        firstname: userInfo.firstname || "",
        lastname: userInfo.lastname || "",
        username: userInfo.username || "",
        email: userInfo.email || "",
        phone: userInfo.phone || "",
        gender: userInfo.gender || "",
        accountType: userInfo.accountType ?? userInfo.account ?? "",
        password: "",
        currPassword: "",
      });
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateUser({ ...User, id: userInfo?._id }).unwrap();
      setLoading(false);
      if (res?.status === "Success") {
        toast({
          title: "Success",
          description: "Account updated successfully. Details will be reflected on next login.",
        });
        closeModal(false);
        router.push("/settings");
      }
    } catch (err) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.data?.message || err.data || err.error,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8">
      <div className="relative m-auto w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div
          className="absolute right-6 top-6 cursor-pointer text-slate-500 hover:text-slate-800"
          onClick={() => closeModal(false)}
        >
          <X size={26} />
        </div>
        <div className="px-8 pt-8 pb-4 border-b border-slate-100">
          <p className="text-center text-2xl font-semibold tracking-tight text-slate-900">
            Update details
          </p>
        </div>
        <div className="px-8 pb-8 pt-4">
          <form onSubmit={submitHandler} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstname" className="text-sm font-medium text-slate-700">Firstname</Label>
                <Input
                  type="text"
                  id="firstname"
                  placeholder="Firstname is required"
                  name="firstname"
                  value={User.firstname}
                  onChange={(e) => setUser({ ...User, [e.target.name]: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname" className="text-sm font-medium text-slate-700">Lastname</Label>
                <Input
                  type="text"
                  id="lastname"
                  placeholder="Lastname is required"
                  name="lastname"
                  value={User.lastname}
                  onChange={(e) => setUser({ ...User, [e.target.name]: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-slate-700">Username</Label>
                <Input
                  type="text"
                  id="username"
                  placeholder="Username is required"
                  name="username"
                  value={User.username}
                  onChange={(e) => setUser({ ...User, [e.target.name]: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Email is required"
                  name="email"
                  value={User.email}
                  onChange={(e) => setUser({ ...User, [e.target.name]: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone</Label>
                <Input
                  type="tel"
                  id="phone"
                  placeholder="e.g. 07-------"
                  name="phone"
                  value={User.phone}
                  onChange={(e) => setUser({ ...User, [e.target.name]: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium text-slate-700">Gender</Label>
                <Select
                  name="gender"
                  value={User.gender}
                  onChange={(e) => setUser({ ...User, gender: e.target.value })}
                  placeholder="Select gender"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Account Type</Label>
                <Input type="text" value={User.accountType} disabled className="bg-slate-50" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">New Password (optional)</Label>
                <Input
                  type="password"
                  id="password"
                  placeholder="Leave blank to keep current"
                  name="password"
                  value={User.password}
                  onChange={(e) => setUser({ ...User, [e.target.name]: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="currPassword" className="text-sm font-medium text-slate-700">Current password to confirm</Label>
                <Input
                  type="password"
                  id="currPassword"
                  placeholder="Required if changing password"
                  name="currPassword"
                  value={User.currPassword}
                  onChange={(e) => setUser({ ...User, [e.target.name]: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => closeModal(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateAccount;

