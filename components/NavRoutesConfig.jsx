"use client";

import {
  LucideSalad,
  LayoutDashboard,
  MessagesSquare,
  Settings2,
  Users2Icon,
  UsersIcon,
  ClipboardCheck,
  Store,
  FolderTree,
  Banknote,
  Mail,
  Globe,
  Package,
  Truck,
  UserCheck,
  RadioTower,
  FileText,
  Newspaper,
} from "lucide-react";
import { HiCreditCard, HiMenuAlt2 } from "react-icons/hi";

// Paths editors are allowed to access
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
  "/newsblogs",
  "/newsarticle",
  "/hrreports",
  "/settings",
];

export const isPathAllowedForEditor = (path) => EDITOR_ALLOWED_PATHS.includes(path);

// null groupLabel = standalone (renders directly, no collapsible wrapper)
export const SideNavGroups = [
  {
    groupLabel: null,
    items: [{ name: "Dashboard", icon: HiMenuAlt2, path: "/", editorCanAccess: true }],
  },
  {
    groupLabel: null,
    items: [{ name: "Orders", icon: Package, path: "/orders", editorCanAccess: true }],
  },
  {
    groupLabel: null,
    items: [{ name: "Products", icon: LucideSalad, path: "/products", editorCanAccess: true }],
  },
  {
    groupLabel: "Operations",
    groupIcon: RadioTower,
    items: [
      { name: "Ops Control", icon: RadioTower, path: "/ops-control", editorCanAccess: false },
      { name: "Drivers", icon: Truck, path: "/drivers", editorCanAccess: true },
      { name: "Delivery Partners", icon: UsersIcon, path: "/partners", editorCanAccess: true },
    ],
  },
  {
    groupLabel: "Marketplace",
    groupIcon: Store,
    items: [
      { name: "Categories", icon: FolderTree, path: "/categories", editorCanAccess: true },
      { name: "Country Cuisines", icon: Globe, path: "/country-cuisines", editorCanAccess: true },
      { name: "Vendors", icon: Users2Icon, path: "/vendors", editorCanAccess: false },
      { name: "Seller Stores", icon: Store, path: "/seller-stores", editorCanAccess: false },
      { name: "Seller Listings", icon: ClipboardCheck, path: "/seller-listings", editorCanAccess: false },
    ],
  },
  {
    groupLabel: "Users & Finance",
    groupIcon: Banknote,
    items: [
      { name: "Subscriptions", icon: HiCreditCard, path: "/subscriptions", editorCanAccess: true },
      { name: "Referral Tracking", icon: UserCheck, path: "/referrals", editorCanAccess: false },
      { name: "Cashout & Payments", icon: Banknote, path: "/cashout", editorCanAccess: false },
      { name: "Job Applications", icon: FileText, path: "/applications", editorCanAccess: false },
    ],
  },
  {
    groupLabel: null,
    items: [{ name: "News Articles", icon: Newspaper, path: "/newsblogs", editorCanAccess: true }],
  },
  {
    groupLabel: null,
    items: [
      { name: "Team Tasks", icon: ClipboardCheck, path: "/hrreports", editorCanAccess: true }
    ],
  },
  {
    groupLabel: null,
    items: [{ name: "Customer Support", icon: MessagesSquare, path: "/support", editorCanAccess: true }],
  },
  {
    groupLabel: "Content & Tools",
    groupIcon: LayoutDashboard,
    items: [
      { name: "Homepage / Hero", icon: LayoutDashboard, path: "/homepage-config", editorCanAccess: true },
      { name: "Email Sender", icon: Mail, path: "/email-sender", editorCanAccess: true },
    ],
  },
  {
    groupLabel: null,
    items: [
      { name: "Settings", icon: Settings2, path: "/settings", editorCanAccess: true },
      { name: "Users", icon: Users2Icon, path: "/users", editorCanAccess: false },
    ],
  },
];

// Flat list for any legacy usage
export const SideNavRoutes = SideNavGroups.flatMap((g) => g.items);
