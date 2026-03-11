"use client";

import {
  Box, Card, CardBody, CardHeader, Center, Heading, HStack, Input, InputGroup,
  InputLeftElement, Spinner, Table, Tbody, Td, Th, Thead, Tr,
  Text, VStack, Badge, Button, SimpleGrid, Icon, useToast,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter,
  useDisclosure, Divider,
} from "@chakra-ui/react";
import { useAdminVendorsQuery, useRunVendorPayoutsMutation } from "@Slices/ordersDeliveryApiSlice";
import { useVerifyVendorMutation, useRejectVendorMutation } from "@Slices/vendorApiSlice";
import { Search, Store, DollarSign, RefreshCw, CheckCircle, XCircle, TrendingUp, Clock3, ShieldCheck } from "lucide-react";
import moment from "moment";
import { useState, useMemo } from "react";

export default function VendorsPage() {
  const { data: vendors = [], isLoading, refetch } = useAdminVendorsQuery();
  const [runPayouts, { isLoading: payingOut }] = useRunVendorPayoutsMutation();
  const [verifyVendor, { isLoading: verifying }] = useVerifyVendorMutation();
  const [rejectVendor, { isLoading: rejecting }] = useRejectVendorMutation();
  const [searchInput, setSearchInput] = useState("");
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const displayVendors = useMemo(() => {
    let list = tab === "verified" ? vendors.filter((v) => v.status === "Verified")
      : tab === "pending" ? vendors.filter((v) => v.status === "Unverified")
      : tab === "payout" ? vendors.filter((v) => Number(v.pendingPayout || 0) > 0)
      : vendors;

    if (searchInput) {
      const q = searchInput.toLowerCase();
      list = list.filter((v) =>
        (v?.name || "").toLowerCase().includes(q)
        || (v?.email || "").toLowerCase().includes(q)
        || (v?.phone || "").includes(q)
      );
    }
    return list;
  }, [vendors, searchInput, tab]);

  const totals = useMemo(() => ({
    totalRevenue: vendors.reduce((a, v) => a + Number(v.revenue || v.totalRevenue || 0), 0),
    totalPending: vendors.reduce((a, v) => a + Number(v.pendingPayout || 0), 0),
    totalOrders: vendors.reduce((a, v) => a + Number(v.orderCount || v.totalOrders || 0), 0),
    verified: vendors.filter((v) => v.status === "Verified").length,
    pending: vendors.filter((v) => v.status === "Unverified").length,
  }), [vendors]);

  const safeRefresh = () => {
    refetch();
    if (selected?._id) {
      const next = vendors.find((v) => String(v._id) === String(selected._id));
      if (next) setSelected(next);
    }
  };

  const handlePayout = async () => {
    try {
      const res = await runPayouts().unwrap();
      toast({ title: "Vendor payouts processed", description: `${res?.data?.processed || 0} vendors paid.`, status: "success", duration: 3500 });
      safeRefresh();
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Failed", status: "error", duration: 4000 });
    }
  };

  const handleVerify = async (vendorId) => {
    try {
      await verifyVendor(vendorId).unwrap();
      toast({ title: "Vendor verified", status: "success", duration: 3000 });
      safeRefresh();
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Failed", status: "error", duration: 4000 });
    }
  };

  const handleReject = async (vendorId) => {
    try {
      await rejectVendor(vendorId).unwrap();
      toast({ title: "Vendor rejected", status: "info", duration: 3000 });
      safeRefresh();
    } catch (e) {
      toast({ title: "Error", description: e?.data?.message || "Failed", status: "error", duration: 4000 });
    }
  };

  if (isLoading) return (<Center minH="50vh"><VStack spacing={4}><Spinner size="xl" color="green.500" thickness="4px" /><Text>Loading vendors...</Text></VStack></Center>);

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={4}>
          <HStack spacing={3}><Icon as={Store} boxSize={7} color="green.600" /><Heading size="lg">Vendor Operations</Heading></HStack>
          <HStack spacing={2}>
            <Button size="sm" colorScheme="orange" onClick={handlePayout} isLoading={payingOut} leftIcon={<DollarSign size={14} />}>Run Vendor Payouts</Button>
            <Button size="sm" variant="outline" colorScheme="green" onClick={safeRefresh} leftIcon={<RefreshCw size={14} />}>Refresh</Button>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
          <Metric label="Total Vendors" value={vendors.length} color="blue" icon={Store} />
          <Metric label="Verified" value={totals.verified} color="green" icon={ShieldCheck} />
          <Metric label="Pending KYC" value={totals.pending} color="yellow" icon={Clock3} />
          <Metric label="Total Orders" value={totals.totalOrders} color="purple" icon={TrendingUp} />
          <Metric label="Total Revenue" value={`UGX ${totals.totalRevenue.toLocaleString()}`} color="teal" icon={DollarSign} />
          <Metric label="Pending Payout" value={`UGX ${totals.totalPending.toLocaleString()}`} color="orange" icon={DollarSign} />
        </SimpleGrid>

        <HStack spacing={2} flexWrap="wrap">
          {[{ key: "all", label: "All" }, { key: "verified", label: "Verified" }, { key: "pending", label: "Pending" }, { key: "payout", label: "Payout Queue" }].map((t) => (
            <Button key={t.key} size="sm" variant={tab === t.key ? "solid" : "outline"} colorScheme="green" onClick={() => setTab(t.key)}>{t.label}</Button>
          ))}
        </HStack>

        <Card>
          <CardHeader>
            <HStack justify="space-between" flexWrap="wrap" gap={4}>
              <Text fontSize="sm" color="gray.600">{displayVendors.length} vendor(s)</Text>
              <InputGroup maxW="320px" size="sm">
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
                    <Th>Status</Th>
                    <Th>Orders</Th>
                    <Th>Revenue</Th>
                    <Th>Pending Payout</Th>
                    <Th>Joined</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {displayVendors.map((v, idx) => (
                    <Tr key={v._id || idx} _hover={{ bg: "gray.50" }} cursor="pointer" onClick={() => { setSelected(v); onOpen(); }}>
                      <Td>
                        <Text fontWeight="600" fontSize="sm">{v.name || v.email || "Unknown Vendor"}</Text>
                        <Text fontSize="xs" color="gray.500">{v.email || "-"}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={v.status === "Verified" ? "green" : v.status === "Rejected" ? "red" : "yellow"}>{v.status || "Unverified"}</Badge>
                      </Td>
                      <Td fontWeight="600">{v.orderCount || v.totalOrders || 0}</Td>
                      <Td fontWeight="600" color="green.600">UGX {(v.revenue || v.totalRevenue || 0).toLocaleString()}</Td>
                      <Td fontWeight="600" color="orange.500">UGX {(v.pendingPayout || 0).toLocaleString()}</Td>
                      <Td fontSize="xs" color="gray.500">{v.createdAt ? moment(v.createdAt).fromNow() : "-"}</Td>
                      <Td>
                        <HStack spacing={1} onClick={(e) => e.stopPropagation()}>
                          {v.status === "Unverified" && (
                            <>
                              <Button size="xs" colorScheme="green" onClick={() => handleVerify(v._id)} isLoading={verifying}>Verify</Button>
                              <Button size="xs" colorScheme="red" variant="outline" onClick={() => handleReject(v._id)} isLoading={rejecting}>Reject</Button>
                            </>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            {displayVendors.length === 0 && <Center py={8}><Text color="gray.500">No vendors found</Text></Center>}
          </CardBody>
        </Card>
      </VStack>

      <VendorDetails vendor={selected} isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}

function Metric({ label, value, color, icon: IconComp }) {
  return (
    <Card size="sm">
      <CardBody>
        <HStack justify="space-between" align="start">
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight="600">{label}</Text>
            <Text fontSize="xl" fontWeight="800" color={`${color}.600`}>{value}</Text>
          </Box>
          <Box p={2} borderRadius="lg" bg={`${color}.50`} color={`${color}.600`}><IconComp size={14} /></Box>
        </HStack>
      </CardBody>
    </Card>
  );
}

function VendorDetails({ vendor, isOpen, onClose }) {
  if (!vendor) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Vendor Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={3}>
            <Row label="Vendor" value={vendor.name || "Unknown Vendor"} />
            <Row label="Email" value={vendor.email || "-"} />
            <Row label="Phone" value={vendor.phone || "-"} />
            <Row label="Status" value={vendor.status || "Unverified"} />
            <Divider />
            <Row label="Orders" value={vendor.orderCount || vendor.totalOrders || 0} />
            <Row label="Revenue" value={`UGX ${(vendor.revenue || vendor.totalRevenue || 0).toLocaleString()}`} />
            <Row label="Pending Payout" value={`UGX ${(vendor.pendingPayout || 0).toLocaleString()}`} />
            <Row label="Total Paid Out" value={`UGX ${(vendor.totalPaidOut || 0).toLocaleString()}`} />
            <Row label="Joined" value={vendor.createdAt ? moment(vendor.createdAt).format("MMM D, YYYY") : "-"} />
          </VStack>
        </ModalBody>
        <ModalFooter><Button variant="ghost" onClick={onClose}>Close</Button></ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function Row({ label, value }) {
  return <HStack justify="space-between"><Text fontSize="sm" color="gray.500">{label}</Text><Text fontSize="sm" fontWeight="600">{value}</Text></HStack>;
}
