"use client";

import { useNewsblogCreatePostMutation } from "@Slices/newsblogApiSlice";
import Navbar from "@components/Navbar";
import Sidenav from "@components/Sidenav";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { useToast } from "@components/ui/use-toast";
import { quillFormats, quillModules } from "@constants/contant";
import { Loader2Icon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
// import ReactQuill from "react-quill";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const Newblog = () => {
  const [EditorValue, setEditorValue] = useState("");
  const [NewsblogForm, setNewsblogForm] = useState({
    author: "YooKatale",
    title: "",
  });
  const [isLoading, setLoading] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const [createNewsblog] = useNewsblogCreatePostMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // set loading to be false
    setLoading((prevState) => (prevState ? false : true));

    const NewForm = new FormData(e.target);

    NewForm.append("blog", JSON.stringify(EditorValue));

    try {
      const res = await createNewsblog(NewForm).unwrap();

      // set loading to be false
      setLoading((prevState) => (prevState ? false : true));

      if (res?.status == "Success") {
        toast({
          title: "Success",
          description: "Newsblog created",
        });

        router.push("/newsblog");
      }
    } catch (err) {
      // set loading to be false
      setLoading((prevState) => (prevState ? false : true));
      console.log({ err });
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
      <main className="max-w-full">
        <div className="flex w-full">
          <Sidenav />
          <Navbar />
          <div className="flex w-full pt-12">
            <div className="w-1/5"></div>
            <div className="w-4/5 pt-4">
              {/* ------------------- main content here
          ---------------------------------------------------
          */}
              <div className="px-2 py-4">
                <div className="p-0 flex justify-between">
                  <div>{/* <p className="text-xl">Products</p> */}</div>
                </div>
                <div className="py-4 px-2">
                  <div className="py-4">
                    <p className="text-2xl">Create new Newsblog</p>
                  </div>
                  <div className="py-4 border border-slate-100 rounded-md">
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                      <div className="grid grid-cols-3">
                        <div className="py-2 mx-2">
                          <Label htmlFor="author" className="text-base mb-1">
                            Author
                          </Label>
                          <Input
                            type="text"
                            id="author"
                            name="author"
                            value={NewsblogForm.author}
                          />
                        </div>
                        <div className="py-2 mx-2">
                          <Label htmlFor="title" className="text-base mb-1">
                            Title
                          </Label>
                          <Input
                            type="text"
                            id="title"
                            name="title"
                            value={NewsblogForm.title}
                            onChange={(e) =>
                              setNewsblogForm({
                                ...NewsblogForm,
                                [e.target.name]: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="py-2 mx-2">
                          <Label htmlFor="title" className="text-base mb-1">
                            Blog Image
                          </Label>
                          <Input type="file" id="image" name="image" />
                        </div>
                      </div>
                      <div className="py-4 px-2">
                        <Label htmlFor="title" className="text-base mb-1">
                          Blog
                        </Label>
                        <ReactQuill
                          theme="snow"
                          value={EditorValue}
                          onChange={setEditorValue}
                          modules={quillModules}
                          formats={quillFormats}
                        />
                      </div>
                      <div className="p-2">
                        <Button type={"submit"} className={"text-md"}>
                          {isLoading && <Loader2Icon />}
                          Submit Newspost
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Newblog;
