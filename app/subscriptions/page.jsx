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
import { Loader2, Plus, Pencil, Trash2, Calendar, UtensilsCrossed, ChevronUp, ChevronDown } from "lucide-react";
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
        loadPackages();
        toast({
          title: "Plan updated",
          description: "Your changes are now live on the subscription page. Users will see the updated plan details.",
          status: "success",
          duration: 6000,
          isClosable: true,
          position: "top-right",
          containerStyle: { maxWidth: "420px" },
        });
      } else {
        await createPackage(payload).unwrap();
        onPlanClose();
        loadPackages();
        toast({
          title: "Plan created",
          description: "The new plan has been added and is now visible on the subscription page.",
          status: "success",
          duration: 6000,
          isClosable: true,
          position: "top-right",
          containerStyle: { maxWidth: "420px" },
        });
      }
    } catch (e) {
      const msg = e?.data?.message || e?.message || "Failed to save. Please check your connection and try again.";
      toast({
        title: "Update failed",
        description: msg,
        status: "error",
        duration: 8000,
        isClosable: true,
        position: "top-right",
        containerStyle: { maxWidth: "420px" },
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      await deletePackage(id).unwrap();
      loadPackages();
      toast({
        title: "Plan deleted",
        description: "The plan has been removed from the subscription page.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e?.data?.message || "Failed to delete the plan.",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top-right",
      });
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
      <Modal isOpen={isPlanOpen} onClose={onPlanClose} size="xl" isCentered scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent maxH="90vh" borderRadius="xl" boxShadow="2xl">
          <ModalHeader fontSize="xl" fontWeight="bold" color="gray.800" borderBottomWidth="1px" py={5}>
            Add subscription plan
          </ModalHeader>
          <ModalCloseButton top={4} right={4} size="lg" />
          <ModalBody py={6} overflowY="auto">
            <PlanForm form={planForm} setForm={setPlanForm} />
          </ModalBody>
          <ModalFooter borderTopWidth="1px" py={4} gap={3}>
            <Button variant="outline" onClick={onPlanClose}>Cancel</Button>
            <Button colorScheme="green" size="md" onClick={handleSavePlan}>Save Plan</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit plan modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl" isCentered scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent maxH="90vh" borderRadius="xl" boxShadow="2xl">
          <ModalHeader fontSize="xl" fontWeight="bold" color="gray.800" borderBottomWidth="1px" py={5}>
            Edit plan
          </ModalHeader>
          <ModalCloseButton top={4} right={4} size="lg" />
          <ModalBody py={6} overflowY="auto">
            <PlanForm form={planForm} setForm={setPlanForm} />
          </ModalBody>
          <ModalFooter borderTopWidth="1px" py={4} gap={3}>
            <Button variant="outline" onClick={onEditClose} isDisabled={saving}>Cancel</Button>
            <Button colorScheme="green" size="md" onClick={handleSavePlan} isLoading={saving} loadingText="Updating...">Update Plan</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function PlanForm({ form, setForm }) {
  const benefits = Array.isArray(form.details) ? form.details : (form.details ? String(form.details).split("\n").filter(Boolean) : []);

  const setBenefits = (arr) => {
    setForm((f) => ({ ...f, details: arr }));
  };

  const addBenefit = () => {
    setBenefits([...benefits, ""]);
  };

  const updateBenefit = (index, value) => {
    const next = [...benefits];
    next[index] = value;
    setBenefits(next);
  };

  const removeBenefit = (index) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const moveUp = (index) => {
    if (index <= 0) return;
    const next = [...benefits];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setBenefits(next);
  };

  const moveDown = (index) => {
    if (index >= benefits.length - 1) return;
    const next = [...benefits];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setBenefits(next);
  };

  return (
    <VStack spacing={6} align="stretch">
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <FormControl isRequired>
          <FormLabel fontWeight="600" color="gray.700">Plan Type</FormLabel>
          <Select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            size="md"
            borderRadius="lg"
            borderColor="gray.300"
            _focus={{ borderColor: "green.500", boxShadow: "0 0 0 1px var(--chakra-colors-green-500)" }}
          >
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="family">Family</option>
            <option value="business">Business</option>
          </Select>
        </FormControl>
        <FormControl isRequired>
          <FormLabel fontWeight="600" color="gray.700">Display Name</FormLabel>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Premium"
            size="md"
            borderRadius="lg"
            borderColor="gray.300"
          />
        </FormControl>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <FormControl isRequired>
          <FormLabel fontWeight="600" color="gray.700">Price (UGX)</FormLabel>
          <Input
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="e.g. 30000"
            size="md"
            borderRadius="lg"
            borderColor="gray.300"
          />
        </FormControl>
        <FormControl>
          <FormLabel fontWeight="600" color="gray.700">Previous Price (UGX, optional)</FormLabel>
          <Input
            type="number"
            min={0}
            value={form.previousPrice}
            onChange={(e) => setForm((f) => ({ ...f, previousPrice: e.target.value }))}
            placeholder="e.g. 40000"
            size="md"
            borderRadius="lg"
            borderColor="gray.300"
          />
          <Text fontSize="xs" color="gray.500" mt={1}>Shown as strike-through on the subscription page</Text>
        </FormControl>
      </SimpleGrid>

      <Box>
        <Flex justify="space-between" align="center" mb={3}>
          <FormLabel fontWeight="600" color="gray.700" mb={0}>Plan Benefits</FormLabel>
          <Button
            leftIcon={<Plus size={16} />}
            size="sm"
            colorScheme="green"
            variant="outline"
            onClick={addBenefit}
          >
            Add Benefit
          </Button>
        </Flex>
        <Text fontSize="sm" color="gray.500" mb={3}>
          Reorder benefits using the arrows. Top items appear first on the subscription page.
        </Text>
        <VStack spacing={2} align="stretch">
          {benefits.map((benefit, index) => (
            <Flex
              key={index}
              gap={2}
              align="center"
              p={3}
              bg="gray.50"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="gray.200"
              _hover={{ borderColor: "gray.300" }}
            >
              <HStack spacing={1} flexShrink={0}>
                <IconButton
                  aria-label="Move up"
                  icon={<ChevronUp size={16} />}
                  size="xs"
                  variant="ghost"
                  onClick={() => moveUp(index)}
                  isDisabled={index === 0}
                />
                <IconButton
                  aria-label="Move down"
                  icon={<ChevronDown size={16} />}
                  size="xs"
                  variant="ghost"
                  onClick={() => moveDown(index)}
                  isDisabled={index === benefits.length - 1}
                />
              </HStack>
              <Input
                flex={1}
                value={benefit}
                onChange={(e) => updateBenefit(index, e.target.value)}
                placeholder={`Benefit ${index + 1}`}
                size="sm"
                borderRadius="md"
                borderColor="gray.300"
              />
              <IconButton
                aria-label="Remove"
                icon={<Trash2 size={14} />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={() => removeBenefit(index)}
              />
            </Flex>
          ))}
          {benefits.length === 0 && (
            <Box
              p={6}
              textAlign="center"
              borderWidth="2px"
              borderStyle="dashed"
              borderColor="gray.200"
              borderRadius="lg"
              bg="gray.50"
            >
              <Text color="gray.500" fontSize="sm">No benefits yet. Click &quot;Add Benefit&quot; to add plan features.</Text>
            </Box>
          )}
        </VStack>
      </Box>
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
