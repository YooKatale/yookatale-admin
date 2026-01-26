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
  TableCaption,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Card,
  CardBody,
  IconButton,
  FormControl,
  FormLabel,
  Textarea,
  Badge,
  Spinner,
  Center,
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
import { Loader2, Plus, Pencil, Trash2, Calendar, UtensilsCrossed } from "lucide-react";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const MEAL_TYPES = ["breakfast", "lunch", "supper"];
const INCOME_LEVELS = ["middle", "low"];
const PREP_TYPES = ["ready-to-eat", "ready-to-cook"];

export default function SubscriptionsPage() {
  const bg = useColorModeValue("white", "gray.900");
  const [subscriptionsData, setSubscriptionsData] = useState([]);
  const [packages, setPackages] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [loadingOverrides, setLoadingOverrides] = useState(false);

  const [fetchSubscriptions] = useSubscriptionsFetchMutation();
  const [approveSubscription] = useSubscriptionsApproveMutation();
  const [fetchPackages] = useSubscriptionPackagesFetchMutation();
  const [createPackage] = useSubscriptionPackageCreateMutation();
  const [updatePackage] = useSubscriptionPackageUpdateMutation();
  const [deletePackage] = useSubscriptionPackageDeleteMutation();
  const [fetchOverrides] = useMealCalendarOverridesFetchMutation();
  const [upsertOverride] = useMealCalendarOverrideUpsertMutation();

  const { toast } = useToast();
  const { isOpen: isPlanOpen, onOpen: onPlanOpen, onClose: onPlanClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({ type: "", price: "", name: "", details: "", previousPrice: "" });

  const loadSubscriptions = useCallback(async () => {
    try {
      const res = await fetchSubscriptions("pending").unwrap();
      if (res?.status === "Success") setSubscriptionsData(res?.data || []);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e?.data?.message || "Failed to load" });
    }
  }, [fetchSubscriptions, toast]);

  const loadPackages = useCallback(async () => {
    setLoadingPackages(true);
    try {
      const res = await fetchPackages().unwrap();
      if (res?.status === "Success") setPackages(res?.data || []);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e?.data?.message || "Failed to load packages" });
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
      toast({ variant: "destructive", title: "Error", description: e?.data?.message || "Failed to load overrides" });
    } finally {
      setLoadingOverrides(false);
    }
  }, [fetchOverrides, toast]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const handleApprove = async (id) => {
    setLoading(true);
    try {
      await approveSubscription(id).unwrap();
      setLoading(false);
      toast({ title: "Success", description: "Subscription approved" });
      loadSubscriptions();
    } catch (e) {
      setLoading(false);
      toast({ variant: "destructive", title: "Error", description: e?.data?.message });
    }
  };

  const openAddPlan = () => {
    setEditingPlan(null);
    setPlanForm({ type: "standard", price: "", name: "", details: "", previousPrice: "" });
    onPlanOpen();
  };

  const openEditPlan = (p) => {
    setEditingPlan(p);
    setPlanForm({
      type: p?.type || "",
      price: p?.price ?? "",
      name: p?.name || "",
      details: Array.isArray(p?.details) ? p.details.join("\n") : "",
      previousPrice: p?.previousPrice ?? "",
    });
    onEditOpen();
  };

  const handleSavePlan = async () => {
    const details = planForm.details ? planForm.details.split("\n").filter(Boolean) : [];
    const payload = {
      type: planForm.type,
      price: Number(planForm.price),
      name: planForm.name,
      details,
      previousPrice: planForm.previousPrice ? Number(planForm.previousPrice) : null,
    };
    try {
      if (editingPlan) {
        await updatePackage({ id: editingPlan._id, ...payload }).unwrap();
        toast({ title: "Updated", description: "Plan updated successfully" });
        onEditClose();
      } else {
        await createPackage(payload).unwrap();
        toast({ title: "Created", description: "Plan created successfully" });
        onPlanClose();
      }
      loadPackages();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e?.data?.message || "Failed to save" });
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      await deletePackage(id).unwrap();
      toast({ title: "Deleted", description: "Plan removed" });
      loadPackages();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e?.data?.message });
    }
  };

  return (
    <Box className="max-w-full" bg={bg} p={8} mt="3">
      <Heading size="lg" mb={6}>Subscription Management</Heading>

      <Tabs variant="enclosed" colorScheme="green">
        <TabList flexWrap="wrap" gap={2}>
          <Tab fontWeight="600">
            <HStack><UtensilsCrossed size={18} />YooCards</HStack>
          </Tab>
          <Tab fontWeight="600" onClick={loadPackages}>
            <HStack><UtensilsCrossed size={18} />Meal Plans</HStack>
          </Tab>
          <Tab fontWeight="600" onClick={loadOverrides}>
            <HStack><Calendar size={18} />Meal Calendars</HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* YooCards — pending approvals */}
          <TabPanel px={0}>
            <Card>
              <CardBody>
                <Text fontWeight="600" mb={4}>Subscriptions pending approval</Text>
                {subscriptionsData.length > 0 ? (
                  <Box overflowX="auto">
                    <Table size="sm">
                      <TableCaption>New Orders</TableCaption>
                      <Thead>
                        <Tr>
                          <Th>Client</Th>
                          <Th>Cards</Th>
                          <Th>Date</Th>
                          <Th></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {subscriptionsData.map((sub) => (
                          <Tr key={sub._id}>
                            <Td>{`${sub?.user?.firstname} ${sub?.user?.lastname}`}</Td>
                            <Td>
                              {sub?.cards?.length > 0 ? (
                                sub.cards.map((c, i) => (
                                  <Box key={i} p={1} borderWidth="1px" borderRadius="md" mb={1}>
                                    <Text fontWeight="bold" fontSize="sm" textTransform="capitalize">{c.card}</Text>
                                    <Text fontSize="xs">{String(c.cardNumber || "").slice(0, 3)}xxxxxxxxx</Text>
                                  </Box>
                                ))
                              ) : (
                                <Text fontSize="sm">No cards</Text>
                              )}
                            </Td>
                            <Td>{moment(sub?.createdAt).fromNow()}</Td>
                            <Td>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    colorScheme="green"
                                    leftIcon={isLoading ? <Loader2 className="animate-spin" /> : null}
                                    onClick={() => setLoading(true)}
                                  >
                                    Approve
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Approve subscription?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will activate {`${sub?.user?.firstname} ${sub?.user?.lastname}'s`} subscription.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setLoading(false)}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-green-600 text-white"
                                      onClick={() => handleApprove(sub._id)}
                                    >
                                      Continue
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                ) : (
                  <Text color="gray.500">No subscriptions pending approval</Text>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Meal Plans — subscription packages CRUD */}
          <TabPanel px={0}>
            <Card>
              <CardBody>
                <Flex justify="space-between" align="center" mb={4}>
                  <Text fontWeight="600">Manage subscription plans (test plans)</Text>
                  <Button
                    leftIcon={<Plus size={18} />}
                    colorScheme="green"
                    size="sm"
                    onClick={openAddPlan}
                  >
                    Add Plan
                  </Button>
                </Flex>
                {loadingPackages ? (
                  <Center py={8}><Spinner size="lg" /></Center>
                ) : packages.length > 0 ? (
                  <Box overflowX="auto">
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Type</Th>
                          <Th>Name</Th>
                          <Th>Price (UGX)</Th>
                          <Th>Previous</Th>
                          <Th></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {packages.map((p) => (
                          <Tr key={p._id}>
                            <Td><Badge colorScheme="green">{p.type}</Badge></Td>
                            <Td>{p.name}</Td>
                            <Td>{Number(p.price || 0).toLocaleString()}</Td>
                            <Td>{p.previousPrice ? Number(p.previousPrice).toLocaleString() : "—"}</Td>
                            <Td>
                              <HStack>
                                <IconButton
                                  aria-label="Edit"
                                  icon={<Pencil size={14} />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditPlan(p)}
                                />
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
                                      <AlertDialogAction
                                        className="bg-red-600 text-white"
                                        onClick={() => handleDeletePlan(p._id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                ) : (
                  <Text color="gray.500">No plans yet. Add one to manage meal plans.</Text>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Meal Calendars — image overrides */}
          <TabPanel px={0}>
            <Card>
              <CardBody>
                <Text fontWeight="600" mb={2}>Meal calendar images</Text>
                <Text fontSize="sm" color="gray.600" mb={4}>
                  Set image URLs for each meal slot. These override defaults on the subscription page.
                </Text>
                {loadingOverrides ? (
                  <Center py={8}><Spinner size="lg" /></Center>
                ) : (
                  <MealCalendarGrid
                    overrides={overrides}
                    upsertOverride={upsertOverride}
                    toast={toast}
                    loadOverrides={loadOverrides}
                  />
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Add plan modal */}
      <Modal isOpen={isPlanOpen} onClose={onPlanClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add subscription plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <PlanForm form={planForm} setForm={setPlanForm} />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={2} onClick={onPlanClose}>Cancel</Button>
            <Button colorScheme="green" onClick={handleSavePlan}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit plan modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <PlanForm form={planForm} setForm={setPlanForm} />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={2} onClick={onEditClose}>Cancel</Button>
            <Button colorScheme="green" onClick={handleSavePlan}>Update</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function PlanForm({ form, setForm }) {
  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>Type</FormLabel>
        <Select
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
        >
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
          <option value="family">Family</option>
          <option value="business">Business</option>
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel>Name</FormLabel>
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Monthly Standard"
        />
      </FormControl>
      <FormControl>
        <FormLabel>Price (UGX)</FormLabel>
        <Input
          type="number"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          placeholder="e.g. 50000"
        />
      </FormControl>
      <FormControl>
        <FormLabel>Previous price (UGX, optional)</FormLabel>
        <Input
          type="number"
          value={form.previousPrice}
          onChange={(e) => setForm((f) => ({ ...f, previousPrice: e.target.value }))}
          placeholder="e.g. 65000"
        />
      </FormControl>
      <FormControl>
        <FormLabel>Details (one per line)</FormLabel>
        <Textarea
          value={form.details}
          onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
          placeholder="Feature one&#10;Feature two"
          rows={4}
        />
      </FormControl>
    </VStack>
  );
}

function MealCalendarGrid({ overrides, upsertOverride, toast, loadOverrides }) {
  const [incomeLevel, setIncomeLevel] = useState("middle");
  const [prepType, setPrepType] = useState("ready-to-eat");
  const [saving, setSaving] = useState(null);

  const getOverride = (day, mealType) =>
    overrides.find(
      (o) =>
        o.incomeLevel === incomeLevel &&
        o.prepType === prepType &&
        o.day === day &&
        o.mealType === mealType
    );

  const handleSave = async (day, mealType, imageUrl) => {
    const slotKey = `${incomeLevel}-${prepType}-${day}-${mealType}`;
    setSaving(slotKey);
    try {
      await upsertOverride({ incomeLevel, prepType, day, mealType, imageUrl }).unwrap();
      toast({ title: "Saved", description: "Image updated" });
      loadOverrides();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e?.data?.message });
    } finally {
      setSaving(null);
    }
  };

  return (
    <VStack align="stretch" spacing={4}>
      <HStack flexWrap="wrap" gap={2}>
        <Select
          w="140px"
          value={incomeLevel}
          onChange={(e) => setIncomeLevel(e.target.value)}
          size="sm"
        >
          <option value="middle">Middle income</option>
          <option value="low">Low income</option>
        </Select>
        <Select
          w="160px"
          value={prepType}
          onChange={(e) => setPrepType(e.target.value)}
          size="sm"
        >
          <option value="ready-to-eat">Ready to eat</option>
          <option value="ready-to-cook">Ready to cook</option>
        </Select>
      </HStack>
      <Box overflowX="auto">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Day</Th>
              <Th>Breakfast</Th>
              <Th>Lunch</Th>
              <Th>Supper</Th>
            </Tr>
          </Thead>
          <Tbody>
            {DAYS.map((day) => (
              <Tr key={day}>
                <Td fontWeight="600" textTransform="capitalize">{day}</Td>
                {MEAL_TYPES.map((mealType) => {
                  const o = getOverride(day, mealType);
                  const slotKey = `${incomeLevel}-${prepType}-${day}-${mealType}`;
                  return (
                    <Td key={mealType}>
                      <MealImageEditor
                        override={o}
                        day={day}
                        mealType={mealType}
                        onSave={handleSave}
                        saving={saving}
                        slotKey={slotKey}
                      />
                    </Td>
                  );
                })}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </VStack>
  );
}

function MealImageEditor({ override, day, mealType, onSave, saving, slotKey }) {
  const [url, setUrl] = useState(override?.imageUrl || "");
  const [editing, setEditing] = useState(false);
  const isSaving = saving === slotKey;

  useEffect(() => {
    setUrl(override?.imageUrl || "");
  }, [override?.imageUrl]);

  const save = () => {
    if (!url.trim()) return;
    onSave(day, mealType, url.trim());
    setEditing(false);
  };

  return (
    <VStack align="stretch" spacing={1}>
      {override?.imageUrl && !editing ? (
        <Box pos="relative" w="full" h="16" borderRadius="md" overflow="hidden" bg="gray.100">
          <Box
            as="img"
            src={override.imageUrl}
            alt=""
            w="full"
            h="full"
            objectFit="cover"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </Box>
      ) : null}
      {editing ? (
        <>
          <Input
            size="xs"
            placeholder="Image URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <HStack>
            <Button size="xs" colorScheme="green" onClick={save} isLoading={isSaving}>Save</Button>
            <Button size="xs" variant="ghost" onClick={() => { setEditing(false); setUrl(override?.imageUrl || ""); }}>Cancel</Button>
          </HStack>
        </>
      ) : (
        <Button size="xs" variant="outline" onClick={() => setEditing(true)}>
          {override?.imageUrl ? "Change image" : "Post image"}
        </Button>
      )}
    </VStack>
  );
}
