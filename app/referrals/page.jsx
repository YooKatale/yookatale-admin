"use client";

import { useGetAdminReferralOverviewMutation } from "@Slices/cashoutApiSlice";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useToast } from "@components/ui/use-toast";
import {
  UserCheck,
  Users,
  DollarSign,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  TrendingUp,
  Award,
  Coins,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Box bg="white" rounded="xl" p={5} boxShadow="sm" borderWidth="1px" borderColor="gray.100" flex="1" minW="220px">
      <Flex align="center" gap={3} mb={2}>
        <Box p={2} rounded="lg" bg="green.50"><Icon size={18} style={{ color: "#16a34a" }} /></Box>
        <Text fontSize="sm" color="gray.500" fontWeight="500">{label}</Text>
      </Flex>
      <Text fontSize="2xl" fontWeight="700" color="gray.800">{value}</Text>
      {sub ? <Text fontSize="xs" color="gray.400" mt={1}>{sub}</Text> : null}
    </Box>
  );
}

function ReferrerRow({ referrer, idx }) {
  const [expanded, setExpanded] = useState(false);
  const name = [referrer.referrer?.firstname, referrer.referrer?.lastname].filter(Boolean).join(" ") || "Unknown";

  return (
    <>
      <Tr _hover={{ bg: "gray.50" }} cursor="pointer" onClick={() => setExpanded(!expanded)}>
        <Td>{idx + 1}</Td>
        <Td>
          <Text fontWeight="600" fontSize="sm">{name}</Text>
          <Text fontSize="xs" color="gray.500">{referrer.referrer?.email || "-"}</Text>
        </Td>
        <Td><Badge colorScheme="green" fontSize="xs">{referrer.referralCode || "N/A"}</Badge></Td>
        <Td isNumeric fontWeight="700" color="blue.600">{referrer.totalSignups || 0}</Td>
        <Td isNumeric fontWeight="700" color="purple.600">{referrer.points || 0}</Td>
        <Td isNumeric>
          <Badge colorScheme={referrer.canRedeem ? "green" : "yellow"}>{referrer.canRedeem ? "Eligible" : "Locked"}</Badge>
        </Td>
        <Td isNumeric fontWeight="700" color="green.600">UGX {(referrer.cashEquivalent || 0).toLocaleString()}</Td>
        <Td>{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</Td>
      </Tr>
      {expanded && (
        <Tr>
          <Td colSpan={8} p={0} borderBottom="2px solid" borderColor="green.100">
            <Box bg="gray.50" p={4}>
              <Text fontWeight="600" fontSize="sm" mb={2} color="gray.700">
                Referred Users ({referrer.referredUsers?.length || 0})
              </Text>
              {referrer.referredUsers?.length > 0 ? (
                <Stack spacing={2}>
                  {referrer.referredUsers.map((u, i) => (
                    <Flex key={u._id || i} bg="white" p={3} rounded="md" align="center" justify="space-between" borderWidth="1px" borderColor="gray.100">
                      <Box>
                        <Text fontSize="sm" fontWeight="500">{[u.firstname, u.lastname].filter(Boolean).join(" ") || "Unknown"}</Text>
                        <Text fontSize="xs" color="gray.500">{u.email || "-"}</Text>
                      </Box>
                      <Text fontSize="xs" color="gray.400">{u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : "-"}</Text>
                    </Flex>
                  ))}
                </Stack>
              ) : (
                <Text fontSize="sm" color="gray.400">No referred users yet.</Text>
              )}
            </Box>
          </Td>
        </Tr>
      )}
    </>
  );
}

export default function ReferralTrackingPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [getAdminReferralOverview] = useGetAdminReferralOverviewMutation();
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminReferralOverview().unwrap();
      if (res?.status === "Success") setData(res.data);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err?.data?.message || err?.message || "Failed to load referral data." });
    } finally {
      setLoading(false);
    }
  }, [getAdminReferralOverview, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const summary = data?.summary || {};
  const referrers = data?.referrers || [];

  const filtered = search.trim()
    ? referrers.filter((r) => {
      const q = search.toLowerCase();
      const name = [r.referrer?.firstname, r.referrer?.lastname].filter(Boolean).join(" ").toLowerCase();
      return name.includes(q) || (r.referrer?.email || "").toLowerCase().includes(q) || (r.referralCode || "").toLowerCase().includes(q);
    })
    : referrers;

  return (
    <Flex minH="100vh" style={{ marginTop: "2em" }}>
      <Stack mx="auto" width="100%" py={4} px={1} spacing={5}>
        <Box bg="white" p={3} borderRadius={8} boxShadow="sm" display="flex" justifyContent="space-between">
          <Flex align="center" gap={3}><UserCheck size={24} /><Heading size="lg" style={{ fontSize: 20, fontWeight: 600 }}>Referral Tracking</Heading></Flex>
          <Button size="sm" leftIcon={<RefreshCw size={16} />} colorScheme="green" onClick={fetchData} isLoading={loading}>Refresh</Button>
        </Box>

        {loading ? (
          <Flex justify="center" py={16}><Spinner size="xl" colorScheme="green" /></Flex>
        ) : (
          <>
            <Flex gap={4} wrap="wrap">
              <StatCard icon={Users} label="Total Platform Users" value={summary.totalUsers || 0} sub="All registered users" />
              <StatCard icon={TrendingUp} label="Active Referrers" value={summary.activeReferrers || 0} sub="Users with referral activity" />
              <StatCard icon={Award} label="Total Referrals" value={summary.totalReferrals || 0} sub="Successful referred signups" />
              <StatCard icon={Coins} label="Total Referral Points" value={summary.totalPoints || 0} sub={`1 signup = ${summary.pointsPerSignup || 1} point`} />
              <StatCard icon={DollarSign} label="Redeemable Value" value={`UGX ${(summary.totalCashEquivalent || 0).toLocaleString()}`} sub={`Unlock at ${summary.minSignupsForCashout || 25} signups`} />
            </Flex>

            <Box bg="white" rounded="xl" boxShadow="sm" borderWidth="1px" borderColor="gray.100" overflow="hidden">
              <Flex p={4} align="center" justify="space-between" borderBottom="1px solid" borderColor="gray.100">
                <Text fontWeight="600" color="gray.700">Referrer Leaderboard ({filtered.length})</Text>
                <InputGroup maxW="320px" size="sm">
                  <InputLeftElement pointerEvents="none"><Search size={14} color="gray" /></InputLeftElement>
                  <Input placeholder="Search name, email, code..." value={search} onChange={(e) => setSearch(e.target.value)} rounded="md" />
                </InputGroup>
              </Flex>

              {filtered.length > 0 ? (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>#</Th>
                        <Th>Referrer</Th>
                        <Th>Code</Th>
                        <Th isNumeric>Signups</Th>
                        <Th isNumeric>Points</Th>
                        <Th isNumeric>Redeem Status</Th>
                        <Th isNumeric>Cash Equivalent</Th>
                        <Th w="40px"></Th>
                      </Tr>
                    </Thead>
                    <Tbody>{filtered.map((r, i) => <ReferrerRow key={r.referrer?._id || i} referrer={r} idx={i} />)}</Tbody>
                  </Table>
                </Box>
              ) : (
                <Text py={12} textAlign="center" color="gray.400" fontSize="sm">{search ? "No referrers match your search." : "No referral data yet."}</Text>
              )}
            </Box>
          </>
        )}
      </Stack>
    </Flex>
  );
}
