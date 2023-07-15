// import React from 'react'
"use client";

import {
  LucideSalad,
  MessagesSquare,
  Settings2,
  User2Icon,
  Users2Icon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HiMenuAlt2 } from "react-icons/hi";

const Sidenav = () => {
  return (
    <div className="p-4 w-1/5 bg-slate-100 h-screen max-h-screen overflow-y-auto overflow-x-hidden">
      <div className="py-4">
        <div className="flex">
          <div className="px-2">
            <Image
              src={"/assets/icons/logo1.png"}
              height={90}
              width={90}
              className="object-contain"
              alt="logo"
            />
          </div>
        </div>
        <div className="py-6 px-2">
          <div className="py-2">
            <Link href={"/"}>
              <div className="flex">
                <HiMenuAlt2 size={25} />
                <h3 className="mx-2 text-lg font-bold text-gray-600">
                  Dashboard
                </h3>
              </div>
            </Link>
          </div>
          <div className="py-2">
            <Link href={"/products"}>
              <div className="flex">
                <LucideSalad size={25} />
                <h3 className="mx-2 text-lg font-bold text-gray-600">
                  Products
                </h3>
              </div>
            </Link>
          </div>
          <div className="py-2">
            <Link href={"/customers"}>
              <div className="flex">
                <Users2Icon size={25} />
                <h3 className="mx-2 text-lg font-bold text-gray-600">
                  Customers
                </h3>
              </div>
            </Link>
          </div>
          <div className="py-2">
            <Link href={"/messages"}>
              <div className="flex">
                <MessagesSquare size={25} />
                <h3 className="mx-2 text-lg font-bold text-gray-600">
                  Messages
                </h3>
              </div>
            </Link>
          </div>
          <div className="py-2">
            <Link href={"/messages"}>
              <div className="flex">
                <Settings2 size={25} />
                <h3 className="mx-2 text-lg font-bold text-gray-600">
                  Settings
                </h3>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidenav;
