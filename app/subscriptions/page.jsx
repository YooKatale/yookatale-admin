"use client";

import {
  useSubscriptionsApproveMutation,
  useSubscriptionsRejectMutation,
  useSubscriptionsBulkDeleteMutation,
  useSubscriptionsFetchMutation,
  useSubscriptionPackagesFetchMutation,
  useSubscriptionPackageCreateMutation,
  useSubscriptionPackageUpdateMutation,
  useSubscriptionPackageDeleteMutation,
  useMealCalendarOverridesFetchMutation,
  useMealCalendarOverrideUpsertMutation,
  useMealSlotsFetchMutation,
  useMealSlotUpsertMutation,
} from "@Slices/yoocacrdApiSlice";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  VStack,
  Card,
  CardBody,
  IconButton,
  FormControl,
  FormLabel,
  Textarea,
  Badge,
  Spinner,
  Center,
  Avatar,
  Stat,
  StatLabel,
  StatNumber,
  Tooltip,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@components/ui/alert-dialog";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  UtensilsCrossed,
  ChevronUp,
  ChevronDown,
  CreditCard,
  Package,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Clock,
  Users,
  DollarSign,
  Star,
  Trash2 as Trash2Icon,
  Filter,
  ChevronRight,
} from "lucide-react";
import { BACKEND_URL } from "@constants/constant";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const MEAL_TYPES = ["breakfast", "lunch", "supper", "full-day", "ingredient-refill"];
const INCOME_LEVELS = ["middle", "low", "high"];
const PREP_TYPES = ["ready-to-eat", "ready-to-cook"];
const CUSTOMER_TYPES = ["individual", "family", "business"];
const PACKAGE_TIERS = ["low", "middle", "high"];
const SPECIAL_SUBSCRIPTION_TYPES = ["milk", "beef"];

const getSubUserLabel = (sub) => {
  const user = sub?.user || {};
  const fullName = [user?.firstname, user?.lastname].filter(Boolean).join(" ").trim();
  return fullName || user?.email || "Unknown User";
};

const getPackageErrorMessage = (error, fallback) =>
  error?.data?.message || error?.data?.error || fallback;

const emptyIncomeTiers = () => ({
  low: { weekly: "", monthly: "", quantity: "" },
  middle: { weekly: "", monthly: "", quantity: "" },
  high: { weekly: "", monthly: "", quantity: "" },
});

const TAB_CONFIG = [
  { key: "yoocards", label: "YooCards", icon: CreditCard, color: "green", desc: "Pending subscription approvals" },
  { key: "plans", label: "Meal Plans", icon: Package, color: "purple", desc: "Manage subscription packages" },
  { key: "calendar", label: "Meal Calendar", icon: Calendar, color: "orange", desc: "Weekly meal slots & images" },
];

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState("yoocards");
  const [subscriptionsData, setSubscriptionsData] = useState([]);
  const [packages, setPackages] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [slots, setSlots] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [packageError, setPackageError] = useState("");
  const [loadingOverrides, setLoadingOverrides] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [subFilter, setSubFilter] = useState("pending");
  const [selectedSubs, setSelectedSubs] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [fetchSubscriptions] = useSubscriptionsFetchMutation();
  const [approveSubscription] = useSubscriptionsApproveMutation();
  const [rejectSubscription] = useSubscriptionsRejectMutation();
  const [bulkDeleteSubscriptions] = useSubscriptionsBulkDeleteMutation();
  const [fetchPackages] = useSubscriptionPackagesFetchMutation();
  const [createPackage] = useSubscriptionPackageCreateMutation();
  const [updatePackage] = useSubscriptionPackageUpdateMutation();
  const [deletePackage] = useSubscriptionPackageDeleteMutation();
  const [fetchOverrides] = useMealCalendarOverridesFetchMutation();
  const [upsertOverride] = useMealCalendarOverrideUpsertMutation();
  const [fetchSlots] = useMealSlotsFetchMutation();
  const [upsertSlot] = useMealSlotUpsertMutation();

  const toast = useToast();
  const { isOpen: isPlanOpen, onOpen: onPlanOpen, onClose: onPlanClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    type: "individual",
    name: "",
    price: "",
    previousPrice: "",
    details: "",
    incomeTiers: emptyIncomeTiers(),
  });
  const [packageTypeFilter, setPackageTypeFilter] = useState("all");
  const [packageSection, setPackageSection] = useState("main");
  const [packageTierSelections, setPackageTierSelections] = useState({});

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setSelectedSubs([]);
    try {
      const res = await fetchSubscriptions(subFilter).unwrap();
      if (res?.status === "Success") setSubscriptionsData(res?.data || []);
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Failed to load", status: "error", duration: 4000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [fetchSubscriptions, toast, subFilter]);

  const loadPackages = useCallback(async () => {
    setLoadingPackages(true);
    setPackageError("");
    try {
      const res = await fetchPackages().unwrap();
      if (res?.status === "Success") setPackages(res?.data || []);
      else setPackageError(getPackageErrorMessage({ data: res }, "Failed to load subscription packages."));
    } catch (e) {
      setPackageError(getPackageErrorMessage(e, "Failed to load subscription packages."));
    } finally {
      setLoadingPackages(false);
    }
  }, [fetchPackages, toast]);

  const loadOverrides = useCallback(async () => {
    setLoadingOverrides(true);
    try {
      const res = await fetchOverrides().unwrap();
      if (res?.status === "Success") setOverrides(res?.data || []);
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Failed to load overrides", status: "error", duration: 4000, isClosable: true });
    } finally {
      setLoadingOverrides(false);
    }
  }, [fetchOverrides, toast]);

  const loadSlots = useCallback(async () => {
    setLoadingSlots(true);
    try {
      const res = await fetchSlots().unwrap();
      if (res?.status === "Success") setSlots(res?.data || []);
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Failed to load slots", status: "error", duration: 4000, isClosable: true });
    } finally {
      setLoadingSlots(false);
    }
  }, [fetchSlots, toast]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ["polling"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.emit("join:admin");
    socket.on("subscription:update", () => {
      toast({ title: "Subscription updated", status: "info", duration: 3000, isClosable: true });
      loadSubscriptions();
    });
    socket.on("meal:calendar:update", () => {
      toast({ title: "Meal calendar updated", status: "info", duration: 3000, isClosable: true });
      loadOverrides();
      loadSlots();
    });
    socket.on("admin:subscription_update", () => {
      toast({ title: "Subscription notification", status: "info", duration: 3000, isClosable: true });
      loadSubscriptions();
    });
    socket.on("admin:meal_update", () => {
      toast({ title: "Meal notification", status: "info", duration: 3000, isClosable: true });
      loadOverrides();
      loadSlots();
    });

    return () => socket.disconnect();
  }, [loadOverrides, loadSlots, loadSubscriptions, toast]);

  useEffect(() => {
    if (activeTab === "calendar" && slots.length === 0) {
      loadOverrides();
      loadSlots();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async (id) => {
    try {
      await approveSubscription(id).unwrap();
      toast({ title: "Subscription approved", status: "success", duration: 3000, isClosable: true });
      loadSubscriptions();
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Failed", status: "error", duration: 4000, isClosable: true });
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectSubscription(id).unwrap();
      toast({ title: "Subscription rejected", status: "info", duration: 3000, isClosable: true });
      loadSubscriptions();
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Failed", status: "error", duration: 4000, isClosable: true });
    }
  };

  const handleBulkDelete = async (mode) => {
    setBulkDeleting(true);
    try {
      const body = mode === "selected" ? { ids: selectedSubs } : { status: subFilter };
      const res = await bulkDeleteSubscriptions(body).unwrap();
      toast({ title: `${res?.deletedCount || 0} subscription(s) deleted`, status: "success", duration: 3000, isClosable: true });
      loadSubscriptions();
    } catch (e) {
      toast({ title: "Bulk delete failed", description: e?.data?.message || "Failed", status: "error", duration: 4000, isClosable: true });
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelectSub = (id) => setSelectedSubs((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleSelectAll = () => {
    if (selectedSubs.length === subscriptionsData.length) setSelectedSubs([]);
    else setSelectedSubs(subscriptionsData.map((s) => s._id));
  };

  const openAddPlan = (type = "individual") => {
    setEditingPlan(null);
    setPlanForm({
      type,
      name: SPECIAL_SUBSCRIPTION_TYPES.includes(type) ? `${type[0].toUpperCase()}${type.slice(1)} Subscription` : "",
      price: "",
      priceWeekly: "",
      priceMonthly: "",
      quantity: "",
      previousPrice: "",
      details: "",
      incomeTiers: emptyIncomeTiers(),
    });
    onPlanOpen();
  };

  const openEditPlan = (p) => {
    setEditingPlan(p);
    setPlanForm({
      type: p?.type || "individual",
      name: p?.name || "",
      price: p?.price ?? "",
      priceWeekly: p?.priceWeekly ?? p?.weeklyPrice ?? "",
      priceMonthly: p?.priceMonthly ?? p?.monthlyPrice ?? "",
      quantity: p?.quantity ?? "",
      previousPrice: p?.previousPrice ?? "",
      details: Array.isArray(p?.details) ? p.details.join("\n") : p?.details || "",
      incomeTiers: PACKAGE_TIERS.reduce((tiers, tier) => ({
        ...tiers,
        [tier]: {
          weekly: p?.incomeTiers?.[tier]?.weekly ?? "",
          monthly: p?.incomeTiers?.[tier]?.monthly ?? "",
          quantity: p?.incomeTiers?.[tier]?.quantity ?? "",
        },
      }), emptyIncomeTiers()),
    });
    onEditOpen();
  };

  const [saving, setSaving] = useState(false);
  const [deletingPackageId, setDeletingPackageId] = useState(null);

  const handleSavePlan = async () => {
    const type = String(planForm.type || "").trim();
    const name = String(planForm.name || "").trim();
    const isSpecialSubscription = SPECIAL_SUBSCRIPTION_TYPES.includes(type);
    let payload;

    if (isSpecialSubscription) {
      const priceWeekly = Number(planForm.priceWeekly);
      const priceMonthly = Number(planForm.priceMonthly);
      const quantity = String(planForm.quantity || "").trim();
      if (!name || planForm.priceWeekly === "" || planForm.priceMonthly === "" ||
          !Number.isFinite(priceWeekly) || priceWeekly < 0 ||
          !Number.isFinite(priceMonthly) || priceMonthly < 0 || !quantity) {
        toast({ title: "Subscription details required", description: "Enter a name, valid weekly and monthly prices, and quantity.", status: "warning", duration: 4000, isClosable: true });
        return;
      }
      payload = { type, name, priceWeekly, priceMonthly, quantity };
    } else {
      const price = Number(planForm.price);
      const previousPrice = planForm.previousPrice === "" ? undefined : Number(planForm.previousPrice);
      const details = String(planForm.details || "")
        .split("\n")
        .map((detail) => detail.trim())
        .filter(Boolean);
      const incomeTiers = PACKAGE_TIERS.reduce((tiers, tier) => ({
        ...tiers,
        [tier]: {
          weekly: Number(planForm.incomeTiers?.[tier]?.weekly),
          monthly: Number(planForm.incomeTiers?.[tier]?.monthly),
          quantity: String(planForm.incomeTiers?.[tier]?.quantity || "").trim(),
        },
      }), {});

      if (!CUSTOMER_TYPES.includes(type)) {
        toast({ title: "Invalid package type", description: "Choose Individual, Family, or Business.", status: "warning", duration: 4000, isClosable: true });
        return;
      }
      if (!name || !Number.isFinite(price) || price < 0) {
        toast({ title: "Package details required", description: "Enter a package name and a valid price.", status: "warning", duration: 4000, isClosable: true });
        return;
      }
      if (previousPrice !== undefined && (!Number.isFinite(previousPrice) || previousPrice < 0)) {
        toast({ title: "Invalid previous price", description: "Enter a valid previous price or leave it blank.", status: "warning", duration: 4000, isClosable: true });
        return;
      }
      const invalidTier = PACKAGE_TIERS.find((tier) => (
        !Number.isFinite(incomeTiers[tier].weekly) || incomeTiers[tier].weekly < 0 ||
        !Number.isFinite(incomeTiers[tier].monthly) || incomeTiers[tier].monthly < 0 ||
        !incomeTiers[tier].quantity
      ));
      if (invalidTier) {
        toast({ title: "Incomplete income tier", description: `Enter weekly price, monthly price, and quantity for the ${invalidTier} tier.`, status: "warning", duration: 4000, isClosable: true });
        return;
      }
      payload = {
        type,
        name,
        price,
        ...(previousPrice === undefined ? {} : { previousPrice }),
        details,
        incomeTiers,
      };
    }

    let requestPayload = payload;
    if (editingPlan) {
      if (isSpecialSubscription) {
        requestPayload = {
          type: type !== editingPlan.type ? type : undefined,
          name: name !== (editingPlan.name || "") ? name : undefined,
          priceWeekly: payload.priceWeekly !== Number(editingPlan.priceWeekly ?? editingPlan.weeklyPrice) ? payload.priceWeekly : undefined,
          priceMonthly: payload.priceMonthly !== Number(editingPlan.priceMonthly ?? editingPlan.monthlyPrice) ? payload.priceMonthly : undefined,
          quantity: payload.quantity !== (editingPlan.quantity || "") ? payload.quantity : undefined,
        };
      } else {
        requestPayload = {
          type: type !== editingPlan.type ? type : undefined,
          name: name !== (editingPlan.name || "") ? name : undefined,
          price: payload.price !== Number(editingPlan.price) ? payload.price : undefined,
          previousPrice: payload.previousPrice !== (editingPlan.previousPrice ?? undefined) ? (payload.previousPrice ?? null) : undefined,
          details: JSON.stringify(payload.details) !== JSON.stringify(editingPlan.details || []) ? payload.details : undefined,
          incomeTiers: JSON.stringify(payload.incomeTiers) !== JSON.stringify(editingPlan.incomeTiers || {}) ? payload.incomeTiers : undefined,
        };
      }
      Object.keys(requestPayload).forEach((key) => requestPayload[key] === undefined && delete requestPayload[key]);
      if (Object.keys(requestPayload).length === 0) {
        toast({ title: "No changes to save", status: "info", duration: 3000, isClosable: true });
        return;
      }
    }

    setSaving(true);
    try {
      if (editingPlan) {
        await updatePackage({ id: editingPlan._id, ...requestPayload }).unwrap();
        onEditClose();
        toast({ title: "Package updated", status: "success", duration: 3000, isClosable: true });
      } else {
        await createPackage(payload).unwrap();
        onPlanClose();
        toast({ title: "Package created", status: "success", duration: 3000, isClosable: true });
      }
      await loadPackages();
    } catch (e) {
      toast({ title: "Could not save package", description: getPackageErrorMessage(e, "The package could not be saved."), status: "error", duration: 5000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id) => {
    setDeletingPackageId(id);
    try {
      await deletePackage(id).unwrap();
      await loadPackages();
      toast({ title: "Package deleted", status: "success", duration: 3000, isClosable: true });
    } catch (e) {
      const blocked = e?.status === 409 || e?.originalStatus === 409;
      toast({
        title: blocked ? "Package cannot be deleted" : "Delete failed",
        description: getPackageErrorMessage(e, "The package could not be deleted."),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeletingPackageId(null);
    }
  };

  const visiblePackages = packages.filter((plan) => {
    const isSpecialSubscription = SPECIAL_SUBSCRIPTION_TYPES.includes(String(plan.type).toLowerCase());
    const belongsToSection = packageSection === "milk-beef" ? isSpecialSubscription : !isSpecialSubscription;
    return belongsToSection && (packageTypeFilter === "all" || String(plan.type).toLowerCase() === packageTypeFilter);
  });

  return (
    <Box maxW="full" px={{ base: 4, md: 8 }} py={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" mb={1}>{activeTab === "plans" ? "Subscription Packages" : "Subscription Management"}</Heading>
          <Text color="gray.500" fontSize="sm">{activeTab === "plans" ? "Create and manage subscription packages" : "Manage YooCards, meal plans, and weekly meal calendars"}</Text>
        </Box>
        <HStack spacing={2}>
          {activeTab === "plans" && (
            packageSection === "main" ? (
              <Button leftIcon={<Plus size={16} />} colorScheme="green" size="sm" onClick={() => openAddPlan()} borderRadius="lg">
                Add Package
              </Button>
            ) : (
              <>
                <Button leftIcon={<Plus size={16} />} colorScheme="green" size="sm" onClick={() => openAddPlan("milk")} borderRadius="lg">
                  Add Milk Subscription
                </Button>
                <Button leftIcon={<Plus size={16} />} colorScheme="orange" size="sm" onClick={() => openAddPlan("beef")} borderRadius="lg">
                  Add Beef Subscription
                </Button>
              </>
            )
          )}
        </HStack>
      </Flex>

      {/* Stats cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Card borderRadius="xl" borderWidth="1px" borderColor="green.100" bg="green.50">
          <CardBody py={4}>
            <HStack spacing={3}>
              <Flex w={10} h={10} borderRadius="xl" bg="green.100" align="center" justify="center">
                <Clock size={20} color="var(--chakra-colors-green-600)" />
              </Flex>
              <Stat size="sm">
                <StatLabel color="green.600" fontSize="xs" fontWeight="600">Pending Approvals</StatLabel>
                <StatNumber color="green.800" fontSize="2xl">{subscriptionsData.length}</StatNumber>
              </Stat>
            </HStack>
          </CardBody>
        </Card>
        <Card borderRadius="xl" borderWidth="1px" borderColor="purple.100" bg="purple.50">
          <CardBody py={4}>
            <HStack spacing={3}>
              <Flex w={10} h={10} borderRadius="xl" bg="purple.100" align="center" justify="center">
                <Package size={20} color="var(--chakra-colors-purple-600)" />
              </Flex>
              <Stat size="sm">
                <StatLabel color="purple.600" fontSize="xs" fontWeight="600">Active Plans</StatLabel>
                <StatNumber color="purple.800" fontSize="2xl">{packages.length}</StatNumber>
              </Stat>
            </HStack>
          </CardBody>
        </Card>
        <Card borderRadius="xl" borderWidth="1px" borderColor="orange.100" bg="orange.50">
          <CardBody py={4}>
            <HStack spacing={3}>
              <Flex w={10} h={10} borderRadius="xl" bg="orange.100" align="center" justify="center">
                <UtensilsCrossed size={20} color="var(--chakra-colors-orange-600)" />
              </Flex>
              <Stat size="sm">
                <StatLabel color="orange.600" fontSize="xs" fontWeight="600">Meal Slots</StatLabel>
                <StatNumber color="orange.800" fontSize="2xl">{slots.length}</StatNumber>
              </Stat>
            </HStack>
          </CardBody>
        </Card>
        <Card borderRadius="xl" borderWidth="1px" borderColor="blue.100" bg="blue.50">
          <CardBody py={4}>
            <HStack spacing={3}>
              <Flex w={10} h={10} borderRadius="xl" bg="blue.100" align="center" justify="center">
                <ImageIcon size={20} color="var(--chakra-colors-blue-600)" />
              </Flex>
              <Stat size="sm">
                <StatLabel color="blue.600" fontSize="xs" fontWeight="600">Overrides</StatLabel>
                <StatNumber color="blue.800" fontSize="2xl">{overrides.length}</StatNumber>
              </Stat>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Tab navigation */}
      <HStack spacing={3} mb={6} overflowX="auto" pb={1}>
        {TAB_CONFIG.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              variant={isActive ? "solid" : "outline"}
              colorScheme={isActive ? tab.color : "gray"}
              size="md"
              borderRadius="xl"
              px={6}
              leftIcon={<tab.icon size={18} />}
              fontWeight={isActive ? "700" : "500"}
              _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
              transition="all 0.2s"
            >
              {tab.label}
            </Button>
          );
        })}
      </HStack>

      {/* YooCards Tab */}
      {activeTab === "yoocards" && (
        <Card borderRadius="xl" boxShadow="sm">
          <CardBody>
            <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
              <Box>
                <Text fontWeight="700" fontSize="lg">Subscriptions</Text>
                <Text fontSize="sm" color="gray.500">Review, approve, reject, and manage subscriptions</Text>
              </Box>
              <HStack spacing={2} flexWrap="wrap">
                <Select
                  w="150px"
                  size="sm"
                  borderRadius="lg"
                  fontWeight="500"
                  value={subFilter}
                  onChange={(e) => setSubFilter(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Select>
                <Badge colorScheme="green" fontSize="md" px={3} py={1} borderRadius="full">
                  {subscriptionsData.length} {subFilter}
                </Badge>
              </HStack>
            </Flex>

            {/* Bulk actions bar */}
            {subscriptionsData.length > 0 && (
              <Flex mb={3} gap={2} align="center" flexWrap="wrap" p={2} bg="gray.50" borderRadius="lg">
                <input
                  type="checkbox"
                  checked={selectedSubs.length === subscriptionsData.length && subscriptionsData.length > 0}
                  onChange={toggleSelectAll}
                  style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#38a169" }}
                />
                <Text fontSize="sm" color="gray.600" fontWeight="500">
                  {selectedSubs.length > 0 ? `${selectedSubs.length} selected` : "Select all"}
                </Text>
                <Box flex={1} />
                {selectedSubs.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" colorScheme="red" variant="outline" borderRadius="lg" leftIcon={<Trash2 size={14} />} isLoading={bulkDeleting}>
                        Delete Selected ({selectedSubs.length})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedSubs.length} subscription(s)?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 text-white" onClick={() => handleBulkDelete("selected")}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" colorScheme="red" borderRadius="lg" leftIcon={<Trash2 size={14} />} isLoading={bulkDeleting}>
                      Delete All {subFilter}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete all {subFilter} subscriptions?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently delete all {subscriptionsData.length} {subFilter} subscription(s). This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 text-white" onClick={() => handleBulkDelete("status")}>Delete All</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </Flex>
            )}

            {isLoading ? (
              <Center py={12}><Spinner size="lg" color="green.500" thickness="3px" /></Center>
            ) : subscriptionsData.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {subscriptionsData.map((sub) => (
                  <Card key={sub._id} variant="outline" borderRadius="lg" _hover={{ borderColor: "green.300", boxShadow: "sm" }} transition="all 0.2s">
                    <CardBody py={3}>
                      <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
                        <HStack spacing={3}>
                          <input
                            type="checkbox"
                            checked={selectedSubs.includes(sub._id)}
                            onChange={() => toggleSelectSub(sub._id)}
                            style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#38a169" }}
                          />
                          <Avatar size="sm" name={getSubUserLabel(sub)} bg="green.500" color="white" />
                          <Box>
                            <Text fontWeight="600" fontSize="sm">{getSubUserLabel(sub)}</Text>
                            <HStack spacing={2}>
                              <Text fontSize="xs" color="gray.500">{moment(sub?.createdAt).fromNow()}</Text>
                              <Badge size="sm" colorScheme={sub?.status === "approved" ? "green" : sub?.status === "rejected" ? "red" : "yellow"} borderRadius="full" fontSize="10px">
                                {sub?.status || "pending"}
                              </Badge>
                            </HStack>
                          </Box>
                        </HStack>
                        <HStack spacing={2} flexWrap="wrap">
                          {sub?.cards?.map((c, i) => (
                            <Tag key={i} size="sm" colorScheme="green" borderRadius="full">
                              <TagLabel>{c.card} {String(c.cardNumber || "").slice(0, 3)}***</TagLabel>
                            </Tag>
                          ))}
                        </HStack>
                        <HStack spacing={2}>
                          {subFilter === "pending" && (
                            <>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" colorScheme="green" borderRadius="lg" leftIcon={<CheckCircle size={14} />}>
                                    Approve
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Approve subscription?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will activate {getSubUserLabel(sub)}&apos;s subscription.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-green-600 text-white" onClick={() => handleApprove(sub._id)}>
                                      Approve
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" colorScheme="red" variant="outline" borderRadius="lg" leftIcon={<XCircle size={14} />}>
                                    Reject
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject subscription?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will reject {getSubUserLabel(sub)}&apos;s subscription request.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-red-600 text-white" onClick={() => handleReject(sub._id)}>
                                      Reject
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </HStack>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            ) : (
              <Center py={12}>
                <VStack spacing={3}>
                  <Flex w={14} h={14} borderRadius="full" bg="gray.100" align="center" justify="center">
                    <CheckCircle size={28} color="var(--chakra-colors-gray-400)" />
                  </Flex>
                  <Text color="gray.500" fontWeight="500">No {subFilter} subscriptions found.</Text>
                </VStack>
              </Center>
            )}
          </CardBody>
        </Card>
      )}

      {/* Meal Plans Tab */}
      {activeTab === "plans" && (
        <Box>
          <HStack mb={4} spacing={2} flexWrap="wrap">
            <Button
              size="sm"
              variant={packageSection === "main" ? "solid" : "outline"}
              colorScheme="purple"
              onClick={() => { setPackageSection("main"); setPackageTypeFilter("all"); }}
            >
              Main Packages
            </Button>
            <Button
              size="sm"
              variant={packageSection === "milk-beef" ? "solid" : "outline"}
              colorScheme="orange"
              onClick={() => { setPackageSection("milk-beef"); setPackageTypeFilter("all"); }}
            >
              Milk & Beef Subscriptions
            </Button>
          </HStack>
          <Flex mb={4} gap={3} flexWrap="wrap" align="center">
            <Select
              w={{ base: "full", md: "190px" }}
              size="sm"
              borderRadius="lg"
              value={packageTypeFilter}
              onChange={(e) => setPackageTypeFilter(e.target.value)}
            >
              <option value="all">All {packageSection === "main" ? "package" : "subscription"} types</option>
              {(packageSection === "main" ? CUSTOMER_TYPES : SPECIAL_SUBSCRIPTION_TYPES).map((type) => (
                <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>
              ))}
            </Select>
            <Badge colorScheme="purple" borderRadius="full" px={3}>{visiblePackages.length} shown</Badge>
          </Flex>
          {loadingPackages ? (
            <Center py={12}><Spinner size="lg" color="purple.500" thickness="3px" /></Center>
          ) : packageError ? (
            <Card borderRadius="xl" borderWidth="1px" borderColor="red.200">
              <CardBody>
                <Center py={10}>
                  <VStack spacing={4} textAlign="center">
                    <XCircle size={32} color="var(--chakra-colors-red-500)" />
                    <Text color="red.600" fontWeight="600">{packageError}</Text>
                    <Button size="sm" variant="outline" colorScheme="red" onClick={loadPackages}>Try again</Button>
                  </VStack>
                </Center>
              </CardBody>
            </Card>
          ) : visiblePackages.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {visiblePackages.map((p) => {
                const isSpecialSubscription = SPECIAL_SUBSCRIPTION_TYPES.includes(String(p.type).toLowerCase());
                const colorScheme = p.type === "business" || p.type === "beef" ? "orange" : p.type === "family" ? "blue" : "green";
                const packageDetails = Array.isArray(p.details) ? p.details : [];
                const selectedTier = packageTierSelections[p._id] || "middle";
                const selectedWeeklyPrice =
                  p.incomeTiers?.[selectedTier]?.weekly ??
                  p.incomeTiers?.middle?.weekly ??
                  p.price;
                return (
                  <Card key={p._id} borderRadius="xl" boxShadow="sm" _hover={{ boxShadow: "md", transform: "translateY(-2px)" }} transition="all 0.2s" overflow="hidden">
                    <Box h="4px" bg={`${colorScheme}.400`} />
                    <CardBody>
                      <Flex justify="space-between" align="start" mb={3}>
                        <Box>
                          <Badge colorScheme={colorScheme} borderRadius="full" mb={1} textTransform="capitalize">{p.type}</Badge>
                          <Heading size="md">{p.name || `${p.type} package`}</Heading>
                          <HStack align="baseline" spacing={2} mt={1}>
                            <Text fontSize="lg" fontWeight="700" color={`${colorScheme}.600`}>
                              UGX {Number(isSpecialSubscription ? (p.priceWeekly ?? p.weeklyPrice ?? 0) : (selectedWeeklyPrice || 0)).toLocaleString()}
                            </Text>
                          </HStack>
                          {isSpecialSubscription ? (
                            <Text fontSize="xs" color="gray.500">
                              Weekly subscription price
                            </Text>
                          ) : (
                            <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                              {selectedTier} income tier · weekly
                            </Text>
                          )}
                        </Box>
                        <HStack spacing={1}>
                          <Tooltip label="Edit plan">
                            <IconButton
                              aria-label="Edit"
                              icon={<Pencil size={14} />}
                              size="sm"
                              variant="ghost"
                              colorScheme={colorScheme}
                              onClick={() => openEditPlan(p)}
                              isDisabled={saving || Boolean(deletingPackageId)}
                            />
                          </Tooltip>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <IconButton
                                aria-label="Delete"
                                icon={<Trash2 size={14} />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                isDisabled={saving || Boolean(deletingPackageId)}
                              />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete plan?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Remove the {p.type} package. This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-600 text-white" onClick={() => handleDeletePlan(p._id)} disabled={saving || Boolean(deletingPackageId)}>
                                  {deletingPackageId === p._id ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </HStack>
                      </Flex>

                      {isSpecialSubscription ? (
                        <Box mb={4}>
                          <VStack align="stretch" spacing={2}>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.600">Monthly</Text>
                              <Text fontSize="sm" fontWeight="600">UGX {Number(p.priceMonthly ?? p.monthlyPrice ?? 0).toLocaleString()}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.600">Quantity</Text>
                              <Text fontSize="sm" fontWeight="600">{p.quantity || "Not specified"}</Text>
                            </HStack>
                          </VStack>
                        </Box>
                      ) : (
                      <Box mb={4}>
                        <HStack justify="space-between" spacing={3} align="center">
                          <Text fontSize="sm" fontWeight="700" color={`${colorScheme}.600`}>Choose income tier</Text>
                          <Select
                            aria-label={`${p.type} package income tier`}
                            size="sm"
                            maxW="140px"
                            value={selectedTier}
                            onChange={(e) => setPackageTierSelections((current) => ({
                              ...current,
                              [p._id]: e.target.value,
                            }))}
                          >
                            {PACKAGE_TIERS.map((tier) => (
                              <option key={tier} value={tier}>
                                {tier[0].toUpperCase() + tier.slice(1)}
                              </option>
                            ))}
                          </Select>
                        </HStack>
                        <VStack align="stretch" spacing={1} mt={2}>
                          {PACKAGE_TIERS.map((tier) => (
                            <HStack key={tier} justify="space-between" fontSize="sm">
                              <Badge colorScheme="gray" textTransform="capitalize">{tier}</Badge>
                              <Text>UGX {Number(p.incomeTiers?.[tier]?.weekly || 0).toLocaleString()} / week</Text>
                              <VStack align="end" spacing={0}>
                                <Text>UGX {Number(p.incomeTiers?.[tier]?.monthly || 0).toLocaleString()} / month</Text>
                                <Text color="gray.500">{p.incomeTiers?.[tier]?.quantity || "No quantity"}</Text>
                              </VStack>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                      )}

                      {!isSpecialSubscription && packageDetails.length > 0 && (
                        <Box mt={4}>
                          <Text fontSize="sm" fontWeight="700" mb={2}>Included benefits</Text>
                          <VStack align="stretch" spacing={1}>
                            {packageDetails.map((detail, index) => (
                              <Text key={`${index}-${detail}`} fontSize="sm" color="gray.600">- {detail}</Text>
                            ))}
                          </VStack>
                        </Box>
                      )}

                      {p.createdAt && (
                        <Text mt={4} fontSize="xs" color="gray.400">
                          Created {moment(p.createdAt).format("DD MMM YYYY")}
                        </Text>
                      )}
                    </CardBody>
                  </Card>
                );
              })}

              {packageSection === "main" && <Card
                borderRadius="xl"
                borderWidth="2px"
                borderStyle="dashed"
                borderColor="gray.200"
                cursor="pointer"
                onClick={openAddPlan}
                _hover={{ borderColor: "green.300", bg: "green.50" }}
                transition="all 0.2s"
              >
                <CardBody>
                  <Center h="full" minH="200px">
                    <VStack spacing={3}>
                      <Flex w={12} h={12} borderRadius="xl" bg="green.100" align="center" justify="center">
                        <Plus size={24} color="var(--chakra-colors-green-600)" />
                      </Flex>
                      <Text fontWeight="600" color="green.600">Add New Package</Text>
                    </VStack>
                  </Center>
                </CardBody>
              </Card>}
            </SimpleGrid>
          ) : (
            <Card borderRadius="xl">
              <CardBody>
                <Center py={12}>
                  <VStack spacing={4}>
                    <Flex w={16} h={16} borderRadius="full" bg="purple.50" align="center" justify="center">
                      <Package size={32} color="var(--chakra-colors-purple-400)" />
                    </Flex>
                    <Text color="gray.500" fontWeight="500">
                      {packageSection === "main" ? "No subscription packages yet" : "No Milk or Beef subscriptions yet"}
                    </Text>
                    {packageSection === "main" ? (
                      <Button leftIcon={<Plus size={16} />} colorScheme="green" onClick={() => openAddPlan()} borderRadius="lg">
                        Add Your First Package
                      </Button>
                    ) : (
                      <HStack flexWrap="wrap" justify="center">
                        <Button leftIcon={<Plus size={16} />} colorScheme="green" onClick={() => openAddPlan("milk")} borderRadius="lg">
                          Add Milk Subscription
                        </Button>
                        <Button leftIcon={<Plus size={16} />} colorScheme="orange" onClick={() => openAddPlan("beef")} borderRadius="lg">
                          Add Beef Subscription
                        </Button>
                      </HStack>
                    )}
                  </VStack>
                </Center>
              </CardBody>
            </Card>
          )}
        </Box>
      )}

      {/* Meal Calendar Tab */}
      {activeTab === "calendar" && (
        <Card borderRadius="xl" boxShadow="sm">
          <CardBody>
            <Flex justify="space-between" align="start" mb={4} flexWrap="wrap" gap={3}>
              <Box>
                <Text fontWeight="700" fontSize="lg">Meal Calendar</Text>
                <Text fontSize="sm" color="gray.500">
                  Edit meal name, description, quantity, prices, and images per slot
                </Text>
              </Box>
            </Flex>
            {loadingSlots ? (
              <Center py={12}><Spinner size="lg" color="orange.500" thickness="3px" /></Center>
            ) : (
              <MealSlotGrid
                slots={slots}
                overrides={overrides}
                upsertSlot={upsertSlot}
                upsertOverride={upsertOverride}
                toast={toast}
                loadSlots={loadSlots}
                loadOverrides={loadOverrides}
              />
            )}
          </CardBody>
        </Card>
      )}

      {/* Add plan modal */}
      <PlanModal
        isOpen={isPlanOpen}
        onClose={onPlanClose}
        title={SPECIAL_SUBSCRIPTION_TYPES.includes(planForm.type)
          ? `Add ${planForm.type[0].toUpperCase()}${planForm.type.slice(1)} Subscription`
          : "Add Subscription Package"}
        form={planForm}
        setForm={setPlanForm}
        onSave={handleSavePlan}
        saving={saving}
        saveLabel="Create Package"
      />

      {/* Edit plan modal */}
      <PlanModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        title={SPECIAL_SUBSCRIPTION_TYPES.includes(planForm.type)
          ? `Edit ${planForm.type[0].toUpperCase()}${planForm.type.slice(1)} Subscription`
          : "Edit Subscription Package"}
        form={planForm}
        setForm={setPlanForm}
        onSave={handleSavePlan}
        saving={saving}
        saveLabel="Update Package"
      />
    </Box>
  );
}

function PlanModal({ isOpen, onClose, title, form, setForm, onSave, saving, saveLabel }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!saving) onSave();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }} isCentered scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        maxH={{ base: "100dvh", md: "calc(100vh - 3rem)" }}
        h={{ base: "100dvh", md: "auto" }}
        borderRadius={{ base: "none", md: "xl" }}
        boxShadow="2xl"
        display="flex"
        flexDirection="column"
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
          <ModalHeader fontSize="lg" fontWeight="bold" borderBottomWidth="1px" py={4} pr={12}>
            {title}
          </ModalHeader>
          <ModalCloseButton top={4} right={4} />
          <ModalBody py={5} overflowY="auto" flex="1" minH={0}>
            <PlanForm form={form} setForm={setForm} />
          </ModalBody>
          <ModalFooter borderTopWidth="1px" py={4} gap={3} flexWrap="wrap">
            <Button variant="outline" onClick={onClose} isDisabled={saving} borderRadius="lg" flex={{ base: 1, md: "initial" }}>Cancel</Button>
            <Button colorScheme="green" type="submit" isLoading={saving} loadingText="Saving..." borderRadius="lg" flex={{ base: 1, md: "initial" }}>
              {saveLabel}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

function PlanForm({ form, setForm }) {
  if (SPECIAL_SUBSCRIPTION_TYPES.includes(form.type)) {
    const subscriptionType = form.type[0].toUpperCase() + form.type.slice(1);
    return (
      <VStack spacing={5} align="stretch">
        <Text fontSize="sm" color="gray.600">
          {subscriptionType} subscriptions use one weekly price, one monthly price, and a quantity. They do not have income tiers.
        </Text>
        <FormControl isRequired>
          <FormLabel fontWeight="600" fontSize="sm">{subscriptionType} subscription name</FormLabel>
          <Input
            value={form.name ?? ""}
            onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
            placeholder={`${subscriptionType} Subscription`}
          />
        </FormControl>
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
          <FormControl isRequired>
            <FormLabel fontWeight="600" fontSize="sm">Weekly price (UGX)</FormLabel>
            <Input
              type="number"
              min={0}
              value={form.priceWeekly ?? ""}
              onChange={(e) => setForm((current) => ({ ...current, priceWeekly: e.target.value }))}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel fontWeight="600" fontSize="sm">Monthly price (UGX)</FormLabel>
            <Input
              type="number"
              min={0}
              value={form.priceMonthly ?? ""}
              onChange={(e) => setForm((current) => ({ ...current, priceMonthly: e.target.value }))}
            />
          </FormControl>
        </SimpleGrid>
        <FormControl isRequired>
          <FormLabel fontWeight="600" fontSize="sm">Quantity</FormLabel>
          <Input
            value={form.quantity ?? ""}
            onChange={(e) => setForm((current) => ({ ...current, quantity: e.target.value }))}
            placeholder="e.g. 2 litres or 5 kg per week"
          />
        </FormControl>
      </VStack>
    );
  }

  return (
    <VStack spacing={5} align="stretch">
      <FormControl isRequired>
        <FormLabel fontWeight="600" fontSize="sm">Package type</FormLabel>
        <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} borderRadius="lg">
          {CUSTOMER_TYPES.map((type) => <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>)}
        </Select>
      </FormControl>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <FormControl isRequired>
          <FormLabel fontWeight="600" fontSize="sm">Package name</FormLabel>
          <Input value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Premium" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel fontWeight="600" fontSize="sm">Membership price (UGX)</FormLabel>
          <Input type="number" min={0} value={form.price ?? ""} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
        </FormControl>
        <FormControl>
          <FormLabel fontWeight="600" fontSize="sm">Previous price (UGX)</FormLabel>
          <Input type="number" min={0} value={form.previousPrice ?? ""} onChange={(e) => setForm((f) => ({ ...f, previousPrice: e.target.value }))} />
        </FormControl>
      </SimpleGrid>
      <FormControl>
        <FormLabel fontWeight="600" fontSize="sm">Package details</FormLabel>
        <Textarea
          value={form.details ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
          placeholder={"One benefit per line"}
          rows={5}
        />
      </FormControl>
      <Text fontSize="sm" color="gray.600">Each package contains the required Low, Middle, and High income tiers.</Text>
      {PACKAGE_TIERS.map((tier) => (
        <Box key={tier} borderWidth="1px" borderColor="gray.200" borderRadius="lg" p={4}>
          <Badge colorScheme={tier === "middle" ? "green" : "gray"} mb={3} textTransform="capitalize">{tier} income tier</Badge>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Weekly price (UGX)</FormLabel>
              <Input type="number" min={0} value={form.incomeTiers?.[tier]?.weekly ?? ""} onChange={(e) => setForm((f) => ({ ...f, incomeTiers: { ...f.incomeTiers, [tier]: { ...f.incomeTiers[tier], weekly: e.target.value } } }))} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Monthly price (UGX)</FormLabel>
              <Input type="number" min={0} value={form.incomeTiers?.[tier]?.monthly ?? ""} onChange={(e) => setForm((f) => ({ ...f, incomeTiers: { ...f.incomeTiers, [tier]: { ...f.incomeTiers[tier], monthly: e.target.value } } }))} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Quantity</FormLabel>
              <Input value={form.incomeTiers?.[tier]?.quantity ?? ""} onChange={(e) => setForm((f) => ({ ...f, incomeTiers: { ...f.incomeTiers, [tier]: { ...f.incomeTiers[tier], quantity: e.target.value } } }))} placeholder="e.g. 12 meals/day" />
            </FormControl>
          </SimpleGrid>
        </Box>
      ))}
    </VStack>
  );
}

function MealSlotGrid({ slots, overrides, upsertSlot, upsertOverride, toast, loadSlots, loadOverrides }) {
  const [calendarMode, setCalendarMode] = useState("standard");
  const [incomeLevel, setIncomeLevel] = useState("middle");
  const [prepType, setPrepType] = useState("ready-to-eat");
  const [customerType, setCustomerType] = useState("individual");
  const [editingSlot, setEditingSlot] = useState(null);
  const [saving, setSaving] = useState(false);
  const { isOpen: isSlotModalOpen, onOpen: onSlotModalOpen, onClose: onSlotModalClose } = useDisclosure();

  const getSlot = (day, mealType) => slots.find((s) => {
    const customerTypeSuffix = s.mealName?.match(/\((individual|family|business)\)\s*$/i)?.[1]?.toLowerCase();
    if (calendarMode === "specialty") {
      return customerTypeSuffix === customerType && s.prepType === prepType && s.day === day && s.mealType === mealType;
    }
    return !customerTypeSuffix && s.incomeLevel === incomeLevel && s.prepType === prepType && s.day === day && s.mealType === mealType;
  });
  const getOverride = (day, mealType) => overrides.find((o) => o.incomeLevel === incomeLevel && o.prepType === prepType && o.day === day && o.mealType === mealType);

  const openEditor = (day, mealType) => {
    const slot = getSlot(day, mealType);
    const override = getOverride(day, mealType);
    setEditingSlot({
      day, mealType, incomeLevel: slot?.incomeLevel || incomeLevel, prepType,
      customerType,
      mealName: slot?.mealName || "",
      description: slot?.description || "",
      quantity: slot?.quantity || "",
      priceWeekly: slot?.priceWeekly ?? 0,
      priceMonthly: slot?.priceMonthly ?? 0,
      imageUrl: slot?.imageUrl || override?.imageUrl || "",
    });
    onSlotModalOpen();
  };

  const handleSaveSlot = async (form) => {
    if (!form.mealName?.trim()) {
      toast({ title: "Meal name required", status: "warning", duration: 4000, isClosable: true });
      return;
    }
    setSaving(true);
    try {
      const mealName = String(form.mealName ?? "").trim();
      const specialtySuffix = `(${form.customerType || customerType})`;
      const mealSlot = {
        incomeLevel: form.incomeLevel || incomeLevel,
        prepType: form.prepType,
        day: form.day,
        mealType: form.mealType,
        mealName: calendarMode === "specialty" && !mealName.toLowerCase().endsWith(specialtySuffix.toLowerCase())
          ? `${mealName} ${specialtySuffix}`
          : mealName,
        description: String(form.description ?? ""),
        quantity: String(form.quantity ?? ""),
        priceWeekly: Number(form.priceWeekly) || 0,
        priceMonthly: Number(form.priceMonthly) || 0,
        imageUrl: String(form.imageUrl ?? ""),
      };
      await upsertSlot(mealSlot).unwrap();
      await upsertOverride({
        incomeLevel: form.incomeLevel, prepType: form.prepType, day: form.day, mealType: form.mealType,
        imageUrl: form.imageUrl || "",
      }).unwrap();
      await Promise.all([loadSlots(), loadOverrides()]);
      toast({ title: "Meal saved", status: "success", duration: 3000, isClosable: true });
      onSlotModalClose();
      setEditingSlot(null);
    } catch (e) {
      toast({ title: "Save failed", description: e?.data?.message || "Failed", status: "error", duration: 4000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const filledCount = DAYS.reduce((acc, day) => acc + MEAL_TYPES.filter((mt) => getSlot(day, mt)).length, 0);

  return (
    <>
      <VStack align="stretch" spacing={4}>
        <Flex gap={3} flexWrap="wrap" align="center">
          <HStack spacing={2}>
            <Text fontSize="sm" fontWeight="600" color="gray.600">Menu:</Text>
            <Select w="170px" value={calendarMode} onChange={(e) => setCalendarMode(e.target.value)} size="sm" borderRadius="lg" fontWeight="500">
              <option value="standard">Core daily meals</option>
              <option value="specialty">Specialty meals</option>
            </Select>
          </HStack>
          {calendarMode === "specialty" ? (
            <HStack spacing={2}>
              <Text fontSize="sm" fontWeight="600" color="gray.600">Customer:</Text>
              <Select w="150px" value={customerType} onChange={(e) => setCustomerType(e.target.value)} size="sm" borderRadius="lg" fontWeight="500">
                {CUSTOMER_TYPES.map((type) => <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>)}
              </Select>
            </HStack>
          ) : (
          <HStack spacing={2}>
            <Text fontSize="sm" fontWeight="600" color="gray.600">Income:</Text>
            <Select w="150px" value={incomeLevel} onChange={(e) => setIncomeLevel(e.target.value)} size="sm" borderRadius="lg" fontWeight="500">
              <option value="middle">Middle</option>
              <option value="low">Low</option>
              <option value="high">High</option>
            </Select>
          </HStack>
          )}
          <HStack spacing={2}>
            <Text fontSize="sm" fontWeight="600" color="gray.600">Type:</Text>
            <Select w="160px" value={prepType} onChange={(e) => setPrepType(e.target.value)} size="sm" borderRadius="lg" fontWeight="500">
              <option value="ready-to-eat">Ready to eat</option>
              <option value="ready-to-cook">Ready to cook</option>
            </Select>
          </HStack>
          <Badge colorScheme="orange" borderRadius="full" px={2}>
            {filledCount}/{DAYS.length * MEAL_TYPES.length} slots filled
          </Badge>
        </Flex>

        <Box overflowX="auto" borderRadius="xl" borderWidth="1px" borderColor="gray.200">
          <Table size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th borderTopLeftRadius="xl" fontWeight="700">Day</Th>
                {MEAL_TYPES.map((mt) => (
                  <Th key={mt} textTransform="capitalize" fontWeight="700">{mt}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {DAYS.map((day) => (
                <Tr key={day} _hover={{ bg: "gray.25" }}>
                  <Td fontWeight="600" textTransform="capitalize" color="gray.700">{day}</Td>
                  {MEAL_TYPES.map((mealType) => {
                    const slot = getSlot(day, mealType);
                    const override = getOverride(day, mealType);
                    const imgUrl = slot?.imageUrl || override?.imageUrl;
                    return (
                      <Td key={mealType} p={2}>
                        <Box
                          borderRadius="lg"
                          borderWidth="1px"
                          borderColor={slot ? "green.200" : "gray.200"}
                          bg={slot ? "green.50" : "white"}
                          p={2}
                          cursor="pointer"
                          onClick={() => openEditor(day, mealType)}
                          _hover={{ borderColor: "green.400", boxShadow: "sm" }}
                          transition="all 0.15s"
                          minW="120px"
                        >
                          {imgUrl && (
                            <Box w="full" h="12" borderRadius="md" overflow="hidden" bg="gray.100" mb={1}>
                              <Box as="img" src={imgUrl} alt="" w="full" h="full" objectFit="cover" onError={(e) => { e.target.style.display = "none"; }} />
                            </Box>
                          )}
                          {slot?.mealName ? (
                            <>
                              <Text fontSize="xs" fontWeight="600" noOfLines={1} color="gray.800">{slot.mealName}</Text>
                              {(slot.priceWeekly > 0 || slot.priceMonthly > 0) && (
                                <Text fontSize="10px" color="gray.500">
                                  {slot.priceWeekly > 0 && `W: ${Number(slot.priceWeekly).toLocaleString()}`}
                                  {slot.priceWeekly > 0 && slot.priceMonthly > 0 && " / "}
                                  {slot.priceMonthly > 0 && `M: ${Number(slot.priceMonthly).toLocaleString()}`}
                                </Text>
                              )}
                            </>
                          ) : (
                            <HStack spacing={1} justify="center" py={1}>
                              <Plus size={12} color="var(--chakra-colors-gray-400)" />
                              <Text fontSize="xs" color="gray.400">Add</Text>
                            </HStack>
                          )}
                        </Box>
                      </Td>
                    );
                  })}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      <MealSlotEditorModal
        isOpen={isSlotModalOpen}
        onClose={() => { if (!saving) { onSlotModalClose(); setEditingSlot(null); } }}
        slot={editingSlot}
        onSave={handleSaveSlot}
        saving={saving}
      />
    </>
  );
}

function MealSlotEditorModal({ isOpen, onClose, slot, onSave, saving = false }) {
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (slot) setForm({ ...slot });
  }, [slot]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (saving) return;
    onSave(form);
  };

  const handleImageUpload = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file", status: "warning", duration: 4000, isClosable: true });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`${BACKEND_URL}/api/meal-calendar/upload`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (data?.status === "Success" && data?.data?.imageUrl) {
        setForm((f) => ({ ...f, imageUrl: data.data.imageUrl }));
        toast({ title: "Image uploaded", status: "success", duration: 3000, isClosable: true });
      } else {
        throw new Error(data?.message || "Upload failed");
      }
    } catch (err) {
      toast({ title: "Upload failed", description: err?.message || "Failed", status: "error", duration: 4000, isClosable: true });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (!slot) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "lg" }} isCentered scrollBehavior="inside" closeOnOverlayClick={!saving}>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        maxH={{ base: "100dvh", md: "calc(100vh - 3rem)" }}
        h={{ base: "100dvh", md: "auto" }}
        borderRadius={{ base: "none", md: "xl" }}
        display="flex"
        flexDirection="column"
      >
        <ModalHeader borderBottomWidth="1px" py={4} pr={12}>
          <HStack spacing={2}>
            <UtensilsCrossed size={18} />
            <Text textTransform="capitalize">{slot.day} — {slot.mealType}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
          <ModalBody py={4} overflowY="auto" flex="1" minH={0}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontWeight="600" fontSize="sm">Meal Name</FormLabel>
                <Input value={form.mealName || ""} onChange={(e) => setForm((f) => ({ ...f, mealName: e.target.value }))} placeholder="e.g. Rice with Bean Stew" borderRadius="lg" />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="600" fontSize="sm">Description</FormLabel>
                <Textarea value={form.description || ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="e.g. 200g rice, 100g bean stew..." rows={2} borderRadius="lg" />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="600" fontSize="sm">Quantity</FormLabel>
                <Input value={form.quantity || ""} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} placeholder="e.g. ~550g" borderRadius="lg" />
              </FormControl>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontWeight="600" fontSize="sm">Weekly (UGX)</FormLabel>
                  <Input type="number" min={0} value={form.priceWeekly ?? ""} onChange={(e) => setForm((f) => ({ ...f, priceWeekly: e.target.value }))} placeholder="87500" borderRadius="lg" />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="600" fontSize="sm">Monthly (UGX)</FormLabel>
                  <Input type="number" min={0} value={form.priceMonthly ?? ""} onChange={(e) => setForm((f) => ({ ...f, priceMonthly: e.target.value }))} placeholder="350000" borderRadius="lg" />
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel fontWeight="600" fontSize="sm">Image</FormLabel>
                <HStack spacing={2} align="stretch" minW={0}>
                  <Input minW={0} value={form.imageUrl || ""} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="URL or upload" borderRadius="lg" />
                  <Button as="label" size="sm" colorScheme="green" cursor="pointer" isLoading={uploading} borderRadius="lg" flexShrink={0}>
                    Upload
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={handleImageUpload} />
                  </Button>
                </HStack>
                {form.imageUrl && (
                  <Box mt={2} w="full" h="32" borderRadius="lg" overflow="hidden" bg="gray.100">
                    <Box as="img" src={form.imageUrl} alt="" w="full" h="full" objectFit="cover" onError={(e) => { e.target.style.display = "none"; }} />
                  </Box>
                )}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" gap={3} flexWrap="wrap">
            <Button variant="outline" onClick={onClose} isDisabled={saving} borderRadius="lg" flex={{ base: 1, sm: "initial" }}>Cancel</Button>
            <Button colorScheme="green" type="submit" isLoading={saving} loadingText="Saving..." borderRadius="lg" flex={{ base: 1, sm: "initial" }}>Save Meal</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
