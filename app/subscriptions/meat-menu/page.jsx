"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  useCreateMeatMenuPackageMutation,
  useDeleteMeatMenuPackageMutation,
  useGetMeatMenuPackagesQuery,
  useUpdateMeatMenuPackageMutation,
} from "@Slices/meatMenuApiSlice";
import { useSelector } from "react-redux";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const CUSTOMER_TYPES = ["individual", "family", "business"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const emptyCustomerPackage = () => ({ quantity: "", price: "" });

const EMPTY_FORM = {
  planType: "rte-meat-menu",
  productName: "",
  prepType: "ready-to-eat",
  individual: emptyCustomerPackage(),
  family: emptyCustomerPackage(),
  business: emptyCustomerPackage(),
  imageKey: "",
  active: true,
};

const readList = (response) => {
  const candidates = [response?.data, response];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (Array.isArray(candidate?.packages)) return candidate.packages;
    if (Array.isArray(candidate?.items)) return candidate.items;
  }
  return [];
};

const readError = (error) =>
  error?.data?.message ||
  error?.data?.error ||
  error?.error ||
  "Meat-menu request failed.";

const toForm = (item) => ({
  planType: item?.planType || EMPTY_FORM.planType,
  productName: item?.productName || "",
  prepType: item?.prepType || EMPTY_FORM.prepType,
  ...Object.fromEntries(CUSTOMER_TYPES.map((customerType) => [
    customerType,
    {
      quantity: item?.[customerType]?.quantity || "",
      price: item?.[customerType]?.price ?? "",
    },
  ])),
  imageKey: item?.imageKey || "",
  active: item?.active !== false,
});

const formatPrice = (amount, currency = "UGX") => {
  if (amount === undefined || amount === null || amount === "") return "—";
  return `${currency} ${Number(amount).toLocaleString()}`;
};

export default function MeatMenuPage() {
  const userInfo = useSelector((state) => state.auth.userInfo);
  const role = userInfo?.accountType ?? userInfo?.account ?? "";
  const canManage = role === "admin" || role === "editor";
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingPackage, setEditingPackage] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [filters, setFilters] = useState({
    prepType: "",
    planType: "",
  });
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetMeatMenuPackagesQuery(filters, { skip: !canManage });
  const [createPackage, { isLoading: creating }] = useCreateMeatMenuPackageMutation();
  const [updatePackage, { isLoading: updating }] = useUpdateMeatMenuPackageMutation();
  const [deletePackage, { isLoading: deleting }] = useDeleteMeatMenuPackageMutation();
  const packages = readList(response);
  const saving = creating || updating;

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return undefined;
    }
    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const openCreate = () => {
    setEditingPackage(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    onOpen();
  };

  const openEdit = (item) => {
    setEditingPackage(item);
    setForm(toForm(item));
    setImageFile(null);
    onOpen();
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const savePackage = async (event) => {
    event.preventDefault();
    const customerPackages = Object.fromEntries(CUSTOMER_TYPES.map((customerType) => [
      customerType,
      {
        quantity: form[customerType].quantity.trim(),
        price: Number(form[customerType].price),
      },
    ]));
    const payload = {
      planType: form.planType,
      productName: form.productName.trim(),
      prepType: form.prepType,
      ...customerPackages,
      imageKey: form.imageKey,
      active: form.active,
    };

    if (
      !payload.productName ||
      CUSTOMER_TYPES.some((customerType) => (
        !payload[customerType].quantity ||
        form[customerType].price === "" ||
        !Number.isFinite(payload[customerType].price) ||
        payload[customerType].price < 0
      ))
    ) {
      toast({
        title: "Package details required",
        description: "Enter a product name and a quantity and valid non-negative price for each customer type.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      let requestBody = payload;
      if (imageFile) {
        const formData = new FormData();
        formData.append("images", imageFile);
        Object.entries(payload).forEach(([key, value]) => {
          formData.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
        });
        requestBody = formData;
      }
      if (editingPackage) {
        await updatePackage({
          id: editingPackage._id || editingPackage.id,
          body: requestBody,
        }).unwrap();
      } else {
        await createPackage(requestBody).unwrap();
      }
      onClose();
      setImageFile(null);
      toast({
        title: editingPackage ? "Meat-menu package updated" : "Meat-menu package created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (requestError) {
      toast({
        title: "Could not save package",
        description: readError(requestError),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const removePackage = async (item) => {
    const id = item?._id || item?.id;
    if (!id) {
      toast({
        title: "Could not delete package",
        description: "This package has no ID and cannot be deleted.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (!window.confirm(`Delete "${item.productName}"?`)) return;
    try {
      await deletePackage(id).unwrap();
      toast({ title: "Meat-menu package deleted", status: "success", duration: 3000, isClosable: true });
    } catch (requestError) {
      toast({
        title: "Could not delete package",
        description: readError(requestError),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!canManage) {
    return (
      <Box maxW="full" px={{ base: 4, md: 8 }} py={6}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <AlertDescription>Only admins and editors can manage meat-menu packages.</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxW="full" px={{ base: 4, md: 8 }} py={6}>
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" mb={1}>Meat Menu Packages</Heading>
          <Text color="gray.500" fontSize="sm">
            Manage ready-to-eat and ready-to-cook meat-menu subscriptions.
          </Text>
        </Box>
        <HStack>
          <Button
            leftIcon={<RefreshCw size={16} />}
            variant="outline"
            onClick={() => refetch()}
            isLoading={isFetching}
          >
            Refresh
          </Button>
          <Button leftIcon={<Plus size={16} />} colorScheme="green" onClick={openCreate}>
            Add Package
          </Button>
        </HStack>
      </Flex>

      <Card borderRadius="xl" boxShadow="sm">
        <CardBody>
          <Flex gap={3} mb={4} flexWrap="wrap">
            <Select
              aria-label="Filter by plan type"
              maxW="220px"
              value={filters.planType}
              onChange={(event) => setFilters((current) => ({ ...current, planType: event.target.value }))}
            >
              <option value="">All plan types</option>
              <option value="rte-meat-menu">Ready-to-eat</option>
              <option value="rtc-meat-menu">Ready-to-cook</option>
            </Select>
            <Select
              aria-label="Filter by preparation type"
              maxW="220px"
              value={filters.prepType}
              onChange={(event) => setFilters((current) => ({ ...current, prepType: event.target.value }))}
            >
              <option value="">All preparation types</option>
              <option value="ready-to-eat">Ready to eat</option>
              <option value="ready-to-cook">Ready to cook</option>
            </Select>
          </Flex>

          {isError && (
            <Alert status="error" borderRadius="lg" mb={4}>
              <AlertIcon />
              <AlertDescription>{readError(error)}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <Center py={12}><Spinner size="lg" color="green.500" /></Center>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Product</Th>
                    <Th>Plan</Th>
                    <Th>Individual</Th>
                    <Th>Family</Th>
                    <Th>Business</Th>
                    <Th>Active</Th>
                    <Th textAlign="right">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {packages.map((item) => {
                    const id = item._id || item.id;
                    return (
                      <Tr key={id || item.productName}>
                        <Td fontWeight="600">{item.productName}</Td>
                        <Td>
                          <Text textTransform="capitalize">
                            {String(item.planType || "").replaceAll("-", " ")}
                          </Text>
                          <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                            {item.prepType?.replaceAll("-", " ")}
                          </Text>
                        </Td>
                        {CUSTOMER_TYPES.map((customerType) => (
                          <Td key={customerType} minW="180px">
                            <Text>{item[customerType]?.quantity || "—"}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {formatPrice(item[customerType]?.price, item.currency || "UGX")}
                            </Text>
                          </Td>
                        ))}
                        <Td>
                          <Badge colorScheme={item.active === false ? "gray" : "green"}>
                            {item.active === false ? "Inactive" : "Active"}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack justify="flex-end">
                            <IconButton
                              aria-label={`Edit ${item.productName}`}
                              icon={<Pencil size={16} />}
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(item)}
                            />
                            <IconButton
                              aria-label={`Delete ${item.productName}`}
                              icon={<Trash2 size={16} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => removePackage(item)}
                              isLoading={deleting}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                  {packages.length === 0 && !isError && (
                    <Tr>
                      <Td colSpan={7} textAlign="center" py={10} color="gray.500">
                        No meat-menu packages found.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        closeOnOverlayClick={!saving}
      >
        <ModalOverlay />
        <ModalContent as="form" onSubmit={savePackage}>
          <ModalHeader>{editingPackage ? "Edit Meat-Menu Package" : "Create Meat-Menu Package"}</ModalHeader>
          <ModalCloseButton isDisabled={saving} />
          <ModalBody>
            <Flex direction="column" gap={4}>
              <FormControl>
                <FormLabel>Package image</FormLabel>
                <Flex direction="column" gap={3}>
                  {imagePreview && (
                    <Image
                      src={imagePreview}
                      alt={`${form.productName || "Meat menu"} package`}
                      maxH="220px"
                      objectFit="contain"
                      alignSelf="flex-start"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="gray.200"
                    />
                  )}
                  {form.imageKey && !imagePreview && (
                    <Text fontSize="sm" color="gray.600">
                      Current image key: {form.imageKey}
                    </Text>
                  )}
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(event) => {
                      const selectedFile = event.target.files?.[0] || null;
                      if (selectedFile && !ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
                        toast({
                          title: "Invalid file",
                          description: "Choose a JPG, PNG, WEBP, or GIF image.",
                          status: "warning",
                          duration: 4000,
                          isClosable: true,
                        });
                        event.target.value = "";
                        return;
                      }
                      if (selectedFile && selectedFile.size > MAX_IMAGE_SIZE) {
                        toast({
                          title: "Image too large",
                          description: "Choose an image smaller than 5 MB, as with product images.",
                          status: "warning",
                          duration: 4000,
                          isClosable: true,
                        });
                        event.target.value = "";
                        return;
                      }
                      setImageFile(selectedFile);
                    }}
                  />
                  <Text fontSize="xs" color="gray.500">
                    Choose an image to upload with the package. Leave empty to keep the current image.
                  </Text>
                </Flex>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Product name</FormLabel>
                <Input
                  value={form.productName}
                  onChange={(event) => updateField("productName", event.target.value)}
                  placeholder="Posho & Meat"
                />
              </FormControl>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Plan type</FormLabel>
                  <Select value={form.planType} onChange={(event) => updateField("planType", event.target.value)}>
                    <option value="rte-meat-menu">Ready-to-eat meat menu</option>
                    <option value="rtc-meat-menu">Ready-to-cook meat menu</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Preparation type</FormLabel>
                  <Select value={form.prepType} onChange={(event) => updateField("prepType", event.target.value)}>
                    <option value="ready-to-eat">Ready to eat</option>
                    <option value="ready-to-cook">Ready to cook</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {CUSTOMER_TYPES.map((customerType) => (
                  <Card key={customerType} variant="outline">
                    <CardBody>
                      <Text textTransform="capitalize" fontWeight="700" mb={3}>
                        {customerType}
                      </Text>
                      <Flex direction="column" gap={3}>
                        <FormControl isRequired>
                          <FormLabel>Quantity</FormLabel>
                          <Textarea
                            value={form[customerType].quantity}
                            onChange={(event) => setForm((current) => ({
                              ...current,
                              [customerType]: {
                                ...current[customerType],
                                quantity: event.target.value,
                              },
                            }))}
                            placeholder="1 kg posho + 1 kg meat"
                            rows={2}
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Price (UGX)</FormLabel>
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            value={form[customerType].price}
                            onChange={(event) => setForm((current) => ({
                              ...current,
                              [customerType]: {
                                ...current[customerType],
                                price: event.target.value,
                              },
                            }))}
                          />
                        </FormControl>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
              <Checkbox
                isChecked={form.active}
                onChange={(event) => updateField("active", event.target.checked)}
              >
                Package is active
              </Checkbox>
            </Flex>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose} isDisabled={saving}>Cancel</Button>
            <Button colorScheme="green" type="submit" isLoading={saving}>
              {editingPackage ? "Save Changes" : "Create Package"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
