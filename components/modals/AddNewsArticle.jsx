"use client";

import { Button } from "@components/ui/button";
import { quillFormats, quillModules } from "@constants/constant";
import { X } from "lucide-react";
import { useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
// import React from 'react'

const AddNewsArticle = ({ closeModal }) => {
  const [EditorValue, setEditorValue] = useState("");

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
          <div className="pt-6 pb-4">
            <p className="text-center text-2xl font-thin">Create NewsArticle</p>
          </div>
          <div className="py-2">
            <div className="flex">
              <div className="m-auto py-2 w-4/5">
                <ReactQuill
                  theme="snow"
                  value={EditorValue}
                  onChange={setEditorValue}
                  modules={quillModules}
                  formats={quillFormats}
                />
                <div className="py-4">
                  <Button onClick={() => console.log(EditorValue)}>
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewsArticle;
