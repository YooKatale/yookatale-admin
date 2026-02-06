"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Divider,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  Heading,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  useApproveStoreMutation,
  useRejectStoreMutation,
} from "@Slices/sellerStoresApiSlice";
import { Store, MapPin, Phone, Mail, User, Clock } from "lucide-react";

const StoreApprovalModal = ({ isOpen, onClose, store, onSuccess }) => {
  const [rejectReason, setRejectReason] = useState("");
  const [approveStore, { isLoading: isApproving }] = useApproveStoreMutation();
  const [rejectStore, { isLoading: isRejecting }] = useRejectStoreMutation();
  const toast = useToast();

  const handleApprove = async () => {
    try {
      await approveStore(store._id).unwrap();
      toast({
        title: "Store Approved",
        description: `${store.name} has been approved successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to approve store",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await rejectStore({ storeId: store._id, reason: rejectReason }).unwrap();
      toast({
        title: "Store Rejected",
        description: `${store.name} has been rejected.`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      setRejectReason("");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to reject store",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!store) return null;

  const sellerName = store.sellerId
    ? [store.sellerId.firstname, store.sellerId.lastname]
        .filter(Boolean)
        .join(" ") || store.sellerId.email
    : "—";

  const statusColor =
    store.status === "approved"
      ? "green"
      : store.status === "rejected"
      ? "red"
      : "yellow";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Store size={24} />
            <Text>Store Details</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Store Name & Status */}
            <Box>
              <Heading size="md" mb={2}>
                {store.name}
              </Heading>
              <Badge colorScheme={statusColor} fontSize="sm">
                {store.status?.toUpperCase()}
              </Badge>
            </Box>

            <Divider />

            {/* Store Description */}
            {store.description && (
              <Box>
                <Text fontWeight="semibold" mb={1}>
                  Description
                </Text>
                <Text color="gray.600">{store.description}</Text>
              </Box>
            )}

            {/* Seller Information */}
            <Box>
              <Text fontWeight="semibold" mb={2} display="flex" alignItems="center" gap={2}>
                <User size={18} />
                Seller Information
              </Text>
              <SimpleGrid columns={2} spacing={2}>
                <Text fontSize="sm" color="gray.600">
                  <strong>Name:</strong> {sellerName}
                </Text>
                {store.sellerId?.email && (
                  <Text fontSize="sm" color="gray.600">
                    <strong>Email:</strong> {store.sellerId.email}
                  </Text>
                )}
              </SimpleGrid>
            </Box>

            <Divider />

            {/* Location Information */}
            <Box>
              <Text fontWeight="semibold" mb={2} display="flex" alignItems="center" gap={2}>
                <MapPin size={18} />
                Location
              </Text>
              <VStack spacing={1} align="stretch">
                {store.locationId?.name && (
                  <Text fontSize="sm" color="gray.600">
                    <strong>Location:</strong> {store.locationId.name}
                  </Text>
                )}
                {store.locationId?.region && (
                  <Text fontSize="sm" color="gray.600">
                    <strong>Region:</strong> {store.locationId.region}
                  </Text>
                )}
                {store.locationId?.district && (
                  <Text fontSize="sm" color="gray.600">
                    <strong>District:</strong> {store.locationId.district}
                  </Text>
                )}
                {store.addressLine && (
                  <Text fontSize="sm" color="gray.600">
                    <strong>Address:</strong> {store.addressLine}
                  </Text>
                )}
              </VStack>
            </Box>

            <Divider />

            {/* Contact Information */}
            <Box>
              <Text fontWeight="semibold" mb={2} display="flex" alignItems="center" gap={2}>
                <Phone size={18} />
                Contact Information
              </Text>
              <VStack spacing={1} align="stretch">
                {store.contactPhone && (
                  <Text fontSize="sm" color="gray.600">
                    <strong>Phone:</strong> {store.contactPhone}
                  </Text>
                )}
                {store.contactWhatsApp && (
                  <Text fontSize="sm" color="gray.600">
                    <strong>WhatsApp:</strong> {store.contactWhatsApp}
                  </Text>
                )}
                {store.openHours && (
                  <Text fontSize="sm" color="gray.600" display="flex" alignItems="center" gap={2}>
                    <Clock size={16} />
                    <strong>Hours:</strong> {store.openHours}
                  </Text>
                )}
              </VStack>
            </Box>

            {/* Rejection Reason Input (only for pending stores) */}
            {store.status === "pending" && (
              <>
                <Divider />
                <FormControl>
                  <FormLabel>Rejection Reason (if rejecting)</FormLabel>
                  <Textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    rows={3}
                  />
                </FormControl>
              </>
            )}

            {/* Rejection Reason Display (if rejected) */}
            {store.status === "rejected" && store.rejectionReason && (
              <>
                <Divider />
                <Box>
                  <Text fontWeight="semibold" mb={1} color="red.600">
                    Rejection Reason
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {store.rejectionReason}
                  </Text>
                </Box>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            {store.status === "pending" && (
              <>
                <Button
                  colorScheme="red"
                  onClick={handleReject}
                  isLoading={isRejecting}
                  loadingText="Rejecting..."
                >
                  Reject
                </Button>
                <Button
                  colorScheme="green"
                  onClick={handleApprove}
                  isLoading={isApproving}
                  loadingText="Approving..."
                >
                  Approve
                </Button>
              </>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StoreApprovalModal;
