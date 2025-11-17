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
  //Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useEffect, useState } from "react";
import { useRegisterMutation, useUpdateAdminUserAccountMutation } from "@Slices/userApiSlice";
import { Select } from "@chakra-ui/react";

const AddAccount = ({ closeModal, accountData, editmode, reloadAccounts }) => {
  const [isLoading, setLoading] = useState(false);
  const [User, setUser] = useState({
    _id:"",
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    gender: "",
    accountType: "",
  });

  const router = useRouter();

  const [registerUser] = useRegisterMutation();
const [updateUser]=useUpdateAdminUserAccountMutation()
  const { toast } = useToast();

  const { userInfo } = useSelector((state) => state.auth);
  const closeModalAndUpdate=()=>{
    setUser({
      _id:"",
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      gender: "",
      accountType: "",
    });
     closeModal(false)
  }
  
  const submitHandler = async (e) => {
    e.preventDefault();

    // User.gender = e.target.gender.value;
    // User.accountType = e.target.accountType.value;

    setLoading(true);

    try {
    
      
      const res = await (editmode ? updateUser(User).unwrap() : registerUser(User).unwrap());
      
      

      if (res?.status == "Success"){
        setLoading(false);
        
        // Show appropriate message based on email status
        const message = res?.message || 
          `Account ${editmode?"Edited":"Created"} Successfully. ${editmode?"":`Credentials emailed to ${res?.data}`}`;
        
        toast({
          title: "Success",
          description: message,
          variant: res?.message?.includes("email failed") ? "warning" : "default",
        });
        
        // Log for debugging
        console.log("Account operation response:", res);
        
        // clear form input data
        closeModalAndUpdate()
        reloadAccounts()
        router.push("/accounts");
      }
    } catch (err) {
      // set loading to be false
      setLoading(false);

      toast({
        variant: "destructive",
        title: "Error occured",
        description: err.data?.message
          ? err.data?.message
          : err.data || err.error,
      });
    }
  };

  useEffect(()=>{
if(editmode){
  setUser({ ...User, _id:accountData._id,firstname:accountData.firstname, 
    lastname:accountData.lastname,accountType:accountData.accountType, 
    email:accountData.email, gender:accountData.gender, phone:accountData.phone })
 // setUser({...User, accountData})
}
  },[accountData])

const handleSelect=(name,e)=>{
  const fieldname = name==="accounType"?User.accountType:User.gender
  if(name==="accounType"){
  setUser({...User.accountType,  e })
  }else{
    setUser({ ...User.gender,  e })
  }
}
  return (
    <>
      <div className="p-8 flex bg-none justify-center items-center fixed z-30 top-0 left-0 right-0 bottom-0">
        <div className="m-auto w-4/5 h-full p-4 bg-white overflow-y-auto overflow-x-hidden rounded-md shadow-md relative">
          <div
            className="absolute top-4 right-8 cursor-pointer"
            onClick={closeModalAndUpdate}
          >
            <X size={30} />
          </div>
          <div className="pt-8 pb-4">
            <p className="text-center text-3xl font-thin">{editmode? "Edit User": "Add New User" }</p>
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
                    <Label htmlFor="gender" className="text-lg mb-1">Gender</Label>
                    <Select
                     
                      name="gender"
                      value={User.gender}
                      onChange={(e) =>
                        setUser({ ...User, [e.target.name]: e.target.value })
                      }
                    >
                       <option disabled></option>
                      <option value='male'>Male</option>
                      <option value='female'>Female</option>
                    </Select>
                    </div>

                    <div className="p-2">
                    <Label htmlFor="gender" className="text-lg mb-1">Account Type</Label>
                    <Select
                      name="accountType"
                      value={User.accountType}
                      onChange={(e) =>
                        setUser({ ...User, [e.target.name]: e.target.value })
                      }
                    >
                      <option disabled></option>
                      <option value='admin'>Admin</option>
                      <option value='iam'>IAM</option>
                      <option value='editor'>Editor</option>
                    </Select>
                    </div>
                   
                  </div>

                  
                  
                  <div className="py-2">
                    <Button type="submit">
                      {isLoading ? <Loader2 /> : ""}
                      {editmode?"Update User":"Add User"}
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
