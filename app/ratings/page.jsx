"use client";

import { useState, useEffect } from "react";
import {
  Box, Flex, Heading, Text, SimpleGrid, Tabs, TabList, TabPanels,
  Tab, TabPanel, HStack, VStack, Badge, Button, Select, Spinner,
  Center, Icon,
} from "@chakra-ui/react";
import { Star, MessageSquare, Smartphone, RefreshCw, TrendingUp, Filter } from "lucide-react";
import { useGetAppRatingsMutation, useGetPlatformFeedbackMutation, useGetProductRatingsMutation } from "@/Slices/ratingsApiSlice";

const PRIMARY = "#185f2d";

function StarRating({ rating, max = 5 }) {
  return (
    <HStack spacing={0.5}>
      {[...Array(max)].map((_, i) => (
        <Icon
          key={i}
          as={Star}
          boxSize={3.5}
          color={i < rating ? "#F6A623" : "#E2E8F0"}
          fill={i < rating ? "#F6A623" : "none"}
          stroke={i < rating ? "#F6A623" : "#CBD5E0"}
        />
      ))}
      <Text fontSize="xs" color="gray.500" ml={1}>{rating}/5</Text>
    </HStack>
  );
}

function StatCard({ icon: IconComp, label, value, sub, color = "gray.800" }) {
  return (
    <Box bg="white" borderRadius="xl" p={4} border="1px solid" borderColor="gray.100" boxShadow="0 2px 8px rgba(0,0,0,0.05)">
      <Flex justify="space-between" align="center">
        <Box>
          <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color="gray.400" mb={1}>{label}</Text>
          <Text fontSize="2xl" fontWeight="800" color={color}>{value}</Text>
          {sub && <Text fontSize="xs" color="gray.500" mt={0.5}>{sub}</Text>}
        </Box>
        <Box p={3} borderRadius="xl" bg="gray.50">
          <IconComp size={20} color="#9ca3af" />
        </Box>
      </Flex>
    </Box>
  );
}

function PlatformBadge({ platform }) {
  const colors = { ios: "blue", android: "green", web: "purple" };
  return (
    <Badge colorScheme={colors[platform] || "gray"} borderRadius="full" fontSize="xs" px={2} textTransform="capitalize">
      {platform || "web"}
    </Badge>
  );
}

function EmptyState({ label }) {
  return (
    <Center py={16} flexDirection="column" gap={3}>
      <Box p={4} borderRadius="xl" bg="gray.50">
        <Star size={28} color="#CBD5E0" />
      </Box>
      <Text color="gray.400" fontSize="sm">{label}</Text>
    </Center>
  );
}

function TableHeader({ cols }) {
  return (
    <Flex
      px={4} py={2.5}
      borderBottom="1px solid" borderColor="gray.100"
      bg="gray.50"
      fontSize="xs" fontWeight="700" color="gray.500"
      textTransform="uppercase" letterSpacing="wider"
      gap={4}
    >
      {cols.map(({ label, flex }) => (
        <Text key={label} flex={flex}>{label}</Text>
      ))}
    </Flex>
  );
}

function TableRow({ children }) {
  return (
    <Flex
      align="center" px={4} py={3}
      borderBottom="1px solid" borderColor="gray.50"
      bg="white" _hover={{ bg: "gray.50" }}
      transition="background 0.1s" fontSize="sm" gap={4}
    >
      {children}
    </Flex>
  );
}

export default function RatingsPage() {
  const [appRatings, setAppRatings] = useState([]);
  const [platformFeedback, setPlatformFeedback] = useState([]);
  const [productRatings, setProductRatings] = useState([]);
  const [appStats, setAppStats] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [productStats, setProductStats] = useState(null);
  const [isLoadingApp, setIsLoadingApp] = useState(false);
  const [isLoadingPlatform, setIsLoadingPlatform] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [platformFilter, setPlatformFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [getAppRatings] = useGetAppRatingsMutation();
  const [getPlatformFeedback] = useGetPlatformFeedbackMutation();
  const [getProductRatings] = useGetProductRatingsMutation();

  const loadAppRatings = async () => {
    setIsLoadingApp(true);
    try {
      const res = await getAppRatings(platformFilter ? { platform: platformFilter } : {}).unwrap();
      if (res.status === "Success") { setAppRatings(res.data || []); setAppStats(res.stats || null); }
    } catch {}
    setIsLoadingApp(false);
  };

  const loadPlatformFeedback = async () => {
    setIsLoadingPlatform(true);
    try {
      const params = {};
      if (platformFilter) params.platform = platformFilter;
      if (categoryFilter) params.category = categoryFilter;
      const res = await getPlatformFeedback(params).unwrap();
      if (res.status === "Success") { setPlatformFeedback(res.data || []); setPlatformStats(res.stats || null); }
    } catch {}
    setIsLoadingPlatform(false);
  };

  const loadProductRatings = async () => {
    setIsLoadingProduct(true);
    try {
      const res = await getProductRatings().unwrap();
      if (res.status === "Success") { setProductRatings(res.data || []); setProductStats(res.stats || null); }
    } catch {}
    setIsLoadingProduct(false);
  };

  useEffect(() => {
    loadAppRatings();
    loadPlatformFeedback();
    loadProductRatings();
  }, []);

  const refreshAll = () => { loadAppRatings(); loadPlatformFeedback(); loadProductRatings(); };

  return (
    <Box maxW="full" pb={10}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color="gray.800" fontWeight="800">Ratings & Feedback</Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>User reviews, app ratings, and product comments</Text>
        </Box>
        <Button
          leftIcon={<RefreshCw size={14} />}
          variant="outline" size="sm" borderRadius="xl"
          borderColor="gray.200" color="gray.600"
          onClick={refreshAll}
          isLoading={isLoadingApp || isLoadingPlatform || isLoadingProduct}
        >
          Refresh
        </Button>
      </Flex>

      {/* Overview Stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <StatCard icon={Smartphone} label="App Ratings" value={appStats?.total ?? "—"} sub={appStats ? `Avg ${appStats.average?.toFixed(1)}/5` : undefined} color={PRIMARY} />
        <StatCard icon={MessageSquare} label="Platform Feedback" value={platformStats?.total ?? "—"} sub={platformStats ? `Avg ${platformStats.average?.toFixed(1)}/5` : undefined} />
        <StatCard icon={Star} label="Product Reviews" value={productStats?.total ?? "—"} sub={productStats ? `Avg ${productStats.average?.toFixed(1)}/5` : undefined} color="orange.500" />
        <StatCard icon={TrendingUp} label="Store Redirects" value={appStats?.redirectedToStore ?? "—"} sub="From app ratings" />
      </SimpleGrid>

      {/* Tabs */}
      <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100" boxShadow="0 2px 8px rgba(0,0,0,0.05)" overflow="hidden">
        <Tabs colorScheme="green">
          <TabList borderBottomColor="gray.100" px={4} pt={1}>
            <Tab fontSize="sm" fontWeight="600" py={4} _selected={{ color: PRIMARY, borderColor: PRIMARY }}>
              <HStack spacing={2}>
                <Smartphone size={15} />
                <Text>App Ratings</Text>
                {(appStats?.total ?? 0) > 0 && (
                  <Badge bg={PRIMARY} color="white" borderRadius="full" fontSize="xs" px={2}>{appStats.total}</Badge>
                )}
              </HStack>
            </Tab>
            <Tab fontSize="sm" fontWeight="600" py={4} _selected={{ color: PRIMARY, borderColor: PRIMARY }}>
              <HStack spacing={2}>
                <MessageSquare size={15} />
                <Text>Platform Feedback</Text>
                {(platformStats?.total ?? 0) > 0 && (
                  <Badge bg={PRIMARY} color="white" borderRadius="full" fontSize="xs" px={2}>{platformStats.total}</Badge>
                )}
              </HStack>
            </Tab>
            <Tab fontSize="sm" fontWeight="600" py={4} _selected={{ color: PRIMARY, borderColor: PRIMARY }}>
              <HStack spacing={2}>
                <Star size={15} />
                <Text>Product Reviews</Text>
                {(productStats?.total ?? 0) > 0 && (
                  <Badge bg={PRIMARY} color="white" borderRadius="full" fontSize="xs" px={2}>{productStats.total}</Badge>
                )}
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* App Ratings */}
            <TabPanel p={0}>
              <Flex px={4} py={3} gap={3} borderBottom="1px solid" borderColor="gray.50" flexWrap="wrap" align="center">
                <HStack spacing={2} color="gray.400">
                  <Filter size={14} />
                  <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider">Filter</Text>
                </HStack>
                <Select
                  size="sm" value={platformFilter}
                  onChange={(e) => { setPlatformFilter(e.target.value); setTimeout(loadAppRatings, 100); }}
                  maxW="160px" borderRadius="lg" borderColor="gray.200" fontSize="sm"
                >
                  <option value="">All Platforms</option>
                  <option value="ios">iOS</option>
                  <option value="android">Android</option>
                  <option value="web">Web</option>
                </Select>
              </Flex>
              {isLoadingApp ? (
                <Center py={12}><Spinner color={PRIMARY} size="lg" /></Center>
              ) : appRatings.length === 0 ? (
                <EmptyState label="No app ratings yet" />
              ) : (
                <Box overflowX="auto">
                  <TableHeader cols={[
                    { label: "Date", flex: "1.5" },
                    { label: "User", flex: "2" },
                    { label: "Rating", flex: "2" },
                    { label: "Platform", flex: "1.2" },
                    { label: "Store Visit", flex: "1.5" },
                  ]} />
                  {appRatings.map((r) => (
                    <TableRow key={r._id}>
                      <Text flex="1.5" fontSize="xs" color="gray.400">{new Date(r.createdAt).toLocaleDateString()}</Text>
                      <Box flex="2">
                        <Text fontWeight="500" fontSize="sm" noOfLines={1}>{r.userName || r.userEmail || "Anonymous"}</Text>
                        {r.userEmail && r.userName && <Text fontSize="xs" color="gray.400" noOfLines={1}>{r.userEmail}</Text>}
                      </Box>
                      <Box flex="2"><StarRating rating={r.rating} /></Box>
                      <Box flex="1.2"><PlatformBadge platform={r.platform} /></Box>
                      <Box flex="1.5">
                        <Badge colorScheme={r.redirectedToStore ? "green" : "gray"} borderRadius="full" fontSize="xs" px={2}>
                          {r.redirectedToStore ? "Visited Store" : "No"}
                        </Badge>
                      </Box>
                    </TableRow>
                  ))}
                </Box>
              )}
            </TabPanel>

            {/* Platform Feedback */}
            <TabPanel p={0}>
              <Flex px={4} py={3} gap={3} borderBottom="1px solid" borderColor="gray.50" flexWrap="wrap" align="center">
                <HStack spacing={2} color="gray.400">
                  <Filter size={14} />
                  <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider">Filter</Text>
                </HStack>
                <Select
                  size="sm" value={platformFilter}
                  onChange={(e) => { setPlatformFilter(e.target.value); setTimeout(loadPlatformFeedback, 100); }}
                  maxW="160px" borderRadius="lg" borderColor="gray.200" fontSize="sm"
                >
                  <option value="">All Platforms</option>
                  <option value="ios">iOS</option>
                  <option value="android">Android</option>
                  <option value="web">Web</option>
                </Select>
                <Select
                  size="sm" value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setTimeout(loadPlatformFeedback, 100); }}
                  maxW="160px" borderRadius="lg" borderColor="gray.200" fontSize="sm"
                >
                  <option value="">All Categories</option>
                  <option value="general">General</option>
                  <option value="service">Service</option>
                  <option value="delivery">Delivery</option>
                  <option value="product">Products</option>
                  <option value="app">App</option>
                  <option value="other">Other</option>
                </Select>
              </Flex>
              {isLoadingPlatform ? (
                <Center py={12}><Spinner color={PRIMARY} size="lg" /></Center>
              ) : platformFeedback.length === 0 ? (
                <EmptyState label="No platform feedback yet" />
              ) : (
                <Box overflowX="auto">
                  <TableHeader cols={[
                    { label: "Date", flex: "1.5" },
                    { label: "User", flex: "2" },
                    { label: "Rating", flex: "2" },
                    { label: "Platform", flex: "1.2" },
                    { label: "Category", flex: "1.2" },
                    { label: "Feedback", flex: "3" },
                  ]} />
                  {platformFeedback.map((f) => (
                    <TableRow key={f._id}>
                      <Text flex="1.5" fontSize="xs" color="gray.400">{new Date(f.createdAt).toLocaleDateString()}</Text>
                      <Box flex="2"><Text fontWeight="500" fontSize="sm" noOfLines={1}>{f.userName || f.userEmail || "Anonymous"}</Text></Box>
                      <Box flex="2"><StarRating rating={f.rating} /></Box>
                      <Box flex="1.2"><PlatformBadge platform={f.platform} /></Box>
                      <Box flex="1.2">
                        <Badge borderRadius="full" fontSize="xs" px={2} colorScheme="purple" textTransform="capitalize">
                          {f.category || "general"}
                        </Badge>
                      </Box>
                      <Text flex="3" fontSize="sm" color="gray.600" noOfLines={2}>
                        {f.feedback || <Text as="span" color="gray.400" fontStyle="italic">No comment</Text>}
                      </Text>
                    </TableRow>
                  ))}
                </Box>
              )}
            </TabPanel>

            {/* Product Reviews */}
            <TabPanel p={0}>
              {isLoadingProduct ? (
                <Center py={12}><Spinner color={PRIMARY} size="lg" /></Center>
              ) : productRatings.length === 0 ? (
                <EmptyState label="No product reviews yet" />
              ) : (
                <Box overflowX="auto">
                  <TableHeader cols={[
                    { label: "Date", flex: "1.5" },
                    { label: "User", flex: "2" },
                    { label: "Product", flex: "2.5" },
                    { label: "Rating", flex: "2" },
                    { label: "Comment", flex: "3" },
                  ]} />
                  {productRatings.map((r) => (
                    <TableRow key={r._id}>
                      <Text flex="1.5" fontSize="xs" color="gray.400">{new Date(r.createdAt).toLocaleDateString()}</Text>
                      <Box flex="2"><Text fontWeight="500" fontSize="sm" noOfLines={1}>{r.userName || r.userEmail || "Anonymous"}</Text></Box>
                      <Text flex="2.5" fontSize="sm" fontWeight="600" color="gray.700" noOfLines={1}>{r.productId?.name || "Unknown Product"}</Text>
                      <Box flex="2"><StarRating rating={r.rating} /></Box>
                      <Text flex="3" fontSize="sm" color="gray.600" noOfLines={2}>
                        {r.comment || <Text as="span" color="gray.400" fontStyle="italic">No comment</Text>}
                      </Text>
                    </TableRow>
                  ))}
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}
