"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useToast } from "@components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useProductCreateMutation } from "@Slices/productApiSlice";
import { useCategoriesGetMutation } from "@Slices/categoryApiSlice";

const AddProduct = ({ closeModal }) => {
  const [isLoading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const router = useRouter();
  const { toast } = useToast();
  const { userInfo } = useSelector((state) => state.auth);

  const [createProduct] = useProductCreateMutation();
  const [fetchCategories] = useCategoriesGetMutation();

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategories().unwrap();
        if (res?.success && res?.categories) {
          setCategories(res.categories);
        }
      } catch (err) {
        // category fetch error silently handled
      }
    };
    loadCategories();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = e.target;
      const NewFormData = new FormData(form);

      if (selectedCategory) {
        NewFormData.set("category", selectedCategory);
      }

      const res = await createProduct(NewFormData).unwrap();

      if (res?.status === "Success") {
        toast({
          title: "Success",
          description: "Product added successfully",
        });
        router.push("/products");
        closeModal(false);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error occured",
        description: err?.data?.message || err?.data || err?.error,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 px-4 py-8">
        <div className="relative m-auto w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <div
            className="absolute right-6 top-6 cursor-pointer text-slate-500 hover:text-slate-800"
            onClick={() => closeModal(false)}
          >
            <X size={26} />
          </div>
          <div className="px-8 pt-8 pb-4 border-b border-slate-100">
            <p className="text-center text-2xl font-semibold tracking-tight text-slate-900">
              Add New Product
            </p>
          </div>
          <div className="px-8 pb-8 pt-4">
            <form onSubmit={submitHandler} encType="multipart/form-data" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                    Product Name
                  </Label>
                  <Input
                    type="text"
                    id="name"
                    placeholder="Name of product"
                    name="name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-slate-700">
                    Product Category
                  </Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80 overflow-y-auto">
                      <SelectGroup>
                        <SelectLabel>Available Categories</SelectLabel>
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <SelectItem
                              key={category._id}
                              value={category.name.toLowerCase().split(/[\s-]+/)[0]}
                            >
                              {category.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-category" disabled>
                            No categories available
                          </SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subCategory" className="text-sm font-medium text-slate-700">
                    Product Sub-Category
                  </Label>
                  <Input
                    type="text"
                    id="subCategory"
                    placeholder="eg. featured, recommended, popular..."
                    name="subCategory"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium text-slate-700">
                    Product Price
                  </Label>
                  <Input
                    type="number"
                    id="price"
                    placeholder="Price is required"
                    name="price"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-medium text-slate-700">
                    Quantity
                  </Label>
                  <Input
                    type="number"
                    id="quantity"
                    placeholder="Quantity"
                    name="quantity"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-sm font-medium text-slate-700">
                    Unit (e.g., kg, pieces, litres)
                  </Label>
                  <Input
                    type="text"
                    id="unit"
                    placeholder="Unit"
                    name="unit"
                    defaultValue="kg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPercentage" className="text-sm font-medium text-slate-700">
                    Discount Percentage (%)
                  </Label>
                  <Input
                    type="number"
                    id="discountPercentage"
                    placeholder="Discount Percentage"
                    name="discountPercentage"
                    defaultValue="0"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                  Product Description
                </Label>
                <Textarea
                  name="description"
                  placeholder="Product description is required"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="images" className="text-sm font-medium text-slate-700">
                  Product Images
                </Label>
                <Input type="file" id="images" name="images" multiple required />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => closeModal(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProduct;
