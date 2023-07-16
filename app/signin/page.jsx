"use client";

import { useLoginMutation } from "@/Slices/userApiSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setCredentials } from "@Slices/authSlice";
import { ToastAction } from "@components/ui/toast";
import { useToast } from "@components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Signin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);

  const router = useRouter();

  // const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login] = useLoginMutation();

  const { toast } = useToast();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) return router.push("/");
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      // set loading to be true
      setLoading((prevState) => (prevState ? false : true));

      const res = await login({ username, password }).unwrap();

      dispatch(setCredentials({ ...res }));

      // set loading to be false
      setLoading((prevState) => (prevState ? false : true));

      toast({
        title: "Logged In",
        description: `Successfully logged in as ${res?.lastname}`,
      });

      router.push("/");
    } catch (err) {
      // set loading to be false
      setLoading((prevState) => (prevState ? false : true));
      toast({
        variant: "destructive",
        title: "Error occured",
        description: err.data?.message
          ? err.data?.message
          : err.data || err.error,
      });
    }
  };

  return (
    <>
      <main>
        <div className="flex bg-slate-100 h-screen">
          <div className="m-auto w-3/5 shadow-md bg-white p-6 max-h-full h-4/5">
            <div className="pt-6 pb-2">
              <p className="text-center text-2xl font-bold">Admin-Auth</p>
              <p className="text-center text-xl mt-1">Sign in to continue</p>
            </div>
            <div className="pt-6 pb-2">
              <form onSubmit={submitHandler}>
                <div className="flex">
                  <div className="m-auto w-4/5 px-6 pt-4">
                    <div className="py-2">
                      <Label htmlFor="username" className="text-lg mb-1">
                        Username
                      </Label>
                      <Input
                        type="text"
                        id="username"
                        placeholder="Username is required"
                        name="username"
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="py-2">
                      <Label htmlFor="password" className="text-lg mb-1">
                        Password
                      </Label>
                      <Input
                        type="password"
                        id="password"
                        placeholder="password is required"
                        name="password"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="py-4">
                      <Button type="submit" className="text-lg">
                        {isLoading ? (
                          <Loader2 className="animate-spin mx-2" />
                        ) : (
                          ""
                        )}
                        Sign In
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Signin;
