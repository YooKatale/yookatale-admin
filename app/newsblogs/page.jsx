"use client";

import {
  useNewsArticlesFetchMutation,
  useNewsArticleDeleteMutation,
  useNewsArticleUpdateMutation,
} from "@Slices/newsArticle.js";
import {
  Box, Flex, Heading, Text, Badge, Input, InputGroup, InputLeftElement,
  SimpleGrid, Skeleton, HStack, VStack, Button, Icon, useToast,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, Stat, StatLabel, StatNumber,
  Menu, MenuButton, MenuList, MenuItem,
} from "@chakra-ui/react";
import {
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiStar, FiImage,
  FiClock, FiUser, FiExternalLink,
} from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import moment from "moment";

const CATEGORY_COLORS = {
  Company: "green", Promotions: "orange", "Food & Recipes": "yellow",
  Agriculture: "teal", Technology: "blue", General: "gray",
};
const PRIMARY = "#185f2d";

function StatCard({ label, value, color = "gray.800" }) {
  return (
    <Box bg="white" borderRadius="xl" p={5} border="1px solid" borderColor="gray.100" boxShadow="0 2px 8px rgba(0,0,0,0.05)">
      <Stat>
        <StatLabel color="gray.500" fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="wider">{label}</StatLabel>
        <StatNumber fontSize="2xl" fontWeight="800" color={color}>{value}</StatNumber>
      </Stat>
    </Box>
  );
}

export default function NewsArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const cancelRef = useRef();
  const toast = useToast();

  const [fetchArticles] = useNewsArticlesFetchMutation();
  const [deleteArticle] = useNewsArticleDeleteMutation();
  const [updateArticle] = useNewsArticleUpdateMutation();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchArticles().unwrap();
      if (res.status === "Success") setArticles(res.data);
    } catch {
      toast({ title: "Failed to load articles", status: "error", duration: 3000 });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = articles.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.title?.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q) || a.author?.toLowerCase().includes(q);
  });

  const handleToggleFeatured = async (article) => {
    setTogglingId(article._id);
    try {
      const fd = new FormData();
      fd.append("featured", String(!article.featured));
      const res = await updateArticle({ id: article._id, data: fd }).unwrap();
      if (res.status === "Success") {
        setArticles((prev) => prev.map((a) => a._id === article._id ? { ...a, featured: !article.featured } : a));
        toast({ title: article.featured ? "Removed from featured" : "Marked as featured", status: "success", duration: 2000 });
      }
    } catch {
      toast({ title: "Failed to update", status: "error", duration: 2000 });
    }
    setTogglingId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await deleteArticle(deleteId).unwrap();
      if (res.status === "Success") {
        setArticles((prev) => prev.filter((a) => a._id !== deleteId));
        toast({ title: "Article deleted", status: "success", duration: 2000 });
      }
    } catch {
      toast({ title: "Failed to delete article", status: "error", duration: 3000 });
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const stats = {
    total: articles.length,
    featured: articles.filter((a) => a.featured).length,
    categories: [...new Set(articles.map((a) => a.category).filter(Boolean))].length,
  };

  return (
    <Box maxW="full" mt={10} px={{ base: 3, md: 6 }} pb={10}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color="gray.800" fontWeight="800">News Articles</Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>Manage articles published on the YooKatale news page</Text>
        </Box>
        <Link href="/newsarticle">
          <Button leftIcon={<FiPlus />} bg={PRIMARY} color="white" _hover={{ bg: "#1f793a" }} borderRadius="xl" fontWeight="700" size="sm" px={5}>
            New Article
          </Button>
        </Link>
      </Flex>

      {/* Stats */}
      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} mb={6}>
        <StatCard label="Total Articles" value={stats.total} />
        <StatCard label="Featured" value={stats.featured} color={PRIMARY} />
        <StatCard label="Categories" value={stats.categories} />
      </SimpleGrid>

      {/* Search */}
      <Box mb={6}>
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none" h="40px">
            <Icon as={FiSearch} color="gray.400" boxSize="14px" />
          </InputLeftElement>
          <Input
            h="40px" pl="2.5rem" fontSize="sm" bg="white" borderRadius="xl"
            border="1px solid" borderColor="gray.200"
            placeholder="Search by title, category, author..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            _focus={{ borderColor: PRIMARY, boxShadow: `0 0 0 1px ${PRIMARY}` }}
          />
        </InputGroup>
      </Box>

      {/* Articles grid */}
      {loading ? (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={5}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Box key={i} borderRadius="xl" overflow="hidden" bg="white" border="1px solid" borderColor="gray.100">
              <Skeleton h="160px" />
              <Box p={4}>
                <Skeleton h="10px" w="30%" mb={2} />
                <Skeleton h="16px" mb={2} />
                <Skeleton h="16px" w="75%" mb={3} />
                <Skeleton h="10px" w="50%" />
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" py={20} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100">
          <Text fontSize="4xl" mb={3}>📰</Text>
          <Heading size="sm" color="gray.600" mb={2}>
            {search ? "No articles match your search" : "No articles yet"}
          </Heading>
          <Text color="gray.400" fontSize="sm" mb={4}>
            {search ? "Try a different keyword" : "Create your first news article"}
          </Text>
          {!search && (
            <Link href="/newsarticle">
              <Button leftIcon={<FiPlus />} bg={PRIMARY} color="white" _hover={{ bg: "#1f793a" }} size="sm" borderRadius="xl">
                Create Article
              </Button>
            </Link>
          )}
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={5}>
          {filtered.map((article) => (
            <Box
              key={article._id}
              bg="white" borderRadius="xl" overflow="hidden"
              border="1px solid" borderColor="gray.100"
              boxShadow="0 2px 8px rgba(0,0,0,0.05)"
              transition="all 0.2s"
              _hover={{ boxShadow: "0 8px 24px rgba(0,0,0,0.1)", borderColor: "green.200" }}
            >
              {/* Image */}
              <Box position="relative" h="160px" overflow="hidden" bg="gray.100">
                {article.imageUrl ? (
                  <Box
                    as="img" src={article.imageUrl} alt={article.title}
                    w="100%" h="100%" objectFit="cover"
                  />
                ) : (
                  <Flex h="100%" align="center" justify="center">
                    <Icon as={FiImage} color="gray.300" boxSize={8} />
                  </Flex>
                )}
                {article.featured && (
                  <Box position="absolute" top={2} right={2}>
                    <Badge bg="yellow.400" color="yellow.900" borderRadius="full" px={2} py={0.5} fontSize="9px" fontWeight="800">
                      FEATURED
                    </Badge>
                  </Box>
                )}
                <Box position="absolute" top={2} left={2}>
                  <Badge
                    colorScheme={CATEGORY_COLORS[article.category] || "gray"}
                    borderRadius="full" px={2} py={0.5} fontSize="9px" fontWeight="700"
                  >
                    {article.category || "General"}
                  </Badge>
                </Box>
              </Box>

              {/* Content */}
              <Box p={4}>
                <Text fontWeight="700" fontSize="sm" color="gray.800" lineHeight="1.4" mb={1} noOfLines={2}>
                  {article.title}
                </Text>
                {article.summary && (
                  <Text fontSize="xs" color="gray.500" noOfLines={2} mb={3} lineHeight="1.5">
                    {article.summary}
                  </Text>
                )}
                <HStack spacing={3} fontSize="xs" color="gray.400" mb={3} flexWrap="wrap">
                  <HStack spacing={1}><Icon as={FiUser} /><Text noOfLines={1}>{article.author || "YooKatale Team"}</Text></HStack>
                  <HStack spacing={1}><Icon as={FiClock} /><Text>{article.readTime || 3} min</Text></HStack>
                </HStack>
                <Text fontSize="10px" color="gray.300" mb={3}>{moment(article.createdAt).format("DD MMM YYYY")}</Text>

                {/* Actions */}
                <Flex gap={2} flexWrap="wrap">
                  <Link href={`/newsarticle?id=${article._id}`} style={{ flex: 1, minWidth: "70px" }}>
                    <Button
                      leftIcon={<FiEdit2 />} size="xs" variant="outline"
                      borderColor="gray.200" color="gray.600" borderRadius="lg"
                      w="100%" _hover={{ borderColor: PRIMARY, color: PRIMARY }}
                      fontWeight="600"
                    >
                      Edit
                    </Button>
                  </Link>
                  <Button
                    leftIcon={<FiStar />} size="xs" variant="outline"
                    borderColor={article.featured ? "yellow.300" : "gray.200"}
                    color={article.featured ? "yellow.600" : "gray.400"}
                    bg={article.featured ? "yellow.50" : "transparent"}
                    borderRadius="lg" fontWeight="600"
                    isLoading={togglingId === article._id}
                    onClick={() => handleToggleFeatured(article)}
                    _hover={{ borderColor: "yellow.400", color: "yellow.600", bg: "yellow.50" }}
                    title={article.featured ? "Remove from featured" : "Mark as featured"}
                  >
                    {article.featured ? "Unfeature" : "Feature"}
                  </Button>
                  <Button
                    leftIcon={<FiExternalLink />} size="xs" variant="ghost"
                    color="blue.500" borderRadius="lg" fontWeight="600"
                    as="a" href={`https://www.yookatale.app/news/${article.slug || article._id}`} target="_blank"
                    _hover={{ bg: "blue.50" }}
                    title="View on website"
                  >
                    View
                  </Button>
                  <Button
                    leftIcon={<FiTrash2 />} size="xs" colorScheme="red" variant="ghost"
                    borderRadius="lg" fontWeight="600"
                    onClick={() => setDeleteId(article._id)}
                  >
                    Delete
                  </Button>
                </Flex>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {/* Delete confirmation */}
      <AlertDialog isOpen={!!deleteId} leastDestructiveRef={cancelRef} onClose={() => setDeleteId(null)}>
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="md" fontWeight="700">Delete Article</AlertDialogHeader>
            <AlertDialogBody fontSize="sm" color="gray.600">
              Are you sure you want to delete this article? This cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter gap={2}>
              <Button ref={cancelRef} onClick={() => setDeleteId(null)} size="sm" borderRadius="lg" variant="outline">
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} isLoading={deleting} size="sm" borderRadius="lg">
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
