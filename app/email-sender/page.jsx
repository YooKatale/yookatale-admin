"use client";

import { useState } from "react";
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
  Divider
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
  Loader2
} from "lucide-react";

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
];

// Get Frontend API URL - works in both development and production
// The frontend email API is at: https://www.yookatale.app/api/mail (production)
// or http://localhost:3000/api/mail / http://localhost:3001/api/mail (development)
const getFrontendApiUrl = () => {
  if (typeof window === 'undefined') {
    return null; // Server-side, will use development ports
  }

  const origin = window.location.origin;
  const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
  
  if (isLocalhost) {
    // Development: return null to try multiple ports
    return null;
  } else {
    // Production: use the frontend URL
    // You can set NEXT_PUBLIC_FRONTEND_URL in your .env file, or it defaults to yookatale.app
    // Note: In client components, only NEXT_PUBLIC_* env vars are available
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://www.yookatale.app';
    return frontendUrl;
  }
};

// Get API endpoints to try - handles both dev and production
const getApiEndpoints = () => {
  const baseUrl = getFrontendApiUrl();
  
  if (baseUrl) {
    // Production: single endpoint
    return [`${baseUrl}/api/mail`];
  }
  
  // Development: try multiple ports
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return [
      `${protocol}//${hostname}:3000/api/mail`,
      `${protocol}//${hostname}:3001/api/mail`
    ];
  }
  
  return [
    'http://localhost:3000/api/mail',
    'http://localhost:3001/api/mail'
  ];
};

export default function EmailSender() {
  const [emails, setEmails] = useState("");
  const [sending, setSending] = useState(false);
  const [sendingTemplate, setSendingTemplate] = useState(null);
  const [results, setResults] = useState({ success: 0, failed: 0, errors: [], currentIndex: 0, total: 0 });
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

    setSending(true);
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

        {/* Email Input Section */}
        <Card mb={6} shadow="lg">
          <CardHeader>
            <Heading size="md" color="gray.800">Email Recipients</Heading>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Paste email addresses separated by commas, semicolons, or new lines
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Textarea
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="email1@example.com, email2@example.com&#10;email3@example.com"
                minH="200px"
                fontSize="sm"
                resize="vertical"
              />
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  {parseEmails(emails).length > 0 
                    ? `${parseEmails(emails).length} valid email(s) detected`
                    : "No valid emails detected"}
                </Text>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEmails("")}
                  isDisabled={!emails || sending}
                >
                  Clear
                </Button>
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
                      <Button
                        colorScheme={template.color}
                        onClick={() => sendEmails(template.id)}
                        isDisabled={!emails || sending || parseEmails(emails).length === 0}
                        isLoading={isSending}
                        loadingText="Sending..."
                        leftIcon={isSending ? <Loader2 size={16} /> : <Send size={16} />}
                      >
                        Send
                      </Button>
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
                  <Text fontSize="sm" color="gray.500">
                    {results.pausing 
                      ? "⏸️ Pausing between batches to avoid rate limits..." 
                      : `📧 Sending... ${results.currentIndex || 0} of ${results.total || parseEmails(emails).length} emails processed`}
                  </Text>
                  {results.total > 0 && (
                    <Box w="100%" bg="gray.200" borderRadius="md" h="8px" overflow="hidden">
                      <Box 
                        bg="blue.500" 
                        h="100%" 
                        w={`${((results.currentIndex || 0) / results.total) * 100}%`}
                        transition="width 0.3s ease"
                      />
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
                      <Text fontSize="sm" fontWeight="semibold" mb={2} color="gray.700">
                        Failed Emails:
                      </Text>
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
              </VStack>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
