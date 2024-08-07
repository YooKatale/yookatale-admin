"use client";

import {
  CreditCardIcon,
  LucideSalad,
  MessagesSquare,
  PenBoxIcon,
  Settings2,
  Users2Icon,
  UsersIcon,
  ClipboardCheck 
} from "lucide-react";
import { HiCreditCard, HiMenuAlt2, HiOutlineDocumentAdd } from "react-icons/hi";
export const SideNavRoutes=[
    {
        name: "Dashboard",
        icon: <HiMenuAlt2 size={25} />,
        path: "/"
      },
      {
        name: "Products",
        icon: <LucideSalad size={25} />,
        path: "/products"
      },
      {
        name: "Vendors",
        icon: <Users2Icon size={25} />,
        path: "/vendors"
      },
      {
        name: "Delivery Partners",
        icon: <UsersIcon size={25} />,
        path: "/partners"
      },
      {
        name: "Subscriptions",
        icon: <HiCreditCard size={25} />,
        path: "/subscriptions"
      },
      {
        name: "Advertisement",
        icon: <HiCreditCard size={25} />,
        path: "/advertisement"
      },
      {
        name: "Advert Packages",
        icon: <CreditCardIcon size={25} />,
        path: "/advert-packages"
      },
      {
        name: "Yoo Cards",
        icon: <CreditCardIcon size={25} />,
        path: "/cards"
      },
      {
        name: "News Blog",
        icon: <PenBoxIcon size={25} />,
        path: "/newsblogs"
      },
      {
        name: "Messages",
        icon: <MessagesSquare size={25} />,
        path: "/messages"
      },
      {
        name: "Accounts",
        icon: <UsersIcon size={25} />,
        path: "/accounts"
      },
      {
        name: "Settings",
        icon: <Settings2 size={25} />,
        path: "/settings"
      },
      {
        name: "Reports",
        icon: <ClipboardCheck size={25} />,
        path: "/reports"
      }
]