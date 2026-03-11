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
  useGetOrderDeliveryTrackingQuery,
} from "@Slices/ordersDeliveryApiSlice";
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
} from "lucide-react";
import moment from "moment";
import { useMemo, useState } from "react";

const STATUS_CONFIG = {
  pending: { color: "yellow", label: "Pending", icon: Clock },
  confirmed: { color: "blue", label: "Confirmed", icon: CheckCircle },
  preparing: { color: "purple", label: "Preparing", icon: Package },
  ready: { color: "cyan", label: "Ready", icon: Package },
  assigned: { color: "orange", label: "Driver Assigned", icon: Truck },
  picked_up: { color: "teal", label: "Picked Up", icon: Truck },
  in_transit: { color: "blue", label: "In Transit", icon: MapPin },
  delivered: { color: "green", label: "Delivered", icon: CheckCircle },
  cancelled: { color: "red", label: "Cancelled", icon: XCircle },
  refunded: { color: "gray", label: "Refunded", icon: XCircle },
};

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const { data: orderData = {}, isLoading, refetch } = useAdminOrdersQuery({
    status: statusFilter || undefined,
    page: 1,
    limit: 250,
  });
  const { data: stats = {} } = useOrderStatsQuery();
  const { data: drivers = [] } = useAdminDriversQuery();

  const [approveOrder, { isLoading: approving }] = useApproveOrderMutation();
  const [assignDriver, { isLoading: assigning }] = useAssignDriverToOrderMutation();
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();
  const [adminCancelOrder, { isLoading: cancelling }] = useAdminCancelOrderMutation();
  const [adminDeleteOrder, { isLoading: deleting }] = useAdminDeleteOrderMutation();

  const orders = orderData?.orders || [];
  const filtered = useMemo(() => {
    if (!searchInput) return orders;
    const q = searchInput.toLowerCase();
    return orders.filter((o) =>
      (o?.customerName || "").toLowerCase().includes(q)
      || (o?.deliveryAddress?.address1 || "").toLowerCase().includes(q)
      || (o?._id || "").toLowerCase().includes(q)
      || (o?.productItems || "").toLowerCase().includes(q)
      || (o?.driverId?.name || "").toLowerCase().includes(q)
    );
  }, [orders, searchInput]);

  const safeRefresh = () => {
    refetch();
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

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={4}>
          <HStack spacing={3}>
            <Icon as={Package} boxSize={7} color="green.600" />
            <Heading size="lg">Order Management</Heading>
          </HStack>
          <Button size="sm" leftIcon={<RefreshCw size={14} />} onClick={safeRefresh} variant="outline" colorScheme="green">
            Refresh
          </Button>
        </HStack>

        <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4}>
          {[
            { label: "Today", value: stats.todayOrders || 0, color: "blue" },
            { label: "This Week", value: stats.weekOrders || 0, color: "green" },
            { label: "Week Revenue", value: `UGX ${(stats.weekRevenue || 0).toLocaleString()}`, color: "green" },
            { label: "Total Orders", value: stats.totalOrders || 0, color: "gray" },
            { label: "Pending", value: stats.statusCounts?.pending?.count || 0, color: "yellow" },
            { label: "Delivered", value: stats.statusCounts?.delivered?.count || 0, color: "green" },
          ].map((s, i) => (
            <Card key={i} size="sm">
              <CardBody textAlign="center">
                <Text fontSize="xs" color="gray.500" fontWeight="600">{s.label}</Text>
                <Text fontSize="xl" fontWeight="800" color={`${s.color}.600`}>{s.value}</Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

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
                    return (
                      <Tr key={order?._id || idx} _hover={{ bg: "gray.50" }} cursor="pointer" onClick={() => { setSelectedOrder(order); onOpen(); }}>
                        <Td fontSize="xs" fontFamily="mono" color="gray.500">#{(order?._id || "").slice(-6)}</Td>
                        <Td fontWeight="600" fontSize="sm">{order?.customerName || "Unknown"}</Td>
                        <Td fontWeight="700" color="green.600" fontSize="sm">UGX {(order?.total || 0).toLocaleString()}</Td>
                        <Td><Badge colorScheme={sc.color} borderRadius="full" px={2} fontSize="xs">{sc.label}</Badge></Td>
                        <Td fontSize="xs">{order?.driverId?.name || "Unassigned"}</Td>
                        <Td fontSize="xs" color="gray.500">{moment(order?.createdAt).fromNow()}</Td>
                        <Td>
                          <HStack spacing={1}>
                            {order?.status === "pending" && (
                              <Button size="xs" colorScheme="green" onClick={(e) => { e.stopPropagation(); handleApprove(order._id); }} isLoading={approving}>Approve</Button>
                            )}
                            {["confirmed", "preparing", "ready"].includes(order?.status) && (
                              <Button size="xs" colorScheme="blue" onClick={(e) => { e.stopPropagation(); handleAssignDriver(order._id); }} isLoading={assigning}>Auto Assign</Button>
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
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <Box><Text fontSize="xs" color="gray.500">Customer</Text><Text fontWeight="600">{order.customerName || "Unknown"}</Text></Box>
              <Box><Text fontSize="xs" color="gray.500">Total</Text><Text fontWeight="700" color="green.600">UGX {(order.total || 0).toLocaleString()}</Text></Box>
              <Box><Text fontSize="xs" color="gray.500">Address</Text><Text fontSize="sm">{order.deliveryAddress?.address1 || "N/A"}</Text></Box>
              <Box><Text fontSize="xs" color="gray.500">Driver</Text><Text fontSize="sm">{order.driverId?.name || tracking?.deliveryLocation?.partnerName || "Unassigned"}</Text></Box>
            </SimpleGrid>

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

            {["confirmed", "preparing", "ready"].includes(order.status) && (
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
