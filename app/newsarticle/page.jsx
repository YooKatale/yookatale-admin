"use client";

import { useNewsArticleCreatePostMutation } from "@Slices/newsArticle.js";

import Navbar from "@components/Navbar";
import Sidenav from "@components/Sidenav";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { useToast } from "@components/ui/use-toast";
import { quillFormats, quillModules } from "@constants/constant";
import { Loader2Icon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
// import ReactQuill from "react-quill";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const NewsArticle = () => {
  const [EditorValue, setEditorValue] = useState("");
  const [NewsArticleForm, setNewsArticleForm] = useState({
    author: "",
    title: "",
  });
  const [isLoading, setLoading] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const [createNewsArticle] = useNewsArticleCreatePostMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // set loading to be false
    setLoading((prevState) => (prevState ? false : true));

    const NewForm = new FormData(e.target);

    NewForm.append("article", JSON.stringify(EditorValue));

    try {
      const res = await createNewsArticle(NewForm).unwrap();

      // set loading to be false
      setLoading((prevState) => (prevState ? false : true));

      if (res?.status == "Success") {
        toast({
          title: "Success",
          description: "NewsArticle created",
        });

        router.push("/");
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
      <div className="px-2 py-4">
                <div className="p-0 flex justify-between">
                  <div>{/* <p className="text-xl">Products</p> */}</div>
                </div>
                <div className="py-4 px-2">
                  <div className="py-4">
                    <p className="text-2xl">Create new NewsArticle</p>
                  </div>
                  <div className="py-4 border border-slate-100 rounded-md">
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                      <div className="grid grid-cols-3">
                        <div className="py-2 mx-2">
                          <Label htmlFor="title" className="text-base mb-1">
                            Title
                          </Label>
                          <Input
                            type="text"
                            id="title"
                            name="title"
                            value={NewsArticleForm.title}
                            onChange={(e) =>
                              setNewsArticleForm({
                                ...NewsArticleForm,
                                [e.target.name]: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="py-2 mx-2">
                          <Label htmlFor="title" className="text-base mb-1">
                            NewsArticle Image
                          </Label>
                          <Input type="file" id="image" name="image" />
                        </div>
                      </div>
                      <div className="py-4 px-2">
                        <Label htmlFor="title" className="text-base mb-1">
                          Article
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
                          Submit NewsArticle
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
      </main>
    </>
  );
};

export default NewsArticle;
