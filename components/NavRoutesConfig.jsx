"use client";

import {
  CreditCardIcon,
  LucideSalad,
  MessagesSquare,
  PenBoxIcon,
  Settings2,
  Users2Icon,
  UsersIcon,
  ClipboardCheck, 
  BaggageClaim,
  Store
} from "lucide-react";
import { HiCreditCard, HiMenuAlt2, HiOutlineDocumentAdd } from "react-icons/hi";
export const SideNavRoutes=[
  {
      name: "Dashboard",
      icon: HiMenuAlt2,
      path: "/"
    },
    {
      name: "Products",
      icon: LucideSalad,
      path: "/products"
    },
    {
      name: "Vendors",
      icon: Users2Icon,
      path: "/vendors"
    },
    {
      name: "Delivery Partners",
      icon: UsersIcon,
      path: "/partners"
    },
    {
      name: "Subscriptions",
      icon: HiCreditCard,
      path: "/subscriptions"
    },
    {
      name: "Advertisement",
      icon: HiCreditCard,
      path: "/advertisement"
    },
    {
      name: "Advert Packages",
      icon: CreditCardIcon ,
      path: "/advert-packages"
    },
    {
      name: "Yoo Cards",
      icon: CreditCardIcon ,
      path: "/cards"
    },
    {
      name: "News Blog",
      icon: PenBoxIcon ,
      path: "/newsblogs"
    },
    // {
    //   name: "Messages",
    //   icon: <MessagesSquare size={25} />,
    //   path: "/messages"
    // },
    {
      name: "Accounts",
      icon: UsersIcon ,
      path: "/accounts"
    },
    {
      name: "Settings",
      icon: Settings2 ,
      path: "/settings"
    },
    {
      name: "Reports",
      icon: ClipboardCheck,
      path: "/reports"
    },
    {
      name: "Sales Reports",
      icon: BaggageClaim,
      path: "/salesreports"
    },
    {
      name: "Marketing Reports",
      icon: Store,
      path: "/marketingreports"
    } ,
    {
      name: "HR Reports",
      icon: Users2Icon,
      path: "/hrreports"
    }
  ]
export const SideNavRoutesx=[
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
      // {
      //   name: "Messages",
      //   icon: <MessagesSquare size={25} />,
      //   path: "/messages"
      // },
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
      },
      {
        name: "Sales Reports",
        icon: <BaggageClaim size={25} />,
        path: "/salesreports"
      },
      {
        name: "Marketing Reports",
        icon: <Store size={25} />,
        path: "/marketingreports"
      } ,
      {
        name: "HR Reports",
        icon: <Users2Icon size={25} />,
        path: "/hrreports"
      }
]