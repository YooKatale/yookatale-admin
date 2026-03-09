"use client";

import { useGetAdminReferralOverviewMutation } from "@Slices/cashoutApiSlice";
import {
  Badge,
  Box,
  Button,
  Collapse,
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
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useToast } from "@components/ui/use-toast";
import {
  UserCheck,
  Users,
  DollarSign,
  Gift,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  TrendingUp,
  Award,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function StatCard({ icon: Icon, label, value, sub, color = "green" }) {
  return (
    <Box
      bg="white"
      rounded="xl"
      p={5}
      boxShadow="sm"
      borderWidth="1px"
      borderColor="gray.100"
      flex="1"
      minW="200px"
    >
      <Flex align="center" gap={3} mb={2}>
        <Box p={2} rounded="lg" bg={`${color}.50`}>
          <Icon size={20} className={`text-${color}-600`} style={{ color: color === "green" ? "#16a34a" : color === "blue" ? "#2563eb" : color === "purple" ? "#9333ea" : color === "orange" ? "#ea580c" : "#16a34a" }} />
        </Box>
        <Text fontSize="sm" color="gray.500" fontWeight="500">
          {label}
        </Text>
      </Flex>
      <Text fontSize="2xl" fontWeight="700" color="gray.800">
        {value}
      </Text>
      {sub && (
        <Text fontSize="xs" color="gray.400" mt={1}>
          {sub}
        </Text>
      )}
    </Box>
  );
}

function ReferrerRow({ referrer, idx }) {
  const [expanded, setExpanded] = useState(false);
  const name = [referrer.referrer?.firstname, referrer.referrer?.lastname]
    .filter(Boolean)
    .join(" ") || "Unknown";

  return (
    <>
      <Tr
        _hover={{ bg: "gray.50" }}
        cursor="pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <Td>{idx + 1}</Td>
        <Td>
          <Flex align="center" gap={2}>
            <Box
              w="32px"
              h="32px"
              rounded="full"
              bg="green.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="sm"
              fontWeight="600"
              color="green.700"
              flexShrink={0}
            >
              {name.charAt(0).toUpperCase()}
            </Box>
            <Box>
              <Text fontWeight="600" fontSize="sm">
                {name}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {referrer.referrer?.email || "—"}
              </Text>
            </Box>
          </Flex>
        </Td>
        <Td>
          <Badge colorScheme="green" fontSize="xs" px={2} py={0.5} rounded="md">
            {referrer.referralCode}
          </Badge>
        </Td>
        <Td isNumeric fontWeight="600" color="blue.600">
          {referrer.totalSignups}
        </Td>
        <Td isNumeric fontWeight="600" color="green.600">
          UGX {(referrer.signupBonusTotal || 0).toLocaleString()}
        </Td>
        <Td isNumeric>
          <Badge colorScheme={referrer.firstPurchaseRewards > 0 ? "purple" : "gray"}>
            {referrer.firstPurchaseRewards}
          </Badge>
        </Td>
        <Td isNumeric fontWeight="600" color="purple.600">
          UGX {(referrer.firstPurchaseCashTotal || 0).toLocaleString()}
        </Td>
        <Td isNumeric>
          <Badge colorScheme={referrer.giftCards?.length > 0 ? "orange" : "gray"}>
            {referrer.giftCards?.length || 0}
          </Badge>
        </Td>
        <Td>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Td>
      </Tr>
      {expanded && (
        <Tr>
          <Td colSpan={9} p={0} borderBottom="2px solid" borderColor="green.100">
            <Box bg="gray.50" p={4}>
              <Flex gap={6} wrap="wrap">
                {/* Referred users */}
                <Box flex="1" minW="300px">
                  <Text fontWeight="600" fontSize="sm" mb={2} color="gray.700">
                    People Referred ({referrer.referredUsers?.length || 0})
                  </Text>
                  {referrer.referredUsers?.length > 0 ? (
                    <Stack spacing={2}>
                      {referrer.referredUsers.map((u, i) => (
                        <Flex
                          key={u._id || i}
                          bg="white"
                          p={3}
                          rounded="md"
                          align="center"
                          justify="space-between"
                          borderWidth="1px"
                          borderColor="gray.100"
                        >
                          <Box>
                            <Text fontSize="sm" fontWeight="500">
                              {[u.firstname, u.lastname].filter(Boolean).join(" ") || "Unknown"}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {u.email || "—"}
                            </Text>
                          </Box>
                          <Flex align="center" gap={2}>
                            {u.joinedAt && (
                              <Text fontSize="xs" color="gray.400">
                                Joined {new Date(u.joinedAt).toLocaleDateString()}
                              </Text>
                            )}
                            {u.hasFirstPurchaseReward && (
                              <Badge colorScheme="green" fontSize="xs">
                                1st Purchase
                              </Badge>
                            )}
                          </Flex>
                        </Flex>
                      ))}
                    </Stack>
                  ) : (
                    <Text fontSize="sm" color="gray.400">
                      No referred users yet
                    </Text>
                  )}
                </Box>

                {/* Gift cards */}
                {referrer.giftCards?.length > 0 && (
                  <Box flex="1" minW="300px">
                    <Text fontWeight="600" fontSize="sm" mb={2} color="gray.700">
                      Gift Cards Earned ({referrer.giftCards.length})
                    </Text>
                    <Stack spacing={2}>
                      {referrer.giftCards.map((gc, i) => (
                        <Flex
                          key={i}
                          bg="white"
                          p={3}
                          rounded="md"
                          align="center"
                          justify="space-between"
                          borderWidth="1px"
                          borderColor="orange.100"
                        >
                          <Box>
                            <Badge colorScheme="orange" fontSize="xs" mb={1}>
                              {gc.code}
                            </Badge>
                            <Text fontSize="xs" color="gray.500">
                              For referring: {gc.forUser || "Unknown"}
                            </Text>
                          </Box>
                          <Box textAlign="right">
                            <Text fontSize="sm" fontWeight="600" color="orange.600">
                              UGX {(gc.amount || 0).toLocaleString()}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              Balance: UGX {(gc.balance || 0).toLocaleString()}
                            </Text>
                            <Badge
                              colorScheme={gc.status === "active" ? "green" : "gray"}
                              fontSize="xs"
                            >
                              {gc.status || "—"}
                            </Badge>
                          </Box>
                        </Flex>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Flex>
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
      if (res?.status === "Success") {
        setData(res.data);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err?.data?.message || err?.message || "Failed to load referral data.",
      });
    } finally {
      setLoading(false);
    }
  }, [getAdminReferralOverview, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const summary = data?.summary || {};
  const referrers = data?.referrers || [];

  const filtered = search.trim()
    ? referrers.filter((r) => {
        const q = search.toLowerCase();
        const name = [r.referrer?.firstname, r.referrer?.lastname]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return (
          name.includes(q) ||
          (r.referrer?.email || "").toLowerCase().includes(q) ||
          (r.referralCode || "").toLowerCase().includes(q)
        );
      })
    : referrers;

  return (
    <Flex minH="100vh" style={{ marginTop: "2em" }}>
      <Stack mx="auto" width="100%" py={4} px={1} spacing={5}>
        {/* Header */}
        <div
          className="p-2 flex justify-between"
          style={{
            backgroundColor: "white",
            padding: 12,
            borderRadius: 8,
            boxShadow: "sm",
          }}
        >
          <Flex align="center" gap={3}>
            <UserCheck size={24} className="text-green-600" />
            <Heading size="lg" style={{ fontSize: 20, fontWeight: "600" }}>
              Referral Tracking
            </Heading>
          </Flex>
          <Button
            size="sm"
            leftIcon={<RefreshCw size={16} />}
            colorScheme="green"
            onClick={fetchData}
            isLoading={loading}
          >
            Refresh
          </Button>
        </div>

        {loading ? (
          <Flex justify="center" py={16}>
            <Spinner size="xl" colorScheme="green" />
          </Flex>
        ) : (
          <>
            {/* Summary Cards */}
            <Flex gap={4} wrap="wrap">
              <StatCard
                icon={Users}
                label="Total Referrers"
                value={summary.totalReferrers || 0}
                sub="Users with referral codes"
                color="blue"
              />
              <StatCard
                icon={TrendingUp}
                label="Total Referrals"
                value={summary.totalReferrals || 0}
                sub="Users signed up via referral"
                color="green"
              />
              <StatCard
                icon={DollarSign}
                label="Signup Bonuses Paid"
                value={`UGX ${(summary.totalSignupBonusPaid || 0).toLocaleString()}`}
                sub="50k per referred signup"
                color="green"
              />
              <StatCard
                icon={Award}
                label="First-Purchase Cash"
                value={`UGX ${(summary.totalFirstPurchaseCashPaid || 0).toLocaleString()}`}
                sub="20k per first purchase"
                color="purple"
              />
              <StatCard
                icon={Gift}
                label="Gift Cards Issued"
                value={summary.totalGiftCardsIssued || 0}
                sub={`Worth UGX ${(summary.totalGiftCardValue || 0).toLocaleString()}`}
                color="orange"
              />
              <StatCard
                icon={DollarSign}
                label="Total Paid Out"
                value={`UGX ${(summary.totalPaid || 0).toLocaleString()}`}
                sub="All referral rewards combined"
                color="green"
              />
            </Flex>

            {/* Search + Table */}
            <Box
              bg={useColorModeValue("white", "gray.700")}
              rounded="xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
              overflow="hidden"
            >
              <Flex p={4} align="center" justify="space-between" borderBottom="1px solid" borderColor="gray.100">
                <Text fontWeight="600" color="gray.700">
                  All Referrers ({filtered.length})
                </Text>
                <InputGroup maxW="300px" size="sm">
                  <InputLeftElement pointerEvents="none">
                    <Search size={14} color="gray" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search by name, email, or code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    rounded="md"
                  />
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
                        <Th isNumeric>Signup Bonus</Th>
                        <Th isNumeric>1st Purchase</Th>
                        <Th isNumeric>Cash Bonus</Th>
                        <Th isNumeric>Gift Cards</Th>
                        <Th w="40px"></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filtered.map((r, i) => (
                        <ReferrerRow key={r.referrer?._id || i} referrer={r} idx={i} />
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Text py={12} textAlign="center" color="gray.400" fontSize="sm">
                  {search ? "No referrers match your search." : "No referral data yet."}
                </Text>
              )}
            </Box>
          </>
        )}
      </Stack>
    </Flex>
  );
}