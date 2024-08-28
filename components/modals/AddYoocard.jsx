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
import { Textarea } from "@components/ui/textarea";
import { useToast } from "@components/ui/use-toast";
import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
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

  const router = useRouter();

  const { toast } = useToast();

  const submitHandler = async (e) => {
    e.preventDefault();
    YooCard.type = e.target.type.value;

    // compile card details data
    let DetailsInputValues = [];
    [...Array(parseInt(formDetailsInputCount))].forEach((count, index) => {
      let inputName = `details${index + 1}`;

      if (e.target[inputName].value !== "")
        DetailsInputValues.push(e.target[inputName].value);
    });

    YooCard.details = DetailsInputValues;

    setLoading((prevState) => (prevState ? false : true));

    try {
      const res = await createCard(YooCard).unwrap();
      setLoading((prevState) => (prevState ? false : true));
      if (res?.status == "Success") {
        toast({
          title: "Success",
          description: `Card created.`,
        });
        // clear form input data
        setYooCard({
          type: "",
          name: "",
          price: 0,
          details: "",
          previousPrice: 0,
        });
        setFormDetailsInputCount(0);
        router.push("/cards");
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
            <p className="text-center text-3xl font-thin">Add YooCard</p>
          </div>
          <div className="py-2">
            <div className="flex">
              <div className="m-auto py-2 w-4/5">
                <form onSubmit={submitHandler}>
                  <div className="grid grid-cols-2">
                    <div className="p-2">
                      <Label htmlFor="type" className="text-lg mb-1">
                        Card Type
                      </Label>
                      <Select
                        name="type"
                        onChange={(e) => {
                          setYooCard({
                            ...YooCard,
                            [e.target.name]: e.target.value,
                          });
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder="Select card type"
                            value={YooCard.type}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Card Type</SelectLabel>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="family">Family</SelectItem>
                            <SelectItem value="gold">Gold</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="p-2">
                      <Label htmlFor="name" className="text-lg mb-1">
                        Card Name
                      </Label>
                      <Input
                        type="text"
                        id="name"
                        placeholder="name is required"
                        name="name"
                        value={YooCard.name}
                        onChange={(e) => {
                          setYooCard({
                            ...YooCard,
                            [e.target.name]: e.target.value,
                          });
                        }}
                      />
                    </div>
                    <div className="p-2">
                      <Label htmlFor="price" className="text-lg mb-1">
                        Card Price
                      </Label>
                      <Input
                        type="number"
                        id="price"
                        placeholder="price is required"
                        name="price"
                        value={YooCard.price}
                        onChange={(e) => {
                          setYooCard({
                            ...YooCard,
                            [e.target.name]: e.target.value,
                          });
                        }}
                      />
                    </div>
                    <div className="p-2">
                      <Label htmlFor="previousPrice" className="text-lg mb-1">
                        Previous Price
                      </Label>
                      <Input
                        type="number"
                        id="previousPrice"
                        placeholder=""
                        name="previousPrice"
                        value={YooCard.previousPrice}
                        onChange={(e) => {
                          setYooCard({
                            ...YooCard,
                            [e.target.name]: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="flex justify-between pb-2">
                      <Label htmlFor="details" className="text-lg">
                        Card Details
                      </Label>
                      <div>
                        <Button
                          type={"button"}
                          onClick={() =>
                            setFormDetailsInputCount(
                              (prev, curr) => (curr = prev + 1)
                            )
                          }
                          className="text-md"
                        >
                          <Plus size={20} /> Input
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3">
                      {[...Array(parseInt(formDetailsInputCount))].map(
                        (count, index) => (
                          <div className="mr-2">
                            <Input
                              type="text"
                              id={`details${index + 1}`}
                              placeholder={`Input ${index + 1}`}
                              name={`details${index + 1}`}
                            />
                          </div>
                        )
                      )}
                    </div>
                    {/* <Textarea
                      name={"details"}
                      id={"details"}
                      value={YooCard.details}
                      onChange={(e) => {
                        setYooCard({
                          ...YooCard,
                          [e.target.name]: e.target.value,
                        });
                      }}
                    ></Textarea> */}
                  </div>
                  <div className="py-2">
                    <Button type="submit">
                      {isLoading ? <Loader2 /> : ""}Add Card
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

export default AddYoocard;
