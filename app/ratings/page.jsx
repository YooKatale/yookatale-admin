"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Badge,
  Select,
  HStack,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useGetAppRatingsMutation, useGetPlatformFeedbackMutation, useGetProductRatingsMutation } from "@/Slices/ratingsApiSlice";

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
  const toast = useToast();

  useEffect(() => {
    loadAppRatings();
    loadPlatformFeedback();
    loadProductRatings();
  }, []);

  const loadAppRatings = async () => {
    setIsLoadingApp(true);
    try {
      const params = {};
      if (platformFilter) params.platform = platformFilter;
      
      const res = await getAppRatings(params).unwrap();
      if (res.status === "Success") {
        setAppRatings(res.data || []);
        setAppStats(res.stats || null);
      }
    } catch (error) {
      console.error("Error loading app ratings:", error);
      toast({
        title: "Error",
        description: error?.data?.message || error?.message || "Failed to load app ratings",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoadingApp(false);
    }
  };

  const loadPlatformFeedback = async () => {
    setIsLoadingPlatform(true);
    try {
      const params = {};
      if (platformFilter) params.platform = platformFilter;
      if (categoryFilter) params.category = categoryFilter;
      
      const res = await getPlatformFeedback(params).unwrap();
      if (res.status === "Success") {
        setPlatformFeedback(res.data || []);
        setPlatformStats(res.stats || null);
      }
    } catch (error) {
      console.error("Error loading platform feedback:", error);
      toast({
        title: "Error",
        description: error?.data?.message || error?.message || "Failed to load platform feedback",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoadingPlatform(false);
    }
  };

  const loadProductRatings = async () => {
    setIsLoadingProduct(true);
    try {
      const res = await getProductRatings().unwrap();
      if (res.status === "Success") {
        setProductRatings(res.data || []);
        setProductStats(res.stats || null);
      }
    } catch (error) {
      console.error("Error loading product ratings:", error);
      toast({
        title: "Error",
        description: error?.data?.message || error?.message || "Failed to load product ratings",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "green";
    if (rating >= 3) return "yellow";
    return "red";
  };

  const getPlatformBadgeColor = (platform) => {
    switch (platform) {
      case "ios": return "blue";
      case "android": return "green";
      case "web": return "purple";
      default: return "gray";
    }
  };

  return (
    <Box p={8}>
      <Heading mb={6}>Ratings & Feedback</Heading>

      <Tabs>
        <TabList>
          <Tab>App Ratings</Tab>
          <Tab>Platform Feedback</Tab>
          <Tab>Product Ratings & Comments</Tab>
        </TabList>

        <TabPanels>
          {/* App Ratings Tab */}
          <TabPanel>
            <VStack align="stretch" spacing={4}>
              {/* Filters */}
              <HStack>
                <Select
                  placeholder="Filter by Platform"
                  value={platformFilter}
                  onChange={(e) => {
                    setPlatformFilter(e.target.value);
                    setTimeout(loadAppRatings, 100);
                  }}
                  width="200px"
                >
                  <option value="">All Platforms</option>
                  <option value="ios">iOS</option>
                  <option value="android">Android</option>
                  <option value="web">Web</option>
                </Select>
              </HStack>

              {/* Stats */}
              {appStats && (
                <HStack spacing={4}>
                  <Stat>
                    <StatLabel>Total Ratings</StatLabel>
                    <StatNumber>{appStats.total}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Average Rating</StatLabel>
                    <StatNumber>{appStats.average?.toFixed(1) || "0.0"}</StatNumber>
                    <StatHelpText>/ 5.0</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Redirected to Store</StatLabel>
                    <StatNumber>{appStats.redirectedToStore || 0}</StatNumber>
                  </Stat>
                </HStack>
              )}

              {/* Ratings Table */}
              {isLoadingApp ? (
                <Center p={8}>
                  <Spinner size="xl" />
                </Center>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Date</Th>
                        <Th>User</Th>
                        <Th>Rating</Th>
                        <Th>Platform</Th>
                        <Th>Redirected to Store</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {appRatings.length === 0 ? (
                        <Tr>
                          <Td colSpan={5} textAlign="center">
                            <Text color="gray.500">No app ratings found</Text>
                          </Td>
                        </Tr>
                      ) : (
                        appRatings.map((rating) => (
                          <Tr key={rating._id}>
                            <Td>
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </Td>
                            <Td>
                              {rating.userName || rating.userEmail || "Anonymous"}
                            </Td>
                            <Td>
                              <Badge colorScheme={getRatingColor(rating.rating)}>
                                {rating.rating} / 5
                              </Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme={getPlatformBadgeColor(rating.platform)}>
                                {rating.platform}
                              </Badge>
                            </Td>
                            <Td>
                              {rating.redirectedToStore ? (
                                <Badge colorScheme="green">Yes</Badge>
                              ) : (
                                <Badge colorScheme="gray">No</Badge>
                              )}
                            </Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </VStack>
          </TabPanel>

          {/* Platform Feedback Tab */}
          <TabPanel>
            <VStack align="stretch" spacing={4}>
              {/* Filters */}
              <HStack>
                <Select
                  placeholder="Filter by Platform"
                  value={platformFilter}
                  onChange={(e) => {
                    setPlatformFilter(e.target.value);
                    setTimeout(loadPlatformFeedback, 100);
                  }}
                  width="200px"
                >
                  <option value="">All Platforms</option>
                  <option value="ios">iOS</option>
                  <option value="android">Android</option>
                  <option value="web">Web</option>
                </Select>
                <Select
                  placeholder="Filter by Category"
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setTimeout(loadPlatformFeedback, 100);
                  }}
                  width="200px"
                >
                  <option value="">All Categories</option>
                  <option value="general">General</option>
                  <option value="service">Service</option>
                  <option value="delivery">Delivery</option>
                  <option value="product">Product</option>
                  <option value="app">App</option>
                  <option value="other">Other</option>
                </Select>
              </HStack>

              {/* Stats */}
              {platformStats && (
                <HStack spacing={4} flexWrap="wrap">
                  <Stat>
                    <StatLabel>Total Feedback</StatLabel>
                    <StatNumber>{platformStats.total}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Average Rating</StatLabel>
                    <StatNumber>{platformStats.average?.toFixed(1) || "0.0"}</StatNumber>
                    <StatHelpText>/ 5.0</StatHelpText>
                  </Stat>
                </HStack>
              )}

              {/* Feedback Table */}
              {isLoadingPlatform ? (
                <Center p={8}>
                  <Spinner size="xl" />
                </Center>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Date</Th>
                        <Th>User</Th>
                        <Th>Rating</Th>
                        <Th>Platform</Th>
                        <Th>Category</Th>
                        <Th>Feedback</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {platformFeedback.length === 0 ? (
                        <Tr>
                          <Td colSpan={6} textAlign="center">
                            <Text color="gray.500">No platform feedback found</Text>
                          </Td>
                        </Tr>
                      ) : (
                        platformFeedback.map((feedback) => (
                          <Tr key={feedback._id}>
                            <Td>
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </Td>
                            <Td>
                              {feedback.userName || feedback.userEmail || "Anonymous"}
                            </Td>
                            <Td>
                              <Badge colorScheme={getRatingColor(feedback.rating)}>
                                {feedback.rating} / 5
                              </Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme={getPlatformBadgeColor(feedback.platform)}>
                                {feedback.platform}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge>{feedback.category || "general"}</Badge>
                            </Td>
                            <Td>
                              <Text fontSize="sm" maxW="400px" whiteSpace="pre-wrap" wordBreak="break-word">
                                {feedback.feedback || "No feedback provided"}
                              </Text>
                            </Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </VStack>
          </TabPanel>

          {/* Product Ratings & Comments Tab */}
          <TabPanel>
            <VStack align="stretch" spacing={4}>
              {/* Stats */}
              {productStats && (
                <HStack spacing={4} flexWrap="wrap">
                  <Stat>
                    <StatLabel>Total Ratings</StatLabel>
                    <StatNumber>{productStats.total}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Average Rating</StatLabel>
                    <StatNumber>{productStats.average?.toFixed(1) || "0.0"}</StatNumber>
                    <StatHelpText>/ 5.0</StatHelpText>
                  </Stat>
                </HStack>
              )}

              {/* Product Ratings Table */}
              {isLoadingProduct ? (
                <Center p={8}>
                  <Spinner size="xl" />
                </Center>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Date</Th>
                        <Th>User</Th>
                        <Th>Product</Th>
                        <Th>Rating</Th>
                        <Th>Comment</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {productRatings.length === 0 ? (
                        <Tr>
                          <Td colSpan={5} textAlign="center">
                            <Text color="gray.500">No product ratings found</Text>
                          </Td>
                        </Tr>
                      ) : (
                        productRatings.map((rating) => (
                          <Tr key={rating._id}>
                            <Td>
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </Td>
                            <Td>
                              {rating.userName || rating.userEmail || "Anonymous"}
                            </Td>
                            <Td>
                              <Text fontSize="sm" fontWeight="medium">
                                {rating.productId?.name || "Unknown Product"}
                              </Text>
                            </Td>
                            <Td>
                              <Badge colorScheme={getRatingColor(rating.rating)}>
                                {rating.rating} / 5
                              </Badge>
                            </Td>
                            <Td>
                              <Text fontSize="sm" maxW="400px" whiteSpace="pre-wrap" wordBreak="break-word">
                                {rating.comment || "No comment"}
                              </Text>
                            </Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
