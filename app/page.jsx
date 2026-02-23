"use client";

import Navbar from "@/components/Navbar";
import Sidenav from "@/components/Sidenav";
import { useDashboardDataMutation } from "@Slices/userApiSlice";
import { useVendorGetMutation } from "@Slices/vendorApiSlice";
import { usePartnerGetMutation } from "@Slices/partnersApiSlice";
import { Button } from "@components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import moment from "moment/moment";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Box, Input, InputGroup, InputLeftElement, useColorModeValue, Flex, Text, Heading, Grid, GridItem, Card, CardBody, CardHeader, HStack, VStack, Badge, Spinner, Center } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Product from "@components/product";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Search, TrendingUp, Users, ShoppingCart, Package, DollarSign, Activity, Calendar, Clock } from "lucide-react";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Home() {
  const [Dashboard, setDashboard] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [searchVendor, setSearchVendor] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [partners, setPartners] = useState([]);
  const [searchPartner, setSearchPartner] = useState("");
  const [loading, setLoading] = useState(true);

  const [fetchDashboardData] = useDashboardDataMutation();
  const [vendorGet] = useVendorGetMutation();
  const [partnerGet] = usePartnerGetMutation();

  const router = useRouter();
  const { userInfo } = useSelector((state) => state.auth);
  const accountType = userInfo?.accountType ?? userInfo?.account ?? "";
  const isEditor = accountType === "editor";

  const handleDataFetch = async () => {
    try {
      setLoading(true);
      const res = await fetchDashboardData().unwrap();
      if (res?.status === "Success") {
        setDashboard(res?.data);
        setFilteredOrders(res?.data?.PendingOrders?.orders || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorFetch = async () => {
    try {
      const res = await vendorGet().unwrap();
      if (res?.status === "Success") {
        setVendors(res?.data);
      }
    } catch (error) {
      console.error("Error fetching vendor data: ", error);
    }
  };

  const handlePartnerFetch = async () => {
    try {
      const res = await partnerGet().unwrap();
      if (res?.status === "Success") {
        setPartners(res?.data);
      }
    } catch (error) {
      console.error("Error fetching partner data: ", error);
    }
  };

  useEffect(() => {
    handleDataFetch();
    handleVendorFetch();
    handlePartnerFetch();
  }, []);

  useEffect(() => {
    filterOrdersByLocation();
  }, [searchInput, Dashboard]);

  const filterOrdersByLocation = () => {
    if (!searchInput) {
      setFilteredOrders(Dashboard?.PendingOrders?.orders || []);
    } else {
      const filtered = (Dashboard?.PendingOrders?.orders || []).filter(
        (order) =>
          order.deliveryAddress?.address1
            ?.toLowerCase()
            .includes(searchInput.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  };

  // Process real order data for charts from backend
  const processOrderData = () => {
    // Use monthly order counts from backend if available
    if (Dashboard?.ordermonthlycounts && Array.isArray(Dashboard.ordermonthlycounts)) {
      return Dashboard.ordermonthlycounts.slice(-6).map(item => ({
        date: item.month || item._id?.month || 'Month',
        count: item.count || 0
      }));
    }
    
    // Fallback: process from orders array
    const orders = Dashboard?.PendingOrders?.orders || [];
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      const count = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString();
      }).length;
      last7Days.push({ date: dateStr, count });
    }
    
    return last7Days;
  };

  const orderData = processOrderData();

  // Chart configurations using REAL data
  const ordersChartOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'Inter, sans-serif',
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    colors: ['#48BB78'],
    xaxis: {
      categories: orderData.map(d => d.date),
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
        },
      },
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
      },
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 3,
    },
  };

  const ordersChartSeries = [{
    name: 'Orders',
    data: orderData.map(d => d.count),
  }];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const StatCard = ({ icon: Icon, title, value, color, trend, subtitle }) => (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }}>
      <Card
        bg="white"
        borderRadius="xl"
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
        border="1px solid"
        borderColor="gray.100"
        _hover={{
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
        }}
        transition="all 0.3s"
        h="100%"
      >
        <CardBody p={6}>
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={2} flex={1}>
              <Text fontSize="sm" color="gray.600" fontWeight="500" textTransform="uppercase" letterSpacing="0.05em">
                {title}
              </Text>
              <Heading size="xl" color="gray.800" fontWeight="700" fontFamily="Inter, sans-serif">
                {value || "0"}
              </Heading>
              {subtitle && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {subtitle}
                </Text>
              )}
              {trend && (
                <HStack mt={2}>
                  <TrendingUp size={14} color={color} />
                  <Text fontSize="xs" color={color} fontWeight="600">
                    {trend}
                  </Text>
                </HStack>
              )}
            </VStack>
            <Box
              p={4}
              borderRadius="xl"
              bg={`${color}.50`}
              color={`${color}.600`}
            >
              <Icon size={28} />
            </Box>
          </HStack>
        </CardBody>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <Center minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text color="gray.600" fontWeight="500">Loading dashboard...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box bg="gray.50" minH="100vh">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
            <VStack align="start" spacing={1}>
              <Heading size="xl" color="gray.800" fontWeight="700" fontFamily="Inter, sans-serif">
                Dashboard Overview
              </Heading>
              <Text color="gray.600" fontSize="sm" fontWeight="500">
                Welcome back! Here's what's happening with your business today.
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Badge
                colorScheme="green"
                px={4}
                py={2}
                borderRadius="full"
                fontSize="sm"
                fontWeight="600"
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Box w={2} h={2} bg="green.400" borderRadius="full" />
                Live
              </Badge>
              <Text fontSize="xs" color="gray.500" display="flex" alignItems="center" gap={1}>
                <Clock size={12} />
                {moment().format('MMM DD, YYYY')}
              </Text>
            </HStack>
          </Flex>
        </motion.div>

        {/* Stats Cards - Editors only see Total Products; admin sees all */}
        <Grid
          templateColumns={{
            base: "1fr",
            md: isEditor ? "1fr" : "repeat(2, 1fr)",
            lg: isEditor ? "1fr" : "repeat(4, 1fr)",
          }}
          gap={6}
          mb={8}
        >
          <StatCard
            icon={Package}
            title="Total Products"
            value={Dashboard?.Products?.count || 0}
            color="blue"
            subtitle="Active products"
          />
          {!isEditor && (
            <>
              <StatCard
                icon={Users}
                title="Total Customers"
                value={Dashboard?.Users?.count || 0}
                color="green"
                subtitle="Registered users"
              />
              <StatCard
                icon={ShoppingCart}
                title="Pending Orders"
                value={Dashboard?.PendingOrders?.count || 0}
                color="orange"
                subtitle="Awaiting fulfillment"
              />
              <StatCard
                icon={DollarSign}
                title="Total Revenue"
                value={`UGX ${(Dashboard?.AllTimeOrders?.allorderscashvalue || 0).toLocaleString()}`}
                color="purple"
                subtitle="All-time revenue"
              />
            </>
          )}
        </Grid>

        {/* Orders Trend - Admin only; hidden for editors */}
        {!isEditor && orderData.length > 0 && orderData.some(d => d.count > 0) && (
          <motion.div variants={itemVariants} mb={8}>
            <Card
              bg="white"
              borderRadius="xl"
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
              border="1px solid"
              borderColor="gray.100"
            >
              <CardHeader pb={4}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Heading size="md" color="gray.800" fontFamily="Inter, sans-serif">
                      Orders Trend
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      {Dashboard?.ordermonthlycounts ? "Monthly order statistics" : "Last 7 days order statistics"}
                    </Text>
                  </VStack>
                  <Activity size={20} color="#48BB78" />
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <Chart
                  options={ordersChartOptions}
                  series={ordersChartSeries}
                  type="area"
                  height={350}
                />
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Recent Orders - Admin only; hidden for editors */}
        {!isEditor && (
        <motion.div variants={itemVariants}>
          <Card
            bg="white"
            borderRadius="xl"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
            border="1px solid"
            borderColor="gray.100"
          >
            <CardHeader pb={4}>
              <HStack justify="space-between" flexWrap="wrap" gap={4}>
                <VStack align="start" spacing={1}>
                  <Heading size="md" color="gray.800" fontFamily="Inter, sans-serif">
                    Recent Orders
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    Latest customer orders
                  </Text>
                </VStack>
                <InputGroup maxW="300px">
                  <InputLeftElement pointerEvents="none">
                    <Search size={18} color="gray" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search by location..."
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      filterOrdersByLocation();
                    }}
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{ borderColor: "green.500", boxShadow: "0 0 0 1px #48BB78" }}
                  />
                </InputGroup>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              {Dashboard?.PendingOrders && Dashboard?.PendingOrders?.orders && filteredOrders.length > 0 ? (
                <Box overflowX="auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead fontWeight="600">Customer</TableHead>
                        <TableHead fontWeight="600">Items</TableHead>
                        <TableHead fontWeight="600">Payment</TableHead>
                        <TableHead fontWeight="600">Total</TableHead>
                        <TableHead fontWeight="600">Date</TableHead>
                        <TableHead fontWeight="600">Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.slice(0, 10).map((order, index) => (
                        <TableRow key={index} _hover={{ bg: "gray.50" }}>
                          <TableCell fontWeight="600">
                            {order?.user?.firstname} {order?.user?.lastname}
                          </TableCell>
                          <TableCell>{order?.productItems}</TableCell>
                          <TableCell>
                            <Badge
                              colorScheme={
                                order?.paymentMethod === "card" ? "blue" :
                                order?.paymentMethod === "mobileMoney" ? "green" : "orange"
                              }
                              borderRadius="full"
                              px={3}
                              py={1}
                            >
                              {order?.paymentMethod || order?.payment?.paymentMethod || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell fontWeight="600" color="green.600">
                            UGX {order?.total?.toLocaleString()}
                          </TableCell>
                          <TableCell fontSize="sm" color="gray.600">
                            {moment(order?.createdAt).fromNow()}
                          </TableCell>
                          <TableCell fontSize="sm" color="gray.600">
                            {order?.deliveryAddress?.address1}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              ) : (
                <Box textAlign="center" py={12}>
                  <ShoppingCart size={48} color="#CBD5E0" style={{ margin: "0 auto 16px" }} />
                  <Text color="gray.500" fontWeight="500">No orders found</Text>
                </Box>
              )}
            </CardBody>
          </Card>
        </motion.div>
        )}

        {/* Additional sections - Products, Vendors, Partners */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr" }} gap={6} mt={8}>
          <motion.div variants={itemVariants}>
            <Product />
          </motion.div>
        </Grid>

        {/* Vendors and Partners Section - Vendors hidden for editors */}
        <Grid templateColumns={{ base: "1fr", lg: isEditor ? "1fr" : "1fr 1fr" }} gap={6} mt={8}>
          {/* Vendors - Admin only */}
          {!isEditor && vendors.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card
                bg="white"
                borderRadius="xl"
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
                border="1px solid"
                borderColor="gray.100"
              >
                <CardHeader pb={4}>
                  <HStack justify="space-between" flexWrap="wrap" gap={4}>
                    <VStack align="start" spacing={1}>
                      <Heading size="md" color="gray.800" fontFamily="Inter, sans-serif">
                        Vendors
                      </Heading>
                      <Text fontSize="sm" color="gray.600">
                        Active vendor list
                      </Text>
                    </VStack>
                    <InputGroup maxW="250px">
                      <InputLeftElement pointerEvents="none">
                        <Search size={18} color="gray" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search vendors..."
                        value={searchVendor}
                        onChange={(e) => setSearchVendor(e.target.value)}
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: "green.500", boxShadow: "0 0 0 1px #48BB78" }}
                      />
                    </InputGroup>
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <Box overflowX="auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead fontWeight="600">Name</TableHead>
                          <TableHead fontWeight="600">Address</TableHead>
                          <TableHead fontWeight="600">Phone</TableHead>
                          <TableHead fontWeight="600">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vendors
                          .filter((vendor) => {
                            if (!searchVendor) return vendor;
                            return vendor.address?.toLowerCase().includes(searchVendor.toLowerCase());
                          })
                          .slice(0, 5)
                          .map((vendor, index) => (
                            <TableRow key={index} _hover={{ bg: "gray.50" }}>
                              <TableCell fontWeight="600">{vendor.name}</TableCell>
                              <TableCell fontSize="sm" color="gray.600">{vendor.address}</TableCell>
                              <TableCell>{vendor.phone}</TableCell>
                              <TableCell fontSize="sm" color="gray.600">
                                {moment(vendor?.createdAt).fromNow()}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </Box>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* Partners */}
          {partners.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card
                bg="white"
                borderRadius="xl"
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
                border="1px solid"
                borderColor="gray.100"
              >
                <CardHeader pb={4}>
                  <HStack justify="space-between" flexWrap="wrap" gap={4}>
                    <VStack align="start" spacing={1}>
                      <Heading size="md" color="gray.800" fontFamily="Inter, sans-serif">
                        Delivery Partners
                      </Heading>
                      <Text fontSize="sm" color="gray.600">
                        Active driver list
                      </Text>
                    </VStack>
                    <InputGroup maxW="250px">
                      <InputLeftElement pointerEvents="none">
                        <Search size={18} color="gray" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search partners..."
                        value={searchPartner}
                        onChange={(e) => setSearchPartner(e.target.value)}
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: "green.500", boxShadow: "0 0 0 1px #48BB78" }}
                      />
                    </InputGroup>
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <Box overflowX="auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead fontWeight="600">Name</TableHead>
                          <TableHead fontWeight="600">Location</TableHead>
                          <TableHead fontWeight="600">Phone</TableHead>
                          <TableHead fontWeight="600">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {partners
                          .filter((partner) => {
                            if (!searchPartner) return true;
                            return partner.location?.toLowerCase().includes(searchPartner.toLowerCase());
                          })
                          .slice(0, 5)
                          .map((partner, index) => (
                            <TableRow key={index} _hover={{ bg: "gray.50" }}>
                              <TableCell fontWeight="600">{partner.fullname || "N/A"}</TableCell>
                              <TableCell fontSize="sm" color="gray.600">{partner.location || "N/A"}</TableCell>
                              <TableCell>{partner.phone || "N/A"}</TableCell>
                              <TableCell fontSize="sm" color="gray.600">
                                {moment(partner?.createdAt).fromNow()}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </Box>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </Grid>
      </motion.div>
    </Box>
  );
}
