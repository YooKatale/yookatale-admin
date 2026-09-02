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
import { useProductCreateMutation, useProductsGetMutation } from "@Slices/productApiSlice";
import { useCategoriesGetMutation } from "@Slices/categoryApiSlice";

const AddProduct = ({ closeModal }) => {
  const DEFAULT_CATEGORY_LIST = [
    "Fruits",
    "Vegetables",
    "Meats",
    "Dairy",
    "Grains & Flour",
    "Juice",
    "Breakfast",
    "Lunch Meals",
    "Supper Meals",
    "Popular Products",
    "Recommended Products",
    "Featured Products",
    "Promotional Products",
    "Root Tubers",
    "Herbs & Spices",
    "Fats & Oils",
    "Roughages",
  ];

  const [isLoading, setLoading] = useState(false);
  const [categories, setCategories] = useState(
    DEFAULT_CATEGORY_LIST.map((name, index) => ({ _id: `fallback-${index}`, name }))
  );
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  const normalizeCategoryValue = (value) => {
    if (!value) return "";
    const text = String(value).trim();
    if (!text) return "";
    return text;
  };

  const router = useRouter();
  const { toast } = useToast();
  const { userInfo } = useSelector((state) => state.auth);

  const [createProduct] = useProductCreateMutation();
  const [fetchCategories] = useCategoriesGetMutation();
  const [fetchProducts] = useProductsGetMutation();

  const buildSubCategoryOptions = (categoryName, products) => {
    const values = products
      .filter((product) => {
        const productCategory = String(product?.category || "").trim();
        return !categoryName || productCategory.toLowerCase() === String(categoryName).trim().toLowerCase();
      })
      .map((product) => product?.subCategory)
      .filter(Boolean)
      .map((item) => String(item).trim())
      .filter((item, index, arr) => arr.indexOf(item) === index && item.length > 0);

    if (values.length > 0) return values;

    const categoryDefaults = {
      fruits: ["Citrus", "Bananas", "Apples", "Berries", "Pineapples"],
      vegetables: ["Leafy Greens", "Tomatoes", "Onions", "Cabbage", "Peppers"],
      meats: ["Beef", "Chicken", "Goat", "Fish", "Pork"],
      dairy: ["Milk", "Yogurt", "Cheese", "Butter", "Cream"],
      grains: ["Rice", "Maize", "Flour", "Wheat", "Pasta"],
      breakfast: ["Quick Meals", "Smoothies", "Baked Items", "Porridge"],
      lunch: ["Main Meals", "Wraps", "Rice Bowls", "Soup"],
      supper: ["Dinner Sets", "Staples", "Grilled Meals", "Stews"],
      juices: ["Fresh", "Blended", "Fruit Mix", "Vegetable Mix"],
    };

    const normalized = String(categoryName || "").trim().toLowerCase();
    return categoryDefaults[normalized] || ["Featured", "Popular", "Recommended", "New" ];
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoryRes, productRes] = await Promise.all([
          fetchCategories().unwrap(),
          fetchProducts().unwrap(),
        ]);

        const serverCategories = Array.isArray(categoryRes?.categories)
          ? categoryRes.categories
          : Array.isArray(categoryRes?.data)
            ? categoryRes.data
            : [];

        if (serverCategories.length > 0) {
          setCategories(serverCategories);
        } else {
          setCategories(DEFAULT_CATEGORY_LIST.map((name, index) => ({ _id: `fallback-${index}`, name })));
        }

        const productList = Array.isArray(productRes?.data) ? productRes.data : [];
        const allSubCategories = [...new Set(
          productList
            .map((product) => product?.subCategory)
            .filter((value) => typeof value === "string" && value.trim().length > 0)
            .map((value) => value.trim())
        )];

        setSubCategories(allSubCategories);
      } catch (err) {
        // fallback to empty state gracefully
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setSelectedSubCategory("");
      return;
    }

    const options = buildSubCategoryOptions(selectedCategory, []);
    if (!options.includes(selectedSubCategory) && options.length > 0) {
      setSelectedSubCategory(options[0]);
    }
  }, [selectedCategory]);

  const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = e.target;
      const fileInput = form.elements.images;
      if (fileInput?.files) {
        for (const file of fileInput.files) {
          if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            toast({ variant: "destructive", title: "Invalid file type", description: `"${file.name}" is not an allowed image type. Use JPG, PNG, WebP, or GIF.` });
            setLoading(false);
            return;
          }
          if (file.size > MAX_FILE_SIZE) {
            toast({ variant: "destructive", title: "File too large", description: `"${file.name}" exceeds the 5MB limit.` });
            setLoading(false);
            return;
          }
        }
      }
      const NewFormData = new FormData(form);
      const activeCategory = normalizeCategoryValue(selectedCategory);
      const activeSubCategory = normalizeCategoryValue(selectedSubCategory) || normalizeCategoryValue(form.elements.subCategory?.value);

      if (activeCategory) {
        NewFormData.set("category", activeCategory);
      }
      if (activeSubCategory) {
        NewFormData.set("subCategory", activeSubCategory);
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
                            <SelectItem key={category._id} value={category.name}>
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
                  <Select value={selectedSubCategory} onValueChange={setSelectedSubCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={subCategories.length > 0 ? "Select sub-category" : "No sub-categories available"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-80 overflow-y-auto">
                      <SelectGroup>
                        <SelectLabel>Available Sub-Categories</SelectLabel>
                        {subCategories.length > 0 ? (
                          subCategories.map((subCategory) => (
                            <SelectItem key={subCategory} value={subCategory}>
                              {subCategory}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="featured">Featured</SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="subCategory" value={selectedSubCategory} />
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
                <Input type="file" id="images" name="images" multiple required accept="image/jpeg,image/png,image/webp,image/gif" />
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
