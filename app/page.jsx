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
import { Box, Input, InputGroup, InputLeftElement, useColorModeValue, Flex, Text, Heading, Grid, GridItem, Card, CardBody, CardHeader, HStack, VStack, Badge } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import Product from "@components/product";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Search, TrendingUp, Users, ShoppingCart, Package, DollarSign, Activity } from "lucide-react";

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

  const [fetchDashboardData] = useDashboardDataMutation();
  const [vendorGet] = useVendorGetMutation();
  const [partnerGet] = usePartnerGetMutation();

  const router = useRouter();

  const handleDataFetch = async () => {
    try {
      const res = await fetchDashboardData().unwrap();
      if (res?.status === "Success") {
        setDashboard(res?.data);
        setFilteredOrders(res?.data?.PendingOrders?.orders || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data: ", error);
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

  const filterVendorsByLocation = () => {
    // Filter logic for vendors
  };

  // Chart configurations
  const salesChartOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false },
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
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    tooltip: {
      theme: 'light',
    },
  };

  const salesChartSeries = [{
    name: 'Sales',
    data: [30, 40, 35, 50, 49, 60, 70],
  }];

  const ordersChartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '55%',
      },
    },
    dataLabels: { enabled: false },
    colors: ['#48BB78', '#38A169'],
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    },
    tooltip: {
      theme: 'light',
    },
  };

  const ordersChartSeries = [{
    name: 'Orders',
    data: [44, 55, 57, 56, 61, 58],
  }];

  const usersChartOptions = {
    chart: {
      type: 'donut',
      height: 350,
    },
    labels: ['Active Users', 'New Users', 'Inactive Users'],
    colors: ['#48BB78', '#38A169', '#68D391'],
    legend: {
      position: 'bottom',
    },
    tooltip: {
      theme: 'light',
    },
  };

  const usersChartSeries = [
    Dashboard?.Users?.count ? Math.floor(Dashboard?.Users?.count * 0.7) : 0,
    Dashboard?.Users?.count ? Math.floor(Dashboard?.Users?.count * 0.2) : 0,
    Dashboard?.Users?.count ? Math.floor(Dashboard?.Users?.count * 0.1) : 0,
  ];

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

  const StatCard = ({ icon: Icon, title, value, color, trend }) => (
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
      >
        <CardBody p={6}>
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={2} flex={1}>
              <Text fontSize="sm" color="gray.600" fontWeight="500">
                {title}
              </Text>
              <Heading size="lg" color="gray.800" fontWeight="700">
                {value || "___"}
              </Heading>
              {trend && (
                <HStack>
                  <TrendingUp size={16} color={color} />
                  <Text fontSize="xs" color={color} fontWeight="600">
                    {trend}
                  </Text>
                </HStack>
              )}
            </VStack>
            <Box
              p={3}
              borderRadius="lg"
              bg={`${color}.50`}
              color={color}
            >
              <Icon size={24} />
            </Box>
          </HStack>
        </CardBody>
      </Card>
    </motion.div>
  );

  return (
    <Box bg="gray.50" minH="100vh" p={6}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Flex justify="space-between" align="center" mb={8}>
            <VStack align="start" spacing={1}>
              <Heading size="xl" color="gray.800" fontWeight="700">
                Dashboard Overview
              </Heading>
              <Text color="gray.600" fontSize="sm">
                Welcome back! Here's what's happening with your business today.
              </Text>
            </VStack>
            <Badge
              colorScheme="green"
              px={4}
              py={2}
              borderRadius="full"
              fontSize="sm"
              fontWeight="600"
            >
              Live
            </Badge>
          </Flex>
        </motion.div>

        {/* Stats Cards */}
        <Grid
          templateColumns={{ base: "1fr", md: "2fr", lg: "repeat(4, 1fr)" }}
          gap={6}
          mb={8}
        >
          <StatCard
            icon={Package}
            title="Total Products"
            value={Dashboard?.Products?.count}
            color="blue"
            trend="+12% this month"
          />
          <StatCard
            icon={Users}
            title="Total Customers"
            value={Dashboard?.Users?.count}
            color="green"
            trend="+8% this month"
          />
          <StatCard
            icon={ShoppingCart}
            title="Pending Orders"
            value={Dashboard?.PendingOrders?.count}
            color="orange"
            trend="+5 new today"
          />
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={`UGX ${Dashboard?.TotalRevenue?.toLocaleString() || "0"}`}
            color="purple"
            trend="+15% this month"
          />
        </Grid>

        {/* Charts Row */}
        <Grid
          templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
          gap={6}
          mb={8}
        >
          {/* Sales Chart */}
          <motion.div variants={itemVariants}>
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
                    <Heading size="md" color="gray.800">
                      Sales Overview
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      Last 7 days performance
                    </Text>
                  </VStack>
                  <Activity size={20} color="#48BB78" />
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <Chart
                  options={salesChartOptions}
                  series={salesChartSeries}
                  type="area"
                  height={350}
                />
              </CardBody>
            </Card>
          </motion.div>

          {/* Users Chart */}
          <motion.div variants={itemVariants}>
            <Card
              bg="white"
              borderRadius="xl"
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
              border="1px solid"
              borderColor="gray.100"
            >
              <CardHeader pb={4}>
                <VStack align="start" spacing={1}>
                  <Heading size="md" color="gray.800">
                    User Distribution
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    User activity breakdown
                  </Text>
                </VStack>
              </CardHeader>
              <CardBody pt={0}>
                <Chart
                  options={usersChartOptions}
                  series={usersChartSeries}
                  type="donut"
                  height={350}
                />
              </CardBody>
            </Card>
          </motion.div>
        </Grid>

        {/* Orders Chart */}
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
                  <Heading size="md" color="gray.800">
                    Orders Trend
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    Monthly orders comparison
                  </Text>
                </VStack>
                <TrendingUp size={20} color="#48BB78" />
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <Chart
                options={ordersChartOptions}
                series={ordersChartSeries}
                type="bar"
                height={350}
              />
            </CardBody>
          </Card>
        </motion.div>

        {/* Recent Orders Section */}
        <motion.div variants={itemVariants}>
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
                  <Heading size="md" color="gray.800">
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
              {Dashboard?.PendingOrders && Dashboard?.PendingOrders?.orders && (
                <Box overflowX="auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Total</TableHead>
                                    <TableHead>Date</TableHead>
                        <TableHead>Address</TableHead>
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
                            >
                              {order?.paymentMethod || order?.payment?.paymentMethod || "N/A"}
                            </Badge>
                                      </TableCell>
                          <TableCell fontWeight="600">
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
              )}
              {(!Dashboard?.PendingOrders || filteredOrders.length === 0) && (
                <Box textAlign="center" py={12}>
                  <Text color="gray.500">No orders found</Text>
                </Box>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Additional sections */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mt={8}>
          <motion.div variants={itemVariants}>
            <Product router={router} />
          </motion.div>
        </Grid>
      </motion.div>
      </Box>
  );
}
