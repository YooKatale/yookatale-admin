"use client";

import {
  Box, Card, CardBody, CardHeader, Center, Heading, HStack, Input, InputGroup,
  InputLeftElement, Spinner, Table, Tbody, Td, Th, Thead, Tr,
   Text, VStack, Badge, Button, SimpleGrid, Icon, Flex,
  useToast,
} from "@chakra-ui/react";
import { useAdminVendorsQuery, useRunVendorPayoutsMutation } from "@Slices/ordersDeliveryApiSlice";
import { useVendorGetMutation } from "@Slices/vendorApiSlice";
import { Search, Store, DollarSign, ShoppingBag, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import moment from "moment";
import { useState, useMemo, useEffect } from "react";

export default function VendorsPage() {
  const { data: vendors = [], isLoading, refetch } = useAdminVendorsQuery();
  const [runPayouts, { isLoading: payingOut }] = useRunVendorPayoutsMutation();
  const [searchInput, setSearchInput] = useState("");
  const [tab, setTab] = useState("all");
  const toast = useToast();

  const displayVendors = useMemo(() => {
    let list = tab === "verified" ? vendors.filter((v) => v.status === "Verified") :
               tab === "pending" ? vendors.filter((v) => v.status === "Unverified") :
               vendors;
    if (searchInput) {
      const q = searchInput.toLowerCase();
      list = list.filter((v) => v?.name?.toLowerCase().includes(q) || v?.email?.toLowerCase().includes(q) || v?.phone?.includes(q));
    }
    return list;
  }, [vendors, searchInput, tab]);

  const totalRevenue = vendors.reduce((a, v) => a + (v.revenue || v.totalRevenue || 0), 0);
  const totalPending = vendors.reduce((a, v) => a + (v.pendingPayout || 0), 0);
  const totalOrders = vendors.reduce((a, v) => a + (v.orderCount || v.totalOrders || 0), 0);

  const handlePayout = async () => {
    try {
      const res = await runPayouts().unwrap();
      toast({ title: "Vendor Payouts Processed!", description: `${res?.data?.processed || 0} vendors paid.`, status: "success", duration: 4000 });
      refetch();
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Failed", status: "error", duration: 4000 });
    }
  };

  if (isLoading) return (<Center minH="50vh"><VStack spacing={4}><Spinner size="xl" color="green.500" thickness="4px" /><Text>Loading vendors...</Text></VStack></Center>);

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={4}>
          <HStack spacing={3}><Icon as={Store} boxSize={7} color="green.600" /><Heading size="lg">Vendor Management</Heading></HStack>
          <HStack spacing={2}>
            <Button size="sm" colorScheme="orange" onClick={handlePayout} isLoading={payingOut} leftIcon={<DollarSign size={14} />}>Process Vendor Payouts</Button>
            <Button size="sm" variant="outline" colorScheme="green" onClick={refetch} leftIcon={<RefreshCw size={14} />}>Refresh</Button>
          </HStack>
        </HStack>

        {/* Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          {[
            { label: "Total Vendors", value: vendors.length, color: "blue" },
            { label: "Verified", value: vendors.filter((v) => v.status === "Verified").length, color: "green" },
            { label: "Total Orders", value: totalOrders, color: "purple" },
            { label: "Pending Payouts", value: `UGX ${totalPending.toLocaleString()}`, color: "orange" },
          ].map((s, i) => (
            <Card key={i} size="sm"><CardBody textAlign="center">
              <Text fontSize="xs" color="gray.500" fontWeight="600">{s.label}</Text>
              <Text fontSize="xl" fontWeight="800" color={`${s.color}.600`}>{s.value}</Text>
            </CardBody></Card>
          ))}
        </SimpleGrid>

        {/* Tabs */}
        <HStack spacing={2}>
          {[{ key: "all", label: "All" }, { key: "verified", label: "Verified" }, { key: "pending", label: "Pending" }].map((t) => (
            <Button key={t.key} size="sm" variant={tab === t.key ? "solid" : "outline"} colorScheme="green" onClick={() => setTab(t.key)}>{t.label}</Button>
          ))}
        </HStack>

        <Card>
          <CardHeader>
            <HStack justify="space-between" flexWrap="wrap" gap={4}>
              <Text fontSize="sm" color="gray.600">{displayVendors.length} vendor(s)</Text>
              <InputGroup maxW="300px" size="sm">
                <InputLeftElement pointerEvents="none"><Search size={14} color="gray" /></InputLeftElement>
                <Input placeholder="Search vendors..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} borderRadius="lg" />
              </InputGroup>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Category</Th>
                    <Th>Phone</Th>
                    <Th>Email</Th>
                    <Th>Status</Th>
                    <Th>Orders</Th>
                    <Th>Revenue</Th>
                    <Th>Pending Payout</Th>
                    <Th>Joined</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {displayVendors.map((v, idx) => (
                    <Tr key={v._id || idx} _hover={{ bg: "gray.50" }}>
                      <Td fontWeight="600" fontSize="sm">{v.name || v.storeName || v.email || "Unknown Vendor"}</Td>
                      <Td fontSize="sm"><Badge colorScheme="purple" borderRadius="full">{v.category || "General"}</Badge></Td>
                      <Td fontSize="sm">{v.phone || "-"}</Td>
                      <Td fontSize="sm">{v.email || "-"}</Td>
                      <Td>
                        <Badge colorScheme={v.status === "Verified" ? "green" : v.status === "Rejected" ? "red" : "yellow"} borderRadius="full" fontSize="xs">
                          {v.status}
                        </Badge>
                      </Td>
                      <Td fontWeight="600">{v.orderCount || v.totalOrders || 0}</Td>
                      <Td fontWeight="600" color="green.600" fontSize="sm">UGX {(v.revenue || v.totalRevenue || 0).toLocaleString()}</Td>
                      <Td fontWeight="600" color="orange.500" fontSize="sm">UGX {(v.pendingPayout || 0).toLocaleString()}</Td>
                      <Td fontSize="xs" color="gray.500">{v.createdAt ? moment(v.createdAt).fromNow() : "-"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            {displayVendors.length === 0 && <Center py={8}><Text color="gray.500">No vendors found</Text></Center>}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}