"use client";

import { useState, useEffect } from "react";
import {
  Box, Flex, Heading, Text, Badge, Button, Input,
  Grid, VStack, HStack, Icon, Divider, Spinner, Select,
} from "@chakra-ui/react";
import {
  FiUser, FiMail, FiPhone, FiFileText, FiDownload,
  FiSearch, FiBriefcase, FiCalendar, FiExternalLink, FiRefreshCw,
} from "react-icons/fi";
import { useGetApplicationsMutation } from "@Slices/applicationsApiSlice";

const APPLY_EMAIL = "info@yookatale.app";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [getApplications] = useGetApplicationsMutation();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getApplications().unwrap();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setApplications(data);
      setFiltered(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      applications.filter((a) =>
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.phone?.includes(q)
      )
    );
  }, [search, applications]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 8 }}>
      {/* Header */}
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap="4" mb="8">
        <Box>
          <Heading size="lg" color="gray.800" mb="1">Job Applications</Heading>
          <Text color="gray.500" fontSize="sm">
            All incoming applications — forward selected CVs to{" "}
            <Text as="a" href={`mailto:${APPLY_EMAIL}`} color="green.600" fontWeight="semibold">
              {APPLY_EMAIL}
            </Text>
          </Text>
        </Box>
        <HStack spacing="3">
          <Button
            size="sm" leftIcon={<FiRefreshCw />}
            variant="outline" borderRadius="lg"
            onClick={load} isLoading={loading}
          >
            Refresh
          </Button>
          <Button
            size="sm" leftIcon={<FiMail />}
            bg="green.600" color="white" borderRadius="lg"
            as="a" href={`mailto:${APPLY_EMAIL}`}
            _hover={{ bg: "green.700" }}
          >
            Open Email
          </Button>
        </HStack>
      </Flex>

      {/* Stats */}
      <Grid templateColumns={{ base: "repeat(2,1fr)", md: "repeat(3,1fr)" }} gap="4" mb="8">
        <StatCard label="Total Applications" value={applications.length} color="green.500" />
        <StatCard label="With CV Attached" value={applications.filter((a) => a.resume).length} color="blue.500" />
        <StatCard label="This Month" value={applications.filter((a) => {
          const d = new Date(a.createdAt || a.date);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length} color="purple.500" />
      </Grid>

      {/* Search */}
      <Box mb="6">
        <Flex
          align="center" gap="2" bg="white"
          border="1px solid" borderColor="gray.200"
          borderRadius="xl" px="4" py="2"
          maxW="420px" boxShadow="sm"
        >
          <Icon as={FiSearch} color="gray.400" />
          <Input
            variant="unstyled" placeholder="Search by name, email or phone..."
            fontSize="sm" value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </Flex>
      </Box>

      {/* List */}
      {loading ? (
        <Flex justify="center" align="center" py="20">
          <Spinner color="green.500" size="lg" />
        </Flex>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" py="16" bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
          <Icon as={FiBriefcase} boxSize="10" color="gray.300" mb="3" />
          <Text color="gray.500" fontWeight="medium">No applications found</Text>
        </Box>
      ) : (
        <VStack spacing="4" align="stretch">
          {filtered.map((app, i) => (
            <ApplicationCard key={app._id || i} app={app} formatDate={formatDate} />
          ))}
        </VStack>
      )}
    </Box>
  );
}

function StatCard({ label, value, color }) {
  return (
    <Box bg="white" borderRadius="xl" p="5" border="1px solid" borderColor="gray.100" boxShadow="sm">
      <Text fontSize="2xl" fontWeight="bold" color={color}>{value}</Text>
      <Text fontSize="sm" color="gray.500" mt="1">{label}</Text>
    </Box>
  );
}

function ApplicationCard({ app, formatDate }) {
  const [open, setOpen] = useState(false);

  return (
    <Box
      bg="white" borderRadius="xl"
      border="1px solid" borderColor="gray.100"
      boxShadow="sm" overflow="hidden"
      transition="box-shadow 0.2s"
      _hover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
    >
      <Box px={{ base: 4, md: 6 }} py="4">
        <Flex justify="space-between" align="flex-start" wrap="wrap" gap="3">
          <HStack spacing="3" align="start">
            <Flex
              w="42px" h="42px" borderRadius="full" bg="green.50"
              align="center" justify="center" flexShrink={0}
            >
              <Icon as={FiUser} color="green.600" boxSize="18px" />
            </Flex>
            <Box>
              <Text fontWeight="bold" fontSize="md" color="gray.800">{app.name || "—"}</Text>
              <HStack spacing="4" mt="1" wrap="wrap">
                <HStack spacing="1">
                  <Icon as={FiMail} color="gray.400" boxSize="12px" />
                  <Text fontSize="sm" color="gray.600">{app.email || "—"}</Text>
                </HStack>
                <HStack spacing="1">
                  <Icon as={FiPhone} color="gray.400" boxSize="12px" />
                  <Text fontSize="sm" color="gray.600">{app.phone || "—"}</Text>
                </HStack>
                {(app.createdAt || app.date) && (
                  <HStack spacing="1">
                    <Icon as={FiCalendar} color="gray.400" boxSize="12px" />
                    <Text fontSize="xs" color="gray.400">{formatDate(app.createdAt || app.date)}</Text>
                  </HStack>
                )}
              </HStack>
            </Box>
          </HStack>
          <HStack spacing="2" flexShrink={0}>
            {app.resume && (
              <Button
                as="a" href={app.resume} target="_blank" rel="noopener noreferrer"
                size="xs" leftIcon={<FiDownload />}
                bg="green.600" color="white" borderRadius="lg"
                _hover={{ bg: "green.700" }}
              >
                View CV
              </Button>
            )}
            <Button
              size="xs" variant="outline" borderRadius="lg"
              onClick={() => setOpen((p) => !p)}
            >
              {open ? "Hide" : "Details"}
            </Button>
            <Button
              as="a"
              href={`mailto:${APPLY_EMAIL}?subject=Re: Job Application - ${encodeURIComponent(app.name || "Applicant")}&body=Dear ${encodeURIComponent(app.name || "Applicant")},%0A%0A`}
              size="xs" leftIcon={<FiMail />} variant="ghost"
              borderRadius="lg" colorScheme="blue"
            >
              Reply
            </Button>
          </HStack>
        </Flex>
      </Box>

      {open && (
        <Box px={{ base: 4, md: 6 }} pb="5">
          <Divider mb="4" />
          <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wide" mb="2">
            Cover Letter
          </Text>
          <Box
            bg="gray.50" borderRadius="lg" p="4"
            border="1px solid" borderColor="gray.100"
            fontSize="sm" color="gray.700" lineHeight="tall"
            whiteSpace="pre-wrap" maxH="240px" overflowY="auto"
          >
            {app.coverLetter || "No cover letter provided."}
          </Box>
          {app.resume && (
            <Box mt="3">
              <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wide" mb="2">
                CV / Resume
              </Text>
              <Button
                as="a" href={app.resume} target="_blank" rel="noopener noreferrer"
                size="sm" leftIcon={<FiExternalLink />} variant="outline"
                borderRadius="lg" colorScheme="green"
              >
                Open CV in new tab
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
