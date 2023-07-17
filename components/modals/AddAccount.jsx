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
import { useRegisterMutation } from "@Slices/userApiSlice";

const AddAccount = ({ closeModal }) => {
  const [isLoading, setLoading] = useState(false);
  const [User, setUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    gender: "",
    accountType: "",
  });

  const router = useRouter();

  const [registerUser] = useRegisterMutation();

  const { toast } = useToast();

  const { userInfo } = useSelector((state) => state.auth);

  const submitHandler = async (e) => {
    e.preventDefault();

    User.gender = e.target.gender.value;
    User.accountType = e.target.accountType.value;

    setLoading((prevState) => (prevState ? false : true));

    try {
      const res = await registerUser(User).unwrap();

      setLoading((prevState) => (prevState ? false : true));

      if (res?.status == "Success") {
        toast({
          title: "Success",
          description: `Account created successfully. Password emailed to ${res?.data}`,
        });

        // clear form input data
        setUser({
          firstname: "",
          lastname: "",
          email: "",
          phone: "",
          gender: "",
          accountType: "",
        });

        router.push("/accounts");
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
            <p className="text-center text-3xl font-thin">Add New User</p>
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
                      <Select
                        name="gender"
                        onChange={(e) =>
                          setUser({
                            ...User,
                            [e.target.name]: e.target.value,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder="Select gender"
                            value={User.gender}
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
                      <Select
                        name="accountType"
                        onChange={(e) =>
                          setUser({
                            ...User,
                            [e.target.name]: e.target.value,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder="Select account type"
                            value={User.accountType}
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
                  </div>
                  {/* <div className="p-2">
                    <Label htmlFor="images" className="text-lg mb-1">
                      Product Images
                    </Label>
                    <Input type="file" id="images" name="images" multiple />
                  </div> */}
                  <div className="py-2">
                    <Button type="submit">
                      {isLoading ? <Loader2 /> : ""}Add User
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

export default AddAccount;
