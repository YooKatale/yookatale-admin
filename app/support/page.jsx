"use client";

import { useState, useEffect, useCallback } from "react";
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
  Badge,
  Flex,
  Divider,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import {
  MessageCircle,
  User,
  Send,
  ChevronRight,
  Trash2,
  AlertCircle,
  Headphones,
} from "lucide-react";
import { BACKEND_URL } from "@constants/constant";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function SupportPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const toast = useToast();

  const loadConversations = useCallback(async () => {
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
  }, [toast]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/admin/support/conversations/${selectedId}/messages`, {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && data.status === "Success" && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      } catch (e) {
        if (!cancelled)
          toast({ title: "Error", description: "Failed to load messages", status: "error", duration: 5000 });
      }
    };
    load();
    const t = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [selectedId, toast]);

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
        toast({
          title: "Error",
          description: data.message || "Failed to send",
          status: "error",
          duration: 5000,
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to send message",
        status: "error",
        duration: 5000,
      });
    } finally {
      setSending(false);
    }
  };

  const openDeleteConfirm = (id) => {
    setDeleteTargetId(id);
    onDeleteOpen();
  };

  const confirmDeleteConversation = async () => {
    if (!deleteTargetId) return;
    setDeletingId(deleteTargetId);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/support/conversations/${deleteTargetId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (data.status === "Success") {
        toast({ title: "Conversation deleted", status: "success", duration: 3000 });
        if (selectedId === deleteTargetId) {
          setSelectedId(null);
          setMessages([]);
        }
        setDeleteTargetId(null);
        onDeleteClose();
        loadConversations();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete",
          status: "error",
          duration: 5000,
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        status: "error",
        duration: 5000,
      });
    } finally {
      setDeletingId(null);
    }
  };
  const withAgent = conversations.filter((c) => c.status === "with_agent");

  const selected = conversations.find((c) => c._id === selectedId);
  const needsAttention = conversations.filter((c) => c.status === "open");

  return (
    <Box p={6} maxW="1400px" mx="auto">
      <Flex align="center" gap={3} mb={2}>
        <Headphones size={28} className="text-slate-700" />
        <Heading size="lg" fontWeight="600" color="gray.800">
          Customer Support
        </Heading>
      </Flex>
      <Text color="gray.600" mb={6}>
        Reply to customers who requested an agent. Conversations marked as open are waiting for attention.
      </Text>

      {needsAttention.length > 0 && (
        <Box
          mb={4}
          p={4}
          borderRadius="lg"
          bg="orange.50"
          borderWidth="1px"
          borderColor="orange.200"
        >
          <HStack spacing={2} mb={2}>
            <AlertCircle size={20} className="text-orange-600" />
            <Text fontWeight="600" color="orange.800">
              Needs attention
            </Text>
            <Badge colorScheme="orange" size="sm">
              {needsAttention.length}
            </Badge>
          </HStack>
          <Text fontSize="sm" color="orange.700">
            The following conversations are open and waiting for an agent. Select one to respond.
          </Text>
        </Box>
      )}

      <HStack align="stretch" spacing={4} gap={4} flexWrap="wrap">
        <Box
          flex="1"
          minW="300px"
          maxW="380px"
          bg="white"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="gray.200"
          overflow="hidden"
          shadow="sm"
        >
          <Box px={4} py={3} borderBottomWidth="1px" bg="gray.50">
            <HStack spacing={2}>
              <MessageCircle size={20} color="var(--chakra-colors-gray-600)" />
              <Text fontWeight="600" color="gray.800">
                Conversations
              </Text>
            </HStack>
          </Box>
          <Box overflowY="auto" maxH="500px">
            {loading ? (
              <Flex justify="center" py={8}>
                <Spinner size="md" />
              </Flex>
            ) : conversations.length === 0 ? (
              <Box p={6} textAlign="center">
                <MessageCircle size={40} color="var(--chakra-colors-gray-300)" style={{ margin: "0 auto 8px" }} />
                <Text color="gray.500">No conversations yet.</Text>
              </Box>
            ) : (
              <VStack align="stretch" spacing={0} divider={<Divider />}>
                {conversations.map((c) => (
                  <Box
                    key={c._id}
                    p={4}
                    bg={selectedId === c._id ? "blue.50" : "white"}
                    borderLeftWidth="3px"
                    borderLeftColor={selectedId === c._id ? "blue.500" : "transparent"}
                    cursor="pointer"
                    onClick={() => setSelectedId(c._id)}
                    _hover={{ bg: selectedId === c._id ? "blue.50" : "gray.50" }}
                  >
                    <Flex justify="space-between" align="flex-start" gap={2}>
                      <HStack spacing={2} flex="1" minW={0}>
                        <Box color="gray.500">
                          <User size={18} />
                        </Box>
                        <VStack align="stretch" spacing={0} flex="1" minW={0}>
                          <Text fontWeight="600" fontSize="sm" noOfLines={1}>
                            {c.guestName || c.guestEmail || "Guest"}
                          </Text>
                          <Text fontSize="xs" color="gray.500" noOfLines={1}>
                            {c.guestEmail || "—"}
                          </Text>
                          {c.lastMessage && (
                            <Text fontSize="xs" color="gray.600" noOfLines={1} mt={1}>
                              {c.lastMessage.content}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                      <HStack spacing={1} flexShrink={0}>
                        <Badge
                          colorScheme={c.status === "open" ? "orange" : "green"}
                          size="sm"
                          fontSize="xs"
                        >
                          {c.status === "open" ? "Open" : "With agent"}
                        </Badge>
                        <IconButton
                          aria-label="Delete conversation"
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          icon={<Trash2 size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteConfirm(c._id);
                          }}
                        />
                      </HStack>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </Box>

        <Box
          flex="2"
          minW="360px"
          bg="white"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="gray.200"
          overflow="hidden"
          display="flex"
          flexDirection="column"
          shadow="sm"
        >
          {!selected ? (
            <Flex
              flex="1"
              direction="column"
              align="center"
              justify="center"
              p={8}
              color="gray.500"
              textAlign="center"
            >
              <MessageCircle size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
              <Text fontWeight="500">Select a conversation</Text>
              <Text fontSize="sm" mt={1}>
                Choose a thread from the list to view messages and reply
              </Text>
            </Flex>
          ) : (
            <>
              <Box px={4} py={3} borderBottomWidth="1px" bg="gray.50" flexShrink={0}>
                <Flex justify="space-between" align="center">
                  <HStack spacing={2}>
                    <User size={20} color="var(--chakra-colors-gray-600)" />
                    <VStack align="stretch" spacing={0}>
                      <Text fontWeight="700" fontSize="md">
                        {selected.guestName || "Guest"}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {selected.guestEmail}
                        {selected.guestPhone && ` · ${selected.guestPhone}`}
                      </Text>
                    </VStack>
                  </HStack>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    leftIcon={<Trash2 size={14} />}
                    onClick={() => openDeleteConfirm(selected._id)}
                  >
                    Delete chat
                  </Button>
                </Flex>
              </Box>
              <VStack
                flex="1"
                align="stretch"
                p={4}
                overflowY="auto"
                spacing={3}
                maxH="400px"
                bg="gray.50"
              >
                {messages.map((m, i) => (
                  <Box
                    key={i}
                    alignSelf={m.role === "agent" ? "flex-end" : "flex-start"}
                    maxW="85%"
                    px={4}
                    py={2}
                    borderRadius="lg"
                    bg={m.role === "agent" ? "blue.500" : "white"}
                    color={m.role === "agent" ? "white" : "gray.800"}
                    borderWidth={m.role === "agent" ? 0 : "1px"}
                    borderColor="gray.200"
                    boxShadow="sm"
                  >
                    <Text fontSize="xs" opacity={0.9} mb={1}>
                      {m.role === "agent" ? "Agent" : "Customer"}
                    </Text>
                    <Text fontSize="sm">{m.content}</Text>
                    {m.createdAt && (
                      <Text fontSize="xs" mt={1} opacity={0.8}>
                        {formatTime(m.createdAt)}
                      </Text>
                    )}
                  </Box>
                ))}
              </VStack>
              <HStack p={4} borderTopWidth="1px" bg="white" flexShrink={0}>
                <Input
                  placeholder="Type your reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendReply()}
                  size="md"
                />
                <Button
                  colorScheme="blue"
                  onClick={sendReply}
                  isLoading={sending}
                  leftIcon={<Send size={18} />}
                >
                  Send
                </Button>
              </HStack>
            </>
          )}
        </Box>
      </HStack>

      <AlertDialog isOpen={isDeleteOpen} onClose={onDeleteClose} leastDestructiveRef={undefined}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete conversation</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this conversation? All messages will be permanently removed.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onDeleteClose}>Cancel</Button>
              <Button
                colorScheme="red"
                onClick={confirmDeleteConversation}
                isLoading={deletingId !== null}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
