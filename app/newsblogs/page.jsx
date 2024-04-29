"use client";

import { useNewsblogsFetchMutation } from "@Slices/newsblogApiSlice";
import Navbar from "@components/Navbar";
import Sidenav from "@components/Sidenav";
import { Button } from "@components/ui/button";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";

const NewsblogsPage = () => {
  const [modalState, setModalState] = useState(false);
  const [modal, setModal] = useState("");
  const [Newsblogs, setNewsblogs] = useState([]);

  const [fetchNewsblogs] = useNewsblogsFetchMutation();

  const handleDataFetch = async () => {
    try {
      const res = await fetchNewsblogs().unwrap();

      if (res.status == "Success") {
        setNewsblogs(res.data);
      }
    } catch (error) {}
  };

  useEffect(() => {
    handleDataFetch();
  }, []);

  // function to set modal data
  const handleModal = (modal) => {
    setModalState((prevState) => (prevState ? false : true));
    setModal(modal);
  };

  return (
    <>
      {/* --------------- display modal forms
        -------------------------------------------------- */}
      {/* {modalState && modal === "addNewsblog" ? (
        <AddNewsblog closeModal={setModalState} />
      ) : (
        <></>
      )} */}
      <main className="max-w-full">
        <div className="flex w-full">
          <Sidenav />
          <Navbar />
          <div className="flex flex-col lg:flex-row lg:w-full pt-12 w-[140%]">
            <div className="w-1/5"></div>
            <div className="w-4/5 pt-4">
              {/* ------------------- main content here
            ---------------------------------------------------
            */}
              <div className="px-2 py-4">
                <div className="p-2 flex justify-between">
                  <div>{/* <p className="text-xl">Products</p> */}</div>
                  <div className="flex justify-end">
                    <Link href={"/newblog"}>
                      <Button className="mx-2 text-lg">
                        Create new Newsblog
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="py-6 px-2">
                  <div className="grid grid-cols-3">
                    {Newsblogs.length > 0 &&
                      Newsblogs.map((newsblog, index) => (
                        <div
                          className="m-4 border border-slate-100 rounded-md"
                          key={index}
                        >
                          <a href={`/newsblog?id=${newsblog?._id}`}>
                            <div className="">
                              <img
                                src={`${newsblog?.image}`}
                                alt="newsblog image"
                                className="rounded-t-md"
                              />
                            </div>
                            <div className="p-2">
                              <h3 className="text-lg font-bold">
                                {newsblog?.title}
                              </h3>
                              <div className="__truncate my-2">
                                <p
                                  dangerouslySetInnerHTML={{
                                    __html: newsblog.blog,
                                  }}
                                ></p>
                              </div>
                              <div className="py-1">
                                <p className="font-bold text-gray-500">
                                  {moment(newsblog?.createdAt).fromNow()}
                                </p>
                              </div>
                            </div>
                          </a>
                        </div>
                      ))}
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

export default NewsblogsPage;
