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

// Frontend API URL - tries multiple ports
const getFrontendApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Try to use same origin but port 3000, fallback to 3001
    const origin = window.location.origin;
    const baseUrl = origin.includes('localhost') ? 'http://localhost' : origin.split(':').slice(0, 2).join(':');
    return `${baseUrl}:3000`; // Default to port 3000
  }
  return "http://localhost:3000";
};

const FRONTEND_API_URL = getFrontendApiUrl();

export default function EmailSender() {
  const [emails, setEmails] = useState("");
  const [sending, setSending] = useState(false);
  const [sendingTemplate, setSendingTemplate] = useState(null);
  const [results, setResults] = useState({ success: 0, failed: 0, errors: [] });
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
    setResults({ success: 0, failed: 0, errors: [] });

    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    let successCount = 0;
    let failCount = 0;
    const errorList = [];

    try {
      // Send emails one by one with delay to avoid rate limiting
      for (let i = 0; i < emailList.length; i++) {
        const email = emailList[i];
        
        try {
          // Try port 3000 first, then 3001 if it fails
          let response = null;
          let lastError = null;
          
          for (const port of [3000, 3001]) {
            try {
              const apiUrl = typeof window !== 'undefined' 
                ? `${window.location.protocol}//${window.location.hostname}:${port}/api/mail`
                : `http://localhost:${port}/api/mail`;
              
              response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: email,
                  type: templateId,
                }),
                signal: AbortSignal.timeout(30000), // 30 second timeout
              });

              if (response.ok) {
                break; // Success, exit loop
              } else {
                lastError = new Error(`HTTP ${response.status}`);
              }
            } catch (err) {
              lastError = err;
              continue; // Try next port
            }
          }

          if (response && response.ok) {
            successCount++;
          } else {
            const errorData = await response?.json().catch(() => ({}));
            failCount++;
            errorList.push({ 
              email, 
              error: errorData?.error || lastError?.message || `HTTP ${response?.status || 'Connection failed'}` 
            });
          }
        } catch (error) {
          failCount++;
          errorList.push({ email, error: error.message || "Connection failed" });
        }

        // Small delay between emails (except for the last one)
        if (i < emailList.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Update results in real-time
        setResults({ success: successCount, failed: failCount, errors: errorList });
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
        {(results.success > 0 || results.failed > 0) && !sending && (
          <Card shadow="lg">
            <CardHeader>
              <Heading size="md" color="gray.800">Send Results</Heading>
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
