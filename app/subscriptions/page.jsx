"use client";

import {
  useSubscriptionsApproveMutation,
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
  Image as ImageIcon,
  Clock,
  Users,
  DollarSign,
  Star,
} from "lucide-react";
import { BACKEND_URL } from "@constants/constant";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const MEAL_TYPES = ["breakfast", "lunch", "supper"];
const INCOME_LEVELS = ["middle", "low", "high"];
const PREP_TYPES = ["ready-to-eat", "ready-to-cook"];

const getSubUserLabel = (sub) => {
  const user = sub?.user || {};
  const fullName = [user?.firstname, user?.lastname].filter(Boolean).join(" ").trim();
  return fullName || user?.email || "Unknown User";
};

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
  const [loadingOverrides, setLoadingOverrides] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [fetchSubscriptions] = useSubscriptionsFetchMutation();
  const [approveSubscription] = useSubscriptionsApproveMutation();
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
  const [planForm, setPlanForm] = useState({ type: "", price: "", name: "", details: "", previousPrice: "" });

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchSubscriptions("pending").unwrap();
      if (res?.status === "Success") setSubscriptionsData(res?.data || []);
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Failed to load", status: "error", duration: 4000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [fetchSubscriptions, toast]);

  const loadPackages = useCallback(async () => {
    setLoadingPackages(true);
    try {
      const res = await fetchPackages().unwrap();
      if (res?.status === "Success") setPackages(res?.data || []);
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Failed to load packages", status: "error", duration: 4000, isClosable: true });
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
    if (activeTab === "plans" && packages.length === 0) loadPackages();
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

  const openAddPlan = () => {
    setEditingPlan(null);
    setPlanForm({ type: "standard", price: "", name: "", details: [], previousPrice: "" });
    onPlanOpen();
  };

  const openEditPlan = (p) => {
    setEditingPlan(p);
    const detailsArray = Array.isArray(p?.details) ? p.details : (p?.details ? String(p.details).split("\n").filter(Boolean) : []);
    setPlanForm({
      type: p?.type || "",
      price: p?.price ?? "",
      name: p?.name || "",
      details: detailsArray,
      previousPrice: p?.previousPrice ?? "",
    });
    onEditOpen();
  };

  const [saving, setSaving] = useState(false);

  const handleSavePlan = async () => {
    const details = Array.isArray(planForm.details) ? planForm.details.filter(Boolean) : (planForm.details ? String(planForm.details).split("\n").filter(Boolean) : []);
    const payload = {
      type: planForm.type,
      price: Number(planForm.price),
      name: planForm.name,
      details,
      previousPrice: planForm.previousPrice ? Number(planForm.previousPrice) : null,
    };
    setSaving(true);
    try {
      if (editingPlan) {
        await updatePackage({ id: editingPlan._id, ...payload }).unwrap();
        onEditClose();
        toast({ title: "Plan updated", status: "success", duration: 3000, isClosable: true });
      } else {
        await createPackage(payload).unwrap();
        onPlanClose();
        toast({ title: "Plan created", status: "success", duration: 3000, isClosable: true });
      }
      loadPackages();
    } catch (e) {
      toast({ title: "Save failed", description: e?.data?.message || "Failed to save", status: "error", duration: 4000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      await deletePackage(id).unwrap();
      loadPackages();
      toast({ title: "Plan deleted", status: "success", duration: 3000, isClosable: true });
    } catch (e) {
      toast({ title: "Delete failed", description: e?.data?.message || "Failed", status: "error", duration: 4000, isClosable: true });
    }
  };

  return (
    <Box maxW="full" px={{ base: 4, md: 8 }} py={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" mb={1}>Subscription Management</Heading>
          <Text color="gray.500" fontSize="sm">Manage YooCards, meal plans, and weekly meal calendars</Text>
        </Box>
        <HStack spacing={2}>
          {activeTab === "plans" && (
            <Button leftIcon={<Plus size={16} />} colorScheme="green" size="sm" onClick={openAddPlan} borderRadius="lg">
              Add Plan
            </Button>
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
            <Flex justify="space-between" align="center" mb={4}>
              <Box>
                <Text fontWeight="700" fontSize="lg">Pending Approvals</Text>
                <Text fontSize="sm" color="gray.500">Review and approve new subscription requests</Text>
              </Box>
              <Badge colorScheme="green" fontSize="md" px={3} py={1} borderRadius="full">
                {subscriptionsData.length} pending
              </Badge>
            </Flex>

            {isLoading ? (
              <Center py={12}><Spinner size="lg" color="green.500" thickness="3px" /></Center>
            ) : subscriptionsData.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {subscriptionsData.map((sub) => (
                  <Card key={sub._id} variant="outline" borderRadius="lg" _hover={{ borderColor: "green.300", boxShadow: "sm" }} transition="all 0.2s">
                    <CardBody py={3}>
                      <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
                        <HStack spacing={3}>
                          <Avatar size="sm" name={getSubUserLabel(sub)} bg="green.500" color="white" />
                          <Box>
                            <Text fontWeight="600" fontSize="sm">{getSubUserLabel(sub)}</Text>
                            <Text fontSize="xs" color="gray.500">{moment(sub?.createdAt).fromNow()}</Text>
                          </Box>
                        </HStack>
                        <HStack spacing={2} flexWrap="wrap">
                          {sub?.cards?.map((c, i) => (
                            <Tag key={i} size="sm" colorScheme="green" borderRadius="full">
                              <TagLabel>{c.card} {String(c.cardNumber || "").slice(0, 3)}***</TagLabel>
                            </Tag>
                          ))}
                        </HStack>
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
                  <Text color="gray.500" fontWeight="500">All caught up! No pending approvals.</Text>
                </VStack>
              </Center>
            )}
          </CardBody>
        </Card>
      )}

      {/* Meal Plans Tab */}
      {activeTab === "plans" && (
        <Box>
          {loadingPackages ? (
            <Center py={12}><Spinner size="lg" color="purple.500" thickness="3px" /></Center>
          ) : packages.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {packages.map((p) => {
                const details = Array.isArray(p.details) ? p.details : [];
                const typeColors = { standard: "green", premium: "purple", family: "blue", business: "orange" };
                const colorScheme = typeColors[p.type] || "green";
                return (
                  <Card key={p._id} borderRadius="xl" boxShadow="sm" _hover={{ boxShadow: "md", transform: "translateY(-2px)" }} transition="all 0.2s" overflow="hidden">
                    <Box h="4px" bg={`${colorScheme}.400`} />
                    <CardBody>
                      <Flex justify="space-between" align="start" mb={3}>
                        <Box>
                          <Badge colorScheme={colorScheme} borderRadius="full" mb={1} textTransform="capitalize">{p.type}</Badge>
                          <Heading size="md">{p.name || p.type}</Heading>
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
                              />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete plan?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Remove &quot;{p.name}&quot;. This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-600 text-white" onClick={() => handleDeletePlan(p._id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </HStack>
                      </Flex>

                      <Box mb={4}>
                        <HStack spacing={2} align="baseline">
                          <Text fontSize="2xl" fontWeight="800" color={`${colorScheme}.600`}>
                            UGX {Number(p.price || 0).toLocaleString()}
                          </Text>
                          {p.previousPrice && (
                            <Text fontSize="sm" color="gray.400" textDecoration="line-through">
                              {Number(p.previousPrice).toLocaleString()}
                            </Text>
                          )}
                        </HStack>
                        <Text fontSize="xs" color="gray.500">per period</Text>
                      </Box>

                      {details.length > 0 && (
                        <VStack align="stretch" spacing={1.5}>
                          {details.slice(0, 5).map((d, i) => (
                            <HStack key={i} spacing={2} align="start">
                              <CheckCircle size={14} color="var(--chakra-colors-green-500)" style={{ marginTop: 2, flexShrink: 0 }} />
                              <Text fontSize="sm" color="gray.600">{d}</Text>
                            </HStack>
                          ))}
                          {details.length > 5 && (
                            <Text fontSize="xs" color="gray.400">+{details.length - 5} more benefits</Text>
                          )}
                        </VStack>
                      )}
                    </CardBody>
                  </Card>
                );
              })}

              {/* Add plan card */}
              <Card
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
                      <Text fontWeight="600" color="green.600">Add New Plan</Text>
                    </VStack>
                  </Center>
                </CardBody>
              </Card>
            </SimpleGrid>
          ) : (
            <Card borderRadius="xl">
              <CardBody>
                <Center py={12}>
                  <VStack spacing={4}>
                    <Flex w={16} h={16} borderRadius="full" bg="purple.50" align="center" justify="center">
                      <Package size={32} color="var(--chakra-colors-purple-400)" />
                    </Flex>
                    <Text color="gray.500" fontWeight="500">No plans yet</Text>
                    <Button leftIcon={<Plus size={16} />} colorScheme="green" onClick={openAddPlan} borderRadius="lg">
                      Create Your First Plan
                    </Button>
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
        title="Add Subscription Plan"
        form={planForm}
        setForm={setPlanForm}
        onSave={handleSavePlan}
        saving={saving}
        saveLabel="Create Plan"
      />

      {/* Edit plan modal */}
      <PlanModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        title="Edit Plan"
        form={planForm}
        setForm={setPlanForm}
        onSave={handleSavePlan}
        saving={saving}
        saveLabel="Update Plan"
      />
    </Box>
  );
}

function PlanModal({ isOpen, onClose, title, form, setForm, onSave, saving, saveLabel }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent maxH="90vh" borderRadius="xl" boxShadow="2xl">
        <ModalHeader fontSize="lg" fontWeight="bold" borderBottomWidth="1px" py={4}>
          {title}
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />
        <ModalBody py={5} overflowY="auto">
          <PlanForm form={form} setForm={setForm} />
        </ModalBody>
        <ModalFooter borderTopWidth="1px" py={4} gap={3}>
          <Button variant="outline" onClick={onClose} isDisabled={saving} borderRadius="lg">Cancel</Button>
          <Button colorScheme="green" onClick={onSave} isLoading={saving} loadingText="Saving..." borderRadius="lg">
            {saveLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function PlanForm({ form, setForm }) {
  const benefits = Array.isArray(form.details) ? form.details : (form.details ? String(form.details).split("\n").filter(Boolean) : []);

  const setBenefits = (arr) => setForm((f) => ({ ...f, details: arr }));
  const addBenefit = () => setBenefits([...benefits, ""]);
  const updateBenefit = (index, value) => { const next = [...benefits]; next[index] = value; setBenefits(next); };
  const removeBenefit = (index) => setBenefits(benefits.filter((_, i) => i !== index));
  const moveUp = (index) => { if (index <= 0) return; const next = [...benefits]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; setBenefits(next); };
  const moveDown = (index) => { if (index >= benefits.length - 1) return; const next = [...benefits]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; setBenefits(next); };

  return (
    <VStack spacing={5} align="stretch">
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <FormControl isRequired>
          <FormLabel fontWeight="600" fontSize="sm">Plan Type</FormLabel>
          <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} borderRadius="lg">
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="family">Family</option>
            <option value="business">Business</option>
          </Select>
        </FormControl>
        <FormControl isRequired>
          <FormLabel fontWeight="600" fontSize="sm">Display Name</FormLabel>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Premium" borderRadius="lg" />
        </FormControl>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <FormControl isRequired>
          <FormLabel fontWeight="600" fontSize="sm">Price (UGX)</FormLabel>
          <Input type="number" min={0} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="e.g. 30000" borderRadius="lg" />
        </FormControl>
        <FormControl>
          <FormLabel fontWeight="600" fontSize="sm">Previous Price (UGX)</FormLabel>
          <Input type="number" min={0} value={form.previousPrice} onChange={(e) => setForm((f) => ({ ...f, previousPrice: e.target.value }))} placeholder="e.g. 40000" borderRadius="lg" />
          <Text fontSize="xs" color="gray.500" mt={1}>Shown as strike-through</Text>
        </FormControl>
      </SimpleGrid>

      <Box>
        <Flex justify="space-between" align="center" mb={3}>
          <FormLabel fontWeight="600" fontSize="sm" mb={0}>Plan Benefits</FormLabel>
          <Button leftIcon={<Plus size={14} />} size="sm" colorScheme="green" variant="outline" onClick={addBenefit} borderRadius="lg">
            Add
          </Button>
        </Flex>
        <VStack spacing={2} align="stretch">
          {benefits.map((benefit, index) => (
            <Flex key={index} gap={2} align="center" p={2} bg="gray.50" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
              <VStack spacing={0} flexShrink={0}>
                <IconButton aria-label="Up" icon={<ChevronUp size={14} />} size="xs" variant="ghost" onClick={() => moveUp(index)} isDisabled={index === 0} />
                <IconButton aria-label="Down" icon={<ChevronDown size={14} />} size="xs" variant="ghost" onClick={() => moveDown(index)} isDisabled={index === benefits.length - 1} />
              </VStack>
              <Input flex={1} value={benefit} onChange={(e) => updateBenefit(index, e.target.value)} placeholder={`Benefit ${index + 1}`} size="sm" borderRadius="md" />
              <IconButton aria-label="Remove" icon={<Trash2 size={14} />} size="sm" variant="ghost" colorScheme="red" onClick={() => removeBenefit(index)} />
            </Flex>
          ))}
          {benefits.length === 0 && (
            <Box p={6} textAlign="center" borderWidth="2px" borderStyle="dashed" borderColor="gray.200" borderRadius="lg">
              <Text color="gray.400" fontSize="sm">No benefits yet. Click &quot;Add&quot; to add plan features.</Text>
            </Box>
          )}
        </VStack>
      </Box>
    </VStack>
  );
}

function MealSlotGrid({ slots, overrides, upsertSlot, upsertOverride, toast, loadSlots, loadOverrides }) {
  const [incomeLevel, setIncomeLevel] = useState("middle");
  const [prepType, setPrepType] = useState("ready-to-eat");
  const [editingSlot, setEditingSlot] = useState(null);
  const [saving, setSaving] = useState(false);
  const { isOpen: isSlotModalOpen, onOpen: onSlotModalOpen, onClose: onSlotModalClose } = useDisclosure();

  const getSlot = (day, mealType) => slots.find((s) => s.incomeLevel === incomeLevel && s.prepType === prepType && s.day === day && s.mealType === mealType);
  const getOverride = (day, mealType) => overrides.find((o) => o.incomeLevel === incomeLevel && o.prepType === prepType && o.day === day && o.mealType === mealType);

  const openEditor = (day, mealType) => {
    const slot = getSlot(day, mealType);
    const override = getOverride(day, mealType);
    setEditingSlot({
      day, mealType, incomeLevel, prepType,
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
      await upsertSlot({
        incomeLevel: form.incomeLevel, prepType: form.prepType, day: form.day, mealType: form.mealType,
        mealName: form.mealName, description: form.description, quantity: form.quantity,
        priceWeekly: Number(form.priceWeekly) || 0, priceMonthly: Number(form.priceMonthly) || 0,
        imageUrl: form.imageUrl || "",
      }).unwrap();
      await upsertOverride({
        incomeLevel: form.incomeLevel, prepType: form.prepType, day: form.day, mealType: form.mealType,
        imageUrl: form.imageUrl || "",
      }).unwrap();
      loadSlots();
      loadOverrides();
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
            <Text fontSize="sm" fontWeight="600" color="gray.600">Income:</Text>
            <Select w="150px" value={incomeLevel} onChange={(e) => setIncomeLevel(e.target.value)} size="sm" borderRadius="lg" fontWeight="500">
              <option value="middle">Middle</option>
              <option value="low">Low</option>
              <option value="high">High</option>
            </Select>
          </HStack>
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
      const res = await fetch(`${BACKEND_URL}/api/meal-calendar/upload`, { method: "POST", body: fd });
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
      <ModalContent maxH="90vh" borderRadius="xl">
        <ModalHeader borderBottomWidth="1px" py={4}>
          <HStack spacing={2}>
            <UtensilsCrossed size={18} />
            <Text textTransform="capitalize">{slot.day} — {slot.mealType}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody py={4}>
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
              <SimpleGrid columns={2} spacing={4}>
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
                <HStack spacing={2}>
                  <Input value={form.imageUrl || ""} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="URL or upload" borderRadius="lg" />
                  <Button as="label" size="sm" colorScheme="green" cursor="pointer" isLoading={uploading} borderRadius="lg">
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
          <ModalFooter borderTopWidth="1px" gap={3}>
            <Button variant="outline" onClick={onClose} isDisabled={saving} borderRadius="lg">Cancel</Button>
            <Button colorScheme="green" type="submit" isLoading={saving} loadingText="Saving..." borderRadius="lg">Save Meal</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
