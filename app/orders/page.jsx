"use client";

import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Center,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  VStack,
  Badge,
  Button,
  Select,
  SimpleGrid,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  useToast,
  Textarea,
  Divider,
  Link,
  Checkbox,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from "@chakra-ui/react";
import {
  useAdminOrdersQuery,
  useOrderStatsQuery,
  useApproveOrderMutation,
  useAssignDriverToOrderMutation,
  useUpdateOrderStatusMutation,
  useAdminDriversQuery,
  useAdminCancelOrderMutation,
  useAdminDeleteOrderMutation,
  useAdminBulkDeleteOrdersMutation,
  useGetOrderDeliveryTrackingQuery,
  useConfirmCodMutation,
} from "@Slices/ordersDeliveryApiSlice";
import { io } from "socket.io-client";
import { BACKEND_URL } from "@constants/constant";
import {
  Search,
  Package,
  CheckCircle,
  Truck,
  MapPin,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Navigation,
  Trash2,
  ChevronDown,
  AlertTriangle,
  User,
} from "lucide-react";
import moment from "moment";
import { useMemo, useState, useEffect, useRef } from "react";

const STATUS_CONFIG = {
  pending:              { color: "yellow",  label: "Pending",           icon: Clock },
  confirmed:            { color: "blue",    label: "Confirmed",          icon: CheckCircle },
  preparing:            { color: "purple",  label: "Preparing",          icon: Package },
  ready:                { color: "cyan",    label: "Ready",              icon: Package },
  assigned:             { color: "orange",  label: "Driver Assigned",    icon: Truck },
  awaiting_driver:      { color: "orange",  label: "Awaiting Driver",    icon: Truck },
  picked_up:            { color: "teal",    label: "Picked Up",          icon: Truck },
  in_transit:           { color: "blue",    label: "In Transit",         icon: MapPin },
  delivered:            { color: "green",   label: "Delivered",          icon: CheckCircle },
  cancelled:            { color: "red",     label: "Cancelled",          icon: XCircle },
  refunded:             { color: "gray",    label: "Refunded",           icon: XCircle },
  pending_cod_approval: { color: "orange",  label: "COD Pending",        icon: Clock },
};

const STATUS_TABS = [
  "all", "pending", "confirmed", "preparing", "assigned", "awaiting_driver",
  "in_transit", "delivered", "cancelled", "pending_cod_approval",
];

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab]       = useState("all");
  const [searchInput, setSearchInput]   = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedIds, setSelectedIds]   = useState(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(null); // null = selected, or a status string
  const cancelRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast    = useToast();
  const socketRef = useRef(null);

  const { data: orderData = {}, isLoading, refetch } = useAdminOrdersQuery({
    status: statusFilter || undefined,
    page: 1,
    limit: 250,
  });
  const { data: stats = {} } = useOrderStatsQuery();
  const { data: drivers = [] } = useAdminDriversQuery();

  const [approveOrder, { isLoading: approving }]     = useApproveOrderMutation();
  const [assignDriver, { isLoading: assigning }]     = useAssignDriverToOrderMutation();
  const [updateStatus, { isLoading: updating }]     = useUpdateOrderStatusMutation();
  const [adminCancelOrder, { isLoading: cancelling }] = useAdminCancelOrderMutation();
  const [adminDeleteOrder, { isLoading: deleting }]  = useAdminDeleteOrderMutation();
  const [adminBulkDelete, { isLoading: bulkDeleting }] = useAdminBulkDeleteOrdersMutation();
  const [confirmCod, { isLoading: confirmingCod }]   = useConfirmCodMutation();

  // Real-time socket feed
  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ["websocket"], reconnection: true });
    socketRef.current = socket;
    socket.emit("join:admin");
    socket.on("admin:order_update", (data) => {
      toast({
        title: `Order update: #${(data?.orderId || "").slice(-6)} → ${data?.status || "updated"}`,
        status: "info", duration: 4000, isClosable: true,
      });
      refetch();
    });
    return () => { socket.disconnect(); };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const orders = orderData?.orders || [];

  const tabFiltered = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter((o) => o?.status === activeTab);
  }, [orders, activeTab]);

  const filtered = useMemo(() => {
    if (!searchInput) return tabFiltered;
    const q = searchInput.toLowerCase();
    return tabFiltered.filter((o) =>
      (o?.customerName || "").toLowerCase().includes(q)
      || (o?.user?.firstname || "").toLowerCase().includes(q)
      || (o?.user?.lastname || "").toLowerCase().includes(q)
      || (o?.user?.email || "").toLowerCase().includes(q)
      || (o?.deliveryAddress?.address1 || "").toLowerCase().includes(q)
      || (o?._id || "").toLowerCase().includes(q)
      || (o?.productItems || "").toLowerCase().includes(q)
      || (o?.driverId?.name || "").toLowerCase().includes(q)
    );
  }, [tabFiltered, searchInput]);

  // Clear selection when tab/filter changes
  useEffect(() => { setSelectedIds(new Set()); }, [activeTab, statusFilter, searchInput]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((o) => o._id)));
    }
  };

  const safeRefresh = () => {
    refetch();
    setSelectedIds(new Set());
    if (selectedOrder?._id) {
      const next = orders.find((o) => o._id === selectedOrder._id);
      if (next) setSelectedOrder(next);
    }
  };

  const handleApprove = async (orderId) => {
    try {
      await approveOrder({ orderId }).unwrap();
      toast({ title: "Order approved", status: "success", duration: 2500 });
      safeRefresh();
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Failed", status: "error", duration: 4000 });
    }
  };

  const handleAssignDriver = async (orderId, driverId) => {
    try {
      const res = await assignDriver({ orderId, driverId: driverId || undefined }).unwrap();
      toast({ title: res?.message || "Driver assigned", status: "success", duration: 2500 });
      safeRefresh();
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Failed", status: "error", duration: 4000 });
    }
  };

  const handleStatusUpdate = async (orderId, status, note) => {
    try {
      await updateStatus({ orderId, status, note }).unwrap();
      toast({ title: "Status updated", status: "success", duration: 2500 });
      safeRefresh();
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Failed", status: "error", duration: 4000 });
    }
  };

  const handleAdminCancel = async (orderId, reason) => {
    try {
      await adminCancelOrder({ orderId, reason }).unwrap();
      toast({ title: "Order cancelled", status: "success", duration: 2500 });
      safeRefresh();
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Failed", status: "error", duration: 4000 });
    }
  };

  const handleConfirmCod = async (orderId) => {
    try {
      await confirmCod({ orderId }).unwrap();
      toast({ title: "COD Approved", status: "success", duration: 2500 });
      safeRefresh();
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Failed", status: "error", duration: 4000 });
    }
  };

  const handleAdminDelete = async (orderId) => {
    try {
      await adminDeleteOrder({ orderId }).unwrap();
      toast({ title: "Order deleted", status: "success", duration: 2500 });
      if (selectedOrder?._id === orderId) onClose();
      safeRefresh();
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Failed", status: "error", duration: 4000 });
    }
  };

  const handleBulkDelete = async () => {
    try {
      let payload;
      if (bulkDeleteTarget) {
        // Delete all orders with a specific status
        payload = { status: bulkDeleteTarget };
      } else {
        // Delete selected order IDs
        payload = { orderIds: Array.from(selectedIds) };
      }
      const res = await adminBulkDelete(payload).unwrap();
      toast({
        title: res?.message || "Orders deleted",
        status: "success",
        duration: 3000,
      });
      setBulkDeleteOpen(false);
      setBulkDeleteTarget(null);
      safeRefresh();
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Bulk delete failed", status: "error", duration: 4000 });
    }
  };

  const getCustomerDisplay = (order) => {
    const name = order?.customerName || "Unknown";
    const user = order?.user;
    const phone = order?.customerPhone || order?.deliveryAddress?.phone || user?.phone || "";
    const email = user?.email || "";
    return { name, phone, email };
  };

  if (isLoading) {
    return (
      <Center minH="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text>Loading orders...</Text>
        </VStack>
      </Center>
    );
  }

  const bulkCount = bulkDeleteTarget
    ? orders.filter((o) => o.status === bulkDeleteTarget).length
    : selectedIds.size;

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={4}>
          <HStack spacing={3}>
            <Icon as={Package} boxSize={7} color="green.600" />
            <Heading size="lg">Order Management</Heading>
          </HStack>
          <HStack spacing={2}>
            {/* Bulk delete menu */}
            <Menu>
              <MenuButton as={Button} size="sm" colorScheme="red" variant="outline" rightIcon={<ChevronDown size={14} />} leftIcon={<Trash2 size={14} />}>
                Bulk Delete
              </MenuButton>
              <MenuList>
                {selectedIds.size > 0 && (
                  <MenuItem
                    icon={<Trash2 size={14} />}
                    color="red.600"
                    onClick={() => { setBulkDeleteTarget(null); setBulkDeleteOpen(true); }}
                  >
                    Delete {selectedIds.size} selected
                  </MenuItem>
                )}
                {Object.entries(STATUS_CONFIG).map(([k, v]) => {
                  const cnt = orders.filter((o) => o.status === k).length;
                  if (cnt === 0) return null;
                  return (
                    <MenuItem
                      key={k}
                      onClick={() => { setBulkDeleteTarget(k); setBulkDeleteOpen(true); }}
                    >
                      Delete all {v.label} ({cnt})
                    </MenuItem>
                  );
                })}
              </MenuList>
            </Menu>
            <Button size="sm" leftIcon={<RefreshCw size={14} />} onClick={safeRefresh} variant="outline" colorScheme="green">
              Refresh
            </Button>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4}>
          {[
            { label: "Today", value: stats.todayOrders || 0, color: "blue" },
            { label: "This Week", value: stats.weekOrders || 0, color: "green" },
            { label: "Week Revenue", value: `UGX ${(stats.weekRevenue || 0).toLocaleString()}`, color: "green" },
            { label: "Total Orders", value: stats.totalOrders || 0, color: "gray" },
            { label: "Pending", value: stats.statusCounts?.pending?.count || stats.statusCounts?.pending || 0, color: "yellow" },
            { label: "Delivered", value: stats.statusCounts?.delivered?.count || stats.statusCounts?.delivered || 0, color: "green" },
          ].map((s, i) => (
            <Card key={i} size="sm">
              <CardBody textAlign="center">
                <Text fontSize="xs" color="gray.500" fontWeight="600">{s.label}</Text>
                <Text fontSize="xl" fontWeight="800" color={`${s.color}.600`}>{s.value}</Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Status tabs */}
        <Box overflowX="auto" pb={1}>
          <HStack spacing={2} minW="max-content">
            {STATUS_TABS.map((t) => {
              const label = t === "all" ? "All" : STATUS_CONFIG[t]?.label || t;
              const count = t === "all" ? orders.length : orders.filter((o) => o?.status === t).length;
              return (
                <Button
                  key={t}
                  size="sm"
                  variant={activeTab === t ? "solid" : "outline"}
                  colorScheme={t === "pending_cod_approval" ? "orange" : t === "awaiting_driver" ? "orange" : "green"}
                  onClick={() => setActiveTab(t)}
                  borderRadius="full"
                  fontSize="xs"
                >
                  {label} {count > 0 && <Badge ml={1} colorScheme={activeTab === t ? "whiteAlpha" : "gray"} borderRadius="full" fontSize="10px" px={1.5}>{count}</Badge>}
                </Button>
              );
            })}
          </HStack>
        </Box>

        {/* Selection bar */}
        {selectedIds.size > 0 && (
          <Box bg="red.50" borderRadius="lg" p={3} borderWidth="1px" borderColor="red.200">
            <HStack justify="space-between">
              <HStack spacing={3}>
                <Icon as={AlertTriangle} color="red.500" boxSize={4} />
                <Text fontSize="sm" fontWeight="600" color="red.700">
                  {selectedIds.size} order{selectedIds.size > 1 ? "s" : ""} selected
                </Text>
              </HStack>
              <HStack spacing={2}>
                <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                  Clear
                </Button>
                <Button
                  size="sm"
                  colorScheme="red"
                  leftIcon={<Trash2 size={14} />}
                  onClick={() => { setBulkDeleteTarget(null); setBulkDeleteOpen(true); }}
                >
                  Delete Selected
                </Button>
              </HStack>
            </HStack>
          </Box>
        )}

        <Card>
          <CardHeader>
            <HStack justify="space-between" flexWrap="wrap" gap={4}>
              <HStack spacing={3}>
                <Select size="sm" maxW="200px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} borderRadius="lg" placeholder="All Statuses">
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
                </Select>
                <Text fontSize="sm" color="gray.500">{filtered.length} orders</Text>
              </HStack>
              <InputGroup maxW="360px" size="sm">
                <InputLeftElement pointerEvents="none"><Search size={14} color="gray" /></InputLeftElement>
                <Input placeholder="Search customer, order, address..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} borderRadius="lg" />
              </InputGroup>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th w="40px">
                      <Checkbox
                        isChecked={filtered.length > 0 && selectedIds.size === filtered.length}
                        isIndeterminate={selectedIds.size > 0 && selectedIds.size < filtered.length}
                        onChange={toggleSelectAll}
                        colorScheme="green"
                      />
                    </Th>
                    <Th>Order</Th>
                    <Th>Customer</Th>
                    <Th>Total</Th>
                    <Th>Status</Th>
                    <Th>Driver</Th>
                    <Th>Date</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((order, idx) => {
                    const sc = STATUS_CONFIG[order?.status] || STATUS_CONFIG.pending;
                    const customer = getCustomerDisplay(order);
                    return (
                      <Tr key={order?._id || idx} _hover={{ bg: "gray.50" }} cursor="pointer" bg={selectedIds.has(order?._id) ? "green.50" : undefined}>
                        <Td onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            isChecked={selectedIds.has(order?._id)}
                            onChange={() => toggleSelect(order?._id)}
                            colorScheme="green"
                          />
                        </Td>
                        <Td fontSize="xs" fontFamily="mono" color="gray.500" onClick={() => { setSelectedOrder(order); onOpen(); }}>
                          #{(order?._id || "").slice(-6)}
                        </Td>
                        <Td onClick={() => { setSelectedOrder(order); onOpen(); }}>
                          <HStack spacing={2}>
                            <Avatar size="xs" name={customer.name} bg="green.500" color="white" />
                            <Box>
                              <Text fontWeight="600" fontSize="sm" noOfLines={1}>{customer.name}</Text>
                              {customer.phone && <Text fontSize="xs" color="gray.500">{customer.phone}</Text>}
                            </Box>
                          </HStack>
                        </Td>
                        <Td fontWeight="700" color="green.600" fontSize="sm" onClick={() => { setSelectedOrder(order); onOpen(); }}>
                          UGX {(order?.total || 0).toLocaleString()}
                        </Td>
                        <Td onClick={() => { setSelectedOrder(order); onOpen(); }}>
                          <Badge colorScheme={sc.color} borderRadius="full" px={2} fontSize="xs">{sc.label}</Badge>
                        </Td>
                        <Td fontSize="xs" onClick={() => { setSelectedOrder(order); onOpen(); }}>
                          {order?.driverId?.name || "Unassigned"}
                        </Td>
                        <Td fontSize="xs" color="gray.500" onClick={() => { setSelectedOrder(order); onOpen(); }}>
                          {moment(order?.createdAt).fromNow()}
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            {order?.status === "pending" && (
                              <Button size="xs" colorScheme="green" onClick={(e) => { e.stopPropagation(); handleApprove(order._id); }} isLoading={approving}>Approve</Button>
                            )}
                            {["confirmed", "preparing", "ready"].includes(order?.status) && (
                              <Button size="xs" colorScheme="blue" onClick={(e) => { e.stopPropagation(); handleAssignDriver(order._id); }} isLoading={assigning}>Auto Assign</Button>
                            )}
                            {order?.status === "awaiting_driver" && (
                              <Button size="xs" colorScheme="orange" onClick={(e) => { e.stopPropagation(); handleAssignDriver(order._id); }} isLoading={assigning}>Assign Driver</Button>
                            )}
                            {order?.status === "pending_cod_approval" && (
                              <Button size="xs" colorScheme="orange" onClick={(e) => { e.stopPropagation(); handleConfirmCod(order._id); }} isLoading={confirmingCod}>Approve COD</Button>
                            )}
                            {order?.status === "pending_cod_approval" && (
                              <Button size="xs" colorScheme="red" variant="outline" onClick={(e) => { e.stopPropagation(); handleAdminCancel(order._id, "COD rejected by admin"); }}>Reject</Button>
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
            {filtered.length === 0 && <Center py={8}><Text color="gray.500">No orders found</Text></Center>}
          </CardBody>
        </Card>
      </VStack>

      {/* Bulk delete confirmation */}
      <AlertDialog
        isOpen={bulkDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => { if (!bulkDeleting) { setBulkDeleteOpen(false); setBulkDeleteTarget(null); } }}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(4px)">
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              <HStack spacing={2}>
                <Icon as={AlertTriangle} color="red.500" />
                <Text>Delete {bulkCount} Order{bulkCount !== 1 ? "s" : ""}?</Text>
              </HStack>
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={2}>
                {bulkDeleteTarget
                  ? `This will permanently delete all ${bulkCount} orders with status "${STATUS_CONFIG[bulkDeleteTarget]?.label || bulkDeleteTarget}".`
                  : `This will permanently delete ${bulkCount} selected order${bulkCount !== 1 ? "s" : ""}.`
                }
              </Text>
              <Text fontSize="sm" color="red.600" fontWeight="600">
                This action cannot be undone. Associated deliveries will also be removed.
              </Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => { setBulkDeleteOpen(false); setBulkDeleteTarget(null); }} isDisabled={bulkDeleting}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleBulkDelete} ml={3} isLoading={bulkDeleting} loadingText="Deleting...">
                Delete {bulkCount} Order{bulkCount !== 1 ? "s" : ""}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isOpen}
        onClose={onClose}
        drivers={drivers}
        onApprove={handleApprove}
        onAssignDriver={handleAssignDriver}
        onStatusUpdate={handleStatusUpdate}
        onAdminCancel={handleAdminCancel}
        onAdminDelete={handleAdminDelete}
        approving={approving}
        assigning={assigning}
        updating={updating}
        cancelling={cancelling}
        deleting={deleting}
      />
    </Box>
  );
}

function OrderDetailModal({
  order,
  isOpen,
  onClose,
  drivers,
  onApprove,
  onAssignDriver,
  onStatusUpdate,
  onAdminCancel,
  onAdminDelete,
  approving,
  assigning,
  updating,
  cancelling,
  deleting,
}) {
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");

  const { data: tracking = {} } = useGetOrderDeliveryTrackingQuery(
    { orderId: order?._id },
    { skip: !order?._id }
  );

  if (!order) return null;
  const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  const lat = tracking?.deliveryLocation?.location?.lat;
  const lng = tracking?.deliveryLocation?.location?.lng;
  const hasCoords = lat != null && lng != null;
  const mapEmbed = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02}%2C${lat - 0.02}%2C${lng + 0.02}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lng}`
    : null;

  const customerName = order.customerName ||
    [order.user?.firstname, order.user?.lastname].filter(Boolean).join(" ") ||
    order.user?.email || "Unknown Customer";
  const customerPhone = order.customerPhone || order.deliveryAddress?.phone || order.user?.phone || "";
  const customerEmail = order.user?.email || "";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" mx={4}>
        <ModalHeader pb={2}>
          <HStack spacing={3}>
            <Icon as={sc.icon} color={`${sc.color}.500`} boxSize={6} />
            <Box>
              <Heading size="md">Order #{(order._id || "").slice(-6)}</Heading>
              <Badge colorScheme={sc.color} borderRadius="full" fontSize="xs">{sc.label}</Badge>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            {/* Customer card */}
            <Box bg="green.50" borderRadius="lg" p={4} borderWidth="1px" borderColor="green.200">
              <HStack spacing={3} mb={2}>
                <Avatar size="sm" name={customerName} bg="green.500" color="white" />
                <Box>
                  <Text fontWeight="700" fontSize="md">{customerName}</Text>
                  <HStack spacing={3} flexWrap="wrap">
                    {customerPhone && <Text fontSize="xs" color="gray.600"><Icon as={User} boxSize={3} mr={1} />{customerPhone}</Text>}
                    {customerEmail && <Text fontSize="xs" color="gray.600">{customerEmail}</Text>}
                  </HStack>
                </Box>
              </HStack>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <Box><Text fontSize="xs" color="gray.500">Total</Text><Text fontWeight="700" color="green.600">UGX {(order.total || 0).toLocaleString()}</Text></Box>
              <Box><Text fontSize="xs" color="gray.500">Address</Text><Text fontSize="sm">{order.deliveryAddress?.address1 || order.deliveryAddress?.address || "N/A"}</Text></Box>
              <Box><Text fontSize="xs" color="gray.500">Driver</Text><Text fontSize="sm">{order.driverId?.name || tracking?.deliveryLocation?.partnerName || "Unassigned"}</Text></Box>
              <Box><Text fontSize="xs" color="gray.500">Payment</Text><Text fontSize="sm" textTransform="capitalize">{(order.payment?.paymentMethod || order.paymentMethod || "N/A").replace(/_/g, " ")}</Text></Box>
            </SimpleGrid>

            {/* COD Status Banner */}
            {order.status === "pending_cod_approval" && (
              <Box p={3} bg="orange.50" borderRadius="lg" borderWidth="1px" borderColor="orange.200">
                <HStack spacing={2} mb={2}>
                  <Icon as={Clock} boxSize={4} color="orange.500" />
                  <Text fontSize="sm" fontWeight="700" color="orange.700">Cash on Delivery - Pending Approval</Text>
                </HStack>
                <Text fontSize="xs" color="orange.600">This order requires admin approval before a driver can be assigned.</Text>
              </Box>
            )}

            {/* Awaiting Driver Banner */}
            {order.status === "awaiting_driver" && (
              <Box p={3} bg="blue.50" borderRadius="lg" borderWidth="1px" borderColor="blue.200">
                <HStack spacing={2} mb={2}>
                  <Icon as={Truck} boxSize={4} color="blue.500" />
                  <Text fontSize="sm" fontWeight="700" color="blue.700">No Drivers Available</Text>
                </HStack>
                <Text fontSize="xs" color="blue.600">No nearby drivers were found. Try manually assigning a driver below.</Text>
              </Box>
            )}

            <Box borderWidth="1px" borderColor="gray.100" rounded="lg" p={3}>
              <HStack justify="space-between" mb={2}>
                <HStack spacing={2}><Navigation size={14} /><Text fontSize="sm" fontWeight="600">Live Driver Tracking</Text></HStack>
                {hasCoords && (
                  <HStack spacing={2}>
                    <Link href={tracking?.navigation?.googleMaps || `https://www.google.com/maps?q=${lat},${lng}`} isExternal color="blue.600" fontSize="xs">Google Maps</Link>
                    <Link href={tracking?.navigation?.openStreetMap || `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`} isExternal color="blue.600" fontSize="xs">OpenStreetMap</Link>
                  </HStack>
                )}
              </HStack>
              {hasCoords ? (
                <Box borderWidth="1px" borderColor="gray.200" rounded="md" overflow="hidden">
                  <iframe title="order-tracking-map" src={mapEmbed} width="100%" height="260" style={{ border: 0 }} loading="lazy" />
                </Box>
              ) : (
                <Text fontSize="xs" color="gray.500">No live coordinates yet. Driver location appears after dispatch updates.</Text>
              )}
            </Box>

            {/* Order Items */}
            {order.productItems && (
              <Box bg="gray.50" borderRadius="lg" p={3}>
                <Text fontSize="xs" fontWeight="600" color="gray.600" mb={2}>Order Items</Text>
                <Text fontSize="sm" color="gray.700">{order.productItems}</Text>
              </Box>
            )}

            {order.trackingHistory?.length > 0 && (
              <Box bg="blue.50" borderRadius="lg" p={3}>
                <Text fontSize="xs" fontWeight="600" color="blue.600" mb={2}>Tracking History</Text>
                {order.trackingHistory.map((t, i) => (
                  <HStack key={i} spacing={2} py={1}>
                    <Icon as={ArrowRight} boxSize={3} color="blue.400" />
                    <Text fontSize="xs"><strong>{t.status}</strong> - {moment(t.timestamp).format("MMM D, h:mm A")}{t.note ? ` (${t.note})` : ""}</Text>
                  </HStack>
                ))}
              </Box>
            )}

            <Divider />

            {order.status === "pending" && (
              <Button colorScheme="green" onClick={() => onApprove(order._id)} isLoading={approving}>Approve Order</Button>
            )}

            {order.status === "pending_cod_approval" && (
              <HStack spacing={3}>
                <Button colorScheme="orange" flex={1} onClick={() => {
                  onStatusUpdate(order._id, "confirmed", "COD approved by admin");
                }} isLoading={updating}>
                  Approve COD
                </Button>
                <Button colorScheme="red" variant="outline" flex={1} onClick={() => onAdminCancel(order._id, "COD rejected by admin")} isLoading={cancelling}>
                  Reject COD
                </Button>
              </HStack>
            )}

            {["confirmed", "preparing", "ready", "awaiting_driver"].includes(order.status) && (
              <Box>
                <Text fontSize="sm" fontWeight="600" mb={2}>Assign Driver</Text>
                <HStack>
                  <Select size="sm" placeholder="Auto-assign nearest" value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)}>
                    {(drivers || []).filter((d) => d.isAvailable).map((d) => (
                      <option key={d._id} value={d._id}>{d.name} ({d.transport || "driver"})</option>
                    ))}
                  </Select>
                  <Button size="sm" colorScheme="blue" onClick={() => onAssignDriver(order._id, selectedDriverId)} isLoading={assigning}>Assign</Button>
                </HStack>
              </Box>
            )}

            {!(["delivered", "cancelled", "refunded"].includes(order.status)) && (
              <Box>
                <Text fontSize="sm" fontWeight="600" mb={2}>Update Status</Text>
                <HStack>
                  <Select size="sm" placeholder="Select status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
                  </Select>
                  <Button size="sm" colorScheme="purple" onClick={() => onStatusUpdate(order._id, newStatus, note)} isLoading={updating} isDisabled={!newStatus}>Update</Button>
                </HStack>
                <Textarea size="sm" placeholder="Optional note..." value={note} onChange={(e) => setNote(e.target.value)} mt={2} rows={2} />
              </Box>
            )}

            <Box>
              <Text fontSize="sm" fontWeight="600" mb={2}>Safety Actions</Text>
              <HStack>
                {!(["delivered", "cancelled", "refunded"].includes(order.status)) && (
                  <Button size="sm" colorScheme="orange" onClick={() => onAdminCancel(order._id, note || "Cancelled by admin")} isLoading={cancelling}>
                    Cancel Order
                  </Button>
                )}
                <Button size="sm" leftIcon={<Trash2 size={14} />} colorScheme="red" variant="outline" onClick={() => onAdminDelete(order._id)} isLoading={deleting}>
                  Delete Order
                </Button>
              </HStack>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter><Button variant="ghost" onClick={onClose}>Close</Button></ModalFooter>
      </ModalContent>
    </Modal>
  );
}
