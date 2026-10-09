"use client";

import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
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
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  useCreatePartnerPlanAdminMutation,
  useDeactivatePartnerPlanAdminMutation,
  useGetPartnerPlanEnrollmentsAdminQuery,
  useGetPartnerPlansAdminQuery,
  useUpdatePartnerPlanAdminMutation,
} from "@Slices/adminCommercialApiSlice";
import { useSelector } from "react-redux";
import { Pencil, Plus, RefreshCw, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const EMPTY_FORM = {
  id: "",
  name: "",
  priceUGX: "",
  priceUSD: "",
  durationMonths: "",
  advertisingMonths: "",
  benefits: "",
  orderNotificationChannels: "",
  active: true,
};

const readList = (response, keys) => {
  const candidates = [response?.data, response];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    for (const key of keys) {
      if (Array.isArray(candidate?.[key])) return candidate[key];
    }
  }
  return [];
};

const readError = (error) =>
  error?.data?.message || error?.data?.error || error?.error || "Request failed";

const toForm = (plan) => ({
  id: plan?.id || "",
  name: plan?.name || "",
  priceUGX: plan?.priceUGX ?? "",
  priceUSD: plan?.priceUSD ?? "",
  durationMonths: plan?.durationMonths ?? "",
  advertisingMonths: plan?.advertisingMonths ?? "",
  benefits: Array.isArray(plan?.benefits) ? plan.benefits.join("\n") : "",
  orderNotificationChannels: Array.isArray(plan?.orderNotificationChannels)
    ? plan.orderNotificationChannels.join("\n")
    : "",
  active: plan?.active !== false,
});

export default function PartnerPlansPage() {
  const userInfo = useSelector((state) => state.auth.userInfo);
  const role = userInfo?.accountType ?? userInfo?.account ?? "";
  const isAdmin = role === "admin";
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: planResponse, isLoading, isError, error, refetch } = useGetPartnerPlansAdminQuery(undefined, {
    skip: !isAdmin,
  });
  const plans = useMemo(() => readList(planResponse, ["plans"]), [planResponse]);
  const [createPlan, { isLoading: creating }] = useCreatePartnerPlanAdminMutation();
  const [updatePlan, { isLoading: updating }] = useUpdatePartnerPlanAdminMutation();
  const [deactivatePlan, { isLoading: deactivating }] = useDeactivatePartnerPlanAdminMutation();
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [status, setStatus] = useState("");
  const [planId, setPlanId] = useState("");
  const enrollmentArgs = { page, limit, status, planId };
  const {
    data: enrollmentResponse,
    isLoading: loadingEnrollments,
    isFetching: fetchingEnrollments,
    isError: enrollmentError,
    error: enrollmentFetchError,
    refetch: refetchEnrollments,
  } = useGetPartnerPlanEnrollmentsAdminQuery(enrollmentArgs, { skip: !isAdmin });
  const enrollments = useMemo(
    () => readList(enrollmentResponse, ["enrollments", "items", "results"]),
    [enrollmentResponse],
  );
  const total = Number(
    enrollmentResponse?.total ??
    enrollmentResponse?.data?.total ??
    enrollmentResponse?.pagination?.total ??
    enrollmentResponse?.data?.pagination?.total ??
    enrollments.length,
  );
  const pageCount = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const openCreate = () => {
    setEditingPlan(null);
    setForm(EMPTY_FORM);
    onOpen();
  };
  const openEdit = (plan) => {
    setEditingPlan(plan);
    setForm(toForm(plan));
    onOpen();
  };

  const savePlan = async (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const id = form.id.trim();
    const benefits = form.benefits.split("\n").map((value) => value.trim()).filter(Boolean);
    const orderNotificationChannels = form.orderNotificationChannels
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);
    const numbers = {
      priceUGX: Number(form.priceUGX),
      priceUSD: Number(form.priceUSD),
      durationMonths: Number(form.durationMonths),
      advertisingMonths: Number(form.advertisingMonths),
    };

    if (!name || !Number.isFinite(numbers.priceUGX) || numbers.priceUGX < 0 ||
        !Number.isFinite(numbers.priceUSD) || numbers.priceUSD < 0 ||
        !Number.isInteger(numbers.durationMonths) || numbers.durationMonths < 1 ||
        !Number.isInteger(numbers.advertisingMonths) || numbers.advertisingMonths < 0) {
      toast({
        title: "Invalid plan details",
        description: "Enter a name, non-negative prices, a positive plan duration, and a non-negative advertising duration.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    if (id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(id)) {
      toast({ title: "Invalid plan ID", description: "Use letters, numbers, and hyphens only.", status: "warning", duration: 4000, isClosable: true });
      return;
    }

    const payload = {
      ...(!editingPlan && id ? { id } : {}),
      name,
      ...numbers,
      benefits,
      orderNotificationChannels,
      active: form.active,
    };
    try {
      if (editingPlan) {
        await updatePlan({ id: editingPlan.id, ...payload }).unwrap();
      } else {
        await createPlan(payload).unwrap();
      }
      toast({ title: editingPlan ? "Partner plan updated" : "Partner plan created", status: "success", duration: 3000, isClosable: true });
      onClose();
      await refetch();
    } catch (requestError) {
      toast({ title: "Could not save partner plan", description: readError(requestError), status: "error", duration: 5000, isClosable: true });
    }
  };

  const handleDeactivate = async (plan) => {
    if (!window.confirm(`Deactivate "${plan.name}"? Existing purchases will be preserved.`)) return;
    try {
      await deactivatePlan(plan.id).unwrap();
      toast({ title: "Partner plan deactivated", status: "success", duration: 3000, isClosable: true });
      await refetch();
    } catch (requestError) {
      toast({ title: "Could not deactivate plan", description: readError(requestError), status: "error", duration: 5000, isClosable: true });
    }
  };

  if (!isAdmin) return <AdminOnlyNotice />;

  return (
    <Box px={{ base: 3, md: 6 }} py={5}>
      <VStack align="stretch" spacing={5}>
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <Box>
            <Heading size="lg">Vendor Partner Plans</Heading>
            <Text color="gray.600" mt={1}>Manage the vendor plan catalog and review enrollments.</Text>
          </Box>
          <HStack>
            <Button leftIcon={<RefreshCw size={15} />} variant="outline" onClick={() => { refetch(); refetchEnrollments(); }}>
              Refresh
            </Button>
            <Button leftIcon={<Plus size={16} />} colorScheme="green" onClick={openCreate}>Create plan</Button>
          </HStack>
        </Flex>

        <Tabs colorScheme="green" isLazy>
          <TabList overflowX="auto">
            <Tab>Plans</Tab>
            <Tab>Enrollments</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0}>
              {isLoading ? <LoadingState label="Loading partner plans..." /> :
                isError ? <ErrorState message={readError(error)} retry={refetch} /> :
                plans.length === 0 ? (
                  <Card><CardBody><Text color="gray.600">No partner plans found.</Text></CardBody></Card>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" minW="900px">
                      <Thead><Tr><Th>Plan</Th><Th>UGX</Th><Th>USD</Th><Th>Duration</Th><Th>Advertising</Th><Th>Commission</Th><Th>Status</Th><Th>Actions</Th></Tr></Thead>
                      <Tbody>
                        {plans.map((plan) => (
                          <Tr key={plan.id}>
                            <Td>
                              <Text fontWeight="700">{plan.name}</Text>
                              <Text fontSize="xs" color="gray.500">{plan.id}</Text>
                            </Td>
                            <Td>UGX {Number(plan.priceUGX || 0).toLocaleString()}</Td>
                            <Td>USD {Number(plan.priceUSD || 0).toLocaleString()}</Td>
                            <Td>{plan.durationMonths} months</Td>
                            <Td>{plan.advertisingMonths} months</Td>
                            <Td>0%</Td>
                            <Td><Badge colorScheme={plan.active ? "green" : "gray"}>{plan.active ? "Active" : "Inactive"}</Badge></Td>
                            <Td>
                              <HStack>
                                <IconButton aria-label={`Edit ${plan.name}`} icon={<Pencil size={15} />} size="sm" onClick={() => openEdit(plan)} />
                                {plan.active && (
                                  <Button size="sm" colorScheme="red" variant="outline" onClick={() => handleDeactivate(plan)} isLoading={deactivating}>
                                    Deactivate
                                  </Button>
                                )}
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
            </TabPanel>
            <TabPanel px={0}>
              <VStack align="stretch" spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
                      <option value="">All statuses</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Plan</FormLabel>
                    <Select value={planId} onChange={(event) => { setPlanId(event.target.value); setPage(1); }}>
                      <option value="">All plans</option>
                      {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Rows per page</FormLabel>
                    <Select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }}>
                      {[25, 50, 100].map((value) => <option key={value} value={value}>{value}</option>)}
                    </Select>
                  </FormControl>
                </SimpleGrid>
                {enrollmentError ? <ErrorState message={readError(enrollmentFetchError)} retry={refetchEnrollments} /> :
                  loadingEnrollments ? <LoadingState label="Loading enrollments..." /> :
                  <Card>
                    <CardBody>
                      {fetchingEnrollments && <Text fontSize="sm" color="gray.500" mb={2}>Updating results...</Text>}
                      {enrollments.length === 0 ? <Text color="gray.600">No enrollments match these filters.</Text> : (
                        <Box overflowX="auto">
                          <Table minW="900px" size="sm">
                            <Thead><Tr><Th>Vendor</Th><Th>Plan</Th><Th>Status</Th><Th>Amount</Th><Th>Currency</Th><Th>Payment reference</Th><Th>Created</Th></Tr></Thead>
                            <Tbody>
                              {enrollments.map((enrollment) => (
                                <Tr key={enrollment._id || enrollment.id}>
                                  <Td>{enrollment.vendor?.businessName || enrollment.vendor?.name || enrollment.vendorName || enrollment.vendorId || "—"}</Td>
                                  <Td>{enrollment.planName || enrollment.plan?.name || enrollment.planId || "—"}</Td>
                                  <Td><Badge colorScheme={enrollment.status === "paid" ? "green" : enrollment.status === "failed" ? "red" : "yellow"}>{enrollment.status || "—"}</Badge></Td>
                                  <Td>{enrollment.amount == null ? "—" : Number(enrollment.amount).toLocaleString()}</Td>
                                  <Td>{enrollment.currency || "—"}</Td>
                                  <Td>{enrollment.paymentReference || enrollment.tx_ref || "—"}</Td>
                                  <Td>{enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleString() : "—"}</Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>
                      )}
                      <Flex justify="space-between" align="center" mt={4} gap={3} flexWrap="wrap">
                        <Text fontSize="sm" color="gray.600">Page {page} of {pageCount} · {total} enrollments</Text>
                        <HStack>
                          <Button size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} isDisabled={page <= 1}>Previous</Button>
                          <Button size="sm" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} isDisabled={page >= pageCount}>Next</Button>
                        </HStack>
                      </Flex>
                    </CardBody>
                  </Card>}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "2xl" }} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxH={{ base: "100dvh", md: "calc(100vh - 3rem)" }} display="flex" flexDirection="column">
          <form onSubmit={savePlan} style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
            <ModalHeader>{editingPlan ? "Edit partner plan" : "Create partner plan"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody overflowY="auto" flex="1" minH={0}>
              <VStack align="stretch" spacing={4}>
                <FormControl>
                  <FormLabel>Plan ID (optional slug, generated from name if blank)</FormLabel>
                  <Input value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} placeholder="small-starter" isDisabled={Boolean(editingPlan)} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                </FormControl>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <NumberField label="Price (UGX)" value={form.priceUGX} onChange={(value) => setForm({ ...form, priceUGX: value })} />
                  <NumberField label="Price (USD)" value={form.priceUSD} onChange={(value) => setForm({ ...form, priceUSD: value })} />
                  <NumberField label="Duration (months)" value={form.durationMonths} onChange={(value) => setForm({ ...form, durationMonths: value })} />
                  <NumberField label="Advertising included (months)" value={form.advertisingMonths} onChange={(value) => setForm({ ...form, advertisingMonths: value })} />
                </SimpleGrid>
                <FormControl>
                  <FormLabel>Included benefits (one per line)</FormLabel>
                  <Textarea rows={5} value={form.benefits} onChange={(event) => setForm({ ...form, benefits: event.target.value })} />
                </FormControl>
                <FormControl>
                  <FormLabel>Order notification channels (one per line)</FormLabel>
                  <Textarea rows={3} value={form.orderNotificationChannels} onChange={(event) => setForm({ ...form, orderNotificationChannels: event.target.value })} placeholder="For example: email, sms" />
                </FormControl>
                <Checkbox isChecked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })}>Plan is active</Checkbox>
                <Text fontSize="sm" color="gray.600">Commission rate is fixed at 0% for every plan.</Text>
              </VStack>
            </ModalBody>
            <ModalFooter gap={3}>
              <Button variant="outline" onClick={onClose} isDisabled={creating || updating}>Cancel</Button>
              <Button type="submit" colorScheme="green" isLoading={creating || updating}>{editingPlan ? "Save changes" : "Create plan"}</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <FormControl isRequired>
      <FormLabel>{label}</FormLabel>
      <Input type="number" min={0} step="any" value={value} onChange={(event) => onChange(event.target.value)} />
    </FormControl>
  );
}

function AdminOnlyNotice() {
  return (
    <Center minH="50vh" px={4}>
      <Alert status="error" maxW="lg" borderRadius="lg">
        <AlertIcon />
        This page is restricted to administrator accounts.
      </Alert>
    </Center>
  );
}

function LoadingState({ label }) {
  return <Center py={12}><VStack><Spinner color="green.500" /><Text color="gray.600">{label}</Text></VStack></Center>;
}

function ErrorState({ message, retry }) {
  return (
    <Card borderColor="red.200" borderWidth="1px">
      <CardBody>
        <Flex gap={3} align="center" wrap="wrap">
          <XCircle color="var(--chakra-colors-red-500)" />
          <Text color="red.600" flex="1">{message}</Text>
          <Button size="sm" onClick={retry} variant="outline" colorScheme="red">Try again</Button>
        </Flex>
      </CardBody>
    </Card>
  );
}
