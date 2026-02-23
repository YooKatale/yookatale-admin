import { useYoocardCreatePostMutation } from "@Slices/yoocacrdApiSlice";
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
import React, { useState } from "react";

const AddYoocard = ({ closeModal }) => {
  const [isLoading, setLoading] = useState(false);
  const [YooCard, setYooCard] = useState({
    type: "",
    name: "",
    price: 0,
    details: "",
    previousPrice: 0,
  });
  const [formDetailsInputCount, setFormDetailsInputCount] = useState(1);
  const [createCard] = useYoocardCreatePostMutation();
  const { toast } = useToast();

  const submitHandler = async (e) => {
    e.preventDefault();
    const DetailsInputValues = [];
    for (let i = 0; i < formDetailsInputCount; i++) {
      const val = e.target[`details${i + 1}`]?.value?.trim();
      if (val) DetailsInputValues.push(val);
    }
    const payload = { ...YooCard, details: DetailsInputValues };
    setLoading(true);
    try {
      const res = await createCard(payload).unwrap();
      setLoading(false);
      if (res?.status === "Success") {
        toast({ title: "Success", description: "Card created." });
        setYooCard({ type: "", name: "", price: 0, details: "", previousPrice: 0 });
        setFormDetailsInputCount(1);
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
            Add YooCard
          </p>
        </div>
        <div className="px-8 pb-8 pt-4">
          <form onSubmit={submitHandler} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Card type</Label>
                <Select
                  value={YooCard.type}
                  onValueChange={(value) => setYooCard({ ...YooCard, type: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Card type</SelectLabel>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700">Card name</Label>
                <Input
                  type="text"
                  id="name"
                  placeholder="Name is required"
                  name="name"
                  value={YooCard.name}
                  onChange={(e) => setYooCard({ ...YooCard, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium text-slate-700">Card price</Label>
                <Input
                  type="number"
                  id="price"
                  placeholder="Price"
                  name="price"
                  value={YooCard.price || ""}
                  onChange={(e) => setYooCard({ ...YooCard, price: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousPrice" className="text-sm font-medium text-slate-700">Previous price</Label>
                <Input
                  type="number"
                  id="previousPrice"
                  placeholder="Previous price"
                  name="previousPrice"
                  value={YooCard.previousPrice || ""}
                  onChange={(e) => setYooCard({ ...YooCard, previousPrice: Number(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-slate-700">Card details</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormDetailsInputCount((prev) => prev + 1)}
                >
                  <Plus size={16} className="mr-1" /> Add line
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[...Array(Math.max(1, formDetailsInputCount))].map((_, index) => (
                  <Input
                    key={index}
                    type="text"
                    id={`details${index + 1}`}
                    placeholder={`Detail ${index + 1}`}
                    name={`details${index + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => closeModal(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add card
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddYoocard;
