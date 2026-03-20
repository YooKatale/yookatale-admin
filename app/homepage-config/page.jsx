"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Input,
  useToast,
  Grid,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useGetHomepageConfigMutation, useUpdateHomepageConfigMutation, useUploadSideCardImageMutation } from "@Slices/homepageConfigApiSlice";
import { BACKEND_URL } from "@constants/constant";
import { LayoutDashboard } from "lucide-react";

const getImageUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return BACKEND_URL.replace(/\/$/, "") + (url.startsWith("/") ? url : "/" + url);
};

const defaultSlides = [
  { tag: "YOOKATALE APP", title: "Fresh Groceries", accent: "Delivered Fast", desc: "Farm-fresh produce at your door.", cta: "Download App", ctaSec: "Browse Web", accentColor: "#f0c020", bg: ["#061806", "#1a5c1a"] },
  { tag: "BEST SELLERS", title: "Top Picks", accent: "This Week", desc: "Freshness curated daily.", cta: "Shop Now", ctaSec: "View All", accentColor: "#ff8c42", bg: ["#160800", "#3d1800"] },
  { tag: "WORLD MENUS", title: "Authentic Meals", accent: "From Every Nation", desc: "Subscribe to world cuisine boxes.", cta: "Subscribe", ctaSec: "Learn More", accentColor: "#00c8a0", bg: ["#00130f", "#003328"] },
];

const defaultCards = [
  { eyebrow: "Now Hiring", title: "We're Looking for You — Join Our Team!", ctaText: "View Openings", link: "/careers", gradientColors: ["#0d2b18", "#185f2d"], order: 0 },
  { eyebrow: "Free Delivery", title: "Orders over UGX 50,000", ctaText: "See details", link: "/subscription", gradientColors: ["#001a2e", "#003d6b"], order: 1 },
  { eyebrow: "Download", title: "Yookatale App — Android & iOS", ctaText: "Get the app", link: "https://play.google.com/store/apps/details?id=com.yookataleapp.app", gradientColors: ["#0a1a00", "#294d00"], order: 2 },
];

export default function HomepageConfigPage() {
  const [heroSlides, setHeroSlides] = useState([...defaultSlides]);
  const [sideCards, setSideCards] = useState([...defaultCards]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchConfig] = useGetHomepageConfigMutation();
  const [updateConfig] = useUpdateHomepageConfigMutation();
  const [uploadCardImage] = useUploadSideCardImageMutation();
  const [uploadingCardIndex, setUploadingCardIndex] = useState(null);
  const fileRefs = useRef({});
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchConfig().unwrap();
      if (res?.success && res?.data) {
        if (res.data.heroSlides?.length) setHeroSlides(res.data.heroSlides);
        if (res.data.sideCards?.length) setSideCards(res.data.sideCards);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load config", status: "error", duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfig({ heroSlides, sideCards }).unwrap();
      toast({ title: "Saved", description: "Homepage config updated", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error", description: err?.data?.message || "Failed to save", status: "error", duration: 3000 });
    } finally {
      setSaving(false);
    }
  };

  const updateSlide = (i, field, value) => {
    const next = [...heroSlides];
    if (!next[i]) next[i] = { ...defaultSlides[0] };
    next[i] = { ...next[i], [field]: value };
    if (field === "bg" && typeof value === "string") {
      const parts = value.split(",").map((s) => s.trim());
      next[i].bg = [parts[0] || "#061806", parts[1] || "#1a5c1a"];
    }
    setHeroSlides(next);
  };

  const updateCard = (i, field, value) => {
    const next = [...sideCards];
    if (!next[i]) next[i] = { ...defaultCards[0], order: i };
    next[i] = { ...next[i], [field]: value };
    setSideCards(next);
  };

  const handleCardImage = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Select an image", status: "error", duration: 3000 });
      return;
    }
    setUploadingCardIndex(index);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("index", String(index));
    try {
      const res = await uploadCardImage({ index, formData }).unwrap();
      if (res?.imageUrl) {
        updateCard(index, "imageUrl", res.imageUrl);
        toast({ title: "Image uploaded", status: "success", duration: 3000 });
      }
    } catch {
      toast({ title: "Upload failed", status: "error", duration: 3000 });
    } finally {
      setUploadingCardIndex(null);
      if (fileRefs.current[index]) fileRefs.current[index].value = "";
    }
  };

  if (loading) {
    return (
      <Flex minH="100vh" style={{ marginTop: "4em" }} align="center" justify="center">
        <Text color="gray.500">Loading…</Text>
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" style={{ marginTop: "4em" }}>
      <Box mx="auto" width="100%" maxW="900px" py={4} px={4}>
        <Flex align="center" gap={2} mb={6}>
          <LayoutDashboard size={24} />
          <Heading size="lg" fontSize="22">Homepage / Hero &amp; Side Cards</Heading>
        </Flex>
        <Text fontSize="sm" color="gray.600" mb={6}>
          Edit hero slider and the three side cards. Side card images are optional (gradient used if no image).
        </Text>

        <Box bg="white" p={6} borderRadius="lg" shadow="md" mb={6}>
          <Heading size="md" mb={4}>Hero slides</Heading>
          {heroSlides.map((slide, i) => (
            <Box key={i} borderWidth="1px" borderColor="gray.200" borderRadius="md" p={4} mb={4}>
              <Text fontWeight="700" mb={3}>Slide {i + 1}</Text>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                <FormControl><FormLabel>Tag</FormLabel><Input value={slide.tag || ""} onChange={(e) => updateSlide(i, "tag", e.target.value)} size="sm" /></FormControl>
                <FormControl><FormLabel>Title</FormLabel><Input value={slide.title || ""} onChange={(e) => updateSlide(i, "title", e.target.value)} size="sm" /></FormControl>
                <FormControl><FormLabel>Accent (subtitle)</FormLabel><Input value={slide.accent || ""} onChange={(e) => updateSlide(i, "accent", e.target.value)} size="sm" /></FormControl>
                <FormControl><FormLabel>Accent color (hex)</FormLabel><Input value={slide.accentColor || ""} onChange={(e) => updateSlide(i, "accentColor", e.target.value)} size="sm" placeholder="#f0c020" /></FormControl>
                <FormControl gridColumn={{ md: "1 / -1" }}><FormLabel>Description</FormLabel><Input value={slide.desc || ""} onChange={(e) => updateSlide(i, "desc", e.target.value)} size="sm" /></FormControl>
                <FormControl><FormLabel>CTA button</FormLabel><Input value={slide.cta || ""} onChange={(e) => updateSlide(i, "cta", e.target.value)} size="sm" /></FormControl>
                <FormControl><FormLabel>Secondary button</FormLabel><Input value={slide.ctaSec || ""} onChange={(e) => updateSlide(i, "ctaSec", e.target.value)} size="sm" /></FormControl>
                <FormControl><FormLabel>Background (two hex, comma-separated)</FormLabel><Input value={Array.isArray(slide.bg) ? slide.bg.join(", ") : ""} onChange={(e) => updateSlide(i, "bg", e.target.value)} size="sm" placeholder="#061806, #1a5c1a" /></FormControl>
              </Grid>
            </Box>
          ))}
        </Box>

        <Box bg="white" p={6} borderRadius="lg" shadow="md" mb={6}>
          <Heading size="md" mb={4}>Side cards</Heading>
          {sideCards.slice(0, 3).map((card, i) => (
            <Box key={i} borderWidth="1px" borderColor="gray.200" borderRadius="md" p={4} mb={4}>
              <Text fontWeight="700" mb={3}>Card {i + 1}</Text>
              <Box mb={3} h="80px" borderRadius="md" overflow="hidden" bg="gray.100">
                {card.imageUrl ? (
                  <img src={getImageUrl(card.imageUrl)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => e.target.style.display = "none"} />
                ) : (
                  <Box w="100%" h="100%" bgGradient={`linear(145deg, ${card.gradientColors?.[0] || "#1a0510"}, ${card.gradientColors?.[1] || "#5c0a30"})`} />
                )}
              </Box>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                <FormControl><FormLabel>Eyebrow</FormLabel><Input value={card.eyebrow || ""} onChange={(e) => updateCard(i, "eyebrow", e.target.value)} size="sm" /></FormControl>
                <FormControl><FormLabel>Title</FormLabel><Input value={card.title || ""} onChange={(e) => updateCard(i, "title", e.target.value)} size="sm" /></FormControl>
                <FormControl><FormLabel>CTA text</FormLabel><Input value={card.ctaText || ""} onChange={(e) => updateCard(i, "ctaText", e.target.value)} size="sm" /></FormControl>
                <FormControl><FormLabel>Link (URL or path)</FormLabel><Input value={card.link || ""} onChange={(e) => updateCard(i, "link", e.target.value)} size="sm" placeholder="/search?q=promotions" /></FormControl>
                <FormControl>
                  <FormLabel>Card image</FormLabel>
                  <Input
                    ref={(el) => { fileRefs.current[i] = el; }}
                    type="file"
                    accept="image/*"
                    size="sm"
                    onChange={(e) => handleCardImage(i, e)}
                  />
                  {uploadingCardIndex === i && <Text fontSize="xs" color="gray.500" mt={1}>Uploading…</Text>}
                </FormControl>
              </Grid>
            </Box>
          ))}
        </Box>

        <Button colorScheme="green" size="lg" onClick={handleSave} isLoading={saving}>Save all changes</Button>
      </Box>
    </Flex>
  );
}
