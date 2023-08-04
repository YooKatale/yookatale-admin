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

const EditProducut = ({ closeModal, product }) => {
  const [isLoading, setLoading] = useState(false);
  const [Product, setProduct] = useState({
    name: product.name,
    category: product.category,
    subCategory: product.subCategory,
    price: product.price,
    description: product.description,
  });

  const router = useRouter();

  const [editProduct] = useProductEditMutation();

  const { toast } = useToast();

  const { userInfo } = useSelector((state) => state.auth);

  const submitHandler = async (e) => {
    // set loading to be true
    setLoading({ ...isLoading, operation: "", status: false });

    e.preventDefault();
    try {
      const form = e.target;

      const NewFormData = new FormData(form);

      // append form values if empty
      NewFormData.append("product", JSON.stringify(Product));

      const res = await editProduct(NewFormData).unwrap();

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
                      <Select name="category">
                        <SelectTrigger className="w-full">
                          <SelectValue
                            // placeholder="Select a category"
                            placeholder={product?.category}
                            value={Product.category}
                            onChange={(e) =>
                              setProduct({
                                ...Product,
                                [e.target.name]: e.target.value,
                              })
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Category</SelectLabel>
                            <SelectItem value="roughages">Roughages</SelectItem>
                            <SelectItem value="fruits">Fruits</SelectItem>
                            <SelectItem value="root tubers">
                              Root tubers
                            </SelectItem>
                            <SelectItem value="vegetables">
                              Vegetables
                            </SelectItem>
                            <SelectItem value="grains and flour">
                              Grains and flour
                            </SelectItem>
                            <SelectItem value="meats">Meats</SelectItem>
                            <SelectItem value="fats&oils">
                              Fats & oils
                            </SelectItem>
                            <SelectItem value="herbs&spices">
                              Herbs & Spice
                            </SelectItem>
                            <SelectItem value="juice&meals">
                              Juice & Meals
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {/* <Input
                        type="text"
                        id="category"
                        placeholder="Category of product"
                        name="category"
                      /> */}
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

export default EditProducut;
