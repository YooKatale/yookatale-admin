"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Box, 
  Button, 
  Flex, 
  Heading, 
  Textarea, 
  Text, 
  VStack, 
  HStack,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Spinner,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from "@chakra-ui/react";
import { 
  Mail, 
  Send, 
  Users, 
  Download, 
  UserPlus, 
  Gift,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Loader2,
  Upload,
  FileText,
  Pause,
  Play,
  Trash2,
  Copy,
  AlertCircle,
  Clock,
  BarChart3,
  RefreshCw,
  CheckCircle,
  X,
  TrendingUp,
  Database,
  Calendar,
  Activity,
  Truck
} from "lucide-react";
import { BACKEND_URL } from "@constants/constant";

const EMAIL_TEMPLATES = [
  {
    id: "subscription",
    name: "Subscription Mail",
    description: "Welcome email with app download links and subscription info",
    icon: ShoppingCart,
    color: "green",
  },
  {
    id: "get_started",
    name: "How to Sign Up Mail",
    description: "Guide users on how to sign up and get started",
    icon: UserPlus,
    color: "blue",
  },
  {
    id: "download_app",
    name: "How to Download App",
    description: "Guide users on downloading the Yookatale app",
    icon: Download,
    color: "purple",
  },
  {
    id: "how_to_subscribe",
    name: "How to Subscribe Mail",
    description: "Guide users on subscribing to meal calendar or plans",
    icon: ShoppingCart,
    color: "orange",
  },
  {
    id: "invite_friends",
    name: "How to Invite Friends & Earn",
    description: "Guide users on inviting friends and earning rewards",
    icon: Gift,
    color: "pink",
  },
  {
    id: "partner",
    name: "Partner (Vendors & Drivers)",
    description: "Invite vendors and drivers to register at yookatale.app/partner",
    icon: Truck,
    color: "teal",
  },
];

// Route directly through the backend (Render) which has SMTP properly configured
// This avoids Vercel serverless SMTP restrictions on the frontend
const getApiEndpoints = () => [`${BACKEND_URL}/admin/email/send`];

export default function EmailSender() {
  const [emails, setEmails] = useState("");
  const [sending, setSending] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sendingTemplate, setSendingTemplate] = useState(null);
  const [results, setResults] = useState({ success: 0, failed: 0, errors: [], currentIndex: 0, total: 0 });
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [emailStats, setEmailStats] = useState({ total: 0, valid: 0, invalid: 0, duplicates: 0, domains: {} });
  const [invalidEmails, setInvalidEmails] = useState([]);
  const [showInvalidEmails, setShowInvalidEmails] = useState(false);
  const [allTimeStats, setAllTimeStats] = useState({
    totalSent: 0,
    uniqueEmails: 0,
    byTemplate: {},
    lastUpdated: null
  });
  const [activeTab, setActiveTab] = useState(0);
  const pauseRef = useRef(false);
  const toast = useToast();

  const parseEmails = (emailString) => {
    if (!emailString || !emailString.trim()) return [];
    
    // Split by comma, semicolon, or newline, then clean and validate
    return emailString
      .split(/[,\n;]/)
      .map(email => email.trim())
      .filter(email => {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return email && emailRegex.test(email);
      });
  };

  // Get invalid emails from the input
  const getInvalidEmails = (emailString) => {
    if (!emailString || !emailString.trim()) return [];
    
    return emailString
      .split(/[,\n;]/)
      .map(email => email.trim())
      .filter(email => {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(email);
      });
  };

  // Calculate email statistics
  const calculateEmailStats = (emailString) => {
    const allEmails = emailString.split(/[,\n;]/).map(e => e.trim()).filter(Boolean);
    const validEmails = parseEmails(emailString);
    const invalidEmails = getInvalidEmails(emailString);
    
    // Count duplicates
    const emailSet = new Set();
    const duplicates = new Set();
    validEmails.forEach(email => {
      const lowerEmail = email.toLowerCase();
      if (emailSet.has(lowerEmail)) {
        duplicates.add(lowerEmail);
      } else {
        emailSet.add(lowerEmail);
      }
    });

    // Count domains
    const domains = {};
    validEmails.forEach(email => {
      const domain = email.split('@')[1]?.toLowerCase();
      if (domain) {
        domains[domain] = (domains[domain] || 0) + 1;
      }
    });

    return {
      total: allEmails.length,
      valid: validEmails.length,
      invalid: invalidEmails.length,
      duplicates: duplicates.size,
      domains: domains
    };
  };

  // Load statistics from localStorage on mount
  useEffect(() => {
    const storedStats = localStorage.getItem('emailSenderStats');
    const storedUniqueEmails = localStorage.getItem('uniqueEmailsSent');
    
    if (storedStats) {
      try {
        const parsed = JSON.parse(storedStats);
        // Ensure uniqueEmails count matches the actual stored unique emails
        if (storedUniqueEmails) {
          const uniqueEmailsArray = JSON.parse(storedUniqueEmails);
          parsed.uniqueEmails = uniqueEmailsArray.length;
        }
        setAllTimeStats(parsed);
      } catch (e) {
        // stats load error silently handled
      }
    } else if (storedUniqueEmails) {
      // If we have unique emails but no stats, initialize stats
      const uniqueEmailsArray = JSON.parse(storedUniqueEmails);
      const initialStats = {
        totalSent: uniqueEmailsArray.length,
        uniqueEmails: uniqueEmailsArray.length,
        byTemplate: {},
        lastUpdated: null
      };
      setAllTimeStats(initialStats);
      localStorage.setItem('emailSenderStats', JSON.stringify(initialStats));
    }
  }, []);

  // Update stats when emails change
  useEffect(() => {
    const stats = calculateEmailStats(emails);
    setEmailStats(stats);
    setInvalidEmails(getInvalidEmails(emails));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emails]);

  // Save statistics to localStorage
  const saveStats = (newStats) => {
    localStorage.setItem('emailSenderStats', JSON.stringify(newStats));
    setAllTimeStats(newStats);
  };

  // Update statistics when emails are successfully sent
  const updateAllTimeStats = (sentEmails, templateId) => {
    // Load current stats from localStorage to ensure we have the latest
    const storedStats = localStorage.getItem('emailSenderStats');
    const currentStats = storedStats ? JSON.parse(storedStats) : {
      totalSent: 0,
      uniqueEmails: 0,
      byTemplate: {},
      lastUpdated: null
    };
    
    // Load existing unique emails
    const storedUniqueEmails = localStorage.getItem('uniqueEmailsSent');
    const uniqueEmailsSet = new Set(storedUniqueEmails ? JSON.parse(storedUniqueEmails) : []);
    
    // Add new emails to unique set
    sentEmails.forEach(email => {
      uniqueEmailsSet.add(email.toLowerCase());
    });

    // Update counts
    const newStats = {
      totalSent: (currentStats.totalSent || 0) + sentEmails.length,
      uniqueEmails: uniqueEmailsSet.size,
      byTemplate: { ...(currentStats.byTemplate || {}) },
      lastUpdated: new Date().toISOString()
    };
    
    // Update template-specific count
    newStats.byTemplate[templateId] = (newStats.byTemplate[templateId] || 0) + sentEmails.length;

    // Save unique emails list
    localStorage.setItem('uniqueEmailsSent', JSON.stringify([...uniqueEmailsSet]));

    // Save updated stats
    saveStats(newStats);
  };

  // Auto-deduplicate emails
  const deduplicateEmails = () => {
    const emailList = parseEmails(emails);
    const uniqueEmails = [...new Set(emailList.map(e => e.toLowerCase()))];
    const originalCount = emailList.length;
    const duplicateCount = originalCount - uniqueEmails.length;
    
    if (duplicateCount > 0) {
      setEmails(uniqueEmails.join('\n'));
      toast({
        title: "Duplicates removed",
        description: `Removed ${duplicateCount} duplicate email(s)`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "No duplicates",
        description: "All emails are already unique",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Export failed emails to CSV
  const exportFailedEmails = () => {
    if (results.errors.length === 0) {
      toast({
        title: "No failed emails",
        description: "There are no failed emails to export",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const csvContent = "Email,Error\n" + 
      results.errors.map(e => `"${e.email}","${e.error}"`).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `failed-emails-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `Exported ${results.errors.length} failed email(s) to CSV`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Copy all emails to clipboard
  const copyEmailsToClipboard = () => {
    const emailList = parseEmails(emails);
    if (emailList.length === 0) {
      toast({
        title: "No emails",
        description: "No valid emails to copy",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    navigator.clipboard.writeText(emailList.join('\n')).then(() => {
      toast({
        title: "Copied!",
        description: `Copied ${emailList.length} email(s) to clipboard`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    });
  };

  // Remove invalid emails from the list
  const removeInvalidEmails = () => {
    const validEmails = parseEmails(emails);
    if (validEmails.length === parseEmails(emails).length) {
      toast({
        title: "No invalid emails",
        description: "All emails are valid",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setEmails(validEmails.join('\n'));
    toast({
      title: "Invalid emails removed",
      description: `Removed ${invalidEmails.length} invalid email(s)`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Clear all statistics
  const clearAllStats = () => {
    if (window.confirm('Are you sure you want to clear all statistics? This cannot be undone.')) {
      localStorage.removeItem('emailSenderStats');
      localStorage.removeItem('uniqueEmailsSent');
      setAllTimeStats({
        totalSent: 0,
        uniqueEmails: 0,
        byTemplate: {},
        lastUpdated: null
      });
      toast({
        title: "Statistics cleared",
        description: "All email statistics have been reset",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Parse CSV file and extract emails
  const parseCSV = (csvText) => {
    const lines = csvText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    // Check if first line is a header (common headers: Email, email, Email Address, etc.)
    const firstLine = lines[0].toLowerCase();
    const isHeader = firstLine.includes('email') || firstLine.includes('mail');
    const startIndex = isHeader ? 1 : 0;

    const extractedEmails = [];
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Handle CSV with quotes and commas
      const values = line.split(',').map(val => val.trim().replace(/^["']|["']$/g, ''));
      
      // Try to find email in each column
      values.forEach(value => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(value)) {
          extractedEmails.push(value.toLowerCase());
        }
      });
    }

    return extractedEmails;
  };

  // Handle CSV file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file (.csv)",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);
    setUploadedFileName(file.name);

    try {
      const fileText = await file.text();
      const csvEmails = parseCSV(fileText);
      
      if (csvEmails.length === 0) {
        toast({
          title: "No emails found",
          description: "The CSV file doesn't contain any valid email addresses",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        setIsUploading(false);
        return;
      }

      // Get existing emails
      const existingEmails = parseEmails(emails);
      const existingSet = new Set(existingEmails.map(e => e.toLowerCase()));
      
      // Add new emails from CSV (avoid duplicates)
      const newEmails = csvEmails.filter(e => !existingSet.has(e));
      const allEmails = [...existingEmails, ...newEmails];

      // Update textarea with all emails
      setEmails(allEmails.join('\n'));

      toast({
        title: "CSV uploaded successfully",
        description: `Loaded ${csvEmails.length} email(s) from CSV. ${newEmails.length} new, ${csvEmails.length - newEmails.length} duplicate(s) skipped.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

    } catch (error) {
      // CSV parse error handled by toast below
      toast({
        title: "Error reading file",
        description: error.message || "Failed to read CSV file",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  // Retry function with exponential backoff
  const sendEmailWithRetry = async (email, templateId, maxRetries = 3) => {
    const endpointsToTry = getApiEndpoints();
    let lastError = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      for (const apiUrl of endpointsToTry) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          const response = await fetch(apiUrl, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email,
              type: templateId,
            }),
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json().catch(() => ({}));
            return { success: true, data };
          } else {
            const errorData = await response.json().catch(() => ({}));
            lastError = new Error(errorData?.error || errorData?.details || `HTTP ${response.status}`);
          }
        } catch (err) {
          if (err.name === 'AbortError') {
            lastError = new Error('Request timeout (30s)');
          } else if (err.message) {
            lastError = err;
          } else {
            lastError = new Error('Connection failed');
          }
          // Continue to next endpoint or retry
        }
      }
      
      // If all endpoints failed, wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return { success: false, error: lastError?.message || "Failed to send email" };
  };

  const sendEmails = async (templateId) => {
    const emailList = parseEmails(emails);
    
    if (emailList.length === 0) {
      toast({
        title: "No valid emails",
        description: "Please enter at least one valid email address",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Warn if sending to many emails
    if (emailList.length > 100) {
      const confirmed = window.confirm(
        `You are about to send ${emailList.length} emails. This will take approximately ${Math.ceil(emailList.length / 40) * 1.5} minutes. Continue?`
      );
      if (!confirmed) return;
    }

    setSending(true);
    setPaused(false);
    pauseRef.current = false;
    setSendingTemplate(templateId);
    setResults({ success: 0, failed: 0, errors: [], currentIndex: 0, total: emailList.length });

    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    let successCount = 0;
    let failCount = 0;
    const errorList = [];
    const BATCH_SIZE = 40; // Send 40 emails, then pause
    const BATCH_PAUSE_MS = 90000; // 90 seconds pause between batches

    try {
      // Send emails one by one with delay to avoid rate limiting
      for (let i = 0; i < emailList.length; i++) {
        const email = emailList[i];
        
        // Update current index
        setResults({ 
          success: successCount, 
          failed: failCount, 
          errors: errorList,
          currentIndex: i + 1,
          total: emailList.length
        });
        
        // Send email with retry logic
        const result = await sendEmailWithRetry(email, templateId);
        
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          errorList.push({ 
            email, 
            error: result.error || "Failed to send email"
          });
        }

        // Small delay between individual emails (500ms)
        if (i < emailList.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Pause after every batch (except for the last batch)
        if ((i + 1) % BATCH_SIZE === 0 && i < emailList.length - 1) {
          const batchNumber = Math.floor((i + 1) / BATCH_SIZE);
          const remainingBatches = Math.ceil((emailList.length - (i + 1)) / BATCH_SIZE);
          
          toast({
            title: `Batch ${batchNumber} Complete`,
            description: `Pausing for 90 seconds... ${remainingBatches} batch(es) remaining`,
            status: "info",
            duration: 2000,
            isClosable: true,
          });
          
          // Update UI to show we're pausing
          setResults({ 
            success: successCount, 
            failed: failCount, 
            errors: errorList,
            currentIndex: i + 1,
            total: emailList.length,
            pausing: true 
          });
          
          // Pause for 90 seconds
          await new Promise(resolve => setTimeout(resolve, BATCH_PAUSE_MS));
          
          setResults({ 
            success: successCount, 
            failed: failCount, 
            errors: errorList,
            currentIndex: i + 1,
            total: emailList.length,
            pausing: false 
          });
        }

        // Update results in real-time
        setResults({ 
          success: successCount, 
          failed: failCount, 
          errors: errorList,
          currentIndex: i + 1,
          total: emailList.length
        });
      }

      // Update all-time statistics for successfully sent emails
      // Track only successfully sent emails (exclude failed ones)
      if (successCount > 0) {
        const failedEmailSet = new Set(errorList.map(e => e.email.toLowerCase()));
        const successfulEmails = emailList.filter(email => !failedEmailSet.has(email.toLowerCase()));
        
        // Only update stats with emails that were actually sent successfully
        if (successfulEmails.length > 0) {
          updateAllTimeStats(successfulEmails, templateId);
        }
      }

      // Show completion toast
      toast({
        title: "Emails Sent!",
        description: `Successfully sent ${successCount} email(s). ${failCount > 0 ? `${failCount} failed.` : ""}`,
        status: successCount > 0 ? "success" : "error",
        duration: 5000,
        isClosable: true,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send emails",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSending(false);
      setSendingTemplate(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <HStack spacing={3} mb={2}>
            <Mail className="text-green-600" size={32} />
            <Heading size="xl" color="gray.800">Email Sender</Heading>
          </HStack>
          <Text color="gray.600">Send email templates to multiple recipients at once</Text>
        </div>

        {/* Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab} mb={6} colorScheme="green">
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <Send size={16} />
                <Text>Send Emails</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <BarChart3 size={16} />
                <Text>Statistics</Text>
                {allTimeStats.totalSent > 0 && (
                  <Badge colorScheme="green" borderRadius="full" fontSize="xs">
                    {allTimeStats.totalSent}
                  </Badge>
                )}
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Send Emails Tab */}
            <TabPanel px={0}>

        {/* Email Input Section */}
        <Card mb={6} shadow="lg">
          <CardHeader>
            <Heading size="md" color="gray.800">Email Recipients</Heading>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Paste email addresses separated by commas, semicolons, or new lines. Or upload a CSV file.
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* CSV Upload Section */}
              <Box
                p={4}
                borderWidth="2px"
                borderStyle="dashed"
                borderColor="gray.300"
                borderRadius="lg"
                bg="gray.50"
                _hover={{ borderColor: "blue.400", bg: "blue.50" }}
                transition="all 0.2s"
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading || sending}
                  style={{ display: 'none' }}
                  id="csv-upload-input"
                />
                <label htmlFor="csv-upload-input">
                  <VStack spacing={2} cursor="pointer">
                    {isUploading ? (
                      <>
                        <Spinner size="lg" color="blue.500" />
                        <Text fontSize="sm" color="gray.600">Reading CSV file...</Text>
                      </>
                    ) : (
                      <>
                        <Upload size={32} className="text-blue-500" />
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                          {uploadedFileName ? `Uploaded: ${uploadedFileName}` : "Click to upload CSV file"}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Supports CSV files with email column (with or without header)
                        </Text>
                      </>
                    )}
                  </VStack>
                </label>
                {uploadedFileName && !isUploading && (
                  <HStack mt={2} justify="center">
                    <FileText size={16} className="text-green-500" />
                    <Text fontSize="xs" color="green.600">
                      {uploadedFileName}
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        setUploadedFileName(null);
                        document.getElementById('csv-upload-input').value = '';
                      }}
                    >
                      Clear
                    </Button>
                  </HStack>
                )}
              </Box>

              <Divider />

              <Textarea
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="email1@example.com, email2@example.com&#10;email3@example.com"
                minH="200px"
                fontSize="sm"
                resize="vertical"
                isDisabled={sending}
              />
              {/* Email Statistics */}
              {emailStats.total > 0 && (
                <Box p={3} bg="blue.50" borderRadius="md" borderLeft="3px solid" borderColor="blue.400">
                  <HStack spacing={4} flexWrap="wrap">
                    <HStack>
                      <CheckCircle size={16} className="text-green-500" />
                      <Text fontSize="xs" fontWeight="semibold" color="green.700">
                        {emailStats.valid} Valid
                      </Text>
                    </HStack>
                    {emailStats.invalid > 0 && (
                      <HStack>
                        <AlertCircle size={16} className="text-orange-500" />
                        <Text fontSize="xs" fontWeight="semibold" color="orange.700">
                          {emailStats.invalid} Invalid
                        </Text>
                      </HStack>
                    )}
                    {emailStats.duplicates > 0 && (
                      <HStack>
                        <RefreshCw size={16} className="text-yellow-500" />
                        <Text fontSize="xs" fontWeight="semibold" color="yellow.700">
                          {emailStats.duplicates} Duplicates
                        </Text>
                      </HStack>
                    )}
                    {Object.keys(emailStats.domains).length > 0 && (
                      <HStack>
                        <BarChart3 size={16} className="text-purple-500" />
                        <Text fontSize="xs" fontWeight="semibold" color="purple.700">
                          {Object.keys(emailStats.domains).length} Domains
                        </Text>
                      </HStack>
                    )}
                  </HStack>
                </Box>
              )}

              {/* Invalid Emails Warning */}
              {invalidEmails.length > 0 && (
                <Box p={3} bg="orange.50" borderRadius="md" borderLeft="3px solid" borderColor="orange.400">
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <AlertCircle size={16} className="text-orange-500" />
                      <Text fontSize="sm" fontWeight="semibold" color="orange.700">
                        {invalidEmails.length} Invalid Email(s) Found
                      </Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="orange"
                        onClick={removeInvalidEmails}
                        leftIcon={<X size={12} />}
                      >
                        Remove
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setShowInvalidEmails(!showInvalidEmails)}
                      >
                        {showInvalidEmails ? "Hide" : "Show"}
                      </Button>
                    </HStack>
                  </HStack>
                  {showInvalidEmails && (
                    <VStack align="stretch" spacing={1} maxH="100px" overflowY="auto">
                      {invalidEmails.map((email, idx) => (
                        <Text key={idx} fontSize="xs" color="orange.600">
                          • {email}
                        </Text>
                      ))}
                    </VStack>
                  )}
                </Box>
              )}

              {/* Domain Distribution (Top 5) */}
              {Object.keys(emailStats.domains).length > 0 && emailStats.valid > 0 && (
                <Box p={3} bg="purple.50" borderRadius="md" borderLeft="3px solid" borderColor="purple.400">
                  <HStack mb={2}>
                    <BarChart3 size={16} className="text-purple-500" />
                    <Text fontSize="sm" fontWeight="semibold" color="purple.700">
                      Top Email Domains:
                    </Text>
                  </HStack>
                  <HStack spacing={3} flexWrap="wrap">
                    {Object.entries(emailStats.domains)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([domain, count]) => (
                        <Badge key={domain} colorScheme="purple" fontSize="xs">
                          {domain}: {count}
                        </Badge>
                      ))}
                    {Object.keys(emailStats.domains).length > 5 && (
                      <Text fontSize="xs" color="purple.600">
                        +{Object.keys(emailStats.domains).length - 5} more
                      </Text>
                    )}
                  </HStack>
                </Box>
              )}

              <HStack justify="space-between" flexWrap="wrap" spacing={2}>
                <HStack spacing={2} flexWrap="wrap">
                  <Text fontSize="sm" color="gray.600">
                    {emailStats.valid > 0 
                      ? `${emailStats.valid} valid email(s) ready to send`
                      : "No valid emails detected"}
                  </Text>
                  {emailStats.valid > 0 && (
                    <>
                      <Text fontSize="xs" color="gray.500">•</Text>
                      <Text fontSize="xs" color="gray.500">
                        Est. time: ~{Math.ceil(emailStats.valid / 40) * 1.5} min
                      </Text>
                    </>
                  )}
                </HStack>
                <HStack spacing={2} flexWrap="wrap">
                  {uploadedFileName && (
                    <Badge colorScheme="green" fontSize="xs">
                      CSV Loaded
                    </Badge>
                  )}
                  {emailStats.duplicates > 0 && (
                    <Button
                      size="xs"
                      variant="outline"
                      colorScheme="yellow"
                      onClick={deduplicateEmails}
                      isDisabled={sending}
                      leftIcon={<RefreshCw size={12} />}
                    >
                      Remove Duplicates
                    </Button>
                  )}
                  {emailStats.valid > 0 && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={copyEmailsToClipboard}
                      isDisabled={sending}
                      leftIcon={<Copy size={12} />}
                    >
                      Copy
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEmails("");
                      setUploadedFileName(null);
                      setShowInvalidEmails(false);
                      const fileInput = document.getElementById('csv-upload-input');
                      if (fileInput) fileInput.value = '';
                    }}
                    isDisabled={!emails || sending}
                    leftIcon={<Trash2 size={14} />}
                  >
                    Clear All
                  </Button>
                </HStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Template Buttons */}
        <Card shadow="lg" mb={6}>
          <CardHeader>
            <Heading size="md" color="gray.800">Select Email Template</Heading>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Choose a template to send to all recipients
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {EMAIL_TEMPLATES.map((template) => {
                const Icon = template.icon;
                const isSending = sending && sendingTemplate === template.id;
                
                return (
                  <Box
                    key={template.id}
                    p={4}
                    borderWidth="2px"
                    borderColor={isSending ? `${template.color}.300` : "gray.200"}
                    borderRadius="lg"
                    bg={isSending ? `${template.color}.50` : "white"}
                    _hover={{ borderColor: `${template.color}.400`, shadow: "md" }}
                    transition="all 0.2s"
                  >
                    <HStack justify="space-between" align="start">
                      <HStack spacing={4} flex={1}>
                        <Box
                          p={3}
                          borderRadius="lg"
                          bg={`${template.color}.100`}
                          color={`${template.color}.600`}
                        >
                          <Icon size={24} />
                        </Box>
                        <VStack align="start" spacing={1} flex={1}>
                          <HStack>
                            <Heading size="sm" color="gray.800">
                              {template.name}
                            </Heading>
                            {isSending && (
                              <Spinner size="sm" color={`${template.color}.500`} />
                            )}
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            {template.description}
                          </Text>
                        </VStack>
                      </HStack>
                      <HStack spacing={2}>
                        {isSending && (
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme={template.color}
                            onClick={() => {
                              const newPausedState = !pauseRef.current;
                              setPaused(newPausedState);
                              pauseRef.current = newPausedState;
                              if (newPausedState) {
                                toast({
                                  title: "Paused",
                                  description: "Email sending has been paused. Click Resume to continue.",
                                  status: "warning",
                                  duration: 3000,
                                  isClosable: true,
                                });
                              } else {
                                toast({
                                  title: "Resuming...",
                                  description: "Email sending has been resumed",
                                  status: "info",
                                  duration: 2000,
                                  isClosable: true,
                                });
                              }
                            }}
                            leftIcon={paused ? <Play size={14} /> : <Pause size={14} />}
                          >
                            {paused ? "Resume" : "Pause"}
                          </Button>
                        )}
                        <Button
                          colorScheme={template.color}
                          onClick={() => sendEmails(template.id)}
                          isDisabled={!emails || sending || parseEmails(emails).length === 0}
                          isLoading={isSending}
                          loadingText="Sending..."
                          leftIcon={isSending ? <Loader2 size={16} /> : <Send size={16} />}
                        >
                          {isSending ? "Sending..." : "Send"}
                        </Button>
                      </HStack>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          </CardBody>
        </Card>

        {/* Results Section */}
        {(results.success > 0 || results.failed > 0 || sending) && (
          <Card shadow="lg">
            <CardHeader>
              <Heading size="md" color="gray.800">Send Results</Heading>
              {sending && (
                <VStack align="start" spacing={2} mt={2}>
                  <HStack spacing={4} flexWrap="wrap">
                    <Text fontSize="sm" color="gray.500">
                      {results.pausing 
                        ? "⏸️ Pausing between batches to avoid rate limits..." 
                        : `📧 Sending... ${results.currentIndex || 0} of ${results.total || parseEmails(emails).length} emails processed`}
                    </Text>
                    {results.currentIndex > 0 && results.total > 0 && !results.pausing && (
                      <HStack spacing={1}>
                        <Clock size={14} className="text-gray-500" />
                        <Text fontSize="xs" color="gray.500">
                          Est. remaining: ~{Math.ceil(((results.total - results.currentIndex) / 40) * 1.5)} min
                        </Text>
                      </HStack>
                    )}
                  </HStack>
                  {results.total > 0 && (
                    <Box w="100%">
                      <Box w="100%" bg="gray.200" borderRadius="md" h="8px" overflow="hidden" mb={1}>
                        <Box 
                          bg="blue.500" 
                          h="100%" 
                          w={`${((results.currentIndex || 0) / results.total) * 100}%`}
                          transition="width 0.3s ease"
                        />
                      </Box>
                      <Text fontSize="xs" color="gray.500" textAlign="right">
                        {Math.round(((results.currentIndex || 0) / results.total) * 100)}% complete
                      </Text>
                    </Box>
                  )}
                </VStack>
              )}
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={6}>
                  <HStack>
                    <CheckCircle2 className="text-green-500" size={20} />
                    <Text fontWeight="semibold" color="green.600">
                      Success: {results.success}
                    </Text>
                  </HStack>
                  {results.failed > 0 && (
                    <HStack>
                    <XCircle className="text-red-500" size={20} />
                    <Text fontWeight="semibold" color="red.600">
                      Failed: {results.failed}
                    </Text>
                  </HStack>
                  )}
                </HStack>

                {results.errors.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                          Failed Emails ({results.errors.length}):
                        </Text>
                        <Button
                          size="xs"
                          variant="outline"
                          colorScheme="red"
                          onClick={exportFailedEmails}
                          leftIcon={<Download size={12} />}
                        >
                          Export CSV
                        </Button>
                      </HStack>
                      <VStack align="stretch" spacing={2} maxH="200px" overflowY="auto">
                        {results.errors.map((error, index) => (
                          <Box
                            key={index}
                            p={2}
                            bg="red.50"
                            borderRadius="md"
                            borderLeft="3px solid"
                            borderColor="red.400"
                          >
                            <Text fontSize="xs" color="red.700">
                              <strong>{error.email}:</strong> {error.error}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  </>
                )}

                {/* Success Rate */}
                {results.total > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                          Success Rate:
                        </Text>
                        <Badge 
                          colorScheme={results.success / results.total > 0.8 ? "green" : results.success / results.total > 0.5 ? "yellow" : "red"}
                          fontSize="sm"
                        >
                          {Math.round((results.success / results.total) * 100)}%
                        </Badge>
                      </HStack>
                      <Box w="100%" bg="gray.200" borderRadius="md" h="6px" overflow="hidden">
                        <Box 
                          bg="green.500" 
                          h="100%" 
                          w={`${(results.success / results.total) * 100}%`}
                          transition="width 0.3s ease"
                        />
                      </Box>
                    </Box>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}
            </TabPanel>

            {/* Statistics Tab */}
            <TabPanel px={0}>
              <Card shadow="lg" mb={6}>
                <CardHeader>
                  <HStack justify="space-between">
                    <Box>
                      <Heading size="md" color="gray.800">Email Statistics</Heading>
                      <Text fontSize="sm" color="gray.500" mt={2}>
                        Track all emails sent through this system
                      </Text>
                    </Box>
                    {allTimeStats.totalSent > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="red"
                        onClick={clearAllStats}
                        leftIcon={<Trash2 size={14} />}
                      >
                        Clear Stats
                      </Button>
                    )}
                  </HStack>
                </CardHeader>
                <CardBody>
                  {allTimeStats.totalSent === 0 ? (
                    <VStack spacing={4} py={8}>
                      <Database size={48} className="text-gray-400" />
                      <Text fontSize="lg" color="gray.500" fontWeight="semibold">
                        No statistics yet
                      </Text>
                      <Text fontSize="sm" color="gray.400" textAlign="center">
                        Start sending emails to see statistics here
                      </Text>
                    </VStack>
                  ) : (
                    <VStack spacing={6} align="stretch">
                      {/* Main Statistics */}
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <Stat p={4} bg="blue.50" borderRadius="lg" borderLeft="4px solid" borderColor="blue.400">
                          <StatLabel>
                            <HStack spacing={2}>
                              <Mail size={16} className="text-blue-500" />
                              <Text>Total Emails Sent</Text>
                            </HStack>
                          </StatLabel>
                          <StatNumber color="blue.600" fontSize="3xl">
                            {allTimeStats.totalSent.toLocaleString()}
                          </StatNumber>
                          <StatHelpText>
                            <HStack spacing={1}>
                              <TrendingUp size={12} />
                              <Text>All time</Text>
                            </HStack>
                          </StatHelpText>
                        </Stat>

                        <Stat p={4} bg="green.50" borderRadius="lg" borderLeft="4px solid" borderColor="green.400">
                          <StatLabel>
                            <HStack spacing={2}>
                              <Users size={16} className="text-green-500" />
                              <Text>Unique Recipients</Text>
                            </HStack>
                          </StatLabel>
                          <StatNumber color="green.600" fontSize="3xl">
                            {allTimeStats.uniqueEmails.toLocaleString()}
                          </StatNumber>
                          <StatHelpText>
                            <HStack spacing={1}>
                              <CheckCircle size={12} />
                              <Text>No duplicates</Text>
                            </HStack>
                          </StatHelpText>
                        </Stat>

                        <Stat p={4} bg="purple.50" borderRadius="lg" borderLeft="4px solid" borderColor="purple.400">
                          <StatLabel>
                            <HStack spacing={2}>
                              <Activity size={16} className="text-purple-500" />
                              <Text>Duplicate Sends</Text>
                            </HStack>
                          </StatLabel>
                          <StatNumber color="purple.600" fontSize="3xl">
                            {(allTimeStats.totalSent - allTimeStats.uniqueEmails).toLocaleString()}
                          </StatNumber>
                          <StatHelpText>
                            <Text fontSize="xs">
                              {allTimeStats.uniqueEmails > 0 
                                ? `${Math.round(((allTimeStats.totalSent - allTimeStats.uniqueEmails) / allTimeStats.totalSent) * 100)}% of total`
                                : '0%'}
                            </Text>
                          </StatHelpText>
                        </Stat>
                      </SimpleGrid>

                      {/* Statistics by Template */}
                      {Object.keys(allTimeStats.byTemplate || {}).length > 0 && (
                        <>
                          <Divider />
                          <Box>
                            <Heading size="sm" color="gray.800" mb={4}>
                              Emails Sent by Template
                            </Heading>
                            <VStack spacing={3} align="stretch">
                              {EMAIL_TEMPLATES.map((template) => {
                                const count = allTimeStats.byTemplate[template.id] || 0;
                                const percentage = allTimeStats.totalSent > 0 
                                  ? (count / allTimeStats.totalSent) * 100 
                                  : 0;
                                const Icon = template.icon;
                                
                                if (count === 0) return null;

                                return (
                                  <Box
                                    key={template.id}
                                    p={4}
                                    bg={`${template.color}.50`}
                                    borderRadius="lg"
                                    borderLeft="4px solid"
                                    borderColor={`${template.color}.400`}
                                  >
                                    <HStack justify="space-between" mb={2}>
                                      <HStack spacing={3}>
                                        <Box
                                          p={2}
                                          bg={`${template.color}.100`}
                                          borderRadius="md"
                                          color={`${template.color}.600`}
                                        >
                                          <Icon size={20} />
                                        </Box>
                                        <VStack align="start" spacing={0}>
                                          <Text fontWeight="semibold" color="gray.800">
                                            {template.name}
                                          </Text>
                                          <Text fontSize="xs" color="gray.500">
                                            {percentage.toFixed(1)}% of total sends
                                          </Text>
                                        </VStack>
                                      </HStack>
                                      <Badge
                                        colorScheme={template.color}
                                        fontSize="lg"
                                        px={3}
                                        py={1}
                                        borderRadius="md"
                                      >
                                        {count.toLocaleString()}
                                      </Badge>
                                    </HStack>
                                    <Box w="100%" bg="gray.200" borderRadius="md" h="6px" overflow="hidden" mt={2}>
                                      <Box
                                        bg={`${template.color}.500`}
                                        h="100%"
                                        w={`${percentage}%`}
                                        transition="width 0.3s ease"
                                      />
                                    </Box>
                                  </Box>
                                );
                              })}
                            </VStack>
                          </Box>
                        </>
                      )}

                      {/* Last Updated */}
                      {allTimeStats.lastUpdated && (
                        <>
                          <Divider />
                          <HStack spacing={2} color="gray.500" fontSize="sm">
                            <Calendar size={14} />
                            <Text>
                              Last updated: {new Date(allTimeStats.lastUpdated).toLocaleString()}
                            </Text>
                          </HStack>
                        </>
                      )}
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
}
