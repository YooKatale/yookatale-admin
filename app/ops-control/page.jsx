"use client";

import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  VStack,
  Text,
  Badge,
  Button,
  Spinner,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  useAdminOrdersQuery,
  useOrderStatsQuery,
  useAdminDriversQuery,
  useAssignDriverToOrderMutation,
  useApproveOrderMutation,
} from "@Slices/ordersDeliveryApiSlice";
import { RefreshCw, Activity, Clock, Truck, CheckCircle } from "lucide-react";
import { useMemo } from "react";
import moment from "moment";

export default function OpsControlPage() {
  const toast = useToast();
  const { data: orderData = {}, isLoading, refetch } = useAdminOrdersQuery({ page: 1, limit: 250 });
  const { data: stats = {} } = useOrderStatsQuery();
  const { data: drivers = [] } = useAdminDriversQuery();
  const [assignDriver, { isLoading: assigning }] = useAssignDriverToOrderMutation();
  const [approveOrder, { isLoading: approving }] = useApproveOrderMutation();

  const orders = orderData?.orders || [];

  const unassignedOrders = useMemo(
    () => orders.filter((o) => ["confirmed", "preparing", "ready"].includes(o?.status) && !o?.driverId),
    [orders]
  );

  const pendingApproval = useMemo(() => orders.filter((o) => o?.status === "pending"), [orders]);

  const activeDeliveries = Number(stats?.statusCounts?.assigned?.count || 0)
    + Number(stats?.statusCounts?.picked_up?.count || 0)
    + Number(stats?.statusCounts?.in_transit?.count || 0);

  const availableDrivers = useMemo(
    () => (drivers || []).filter((d) => Boolean(d?.isAvailable)).length,
    [drivers]
  );

  const handleAutoAssign = async (orderId) => {
    try {
      const res = await assignDriver({ orderId }).unwrap();
      toast({
        title: "Driver assigned",
        description: res?.message || "Nearest available driver assigned",
        status: "success",
        duration: 3000,
      });
      refetch();
    } catch (err) {
      toast({
        title: "Assignment failed",
        description: err?.data?.message || "Could not auto-assign driver",
        status: "error",
        duration: 4000,
      });
    }
  };

  const handleApprove = async (orderId) => {
    try {
      await approveOrder({ orderId }).unwrap();
      toast({ title: "Order approved", status: "success", duration: 2500 });
      refetch();
    } catch (err) {
      toast({
        title: "Approval failed",
        description: err?.data?.message || "Could not approve order",
        status: "error",
        duration: 4000,
      });
    }
  };

  if (isLoading) {
    return (
      <Center minH="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text color="gray.600">Loading operations control...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={4}>
          <Heading size="lg">Ops Control</Heading>
          <Button
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            onClick={refetch}
            variant="outline"
            colorScheme="green"
          >
            Refresh
          </Button>
        </HStack>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <MetricCard label="Pending Approval" value={pendingApproval.length} color="yellow" icon={Clock} />
          <MetricCard label="Unassigned Orders" value={unassignedOrders.length} color="red" icon={Truck} />
          <MetricCard label="Active Deliveries" value={activeDeliveries} color="teal" icon={Activity} />
          <MetricCard label="Available Drivers" value={`${availableDrivers}/${drivers.length}`} color="blue" icon={CheckCircle} />
        </SimpleGrid>

        <Card>
          <CardHeader>
            <Heading size="sm">Unassigned Orders Queue</Heading>
          </CardHeader>
          <CardBody pt={0}>
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Order</Th>
                    <Th>Customer</Th>
                    <Th>Status</Th>
                    <Th>Total</Th>
                    <Th>Age</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {unassignedOrders.slice(0, 20).map((order) => (
                    <Tr key={order._id}>
                      <Td fontFamily="mono" fontSize="xs">#{(order._id || "").slice(-6)}</Td>
                      <Td fontWeight="600">{order.customerName || "Unknown Customer"}</Td>
                      <Td>
                        <Badge colorScheme={order.status === "ready" ? "cyan" : order.status === "preparing" ? "purple" : "blue"}>
                          {order.status}
                        </Badge>
                      </Td>
                      <Td fontWeight="700" color="green.600">UGX {Number(order.total || 0).toLocaleString()}</Td>
                      <Td>{moment(order.createdAt).fromNow()}</Td>
                      <Td>
                        <Button size="xs" colorScheme="blue" onClick={() => handleAutoAssign(order._id)} isLoading={assigning}>
                          Auto Assign
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            {unassignedOrders.length === 0 && (
              <Center py={6}><Text color="gray.500" fontSize="sm">No unassigned orders right now.</Text></Center>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="sm">Pending Approval Queue</Heading>
          </CardHeader>
          <CardBody pt={0}>
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Order</Th>
                    <Th>Customer</Th>
                    <Th>Total</Th>
                    <Th>Age</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pendingApproval.slice(0, 20).map((order) => (
                    <Tr key={order._id}>
                      <Td fontFamily="mono" fontSize="xs">#{(order._id || "").slice(-6)}</Td>
                      <Td fontWeight="600">{order.customerName || "Unknown Customer"}</Td>
                      <Td fontWeight="700" color="green.600">UGX {Number(order.total || 0).toLocaleString()}</Td>
                      <Td>{moment(order.createdAt).fromNow()}</Td>
                      <Td>
                        <Button size="xs" colorScheme="green" onClick={() => handleApprove(order._id)} isLoading={approving}>
                          Approve
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            {pendingApproval.length === 0 && (
              <Center py={6}><Text color="gray.500" fontSize="sm">No pending approvals.</Text></Center>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}

function MetricCard({ label, value, color, icon: Icon }) {
  return (
    <Card size="sm">
      <CardBody>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color="gray.500" fontWeight="600">{label}</Text>
            <Text fontSize="2xl" fontWeight="800" color={`${color}.600`}>{value}</Text>
          </VStack>
          <Box p={2} borderRadius="lg" bg={`${color}.50`} color={`${color}.600`}>
            <Icon size={16} />
          </Box>
        </HStack>
      </CardBody>
    </Card>
  );
}
