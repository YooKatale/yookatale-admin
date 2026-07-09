"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box, Flex, Heading, Text, Badge, Button, Input,
  Grid, VStack, HStack, Icon, Spinner,
  AlertDialog, AlertDialogBody, AlertDialogFooter,
  AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
  useDisclosure, useToast,
} from "@chakra-ui/react";
import {
  FiUser, FiMail, FiPhone,
  FiSearch, FiBriefcase, FiCalendar,
  FiRefreshCw, FiTrash2, FiX, FiEdit2
} from "react-icons/fi";
import { UserPlus, Users2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useAccountsGetMutation, useDeleteUserAccountMutation } from "@Slices/userApiSlice";
import AddAccount from "@components/modals/AddAccount";

// Stats Card
function StatCard({ label, value, color, icon }) {
  return (
    <Box bg="white" borderRadius="xl" p="5" border="1px solid" borderColor="gray.100" boxShadow="sm">
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color={color}>{value}</Text>
          <Text fontSize="sm" color="gray.500" mt="1">{label}</Text>
        </Box>
        <Flex w="36px" h="36px" borderRadius="lg" bg={`${color.split(".")[0]}.50`} align="center" justify="center">
          <Icon as={icon} color={color} boxSize="16px" />
        </Flex>
      </Flex>
    </Box>
  );
}

// Account Card
function AccountCard({ app, formatDate, onDeleted, onEdit }) {
  const [deleting, setDeleting] = useState(false);
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef();
  const [deleteAccount] = useDeleteUserAccountMutation();
  const toast = useToast();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount(app._id).unwrap();
      toast({ title: "Account deleted", status: "success", duration: 2500, isClosable: true });
      onDeleted(app._id);
    } catch (e) {
      toast({
        title: "Failed to delete",
        description: e?.data?.message || "Please try again",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
      onAlertClose();
    }
  };

  return (
    <>
      <Box
        bg="white" borderRadius="xl"
        border="1px solid" borderColor="gray.100"
        boxShadow="sm" overflow="hidden"
        transition="box-shadow 0.2s"
        _hover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
      >
        {/* Card Header */}
        <Box px={{ base: 4, md: 6 }} py="4">
          <Flex justify="space-between" align="flex-start" wrap="wrap" gap="3">
            <HStack spacing="3" align="start">
              <Flex
                w="44px" h="44px" borderRadius="full" bg={app.accountType === "admin" ? "green.50" : "blue.50"}
                align="center" justify="center" flexShrink={0}
              >
                <Icon as={FiUser} color={app.accountType === "admin" ? "green.600" : "blue.600"} boxSize="20px" />
              </Flex>
              <Box>
                <HStack spacing="2" wrap="wrap">
                  <Text fontWeight="bold" fontSize="md" color="gray.800">{app.firstname} {app.lastname}</Text>
                  {app.username &&
                    <Badge colorScheme={app.accountType === "admin" ? "green" : "blue"} fontSize="10px" borderRadius="full">
                      {app.username}
                    </Badge>
                  }
                </HStack>
                <HStack spacing="4" mt="1.5" wrap="wrap">
                  <HStack spacing="1">
                    <Icon as={FiMail} color="gray.400" boxSize="12px" />
                    <Text fontSize="sm" color="gray.600">{app.email || "—"}</Text>
                  </HStack>
                  <HStack spacing="1">
                    <Icon as={FiPhone} color="gray.400" boxSize="12px" />
                    <Text fontSize="sm" color="gray.600">{app.phone || "—"}</Text>
                  </HStack>
                  {(app.createdAt || app.date) && (
                    <HStack spacing="1">
                      <Icon as={FiCalendar} color="gray.400" boxSize="12px" />
                      <Text fontSize="xs" color="gray.400">{formatDate(app.createdAt || app.date)}</Text>
                    </HStack>
                  )}
                </HStack>
              </Box>
            </HStack>

            {/* Action buttons */}
            <HStack spacing="2" flexShrink={0} wrap="wrap">
              <Button
                size="xs" leftIcon={<FiEdit2 />}
                variant="outline" colorScheme="blue" borderRadius="md"
                onClick={(e) => { e.stopPropagation(); onEdit(app); }}
              >
                Edit
              </Button>
              <Button
                size="xs" leftIcon={<FiTrash2 />}
                variant="outline" colorScheme="red" borderRadius="md"
                onClick={(e) => { e.stopPropagation(); onAlertOpen(); }}
              >
                Delete
              </Button>
            </HStack>
          </Flex>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={onAlertClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete Account</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete the account for{" "}
              <strong>{app.firstname} {app.lastname}</strong>? This cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose} borderRadius="lg">Cancel</Button>
              <Button
                colorScheme="red" ml="3" borderRadius="lg"
                onClick={handleDelete} isLoading={deleting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

// Users Page
export default function UsersPage() {
  const [accounts, setAccounts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState(false);
  const [modal, setModal] = useState("");
  const [accountData, setAccountData] = useState({});
  const [editMode, setEditMode] = useState(false);

  const toast = useToast();
  const [getAccounts] = useAccountsGetMutation();
  const { userInfo } = useSelector((state) => state.auth);

  // Get all accounts when page loads
  useEffect(() => {
    load();
  }, []);

  // Filter user accounts by name, email or phone number on search input change
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      accounts.filter((a) =>
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.phone?.includes(q)
      )
    );
  }, [search, accounts]);

  // Open the add/edit modal
  const handleModal = (modalName) => {
    setModalState(true);
    setModal(modalName);
    setEditMode(false);
  };

  // Open edit modal for a specific account
  const openEditMode = (data) => {
    if (data.accountType === "admin" && userInfo?.account === "editor") {
      toast({
        title: "Permission denied",
        description: "You cannot edit this account",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setModalState(true);
    setModal("editAccount");
    setEditMode(true);
    setAccountData(data);
  };

  // Delete user account
  const handleDeleted = (id) => {
    setAccounts((prev) => prev.filter((a) => a._id !== id));
  };

  // Get all user accounts
  const load = async () => {
    setLoading(true);
    try {
      const res = await getAccounts().unwrap();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setAccounts(data);
      setFiltered(data);
    } catch (e) {
      toast({ title: "Failed to load users", status: "error", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 8 }}>
      {modalState && (modal === "addAccount" || modal === "editAccount") &&
        <AddAccount
          closeModal={setModalState}
          accountData={accountData}
          editmode={editMode}
          reloadAccounts={load}
        />
      }

      {/* Header */}
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap="4" mb="8">
        <Box>
          <HStack spacing={3}>
            <Icon as={Users2} boxSize={10} color="green.600" />
            <Heading size="lg" color="gray.800" mb="1">Users</Heading>
          </HStack>
          <Text color="gray.500" fontSize="sm">
            Manage {accounts.length} administrative panel users and permissions
          </Text>
        </Box>
        <HStack spacing="3">
          <Button
            size="sm" leftIcon={<FiRefreshCw />}
            variant="outline" borderRadius="lg"
            onClick={load} isLoading={loading}
          >
            Refresh
          </Button>
          <Button
            size="sm" leftIcon={<UserPlus />}
            bg="green.600" color="white" borderRadius="lg"
            onClick={() => handleModal("addAccount")}
            _hover={{ bg: "green.700" }}
            px={3}
          >
            New User
          </Button>
        </HStack>
      </Flex>

      {/* Stats */}
      <Grid templateColumns={{ base: "repeat(2,1fr)", md: "repeat(2,1fr)" }} gap="4" mb="8">
        <StatCard
          label="Administrators"
          value={accounts.filter((a) => a.accountType === "admin").length}
          color="green.500"
          icon={FiUser}
        />
        <StatCard
          label="Editors"
          value={accounts.filter((a) => a.accountType === "editor").length}
          color="blue.500"
          icon={FiUser}
        />
      </Grid>

      {/* Search */}
      <Box mb="6">
        <Flex
          align="center" gap="2" bg="white"
          border="1px solid" borderColor="gray.200"
          borderRadius="xl" px="4" py="2"
          maxW="460px" boxShadow="sm"
        >
          <Icon as={FiSearch} color="gray.400" />
          <Input
            variant="unstyled" placeholder="Search by name, email or phone..."
            fontSize="sm" value={search} onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <Icon
              as={FiX} color="gray.400" cursor="pointer"
              role="button" aria-label="Clear search"
              onClick={() => setSearch("")}
            />
          )}
        </Flex>
        {search && (
          <Text fontSize="xs" color="gray.400" mt="2" ml="1">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &quot;{search}&quot;
          </Text>
        )}
      </Box>

      {/* List */}
      {loading ? (
        <Flex justify="center" align="center" py="20">
          <Spinner color="green.500" size="lg" />
        </Flex>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" py="16" bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
          <Icon as={FiBriefcase} boxSize="10" color="gray.300" mb="3" />
          <Text color="gray.500" fontWeight="medium">No accounts found</Text>
          {search && <Text fontSize="sm" color="gray.400" mt="1">Try a different search term</Text>}
        </Box>
      ) : (
        <VStack spacing="4" align="stretch">
          {filtered.map((app, i) => (
            <AccountCard
              key={app._id || i}
              app={app}
              formatDate={formatDate}
              onDeleted={handleDeleted}
              onEdit={openEditMode}
            />
          ))}
        </VStack>
      )}
    </Box>
  );
}
