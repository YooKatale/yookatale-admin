"use client";

import {
  Box, Card, CardBody, CardHeader, Center, Heading, HStack, Input, InputGroup,
  InputLeftElement, Spinner, Table, Tbody, Td, Th, Thead, Tr,
   Text, VStack, Badge, Button, SimpleGrid, Icon, Flex, Divider,
  useToast, Tooltip,
} from "@chakra-ui/react";
import { useAdminDriversQuery, useRunDriverPayoutsMutation, useDriversByLocationQuery } from "@Slices/ordersDeliveryApiSlice";
import { useFetchPartnersQuery, useVerifyPartnerMutation, useRejectPartnerMutation } from "@Slices/partnersPageApiSlice";
import { Search, Truck, MapPin, DollarSign, Star, CheckCircle, XCircle, Wifi, WifiOff, RefreshCw } from "lucide-react";
import moment from "moment";
import { useState, useMemo } from "react";

export default function DriversPage() {
  const { data: partners = [], isLoading, refetch } = useFetchPartnersQuery();
  const { data: verifiedDrivers = [] } = useAdminDriversQuery();
  const [runPayouts, { isLoading: payingOut }] = useRunDriverPayoutsMutation();
  const [verifyPartner] = useVerifyPartnerMutation();
  const [rejectPartner] = useRejectPartnerMutation();
  const [searchInput, setSearchInput] = useState("");
  const [tab, setTab] = useState("all");
  const toast = useToast();

  const displayDrivers = useMemo(() => {
    let list = tab === "verified" ? partners.filter((p) => p.status === "Verified") :
               tab === "pending" ? partners.filter((p) => p.status === "Unverified") :
               tab === "online" ? verifiedDrivers.filter((d) => d.isAvailable || d.isOnline) :
               partners;
    if (searchInput) {
      const q = searchInput.toLowerCase();
      list = list.filter((p) => p?.name?.toLowerCase().includes(q) || p?.phone?.includes(q) || p?.email?.toLowerCase().includes(q));
    }
    return list;
  }, [partners, verifiedDrivers, searchInput, tab]);

  const totalEarnings = verifiedDrivers.reduce((a, d) => a + (d.commissionEarned || 0), 0);
  const totalDeliveries = verifiedDrivers.reduce((a, d) => a + (d.totalDeliveries || 0), 0);
  const onlineCount = verifiedDrivers.filter((d) => d.isAvailable || d.isOnline).length;

  const handlePayout = async () => {
    try {
      const res = await runPayouts().unwrap();
      toast({ title: "Payouts Processed!", description: `${res?.data?.processed || 0} drivers paid out.`, status: "success", duration: 4000 });
      refetch();
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Failed", status: "error", duration: 4000 });
    }
  };

  const handleVerify = async (id) => {
    try { await verifyPartner(id).unwrap(); toast({ title: "Driver Verified!", status: "success", duration: 3000 }); refetch(); } catch { toast({ title: "Failed", status: "error" }); }
  };

  const handleReject = async (id) => {
    try { await rejectPartner(id).unwrap(); toast({ title: "Driver Rejected", status: "info", duration: 3000 }); refetch(); } catch { toast({ title: "Failed", status: "error" }); }
  };

  if (isLoading) return (<Center minH="50vh"><VStack spacing={4}><Spinner size="xl" color="green.500" thickness="4px" /><Text>Loading drivers...</Text></VStack></Center>);

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={4}>
          <HStack spacing={3}><Icon as={Truck} boxSize={7} color="green.600" /><Heading size="lg">Drivers & Delivery Partners</Heading></HStack>
          <HStack spacing={2}>
            <Button size="sm" colorScheme="orange" onClick={handlePayout} isLoading={payingOut} leftIcon={<DollarSign size={14} />}>Run Weekly Payouts</Button>
            <Button size="sm" variant="outline" colorScheme="green" onClick={refetch} leftIcon={<RefreshCw size={14} />}>Refresh</Button>
          </HStack>
        </HStack>

        {/* Stats */}
        <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4}>
          {[
            { label: "Total Drivers", value: partners.length, color: "blue" },
            { label: "Verified", value: partners.filter((p) => p.status === "Verified").length, color: "green" },
            { label: "Online Now", value: onlineCount, color: "teal" },
            { label: "Pending Approval", value: partners.filter((p) => p.status === "Unverified").length, color: "yellow" },
            { label: "Total Deliveries", value: totalDeliveries, color: "purple" },
            { label: "Unpaid Earnings", value: `UGX ${totalEarnings.toLocaleString()}`, color: "orange" },
          ].map((s, i) => (
            <Card key={i} size="sm"><CardBody textAlign="center">
              <Text fontSize="xs" color="gray.500" fontWeight="600">{s.label}</Text>
              <Text fontSize="xl" fontWeight="800" color={`${s.color}.600`}>{s.value}</Text>
            </CardBody></Card>
          ))}
        </SimpleGrid>

        {/* Tabs */}
        <HStack spacing={2}>
          {[
            { key: "all", label: "All Drivers" },
            { key: "verified", label: "Verified" },
            { key: "pending", label: "Pending" },
            { key: "online", label: "Online" },
          ].map((t) => (
            <Button key={t.key} size="sm" variant={tab === t.key ? "solid" : "outline"} colorScheme="green" onClick={() => setTab(t.key)}>{t.label}</Button>
          ))}
        </HStack>

        <Card>
          <CardHeader>
            <HStack justify="space-between" flexWrap="wrap" gap={4}>
              <Text fontSize="sm" color="gray.600">{displayDrivers.length} driver(s)</Text>
              <InputGroup maxW="300px" size="sm">
                <InputLeftElement pointerEvents="none"><Search size={14} color="gray" /></InputLeftElement>
                <Input placeholder="Search..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} borderRadius="lg" />
              </InputGroup>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Phone</Th>
                    <Th>Transport</Th>
                    <Th>Status</Th>
                    <Th>Online</Th>
                    <Th>Deliveries</Th>
                    <Th>Earnings</Th>
                    <Th>Joined</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {displayDrivers.map((d, idx) => (
                    <Tr key={d._id || idx} _hover={{ bg: "gray.50" }}>
                      <Td fontWeight="600" fontSize="sm">{d.name || "N/A"}</Td>
                      <Td fontSize="sm">{d.phone || "N/A"}</Td>
                      <Td fontSize="sm"><Badge colorScheme="blue" borderRadius="full">{d.transport || d.numberPlate || "N/A"}</Badge></Td>
                      <Td>
                        <Badge colorScheme={d.status === "Verified" ? "green" : d.status === "Rejected" ? "red" : "yellow"} borderRadius="full" fontSize="xs">
                          {d.status}
                        </Badge>
                      </Td>
                      <Td>
                        {d.isAvailable || d.isOnline ? (
                          <Tooltip label="Online"><Icon as={Wifi} color="green.500" boxSize={4} /></Tooltip>
                        ) : (
                          <Tooltip label="Offline"><Icon as={WifiOff} color="gray.400" boxSize={4} /></Tooltip>
                        )}
                      </Td>
                      <Td fontWeight="600" fontSize="sm">{d.totalDeliveries || 0}</Td>
                      <Td fontWeight="600" color="green.600" fontSize="sm">UGX {(d.commissionEarned || 0).toLocaleString()}</Td>
                      <Td fontSize="xs" color="gray.500">{d.createdAt ? moment(d.createdAt).fromNow() : "N/A"}</Td>
                      <Td>
                        <HStack spacing={1}>
                          {d.status === "Unverified" && (
                            <>
                              <Button size="xs" colorScheme="green" onClick={() => handleVerify(d._id)}>Verify</Button>
                              <Button size="xs" colorScheme="red" variant="outline" onClick={() => handleReject(d._id)}>Reject</Button>
                            </>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            {displayDrivers.length === 0 && <Center py={8}><Text color="gray.500">No drivers found</Text></Center>}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}