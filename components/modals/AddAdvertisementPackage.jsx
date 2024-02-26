import { useadvertPlanCreatePostMutation } from "@Slices/yoocacrdApiSlice";
import { useCreateAdvertisementPackageMutation } from "@Slices/advertisementApiSlice";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useToast } from "@components/ui/use-toast";
import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const benefitPacks = [
  { value: "access to pro sales", isChecked: false },
  { value: "yookatale insights", isChecked: false },
  { value: "emails & social media link", isChecked: false },
  { value: "personal manager", isChecked: false },
];

const AddAdvertisementPackage = ({ closeModal }) => {
  const [isLoading, setLoading] = useState(false);
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [advertPlan, setAdvertPlan] = useState({
    type: "",
    adverts: 0,
    period: "",
    price: 0,
  });

  const [createPlan] = useCreateAdvertisementPackageMutation();

  const router = useRouter();

  const { toast } = useToast();
  const handleCheckBox = (value) => {
    const updatedBenefits = [...selectedBenefits];
    const existingBenefitIndex = updatedBenefits.findIndex(
      (benefit) => benefit.value === value
    );

    if (existingBenefitIndex !== -1) {
      updatedBenefits.splice(existingBenefitIndex, 1);
    } else {
      updatedBenefits.push({ value, isChecked: true });
    }

    setSelectedBenefits(updatedBenefits);
  };
 
  const submitHandler = async (e) => {
    e.preventDefault();
    advertPlan.type = e.target.type.value;
    advertPlan.period = e.target.period.value
    setLoading((prevState) => (prevState ? false : true));
    try {
      const res = await createPlan({
        ...advertPlan,
        benefits: selectedBenefits,
      }).unwrap();
      setLoading((prevState) => (prevState ? false : true));
      if (res?.status == "Success") {
        toast({
          title: "Success",
          description: `Plan created.`,
        });
        // clear form input data
        setAdvertPlan({
          type: "",
          period: "",
          adverts: 0,
          price: 0,
        });
        // router.push("/cards");
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
            <p className="text-center text-3xl font-thin">Add A New Package</p>
          </div>
          <div className="py-2">
            <div className="flex">
              <div className="m-auto py-2 w-4/5">
                <form onSubmit={submitHandler}>
                  <div className="grid grid-cols-2">
                    <div className="p-2">
                      <Label htmlFor="type" className="text-lg mb-1">
                        Plan Type
                      </Label>
                      <Select
                        name="type"
                        onChange={(e) => {
                          setAdvertPlan({
                            ...advertPlan,
                            [e.target.name]: e.target.value,
                          });
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder="Select plan type"
                            value={advertPlan.type}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Plan Type</SelectLabel>
                            <SelectItem value="Basic">Basic</SelectItem>
                            <SelectItem value="Vip">VIP</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="p-2">
                      <Label htmlFor="period" className="text-lg mb-1">
                        Period
                      </Label>
                      <Select
                        name="period"
                        onChange={(e) => {
                          setAdvertPlan({
                            ...advertPlan,
                            [e.target.name]: e.target.value,
                          });
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder="Select period"
                            value={advertPlan.period}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Plan Type</SelectLabel>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="3 months">3 Months</SelectItem>
                            <SelectItem value="6 months">6 Months</SelectItem>
                            <SelectItem value="1 year"> 1 year</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="p-2">
                      <Label htmlFor="price" className="text-lg mb-1">
                        Plan Price
                      </Label>
                      <Input
                        type="number"
                        id="price"
                        placeholder="price is required"
                        name="price"
                        value={advertPlan.price}
                        onChange={(e) => {
                          setAdvertPlan({
                            ...advertPlan,
                            [e.target.name]: e.target.value,
                          });
                        }}
                      />
                    </div>
                    <div className="p-2">
                      <Label htmlFor="adverts" className="text-lg mb-1">
                        Number of Adverts
                      </Label>
                      <Input
                        type="number"
                        id="adverts"
                        placeholder=""
                        name="adverts"
                        value={advertPlan.previousPrice}
                        onChange={(e) => {
                          setAdvertPlan({
                            ...advertPlan,
                            [e.target.name]: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="flex justify-between pb-2">
                      <Label htmlFor="details" className="text-lg">
                        Advert Plan Benefits
                      </Label>
                    </div>
                    <div className="grid grid-cols-4">
                      {benefitPacks.map((pack, index) => (
                        <div class="flex items-center mb-4" key={index}>
                          <input
                            id="checkbox-3"
                            type="checkbox"
                            defaultChecked={pack.isChecked}
                            className="w-4 h-4 rounded"
                            onChange={() => handleCheckBox(pack.value)}
                          />
                          <label className="ms-2 text-sm md:text-lg font-medium">
                            {pack.value}
                          </label>
                        </div>
                      ))}
                    </div>
                    {/* <Textarea
                      name={"details"}
                      id={"details"}
                      value={advertPlan.details}
                      onChange={(e) => {
                        setAdvertPlan({
                          ...advertPlan,
                          [e.target.name]: e.target.value,
                        });
                      }}
                    ></Textarea> */}
                  </div>
                  <div className="py-2">
                    <Button type="submit">
                      {isLoading ? <Loader2 /> : ""}Add Package
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

export default AddAdvertisementPackage;
