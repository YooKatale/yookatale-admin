"use client";

import {
  Alert,
  AlertIcon,
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
  Input,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import {
  useGetAdvertisementPricingAdminQuery,
  useUpdateAdvertisementPricingAdminMutation,
} from "@Slices/adminCommercialApiSlice";
import { useSelector } from "react-redux";
import { Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const DEFAULT_PRICING = {
  basePricePerDay: "",
  minDurationDays: "",
  maxDurationDays: "",
  reachTiers: [],
};

const unwrap = (response) => response?.data?.pricing || response?.data || response?.pricing || response || {};
const errorMessage = (error) =>
  error?.data?.message || error?.data?.error || error?.error || "Request failed";

const slug = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AdvertisingPricingPage() {
  const userInfo = useSelector((state) => state.auth.userInfo);
  const role = userInfo?.accountType ?? userInfo?.account ?? "";
  const isAdmin = role === "admin";
  const toast = useToast();
  const {
    data: pricingResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAdvertisementPricingAdminQuery(undefined, { skip: !isAdmin });
  const [updatePricing, { isLoading: saving }] = useUpdateAdvertisementPricingAdminMutation();
  const [form, setForm] = useState(DEFAULT_PRICING);

  useEffect(() => {
    if (!pricingResponse) return;
    const pricing = unwrap(pricingResponse);
    setForm({
      basePricePerDay: pricing.basePricePerDay ?? "",
      minDurationDays: pricing.minDurationDays ?? "",
      maxDurationDays: pricing.maxDurationDays ?? "",
      reachTiers: Array.isArray(pricing.reachTiers)
        ? pricing.reachTiers.map((tier) => ({
            id: tier.id || "",
            label: tier.label || "",
            estimatedAudience: tier.estimatedAudience ?? "",
            dailySurcharge: tier.dailySurcharge ?? 0,
          }))
        : [],
    });
  }, [pricingResponse]);

  const updateField = (index, key, value) => {
    setForm((current) => ({
      ...current,
      reachTiers: current.reachTiers.map((tier, tierIndex) =>
        tierIndex === index ? { ...tier, [key]: value } : tier,
      ),
    }));
  };

  const addTier = () => {
    setForm((current) => ({
      ...current,
      reachTiers: [
        ...current.reachTiers,
        {
          id: "",
          label: "",
          estimatedAudience: "",
          dailySurcharge: 0,
        },
      ],
    }));
  };

  const removeTier = (index) => {
    setForm((current) => ({
      ...current,
      reachTiers: current.reachTiers.filter((_, tierIndex) => tierIndex !== index),
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const basePricePerDay = Number(form.basePricePerDay);
    const minDurationDays = Number(form.minDurationDays);
    const maxDurationDays = Number(form.maxDurationDays);
    const reachTiers = form.reachTiers.map((tier) => ({
      id: slug(tier.id || tier.label),
      label: tier.label.trim(),
      estimatedAudience: tier.estimatedAudience === "" ? null : Number(tier.estimatedAudience),
      dailySurcharge: Number(tier.dailySurcharge),
    }));

    if (!Number.isInteger(basePricePerDay) || basePricePerDay < 30000) {
      toast({ title: "Invalid base price", description: "The daily base price must be at least UGX 30,000.", status: "warning", duration: 4000, isClosable: true });
      return;
    }
    if (!Number.isInteger(minDurationDays) || minDurationDays < 1 ||
        !Number.isInteger(maxDurationDays) || maxDurationDays < minDurationDays) {
      toast({ title: "Invalid duration limits", description: "Enter a minimum of at least 1 day and a maximum no lower than the minimum.", status: "warning", duration: 4000, isClosable: true });
      return;
    }
    if (reachTiers.length === 0 || reachTiers.some((tier) =>
      !tier.id || !tier.label || !Number.isFinite(tier.dailySurcharge) || tier.dailySurcharge < 0 ||
      (tier.estimatedAudience !== null && (!Number.isFinite(tier.estimatedAudience) || tier.estimatedAudience < 0))
    )) {
      toast({ title: "Invalid reach tiers", description: "Add at least one tier. Each tier needs an ID, label, and non-negative surcharge.", status: "warning", duration: 4000, isClosable: true });
      return;
    }
    if (new Set(reachTiers.map((tier) => tier.id)).size !== reachTiers.length) {
      toast({ title: "Duplicate reach tier ID", description: "Each reach tier must have a unique ID.", status: "warning", duration: 4000, isClosable: true });
      return;
    }

    try {
      await updatePricing({ basePricePerDay, minDurationDays, maxDurationDays, reachTiers }).unwrap();
      toast({ title: "Advertisement pricing saved", status: "success", duration: 3000, isClosable: true });
      await refetch();
    } catch (requestError) {
      toast({ title: "Could not save advertisement pricing", description: errorMessage(requestError), status: "error", duration: 5000, isClosable: true });
    }
  };

  if (!isAdmin) {
    return (
      <Center minH="50vh" px={4}>
        <Alert status="error" maxW="lg" borderRadius="lg"><AlertIcon />This page is restricted to administrator accounts.</Alert>
      </Center>
    );
  }

  if (isLoading) {
    return <Center minH="50vh"><VStack><Spinner color="green.500" /><Text>Loading advertising pricing...</Text></VStack></Center>;
  }

  if (isError) {
    return (
      <Card borderColor="red.200" borderWidth="1px">
        <CardBody>
          <Flex gap={3} align="center" wrap="wrap">
            <Alert status="error" flex="1" borderRadius="lg"><AlertIcon />{errorMessage(error)}</Alert>
            <Button onClick={refetch} variant="outline" colorScheme="red">Try again</Button>
          </Flex>
        </CardBody>
      </Card>
    );
  }

  return (
    <Box px={{ base: 3, md: 6 }} py={5}>
      <VStack align="stretch" spacing={5}>
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <Box>
            <Heading size="lg">Vendor Advertising Pricing</Heading>
            <Text color="gray.600" mt={1}>Configure daily pricing, duration limits, and audience tiers.</Text>
          </Box>
          <Button leftIcon={<RefreshCw size={15} />} variant="outline" onClick={refetch}>Refresh</Button>
        </Flex>

        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          Vendor orders are priced server-side as duration days × (base daily price + selected tier surcharge). The minimum one-day base price is UGX 30,000.
        </Alert>

        <Card>
          <CardBody>
            <form onSubmit={handleSave}>
              <VStack align="stretch" spacing={6}>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <NumericField label="Base price per day (UGX)" min={30000} value={form.basePricePerDay} onChange={(value) => setForm((current) => ({ ...current, basePricePerDay: value }))} />
                  <NumericField label="Minimum duration (days)" min={1} value={form.minDurationDays} onChange={(value) => setForm((current) => ({ ...current, minDurationDays: value }))} />
                  <NumericField label="Maximum duration (days)" min={1} value={form.maxDurationDays} onChange={(value) => setForm((current) => ({ ...current, maxDurationDays: value }))} />
                </SimpleGrid>

                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                    <Box>
                      <Heading size="sm">Reach tiers</Heading>
                      <Text fontSize="sm" color="gray.600">Standard reach can have no audience estimate; surcharges are charged per day.</Text>
                    </Box>
                    <Button leftIcon={<Plus size={15} />} size="sm" variant="outline" onClick={addTier}>Add tier</Button>
                  </Flex>

                  {form.reachTiers.map((tier, index) => (
                    <Card key={`${index}-${tier.id}`} variant="outline">
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <Flex justify="space-between" align="center">
                            <Heading size="xs">Tier {index + 1}</Heading>
                            <IconButton aria-label={`Remove reach tier ${index + 1}`} icon={<Trash2 size={15} />} size="sm" colorScheme="red" variant="ghost" onClick={() => removeTier(index)} isDisabled={form.reachTiers.length <= 1} />
                          </Flex>
                          <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4}>
                            <FormControl isRequired>
                              <FormLabel>Tier ID</FormLabel>
                              <Input value={tier.id} onChange={(event) => updateField(index, "id", slug(event.target.value))} placeholder="standard" />
                            </FormControl>
                            <FormControl isRequired>
                              <FormLabel>Label</FormLabel>
                              <Input value={tier.label} onChange={(event) => updateField(index, "label", event.target.value)} placeholder="Standard reach" />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Estimated audience</FormLabel>
                              <Input type="number" min={0} value={tier.estimatedAudience} onChange={(event) => updateField(index, "estimatedAudience", event.target.value)} placeholder="No guarantee" />
                            </FormControl>
                            <FormControl isRequired>
                              <FormLabel>Daily surcharge (UGX)</FormLabel>
                              <Input type="number" min={0} value={tier.dailySurcharge} onChange={(event) => updateField(index, "dailySurcharge", event.target.value)} />
                            </FormControl>
                          </SimpleGrid>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>

                <Flex justify="flex-end">
                  <Button type="submit" leftIcon={<Save size={16} />} colorScheme="green" isLoading={saving}>Save pricing options</Button>
                </Flex>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}

function NumericField({ label, min, value, onChange }) {
  return (
    <FormControl isRequired>
      <FormLabel>{label}</FormLabel>
      <Input type="number" min={min} step={1} value={value} onChange={(event) => onChange(event.target.value)} />
    </FormControl>
  );
}
