"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  useToast,
  Spinner,
  Divider,
  Badge,
} from "@chakra-ui/react";
import { BACKEND_URL } from "@constants/constant";

export default function SupportPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const toast = useToast();

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/support/conversations`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (data.status === "Success" && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to load conversations", status: "error", duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/admin/support/conversations/${selectedId}/messages`, { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && data.status === "Success" && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      } catch (e) {
        if (!cancelled) toast({ title: "Error", description: "Failed to load messages", status: "error", duration: 5000 });
      }
    };
    load();
    const t = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [selectedId]);

  const sendReply = async () => {
    const text = reply.trim();
    if (!text || !selectedId || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/support/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.status === "Success" && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setReply("");
      } else {
        toast({ title: "Error", description: data.message || "Failed to send", status: "error", duration: 5000 });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to send message", status: "error", duration: 5000 });
    } finally {
      setSending(false);
    }
  };

  const selected = conversations.find((c) => c._id === selectedId);

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>Customer Support</Heading>
      <Text color="gray.600" mb={6}>Chat with customers who requested an agent.</Text>

      <HStack align="stretch" spacing={4} gap={4} flexWrap="wrap">
        <Box flex="1" minW="280px" maxW="360px" bg="gray.50" borderRadius="lg" p={4} borderWidth="1px">
          {loading ? (
            <Spinner />
          ) : conversations.length === 0 ? (
            <Text color="gray.500">No conversations yet.</Text>
          ) : (
            <VStack align="stretch" spacing={2}>
              {conversations.map((c) => (
                <Box
                  key={c._id}
                  p={3}
                  borderRadius="md"
                  bg={selectedId === c._id ? "green.50" : "white"}
                  borderWidth="1px"
                  borderColor={selectedId === c._id ? "green.200" : "gray.200"}
                  cursor="pointer"
                  onClick={() => setSelectedId(c._id)}
                >
                  <HStack justify="space-between">
                    <Text fontWeight="600" noOfLines={1}>{c.guestName || c.guestEmail || "Guest"}</Text>
                    <Badge colorScheme={c.status === "open" ? "orange" : "green"} size="sm">{c.status}</Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" noOfLines={1}>{c.guestEmail || "—"}</Text>
                  {c.lastMessage && (
                    <Text fontSize="xs" color="gray.500" noOfLines={1} mt={1}>{c.lastMessage.content}</Text>
                  )}
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        <Box flex="2" minW="320px" bg="white" borderRadius="lg" borderWidth="1px" overflow="hidden" display="flex" flexDirection="column">
          {!selected ? (
            <Box p={8} textAlign="center" color="gray.500">
              Select a conversation
            </Box>
          ) : (
            <>
              <Box p={4} borderBottomWidth="1px" bg="gray.50">
                <Text fontWeight="700">{selected.guestName || "Guest"}</Text>
                <Text fontSize="sm" color="gray.600">{selected.guestEmail} {selected.guestPhone && ` · ${selected.guestPhone}`}</Text>
              </Box>
              <VStack flex="1" align="stretch" p={4} overflowY="auto" spacing={3} maxH="400px">
                {messages.map((m, i) => (
                  <Box
                    key={i}
                    alignSelf={m.role === "agent" ? "flex-end" : "flex-start"}
                    maxW="85%"
                    px={4}
                    py={2}
                    borderRadius="lg"
                    bg={m.role === "agent" ? "green.100" : m.role === "assistant" ? "gray.100" : "blue.50"}
                  >
                    <Text fontSize="xs" color="gray.500" mb={1}>{m.role}</Text>
                    <Text>{m.content}</Text>
                  </Box>
                ))}
              </VStack>
              <HStack p={4} borderTopWidth="1px">
                <Input
                  placeholder="Type your reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendReply()}
                />
                <Button colorScheme="green" onClick={sendReply} isLoading={sending}>Send</Button>
              </HStack>
            </>
          )}
        </Box>
      </HStack>
    </Box>
  );
}
