import { useadvertPlanCreatePostMutation } from "@Slices/yoocacrdApiSlice";
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
import { Loader2, X } from "lucide-react";
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

  const router = useRouter();

    price: 0,

  const router = useRouter();

  });

  const [createPlan] = useCreateAdvertisementPackageMutation();
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
    setLoading(true);
    try {
      const res = await createPlan({
        ...advertPlan,
        benefits: selectedBenefits,
      }).unwrap();
      setLoading(false);
      if (res?.status === "Success") {
        toast({ title: "Success", description: "Plan created." });
        setAdvertPlan({ type: "", period: "", adverts: 0, price: 0 });
        setSelectedBenefits([]);
        closeModal(false);
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
            Add a new package
          </p>
        </div>
        <div className="px-8 pb-8 pt-4">
          <form onSubmit={submitHandler} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Plan type</Label>
                <Select
                  value={advertPlan.type}
                  onValueChange={(value) => setAdvertPlan({ ...advertPlan, type: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select plan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Plan type</SelectLabel>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Vip">VIP</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Period</Label>
                <Select
                  value={advertPlan.period}
                  onValueChange={(value) => setAdvertPlan({ ...advertPlan, period: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Period</SelectLabel>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="3 months">3 Months</SelectItem>
                      <SelectItem value="6 months">6 Months</SelectItem>
                      <SelectItem value="1 year">1 year</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium text-slate-700">Plan price</Label>
                <Input
                  type="number"
                  id="price"
                  placeholder="Price"
                  name="price"
                  value={advertPlan.price || ""}
                  onChange={(e) => setAdvertPlan({ ...advertPlan, price: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adverts" className="text-sm font-medium text-slate-700">Number of adverts</Label>
                <Input
                  type="number"
                  id="adverts"
                  placeholder="Number of adverts"
                  name="adverts"
                  value={advertPlan.adverts || ""}
                  onChange={(e) => setAdvertPlan({ ...advertPlan, adverts: Number(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Advert plan benefits</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {benefitPacks.map((pack, index) => (
                  <div className="flex items-center gap-2" key={index}>
                    <input
                      type="checkbox"
                      id={`benefit-${index}`}
                      checked={selectedBenefits.some((b) => b.value === pack.value)}
                      onChange={() => handleCheckBox(pack.value)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor={`benefit-${index}`} className="text-sm font-medium text-slate-700">
                      {pack.value}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => closeModal(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add package
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAdvertisementPackage;
