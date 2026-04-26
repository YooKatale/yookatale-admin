"use client";

import { useState, useEffect } from "react";
import {
  Box, Flex, Heading, Text, Badge, Button, Input,
  Grid, VStack, HStack, Icon, Divider, Spinner,
  AlertDialog, AlertDialogBody, AlertDialogFooter,
  AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
  useDisclosure, useToast,
} from "@chakra-ui/react";
import {
  FiUser, FiMail, FiPhone, FiFileText, FiDownload,
  FiSearch, FiBriefcase, FiCalendar, FiExternalLink,
  FiRefreshCw, FiTrash2, FiEye, FiX, FiChevronDown, FiChevronUp,
} from "react-icons/fi";
import { useRef } from "react";
import { useGetApplicationsMutation, useDeleteApplicationMutation } from "@Slices/applicationsApiSlice";

const APPLY_EMAIL = "info@yookatale.app";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [getApplications] = useGetApplicationsMutation();
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getApplications().unwrap();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setApplications(data);
      setFiltered(data);
    } catch (e) {
      // load error handled by toast below
      toast({ title: "Failed to load applications", status: "error", duration: 3000, isClosable: true });
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

  const handleDeleted = (id) => {
    setApplications((prev) => prev.filter((a) => a._id !== id));
  };

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const thisMonth = applications.filter((a) => {
    const d = new Date(a.createdAt || a.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 8 }}>
      {/* Header */}
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap="4" mb="8">
        <Box>
          <Heading size="lg" color="gray.800" mb="1">Job Applications</Heading>
          <Text color="gray.500" fontSize="sm">
            Review and manage incoming applications · forward CVs to{" "}
            <Text as="a" href={`mailto:${APPLY_EMAIL}`} color="green.600" fontWeight="semibold" display="inline">
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
      <Grid templateColumns={{ base: "repeat(2,1fr)", md: "repeat(4,1fr)" }} gap="4" mb="8">
        <StatCard label="Total Applications" value={applications.length} color="green.500" icon={FiBriefcase} />
        <StatCard label="With CV Attached" value={applications.filter((a) => a.resume).length} color="blue.500" icon={FiFileText} />
        <StatCard label="This Month" value={thisMonth} color="purple.500" icon={FiCalendar} />
        <StatCard label="No CV Submitted" value={applications.filter((a) => !a.resume).length} color="orange.400" icon={FiUser} />
      </Grid>

      {/* Search */}
      <Box mb="6">
        <Flex
          align="center" gap="2" bg="white"
          border="1px solid" borderColor="gray.200"
          borderRadius="xl" px="4" py="2"
          maxW="460px" boxShadow="sm"
        >
          <Icon as={FiSearch} color="gray.400" />
          <Input
            variant="unstyled" placeholder="Search by name, email or phone..."
            fontSize="sm" value={search} onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <Icon as={FiX} color="gray.400" cursor="pointer" onClick={() => setSearch("")} />
          )}
        </Flex>
        {search && (
          <Text fontSize="xs" color="gray.400" mt="2" ml="1">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &quot;{search}&quot;
          </Text>
        )}
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
          {search && <Text fontSize="sm" color="gray.400" mt="1">Try a different search term</Text>}
        </Box>
      ) : (
        <VStack spacing="4" align="stretch">
          {filtered.map((app, i) => (
            <ApplicationCard
              key={app._id || i}
              app={app}
              formatDate={formatDate}
              onDeleted={handleDeleted}
              toast={toast}
            />
          ))}
        </VStack>
      )}
    </Box>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <Box bg="white" borderRadius="xl" p="5" border="1px solid" borderColor="gray.100" boxShadow="sm">
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color={color}>{value}</Text>
          <Text fontSize="sm" color="gray.500" mt="1">{label}</Text>
        </Box>
        <Flex w="36px" h="36px" borderRadius="lg" bg={`${color.split(".")[0]}.50`} align="center" justify="center">
          <Icon as={icon} color={color} boxSize="16px" />
        </Flex>
      </Flex>
    </Box>
  );
}

function ApplicationCard({ app, formatDate, onDeleted, toast }) {
  const [open, setOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef();
  const [deleteApplication] = useDeleteApplicationMutation();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteApplication(app._id).unwrap();
      toast({ title: "Application deleted", status: "success", duration: 2500, isClosable: true });
      onDeleted(app._id);
    } catch (e) {
      toast({ title: "Failed to delete", description: e?.data?.message || "Please try again", status: "error", duration: 3000, isClosable: true });
    } finally {
      setDeleting(false);
      onAlertClose();
    }
  };

  const isPdf = app.resume && (app.resume.includes(".pdf") || app.resume.includes("application%2Fpdf") || app.resume.includes("pdf"));

  return (
    <>
      <Box
        bg="white" borderRadius="xl"
        border="1px solid" borderColor="gray.100"
        boxShadow="sm" overflow="hidden"
        transition="box-shadow 0.2s"
        _hover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
      >
        {/* Card Header */}
        <Box px={{ base: 4, md: 6 }} py="4">
          <Flex justify="space-between" align="flex-start" wrap="wrap" gap="3">
            <HStack spacing="3" align="start">
              <Flex
                w="44px" h="44px" borderRadius="full" bg="green.50"
                align="center" justify="center" flexShrink={0}
              >
                <Icon as={FiUser} color="green.600" boxSize="20px" />
              </Flex>
              <Box>
                <HStack spacing="2" wrap="wrap">
                  <Text fontWeight="bold" fontSize="md" color="gray.800">{app.name || "—"}</Text>
                  {!app.resume && (
                    <Badge colorScheme="orange" fontSize="10px" borderRadius="full">No CV</Badge>
                  )}
                  {app.resume && (
                    <Badge colorScheme="green" fontSize="10px" borderRadius="full">CV Attached</Badge>
                  )}
                </HStack>
                <HStack spacing="4" mt="1.5" wrap="wrap">
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

            {/* Action buttons */}
            <HStack spacing="2" flexShrink={0} wrap="wrap">
              {app.resume && (
                <>
                  <Button
                    size="xs" leftIcon={<FiEye />}
                    bg="blue.500" color="white" borderRadius="lg"
                    _hover={{ bg: "blue.600" }}
                    onClick={() => setPdfOpen((p) => !p)}
                  >
                    {pdfOpen ? "Hide" : "View CV"}
                  </Button>
                  <Button
                    as="a" href={app.resume} target="_blank" rel="noopener noreferrer"
                    size="xs" leftIcon={<FiDownload />}
                    variant="outline" borderRadius="lg" colorScheme="blue"
                  >
                    Download
                  </Button>
                </>
              )}
              <Button
                size="xs" variant="outline" borderRadius="lg"
                rightIcon={open ? <FiChevronUp /> : <FiChevronDown />}
                onClick={() => setOpen((p) => !p)}
              >
                {open ? "Hide" : "Details"}
              </Button>
              <Button
                as="a"
                href={`mailto:${app.email}?subject=Re: Job Application at YooKatale&body=Dear ${encodeURIComponent(app.name || "Applicant")},%0A%0A`}
                size="xs" leftIcon={<FiMail />} variant="ghost"
                borderRadius="lg" colorScheme="blue"
              >
                Reply
              </Button>
              <Button
                size="xs" leftIcon={<FiTrash2 />}
                variant="ghost" colorScheme="red" borderRadius="lg"
                onClick={onAlertOpen}
              >
                Delete
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* PDF Viewer */}
        {pdfOpen && app.resume && (
          <Box px={{ base: 4, md: 6 }} pb="5">
            <Divider mb="4" />
            <Flex justify="space-between" align="center" mb="3">
              <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wide">
                CV / Resume Preview
              </Text>
              <HStack spacing="2">
                <Button
                  as="a" href={app.resume} target="_blank" rel="noopener noreferrer"
                  size="xs" leftIcon={<FiExternalLink />} variant="ghost" colorScheme="green"
                >
                  Open in new tab
                </Button>
                <Button size="xs" variant="ghost" onClick={() => setPdfOpen(false)}><Icon as={FiX} /></Button>
              </HStack>
            </Flex>
            {isPdf ? (
              <Box
                as="iframe"
                src={app.resume}
                w="100%" h="500px"
                borderRadius="lg"
                border="1px solid"
                borderColor="gray.200"
                title={`CV - ${app.name}`}
              />
            ) : (
              <Flex
                bg="gray.50" borderRadius="lg" p="8" direction="column"
                align="center" justify="center" border="1px solid" borderColor="gray.200"
              >
                <Icon as={FiFileText} boxSize="10" color="gray.300" mb="3" />
                <Text color="gray.500" fontSize="sm" mb="3">Preview not available for this file type</Text>
                <Button
                  as="a" href={app.resume} target="_blank" rel="noopener noreferrer"
                  size="sm" leftIcon={<FiExternalLink />} colorScheme="green" variant="outline"
                >
                  Open file
                </Button>
              </Flex>
            )}
          </Box>
        )}

        {/* Cover Letter */}
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
              whiteSpace="pre-wrap" maxH="280px" overflowY="auto"
            >
              {app.coverLetter || "No cover letter provided."}
            </Box>
            {!app.resume && (
              <Box mt="3" p="3" bg="orange.50" borderRadius="lg" border="1px solid" borderColor="orange.100">
                <Text fontSize="xs" color="orange.600">⚠ This applicant did not attach a CV/Resume.</Text>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={onAlertClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete Application</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete the application from <strong>{app.name}</strong>? This cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose} borderRadius="lg">Cancel</Button>
              <Button
                colorScheme="red" ml="3" borderRadius="lg"
                onClick={handleDelete} isLoading={deleting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
