"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Select,
  Text,
  Textarea,
  useToast,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { Mail, Send } from "lucide-react";
import { BACKEND_URL } from "@constants/constant";

const TEMPLATES = [
  { value: "welcome", label: "Welcome (Subscription)", path: "/api/subscription/bulk-email-only" },
  { value: "partner", label: "Partner (Vendors & Drivers)", path: "/api/bulk/partner" },
];

export default function EmailSenderPage() {
  const [template, setTemplate] = useState("welcome");
  const [emailsText, setEmailsText] = useState("");
  const [sending, setSending] = useState(false);
  const toast = useToast();

  const parseEmails = () => {
    const raw = emailsText.trim();
    if (!raw) return [];
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const list = raw
      .split(/[\n,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && re.test(e));
    return [...new Set(list)];
  };

  const handleSend = async () => {
    const emails = parseEmails();
    if (emails.length === 0) {
      toast({ title: "No valid emails", description: "Enter at least one valid email address.", status: "warning", duration: 4000 });
      return;
    }

    const config = TEMPLATES.find((t) => t.value === template);
    if (!config) return;

    setSending(true);
    try {
      const res = await fetch(`${BACKEND_URL}${config.path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || `HTTP ${res.status}`);
      }

      const { sent = 0, failed = 0, total = 0 } = data?.data || {};
      toast({
        title: "Emails sent",
        description: `Sent: ${sent}, Failed: ${failed}, Total: ${total}`,
        status: sent > 0 ? "success" : "error",
        duration: 6000,
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: "Send failed",
        description: e?.message || "Could not send emails.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Box className="max-w-full" p={8} mt="3">
      <Heading size="lg" mb={6}>
        <HStack><Mail size={24} />Email Sender</HStack>
      </Heading>

      <Card maxW="600px">
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <FormControl>
              <FormLabel>Template</FormLabel>
              <Select value={template} onChange={(e) => setTemplate(e.target.value)}>
                {TEMPLATES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Emails (one per line, or comma/semicolon separated)</FormLabel>
              <Textarea
                value={emailsText}
                onChange={(e) => setEmailsText(e.target.value)}
                placeholder="email1@example.com&#10;email2@example.com&#10;..."
                rows={10}
                fontFamily="mono"
                fontSize="sm"
              />
            </FormControl>

            <Button
              colorScheme="green"
              leftIcon={sending ? <Spinner size="sm" /> : <Send size={18} />}
              onClick={handleSend}
              isDisabled={sending}
            >
              {sending ? "Sending..." : "Send Emails"}
            </Button>
          </VStack>
        </CardBody>
      </Card>

      <Box mt={6} maxW="600px">
        <Text fontSize="sm" color="gray.600">
          <strong>Welcome</strong> — Subscription welcome email with app links and subscription info.
          <br />
          <strong>Partner</strong> — Invites vendors and drivers to register at yookatale.app/partner. Includes Store Registration and Driver Application screenshots.
        </Text>
      </Box>
    </Box>
  );
}
