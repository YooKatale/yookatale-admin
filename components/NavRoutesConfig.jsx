"use client";

import {
  CreditCardIcon,
  LucideSalad,
  LayoutDashboard,
  MessagesSquare,
  PenBoxIcon,
  Settings2,
  Users2Icon,
  UsersIcon,
  ClipboardCheck,
  BaggageClaim,
  Store,
  FolderTree,
  Banknote,
  Star,
  Mail,
  Globe,
} from "lucide-react";
import { HiCreditCard, HiMenuAlt2, HiOutlineDocumentAdd } from "react-icons/hi";
// Paths editors are allowed to access (settings, email sender, support, news blog, subscription, partners, categories, products)
export const EDITOR_ALLOWED_PATHS = [
  "/",
  "/products",
  "/categories",
  "/country-cuisines",
  "/homepage-config",
  "/partners",
  "/subscriptions",
  "/newsblogs",
  "/support",
  "/email-sender",
  "/settings",
];

export const isPathAllowedForEditor = (path) => EDITOR_ALLOWED_PATHS.includes(path);

export const SideNavRoutes = [
  { name: "Dashboard", icon: HiMenuAlt2, path: "/", editorCanAccess: true },
  { name: "Products", icon: LucideSalad, path: "/products", editorCanAccess: true },
  { name: "Categories", icon: FolderTree, path: "/categories", editorCanAccess: true },
  { name: "Country Cuisines", icon: Globe, path: "/country-cuisines", editorCanAccess: true },
  { name: "Homepage / Hero", icon: LayoutDashboard, path: "/homepage-config", editorCanAccess: true },
  { name: "Vendors", icon: Users2Icon, path: "/vendors", editorCanAccess: false },
  { name: "Delivery Partners", icon: UsersIcon, path: "/partners", editorCanAccess: true },
  { name: "Seller Stores", icon: Store, path: "/seller-stores", editorCanAccess: false },
  { name: "Seller Listings", icon: ClipboardCheck, path: "/seller-listings", editorCanAccess: false },
  { name: "Subscriptions", icon: HiCreditCard, path: "/subscriptions", editorCanAccess: true },
  { name: "Ratings & Feedback", icon: Star, path: "/ratings", editorCanAccess: false },
  { name: "Advertisement", icon: HiCreditCard, path: "/advertisement", editorCanAccess: false },
  { name: "Advert Packages", icon: CreditCardIcon, path: "/advert-packages", editorCanAccess: false },
  { name: "Yoo Cards", icon: CreditCardIcon, path: "/cards", editorCanAccess: false },
  { name: "News Blog", icon: PenBoxIcon, path: "/newsblogs", editorCanAccess: true },
  { name: "Accounts", icon: UsersIcon, path: "/accounts", editorCanAccess: false },
  { name: "Cashout & Payments", icon: Banknote, path: "/cashout", editorCanAccess: false },
  { name: "Customer Support", icon: MessagesSquare, path: "/support", editorCanAccess: true },
  { name: "Email Sender", icon: Mail, path: "/email-sender", editorCanAccess: true },
  { name: "Settings", icon: Settings2, path: "/settings", editorCanAccess: true },
  { name: "Daily Reports", icon: Store, path: "/dailyreports", editorCanAccess: false },
];

export const SideNavRoutesx = [
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
        name: "Cashout & Payments",
        icon: <Banknote size={25} />,
        path: "/cashout"
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
        name: "HR Reports",
        icon: <Users2Icon size={25} />,
        path: "/hrreports"
      },
      {
        name: "Marketing Reportsg",
        icon: <Store size={25} />,
        path: "/marketingreports"
      } ,
]