"use client";

import {
  useNewsArticleCreatePostMutation,
  useNewsArticleUpdateMutation,
  useNewsArticlesFetchMutation,
} from "@Slices/newsArticle.js";
import {
  Box, Flex, Heading, Text, Input, Textarea, Switch,
  FormControl, FormLabel, Button, VStack,
  useToast, Icon, SimpleGrid, Spinner,
} from "@chakra-ui/react";
import { FiArrowLeft, FiSave, FiImage, FiStar } from "react-icons/fi";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const DEFAULT_CATEGORIES = ["Company", "Promotions", "Food & Recipes", "Agriculture", "Technology", "General"];

const PRIMARY = "#185f2d";

const quillModules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};
const quillFormats = ["header", "bold", "italic", "underline", "list", "bullet", "link"];

function ArticleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const toast = useToast();
  const fileRef = useRef();

  const [form, setForm] = useState({
    title: "",
    summary: "",
    category: "General",
    author: "YooKatale Team",
    readTime: "3",
    featured: false,
    imageUrl: "",
  });
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(!!editId);
  const [availableCategories, setAvailableCategories] = useState(DEFAULT_CATEGORIES);

  const [createArticle] = useNewsArticleCreatePostMutation();
  const [updateArticle] = useNewsArticleUpdateMutation();
  const [fetchAllArticles] = useNewsArticlesFetchMutation();

  // load existing categories + article for edit
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchAllArticles().unwrap();
        if (res.status === "Success") {
          const cats = [...new Set(res.data.map((a) => a.category).filter(Boolean))];
          const merged = [...new Set([...DEFAULT_CATEGORIES, ...cats])];
          setAvailableCategories(merged);
        }
      } catch {}
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (!editId) return;
    const load = async () => {
      try {
        const res = await fetchAllArticles().unwrap();
        if (res.status === "Success") {
          const found = res.data.find((a) => a._id === editId);
          if (found) {
            setForm({
              title: found.title || "",
              summary: found.summary || "",
              category: found.category || "General",
              author: found.author || "YooKatale Team",
              readTime: String(found.readTime || 3),
              featured: !!found.featured,
              imageUrl: found.imageUrl || "",
            });
            setBody(found.article || "");
            setImagePreview(found.imageUrl || "");
          }
        }
      } catch {}
      setLoadingEdit(false);
    };
    load();
  }, [editId]);

  const handleField = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast({ title: "Title is required", status: "warning", duration: 2000 });
    if (!body.trim() || body === "<p><br></p>") return toast({ title: "Article body is required", status: "warning", duration: 2000 });

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("summary", form.summary);
      fd.append("category", form.category);
      fd.append("author", form.author);
      fd.append("readTime", form.readTime);
      fd.append("featured", String(form.featured));
      fd.append("article", body);
      if (form.imageUrl && !imageFile) fd.append("imageUrl", form.imageUrl);
      if (imageFile) fd.append("image", imageFile);

      let res;
      if (editId) {
        res = await updateArticle({ id: editId, data: fd }).unwrap();
      } else {
        res = await createArticle(fd).unwrap();
      }

      if (res.status === "Success") {
        toast({ title: editId ? "Article updated!" : "Article created!", status: "success", duration: 2500 });
        router.push("/newsblogs");
      }
    } catch (err) {
      toast({ title: err?.data?.message || "Failed to save article", status: "error", duration: 3000 });
    }
    setSaving(false);
  };

  if (loadingEdit) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="lg" color={PRIMARY} />
      </Flex>
    );
  }

  return (
    <Box maxW="900px" mx="auto" mt={10} px={{ base: 3, md: 6 }} pb={16}>
      {/* Header */}
      <Flex align="center" gap={3} mb={6}>
        <Link href="/newsblogs">
          <Button leftIcon={<FiArrowLeft />} variant="ghost" size="sm" color="gray.500" borderRadius="xl">
            Back
          </Button>
        </Link>
        <Box>
          <Heading size="lg" color="gray.800" fontWeight="800">
            {editId ? "Edit Article" : "New Article"}
          </Heading>
          <Text color="gray.500" fontSize="sm">{editId ? "Update this news article" : "Publish a new article to the news page"}</Text>
        </Box>
      </Flex>

      <form onSubmit={handleSubmit}>
        <VStack spacing={5} align="stretch">
          {/* Title */}
          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="700" color="gray.700" mb={1}>Title</FormLabel>
            <Input
              name="title" value={form.title} onChange={handleField}
              placeholder="Enter article title..." fontSize="md" fontWeight="600"
              bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200"
              h="48px" _focus={{ borderColor: PRIMARY, boxShadow: `0 0 0 1px ${PRIMARY}` }}
            />
          </FormControl>

          {/* Summary */}
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="700" color="gray.700" mb={1}>Summary / Excerpt</FormLabel>
            <Textarea
              name="summary" value={form.summary} onChange={handleField}
              placeholder="A short description shown on the news listing page..."
              bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200"
              rows={3} fontSize="sm" resize="vertical"
              _focus={{ borderColor: PRIMARY, boxShadow: `0 0 0 1px ${PRIMARY}` }}
            />
          </FormControl>

          {/* Meta fields */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="700" color="gray.700" mb={1}>Category</FormLabel>
              <Input
                list="category-options"
                name="category" value={form.category} onChange={handleField}
                placeholder="Select or type a new category..."
                bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200"
                h="42px" fontSize="sm"
                _focus={{ borderColor: PRIMARY, boxShadow: `0 0 0 1px ${PRIMARY}` }}
              />
              <datalist id="category-options">
                {availableCategories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="700" color="gray.700" mb={1}>Author</FormLabel>
              <Input
                name="author" value={form.author} onChange={handleField}
                bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200"
                h="42px" fontSize="sm"
                _focus={{ borderColor: PRIMARY, boxShadow: `0 0 0 1px ${PRIMARY}` }}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="700" color="gray.700" mb={1}>Read Time (minutes)</FormLabel>
              <Input
                name="readTime" type="number" min="1" max="60"
                value={form.readTime} onChange={handleField}
                bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200"
                h="42px" fontSize="sm"
                _focus={{ borderColor: PRIMARY, boxShadow: `0 0 0 1px ${PRIMARY}` }}
              />
            </FormControl>
          </SimpleGrid>

          {/* Featured toggle */}
          <FormControl>
            <Flex align="center" gap={3} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" p={4}>
              <Icon as={FiStar} color={form.featured ? "yellow.400" : "gray.300"} boxSize={5} />
              <Box flex={1}>
                <Text fontSize="sm" fontWeight="700" color="gray.700">Featured Article</Text>
                <Text fontSize="xs" color="gray.500">Featured articles appear prominently at the top of the news page</Text>
              </Box>
              <Switch
                isChecked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                colorScheme="green"
                size="md"
              />
            </Flex>
          </FormControl>

          {/* Image upload */}
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="700" color="gray.700" mb={1}>Cover Image</FormLabel>
            <Box
              border="2px dashed" borderColor={imagePreview ? "green.300" : "gray.200"}
              borderRadius="xl" p={4} bg={imagePreview ? "green.50" : "gray.50"}
              cursor="pointer" onClick={() => fileRef.current?.click()}
              transition="all 0.2s"
              _hover={{ borderColor: PRIMARY, bg: "green.50" }}
            >
              {imagePreview ? (
                <Flex gap={4} align="center">
                  <Box w="80px" h="60px" borderRadius="lg" overflow="hidden" flexShrink={0}>
                    <Box as="img" src={imagePreview} alt="preview" w="100%" h="100%" objectFit="cover" />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="green.700">Image selected</Text>
                    <Text fontSize="xs" color="gray.500">Click to change</Text>
                  </Box>
                </Flex>
              ) : (
                <Flex direction="column" align="center" py={4}>
                  <Icon as={FiImage} boxSize={8} color="gray.400" mb={2} />
                  <Text fontSize="sm" color="gray.600" fontWeight="600">Click to upload cover image</Text>
                  <Text fontSize="xs" color="gray.400">JPG, PNG, WebP — recommended 1200×630px</Text>
                </Flex>
              )}
            </Box>
            <input
              ref={fileRef} type="file" accept="image/*"
              style={{ display: "none" }} onChange={handleImageChange}
            />
            {/* Or paste URL */}
            <Box mt={2}>
              <Input
                name="imageUrl" value={imageFile ? "" : form.imageUrl}
                onChange={handleField}
                placeholder="Or paste an image URL..."
                fontSize="xs" h="36px" bg="white" borderRadius="lg"
                border="1px solid" borderColor="gray.200"
                disabled={!!imageFile}
                _focus={{ borderColor: PRIMARY, boxShadow: `0 0 0 1px ${PRIMARY}` }}
              />
            </Box>
          </FormControl>

          {/* Article body */}
          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="700" color="gray.700" mb={1}>Article Body</FormLabel>
            <Box
              border="1px solid" borderColor="gray.200" borderRadius="xl" overflow="hidden"
              bg="white"
              sx={{
                ".ql-toolbar": { borderBottom: "1px solid", borderColor: "gray.200", bg: "gray.50", borderTop: "none", borderLeft: "none", borderRight: "none" },
                ".ql-container": { border: "none", minHeight: "320px", fontSize: "15px" },
                ".ql-editor": { minHeight: "320px", lineHeight: "1.8", padding: "16px" },
              }}
            >
              <ReactQuill
                theme="snow"
                value={body}
                onChange={setBody}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Write the full article content here..."
              />
            </Box>
          </FormControl>

          {/* Submit */}
          <Flex justify="flex-end" gap={3} pt={2}>
            <Link href="/newsblogs">
              <Button variant="outline" borderRadius="xl" size="md" color="gray.600" borderColor="gray.200">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit" leftIcon={<FiSave />}
              bg={PRIMARY} color="white" _hover={{ bg: "#1f793a" }}
              borderRadius="xl" size="md" px={8} fontWeight="700"
              isLoading={saving} loadingText="Saving..."
            >
              {editId ? "Update Article" : "Publish Article"}
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  );
}

export default function NewsArticlePage() {
  return (
    <Suspense fallback={<Flex justify="center" align="center" minH="60vh"><Spinner size="lg" /></Flex>}>
      <ArticleForm />
    </Suspense>
  );
}
