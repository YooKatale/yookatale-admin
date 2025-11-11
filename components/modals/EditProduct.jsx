"use client";

import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2, X } from "lucide-react";
import { useSelector } from "react-redux";
import {
  useProductCreateMutation,
  useProductEditMutation,
} from "@Slices/productApiSlice";
import { useCategoriesGetMutation } from "@Slices/categoryApiSlice";
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
import { useState, useEffect } from "react";
import axios from "axios";
import { DB_URL } from "@config/config";
import { BACKEND_URL } from "@constants/constant";

const EditProduct = ({ closeModal, product }) => {
  const [isLoading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [Product, setProduct] = useState({
    id: product._id,
    name: product.name,
    category: product.category,
    subCategory: product.subCategory,
    price: product.price,
    description: product.description,
  });

  const router = useRouter();

  const [editProduct] = useProductEditMutation();
  const [fetchCategories] = useCategoriesGetMutation();

  const { toast } = useToast();

  const { userInfo } = useSelector((state) => state.auth);

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategories().unwrap();
        if (res?.success && res?.categories) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    loadCategories();
  }, []);

  const submitHandlerd = async (e) => {
    
    setLoading({ ...isLoading, operation: "", status: false });

    e.preventDefault();
    const form = e.target;
      const NewFormData = new FormData(form);
      const formDataObject = {};
  // Loop through the FormData entries
  for (const [key, value] of NewFormData.entries()) {
    if (value instanceof File) {
      // Log any file present
      console.log(`${key}:`, value); 
      formDataObject[key] = value;
    } else {
      formDataObject[key] = value;
    }
  }
    try {
      //append form values if empty
      NewFormData.append("product", JSON.stringify(Product));
      const res = await editProduct(formDataObject).unwrap();
      // set loading to be false
      setLoading({ ...isLoading, operation: "", status: false });
      if (res?.status == "Success") {
        toast({
          title: "Success",
          description: "Product edited successfully",
        });

        router.push("/products");
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
  const submitHandler = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const config = {
      headers: {
          'content-type': 'multipart/form-data'
      }
  };
    setLoading({ ...isLoading, operation: "", status: false });
  
    const form = e.target;
    const NewFormData = new FormData(form); // Create FormData from form
  
    // Manually add the selected category since Select component doesn't work with FormData directly
    if (Product.category) {
      NewFormData.set('category', Product.category);
    }
  
    // Append the product details to FormData
    //NewFormData.append("product", JSON.stringify(Product));
    try {
      // Send the form data through the mutation
      //const res = await editProduct(NewFormData).unwrap(); // Pass FormData directly
      const res = await axios.put(`${BACKEND_URL}/admin/product/edit/${Product.id}`, NewFormData, config);
      // Stop loading
      setLoading({ ...isLoading, operation: "", status: false });

      // Handle success
      if (res.data?.status === "Success") {
        toast({
          title: "Success",
          description: "Product edited successfully",
        });
        router.push("/products");
      }
    } catch (err) {
      // Stop loading
      setLoading({ ...isLoading, operation: "", status: false });
  
      // Handle errors
      toast({
        variant: "destructive",
        title: "Error occurred",
        description: err.data?.error,
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
            <p className="text-center text-3xl font-thin">Edit Product</p>
          </div>
          <div className="py-2">
            <div className="flex">
              <div className="m-auto py-2 w-4/5">
                <form onSubmit={submitHandler} encType="multipart/form-data">
                  <div className="grid grid-cols-2">
                    <div className="p-2" hidden>
                      <Label htmlFor="name" className="text-lg mb-1">
                        Product Name
                      </Label>
                      <Input type="text" name="id" value={product?._id} />
                    </div>
                    <div className="p-2">
                      <Label htmlFor="name" className="text-lg mb-1">
                        Product Name
                      </Label>
                      <Input
                        type="text"
                        id="name"
                        // placeholder="Name of product"
                        name="name"
                        placeholder={product?.name}
                        value={Product.name}
                        onChange={(e) =>
                          setProduct({
                            ...Product,
                            [e.target.name]: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="p-2">
                      <Label htmlFor="category" className="text-lg mb-1">
                        Product Category
                      </Label>
                      <Select 
                        value={Product.category}
                        onValueChange={(value) =>
                          setProduct({
                            ...Product,
                            category: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={product?.category || "Select a category"}
                          />
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
                    <div className="p-2">
                      <Label htmlFor="subCategory" className="text-lg mb-1">
                        Product Sub-Category
                      </Label>
                      <Input
                        type="text"
                        id="subCategory"
                        placeholder="eg featured, recommended, popular..."
                        name="subCategory"
                        value={Product.subCategory}
                        onChange={(e) =>
                          setProduct({
                            ...Product,
                            [e.target.name]: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="p-2">
                      <Label htmlFor="price" className="text-lg mb-1">
                        Product Price
                      </Label>
                      <Input
                        type="number"
                        id="price"
                        // placeholder="Price is required"
                        name="price"
                        placeholder={product?.price}
                        value={Product.price}
                        onChange={(e) =>
                          setProduct({
                            ...Product,
                            [e.target.name]: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="p-2">
                    <Label htmlFor="description" className="text-lg mb-1">
                      Product Description
                    </Label>
                    <Textarea
                      name="description"
                      //   placeholder="Product description is required"
                      placeholder={product?.description}
                      value={Product.description}
                      onChange={(e) =>
                        setProduct({
                          ...Product,
                          [e.target.name]: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="p-2">
                    <Label htmlFor="images" className="text-lg mb-1">
                      Product Images
                    </Label>
                    <Input type="file" id="images" name="images" multiple />
                  </div>
                  <div className="py-2">
                    <Button type="submit">
                      {isLoading ? <Loader2 /> : ""}Edit Product
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

export default EditProduct;
