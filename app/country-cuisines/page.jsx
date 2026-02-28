"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Text,
  useToast,
  Image,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useGetCountryCuisinesMutation, useUploadCountryCuisineImageMutation, useUpdateCountryCuisineMutation } from "@Slices/countryCuisineApiSlice";
import { BACKEND_URL } from "@constants/constant";
import { Globe } from "lucide-react";

const getImageUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("http")) return url;
  return BACKEND_URL.replace(/\/$/, "") + (url.startsWith("/") ? url : "/" + url);
};

export default function CountryCuisinesPage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingCode, setUploadingCode] = useState(null);
  const [fetchCountries] = useGetCountryCuisinesMutation();
  const [uploadImage] = useUploadCountryCuisineImageMutation();
  const [updateCountry] = useUpdateCountryCuisineMutation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [editMenuName, setEditMenuName] = useState("");
  const [savingCode, setSavingCode] = useState(null);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const loadCountries = async () => {
    setLoading(true);
    try {
      const res = await fetchCountries().unwrap();
      if (res?.success && Array.isArray(res?.data)) {
        setCountries(res.data);
      } else {
        setCountries([]);
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to load countries", status: "error", duration: 3000 });
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  const openUpload = (country) => {
    setSelectedCountry(country);
    onOpen();
  };

  const openEdit = (country) => {
    setSelectedCountry(country);
    setEditMenuName(country.menuName != null ? country.menuName : "");
    onEditOpen();
  };

  const handleSaveMenuName = async () => {
    if (!selectedCountry?.code) return;
    setSavingCode(selectedCountry.code);
    try {
      await updateCountry({ code: selectedCountry.code, menuName: editMenuName.trim() || null }).unwrap();
      toast({ title: "Saved", description: "Menu name updated", status: "success", duration: 3000 });
      onEditClose();
      setSelectedCountry(null);
      loadCountries();
    } catch (err) {
      toast({ title: "Error", description: err?.data?.message || "Failed to save", status: "error", duration: 3000 });
    } finally {
      setSavingCode(null);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCountry?.code) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image (e.g. JPG, PNG)", status: "error", duration: 3000 });
      return;
    }
    setUploadingCode(selectedCountry.code);
    const formData = new FormData();
    formData.append("image", file);
    try {
      await uploadImage({ code: selectedCountry.code, formData }).unwrap();
      toast({ title: "Success", description: `Banner image for ${selectedCountry.name} updated`, status: "success", duration: 3000 });
      onClose();
      setSelectedCountry(null);
      loadCountries();
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err?.data?.message || err?.error || "Could not upload image",
        status: "error",
        duration: 4000,
      });
    } finally {
      setUploadingCode(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Flex minH="100vh" style={{ marginTop: "4em" }}>
      <Box mx="auto" width="100%" py={4} px={4}>
        <Box bg="white" p={4} borderRadius="md" shadow="sm" mb={4}>
          <Flex align="center" gap={2} mb={1}>
            <Globe size={22} />
            <Heading size="lg" fontSize="20" fontWeight="600">
              Country Cuisine Banners
            </Heading>
          </Flex>
          <Text fontSize="sm" color="gray.600">
            Upload a banner image for each country. This image is shown in the homepage modal when users tap that country in World Cuisines.
          </Text>
        </Box>

        {loading ? (
          <Box py={8} textAlign="center">
            <Text color="gray.500">Loading countries…</Text>
          </Box>
        ) : (
          <Grid
            templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }}
            gap={4}
          >
            {countries.map((c) => (
              <Box
                key={c.code}
                bg="white"
                p={4}
                borderRadius="lg"
                shadow="sm"
                borderWidth="1px"
                borderColor="gray.200"
                _hover={{ borderColor: "green.300", shadow: "md" }}
              >
                <Box mb={3} borderRadius="md" overflow="hidden" bg="gray.100" h="100px" position="relative">
                  {c.imageUrl ? (
                    <Image
                      src={getImageUrl(c.imageUrl)}
                      alt={c.name}
                      objectFit="cover"
                      w="100%"
                      h="100%"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <Flex h="100%" align="center" justify="center">
                      <Text fontSize="xs" color="gray.500">No image</Text>
                    </Flex>
                  )}
                </Box>
                <Flex align="center" gap={2} mb={2}>
                  <Box w="24px" h="16px" borderRadius="4px" overflow="hidden" flexShrink={0}>
                    <img
                      src={c.flag || `https://flagcdn.com/w80/${(c.code || "").toLowerCase()}.png`}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                  <Text fontWeight="600" fontSize="sm">{c.name}</Text>
                </Flex>
                <Text fontSize="xs" color="gray.500" mb={2} noOfLines={1}>
                  Menu title: {c.menuName || `${c.name} Menu`}
                </Text>
                <Flex gap={2}>
                  <Button size="sm" colorScheme="green" flex={1} onClick={() => openUpload(c)} isLoading={uploadingCode === c.code} loadingText="…">
                    {c.imageUrl ? "Change image" : "Upload image"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEdit(c)}>Edit name</Button>
                </Flex>
              </Box>
            ))}
          </Grid>
        )}

        <Modal isOpen={isEditOpen} onClose={() => { onEditClose(); setSelectedCountry(null); }}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit menu name: {selectedCountry?.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Text fontSize="sm" color="gray.600" mb={2}>This is the title shown in the homepage modal (e.g. &quot;Uganda Combo Menu&quot;).</Text>
              <Input
                value={editMenuName}
                onChange={(e) => setEditMenuName(e.target.value)}
                placeholder={selectedCountry ? `${selectedCountry.name} Menu` : "Menu name"}
                mb={4}
              />
              <Button colorScheme="green" onClick={handleSaveMenuName} isLoading={savingCode === selectedCountry?.code}>Save</Button>
            </ModalBody>
          </ModalContent>
        </Modal>

        <Modal isOpen={isOpen} onClose={() => { onClose(); setSelectedCountry(null); }}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedCountry ? `Upload banner: ${selectedCountry.name}` : "Upload image"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedCountry && (
                <>
                  <Text fontSize="sm" color="gray.600" mb={4}>
                    Choose an image to show in the homepage country modal. Recommended: landscape, about 1200×600px.
                  </Text>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Flex>
  );
}
