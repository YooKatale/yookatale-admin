"use client";

import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useProductCreateMutation } from "@Slices/productApiSlice";
import { useToast } from "@components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useState } from "react";
import {
  useAccountUpdateMutation,
  useRegisterMutation,
} from "@Slices/userApiSlice";

const UpdateAccount = ({ closeModal }) => {
  const { userInfo } = useSelector((state) => state.auth);

  const [isLoading, setLoading] = useState(false);
  const [User, setUser] = useState({
    firstname: userInfo?.firstname,
    lastname: userInfo?.lastname,
    username: userInfo?.username,
    email: userInfo?.email,
    phone: userInfo?.phone,
    gender: userInfo?.gender,
    accountType: userInfo?.account,
    password: "",
    currPassword: "",
  });

  const router = useRouter();

  const [updateUser] = useAccountUpdateMutation();

  const { toast } = useToast();

  const submitHandler = async (e) => {
    e.preventDefault();

    setLoading((prevState) => (prevState ? false : true));

    try {
      const res = await updateUser({ ...User, id: userInfo?._id }).unwrap();

      setLoading((prevState) => (prevState ? false : true));

      if (res?.status == "Success") {
        toast({
          title: "Success",
          description: `Account updated successfully. Details will be reflected on next login`,
        });

        // clear form input data
        setUser({
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

        router.push("/settings");
      }
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
      <div className="p-8 flex bg-none justify-center items-center fixed z-30 top-0 left-0 right-0 bottom-0">
        <div className="m-auto w-4/5 h-full p-4 bg-white overflow-y-auto overflow-x-hidden rounded-md shadow-md relative">
          <div
            className="absolute top-4 right-8 cursor-pointer"
            onClick={() => closeModal(false)}
          >
            <X size={30} />
          </div>
          <div className="pt-8 pb-4">
            <p className="text-center text-3xl font-thin">Update details</p>
          </div>
          <div className="py-2">
            <div className="flex">
              <div className="m-auto py-2 w-4/5">
                <form onSubmit={submitHandler} encType="multipart/form-data">
                  <div className="grid grid-cols-2">
                    <div className="p-2">
                      <Label htmlFor="firstname" className="text-lg mb-1">
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
                      />
                    </div>
                    <div className="p-2">
                      <Label htmlFor="lastname" className="text-lg mb-1">
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
                      />
                    </div>
                    <div className="p-2">
                      <Label htmlFor="username" className="text-lg mb-1">
                        Username
                      </Label>
                      <Input
                        type="text"
                        id="username"
                        placeholder="Username is required"
                        name="username"
                        value={User.username}
                        onChange={(e) =>
                          setUser({ ...User, [e.target.name]: e.target.value })
                        }
                      />
                    </div>
                    <div className="p-2">
                      <Label htmlFor="email" className="text-lg mb-1">
                        Email
                      </Label>
                      <Input
                        type="text"
                        id="email"
                        placeholder="Email is required"
                        name="email"
                        value={User.email}
                        onChange={(e) =>
                          setUser({ ...User, [e.target.name]: e.target.value })
                        }
                      />
                    </div>
                    <div className="p-2">
                      <Label htmlFor="phone" className="text-lg mb-1">
                        Phone
                      </Label>
                      <Input
                        type="text"
                        id="phone"
                        placeholder="eg. 07-------"
                        name="phone"
                        value={User.phone}
                        onChange={(e) =>
                          setUser({ ...User, [e.target.name]: e.target.value })
                        }
                      />
                    </div>
                    <div className="p-2">
                      <Label htmlFor="gender" className="text-lg mb-1">
                        Gender
                      </Label>
                      <Select name="gender">
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder="Select gender"
                            value={User.gender}
                            onChange={(e) =>
                              setUser({
                                ...User,
                                [e.target.name]: e.target.value,
                              })
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Category</SelectLabel>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="p-2">
                      <Label htmlFor="account" className="text-lg mb-1">
                        Account Type
                      </Label>
                      <Select name="account" disabled>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder="Select account type"
                            value={User.accountType}
                            onChange={(e) =>
                              setUser({
                                ...User,
                                [e.target.name]: e.target.value,
                              })
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Account Types</SelectLabel>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="iam">IAM</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="px-2 py-4">
                      <Label htmlFor="password" className="text-lg mb-1">
                        New Password
                      </Label>
                      <Input
                        type="password"
                        id="password"
                        placeholder="password"
                        name="password"
                        value={User.password}
                        onChange={(e) =>
                          setUser({ ...User, [e.target.name]: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="px-2 py-4">
                    <Label htmlFor="currPassword" className="text-lg mb-1">
                      Enter your password to confirm
                    </Label>
                    <Input
                      type="password"
                      id="currPassword"
                      placeholder="current password"
                      name="currPassword"
                      value={User.currPassword}
                      onChange={(e) =>
                        setUser({ ...User, [e.target.name]: e.target.value })
                      }
                    />
                  </div>
                  {/* <div className="p-2">
                    <Label htmlFor="images" className="text-lg mb-1">
                      Product Images
                    </Label>
                    <Input type="file" id="images" name="images" multiple />
                  </div> */}
                  <div className="py-2">
                    <Button type="submit">
                      {isLoading ? <Loader2 /> : ""}Update
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateAccount;

