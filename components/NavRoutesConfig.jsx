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
  Package,
  Truck,
  UserCheck,
  RadioTower,
  FileText,
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
  "/orders",
  "/drivers",
  "/subscriptions",
  "/support",
  "/email-sender",
  "/settings",
];

export const isPathAllowedForEditor = (path) => EDITOR_ALLOWED_PATHS.includes(path);

export const SideNavRoutes = [
  { name: "Dashboard", icon: HiMenuAlt2, path: "/", editorCanAccess: true },
  { name: "Ops Control", icon: RadioTower, path: "/ops-control", editorCanAccess: false },
  { name: "Orders", icon: Package, path: "/orders", editorCanAccess: true },
  { name: "Drivers", icon: Truck, path: "/drivers", editorCanAccess: true },
  { name: "Vendors", icon: Users2Icon, path: "/vendors", editorCanAccess: false },
  { name: "Delivery Partners", icon: UsersIcon, path: "/partners", editorCanAccess: true },
  { name: "Seller Stores", icon: Store, path: "/seller-stores", editorCanAccess: false },
  { name: "Seller Listings", icon: ClipboardCheck, path: "/seller-listings", editorCanAccess: false },
  { name: "Subscriptions", icon: HiCreditCard, path: "/subscriptions", editorCanAccess: true },
  { name: "Referral Tracking", icon: UserCheck, path: "/referrals", editorCanAccess: false },
  { name: "Cashout & Payments", icon: Banknote, path: "/cashout", editorCanAccess: false },
  { name: "Products", icon: LucideSalad, path: "/products", editorCanAccess: true },
  { name: "Categories", icon: FolderTree, path: "/categories", editorCanAccess: true },
  { name: "Country Cuisines", icon: Globe, path: "/country-cuisines", editorCanAccess: true },
  { name: "Homepage / Hero", icon: LayoutDashboard, path: "/homepage-config", editorCanAccess: true },
  { name: "Customer Support", icon: MessagesSquare, path: "/support", editorCanAccess: true },
  { name: "Email Sender", icon: Mail, path: "/email-sender", editorCanAccess: true },
  { name: "Settings", icon: Settings2, path: "/settings", editorCanAccess: true },
  { name: "Daily Reports", icon: Store, path: "/dailyreports", editorCanAccess: false },
  { name: "Job Applications", icon: FileText, path: "/applications", editorCanAccess: false },
];
