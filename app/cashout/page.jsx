"use client";

import {
  useGetCashoutUsersMutation,
  useCreditUserCashoutMutation,
} from "@Slices/cashoutApiSlice";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
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
  useDisclosure,
} from "@chakra-ui/react";
import { useToast } from "@components/ui/use-toast";
import { Banknote, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function CashoutPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [getCashoutUsers] = useGetCashoutUsersMutation();
  const [creditUserCashout, { isLoading: crediting }] = useCreditUserCashoutMutation();
  const { toast } = useToast();

  const { isOpen: isCreditOpen, onOpen: openCredit, onClose: closeCredit } = useDisclosure();
  const [creditTarget, setCreditTarget] = useState(null);
  const [creditType, setCreditType] = useState("referralEarnings");
  const [creditAmount, setCreditAmount] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCashoutUsers().unwrap();
      if (res?.status === "Success" && Array.isArray(res?.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.data?.message || err?.message || "Failed to load cashout users.",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [getCashoutUsers, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCredit = (u) => {
    setCreditTarget(u);
    setCreditType("referralEarnings");
    setCreditAmount("");
    openCredit();
  };

  const handleCreditSubmit = async () => {
    if (!creditTarget?.userId) return;
    const amt = Number(creditAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast({ variant: "destructive", title: "Invalid amount", description: "Enter a positive number." });
      return;
    }
    try {
      await creditUserCashout({
        userId: creditTarget.userId,
        type: creditType,
        amount: amt,
      }).unwrap();
      toast({ title: "Success", description: `Credited UGX ${amt.toLocaleString()} to ${creditType === "referralEarnings" ? "Cash earned" : "Loyalty points"}.` });
      closeCredit();
      setCreditTarget(null);
      setCreditAmount("");
      fetchUsers();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.data?.message || err?.message || "Failed to credit.",
      });
    }
  };

  const formatPayout = (pm) => {
    if (!pm) return "—";
    if (pm.type === "mobile_money") return `${pm.provider} ${pm.phone || ""}`;
    if (pm.type === "card") return `•••• ${pm.last4} ${pm.brand ? ` • ${pm.brand}` : ""}`;
    return "—";
  };

  return (
    <Flex minH="100vh" style={{ marginTop: "2em" }}>
      <Stack mx="auto" width="100%" py={4} px={1}>
        <div
          className="p-2 flex justify-between"
          style={{ backgroundColor: "white", padding: 12, borderRadius: 8, boxShadow: "sm" }}
        >
          <Flex align="center" gap={3}>
            <Banknote size={24} className="text-green-600" />
            <Heading size="lg" style={{ fontSize: 20, fontWeight: "600" }}>
              Cashout &amp; Payments
            </Heading>
          </Flex>
          <Button
            size="sm"
            leftIcon={<RefreshCw size={16} />}
            colorScheme="green"
            onClick={fetchUsers}
            isLoading={loading}
          >
            Refresh
          </Button>
        </div>

        <Box
          p={5}
          rounded="lg"
          bg={useColorModeValue("white", "gray.700")}
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
        >
          {loading ? (
            <Flex justify="center" py={12}>
              <Spinner size="lg" colorScheme="green" />
            </Flex>
          ) : users.length > 0 ? (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>#</Th>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th isNumeric>Cash (UGX)</Th>
                  <Th isNumeric>Loyalty</Th>
                  <Th>Payout method</Th>
                  <Th style={{ textAlign: "center" }}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((u, i) => (
                  <Tr key={u.userId}>
                    <Td>{i + 1}</Td>
                    <Td fontWeight="500">{[u.firstname, u.lastname].filter(Boolean).join(" ") || "—"}</Td>
                    <Td>{u.email || "—"}</Td>
                    <Td isNumeric fontWeight="600" color="green.600">
                      {(u.referralEarnings || 0).toLocaleString()}
                    </Td>
                    <Td isNumeric>{(u.loyaltyPoints || 0).toLocaleString()}</Td>
                    <Td fontSize="sm" color="gray.600">
                      {formatPayout(u.defaultPayoutMethod)}
                    </Td>
                    <Td textAlign="center">
                      <Button
                        size="xs"
                        colorScheme="green"
                        onClick={() => handleOpenCredit(u)}
                      >
                        Credit
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text py={8} textAlign="center" color="gray.500">
              No users with earnings, loyalty points, or payout methods yet.
            </Text>
          )}
        </Box>

        <Modal isOpen={isCreditOpen} onClose={closeCredit} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Credit user</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {creditTarget && (
                <Stack spacing={4}>
                  <Text fontSize="sm" color="gray.600">
                    {[creditTarget.firstname, creditTarget.lastname].filter(Boolean).join(" ")} ({creditTarget.email})
                  </Text>
                  <Box>
                    <Text fontSize="sm" fontWeight="600" mb={1}>Type</Text>
                    <Select
                      value={creditType}
                      onChange={(e) => setCreditType(e.target.value)}
                      size="sm"
                    >
                      <option value="referralEarnings">Cash (referral earnings)</option>
                      <option value="loyaltyPoints">Loyalty points</option>
                    </Select>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="600" mb={1}>Amount</Text>
                    <Input
                      type="number"
                      min={1}
                      placeholder="e.g. 5000"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      size="sm"
                    />
                  </Box>
                </Stack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={closeCredit}>Cancel</Button>
              <Button colorScheme="green" onClick={handleCreditSubmit} isLoading={crediting}>
                Credit
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Stack>
    </Flex>
  );
}
