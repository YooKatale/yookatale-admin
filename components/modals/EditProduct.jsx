"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useToast } from "@components/ui/use-toast";
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue,
} from "@components/ui/select";
import { useProductEditMutation } from "@Slices/productApiSlice";
import { useCategoriesGetMutation } from "@Slices/categoryApiSlice";

const EditProduct = ({ closeModal, product, onSuccess }) => {
  const APPROVED_CATEGORY_LIST = [
    "Bulk Products",
    "Popular Products",
    "Discover Products",
    "Promotional Products",
    "Recommended Products",
    "Fruits",
    "Meats",
    "Dairy",
    "Vegetables",
    "Fats & Oils",
    "Roughages",
    "Root Tubers",
    "Grains & Flour",
    "Spices & Herbs",
    "Juice",
    "Cuisines",
    "Breakfast",
    "Lunch Meals",
    "Supper Meals",
    "Supplements",
    "Rice",
    "Flour",
  ];

  const { toast } = useToast();
  const [isLoading, setLoading] = useState(false);
  const [categories, setCategories] = useState(
    APPROVED_CATEGORY_LIST.map((name, index) => ({ _id: `approved-${index}`, name }))
  );
  const [selectedCategory, setSelectedCategory] = useState(product?.category || "");

  const normalizeCategoryValue = (value) => {
    if (!value) return "";
    const text = String(value).trim();
    return text;
  };
  const [form, setForm] = useState({
    name: product?.name || "",
    subCategory: product?.subCategory || "",
    price: product?.price || "",
    quantity: product?.quantity || "",
    unit: product?.unit || "kg",
    discountPercentage: product?.discountPercentage || "0",
    description: product?.description || "",
  });

  const [editProduct] = useProductEditMutation();
  const [fetchCategories] = useCategoriesGetMutation();

  const categoryDefaults = {
    rice: ["White rice", "Brown rice", "Jasmine rice", "Basmati rice", "Swt rice", "Super rice", "Kaiso rice", "Pakistan rice"],
    flour: ["Wheat flour", "Sorghum flour", "Millet flour", "Maize flour"],
    fruits: ["Citrus", "Bananas", "Apples", "Berries", "Pineapples", "Mangoes", "Avocados"],
    vegetables: ["Leafy Greens", "Tomatoes", "Onions", "Cabbage", "Peppers", "Carrots", "Cucumbers"],
    meats: ["Beef", "Chicken", "Goat", "Fish", "Pork", "Turkey", "Lamb"],
    dairy: ["Milk", "Yogurt", "Cheese", "Butter", "Cream", "Ghee"],
    grains: ["Rice", "Maize", "Flour", "Wheat", "Pasta", "Millet"],
    breakfast: ["Quick Meals", "Smoothies", "Baked Items", "Porridge", "Cereal"],
    lunch: ["Main Meals", "Wraps", "Rice Bowls", "Soup", "Salads"],
    supper: ["Dinner Sets", "Staples", "Grilled Meals", "Stews", "Curries"],
    juice: ["Fresh", "Blended", "Fruit Mix", "Vegetable Mix", "Orange Juice"],
    cuisines: ["Local Cuisine", "Intercontinental", "Fast Foods", "Traditional Dishes"],
    "fats & oils": ["Cooking Oil", "Olive Oil", "Sunflower Oil", "Butter Oil"],
    roughages: ["Hay", "Fodder", "Green Feed", "Forage"],
    "root tubers": ["Cassava", "Sweet Potatoes", "Yams", "Irish Potatoes"],
    "spices & herbs": ["Ginger", "Garlic", "Onions", "Coriander", "Pepper"],
    supplements: ["Protein Supplements", "Vitamins", "Energy Boosters", "Minerals"],
    "bulk products": ["Family Pack", "Wholesale Pack", "Bulk Saver", "Store Pack"],
    "popular products": ["Best Seller", "Trending", "Customer Favorite"],
    "discover products": ["New Arrival", "Seasonal Deal", "Editor Pick"],
    "promotional products": ["Flash Sale", "Combo Offer", "Promo Pack"],
    "recommended products": ["Recommended", "Healthy Pick", "Top Rated"],
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchCategories().unwrap();
        const serverCategories = Array.isArray(res?.categories)
          ? res.categories
          : Array.isArray(res?.data)
            ? res.data
            : [];

        if (serverCategories.length > 0 && serverCategories.some((category) => category?.name)) {
          setCategories(
            serverCategories
              .map((category, index) => ({
                _id: category?._id || `server-${index}`,
                name: category?.name,
              }))
              .filter((category) => category.name)
          );
        } else {
          setCategories(
            APPROVED_CATEGORY_LIST.map((name, index) => ({ _id: `approved-${index}`, name }))
          );
        }
      } catch {
        setCategories(
          APPROVED_CATEGORY_LIST.map((name, index) => ({ _id: `approved-${index}`, name }))
        );
      }
    };
    load();
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  useEffect(() => {
    if (!selectedCategory) return;
    const normalized = String(selectedCategory).trim().toLowerCase();
    const defaults = categoryDefaults[normalized];
    if (defaults && !defaults.includes(String(form.subCategory || ""))) {
      setForm((previous) => ({ ...previous, subCategory: defaults[0] }));
    }
  }, [selectedCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.target);
      const nextCategory = normalizeCategoryValue(selectedCategory || product?.category || form.name);
      fd.set("category", nextCategory);
      // include all controlled fields explicitly
      Object.entries(form).forEach(([k, v]) => fd.set(k, v));

      const res = await editProduct({ id: product._id, formData: fd }).unwrap();

      if (res?.status === "Success") {
        toast({ title: "Product updated successfully" });
        onSuccess?.();
        closeModal();
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: err?.data?.message || err?.data?.error || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="relative m-auto w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="absolute right-5 top-5 cursor-pointer text-slate-400 hover:text-slate-700" onClick={closeModal}>
          <X size={22} />
        </div>
        <div className="px-8 pt-7 pb-4 border-b border-slate-100">
          <p className="text-xl font-bold text-slate-800">Edit Product</p>
          <p className="text-sm text-slate-500 mt-0.5">Update product details below</p>
        </div>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="px-8 pb-8 pt-5 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Product Name</Label>
              <Input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={product?.category || "Select category"} />
                </SelectTrigger>
                <SelectContent className="max-h-72 overflow-y-auto">
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Sub-Category</Label>
              <Input name="subCategory" value={form.subCategory} onChange={handleChange} placeholder="e.g. featured, popular..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Price (UGX)</Label>
              <Input type="number" name="price" value={form.price} onChange={handleChange} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Quantity</Label>
              <Input type="number" name="quantity" value={form.quantity} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Unit</Label>
              <Input name="unit" value={form.unit} onChange={handleChange} placeholder="kg, pieces, litres..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Discount (%)</Label>
              <Input type="number" name="discountPercentage" value={form.discountPercentage} onChange={handleChange} min="0" max="100" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700">Description</Label>
            <Textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700">Replace Images (optional)</Label>
            <Input type="file" name="images" multiple accept="image/jpeg,image/png,image/webp,image/gif" />
            <p className="text-xs text-slate-400">Leave empty to keep existing images</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
