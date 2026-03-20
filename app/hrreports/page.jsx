"use client";

import {
  useGetTasksMutation, useCreateTaskMutation,
  useUpdateTaskMutation, useDeleteTaskMutation, useGetTeamMembersMutation,
} from "@Slices/taskApiSlice";
import {
  Box, Flex, Heading, Text, Badge, Input, Textarea, Select,
  SimpleGrid, VStack, HStack, Button, Icon, useToast,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  useDisclosure, Stat, StatLabel, StatNumber, Tabs, TabList, Tab, TabPanels, TabPanel,
  Avatar, Tooltip, Progress, Divider, Spinner, Center, FormControl, FormLabel,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader,
  AlertDialogBody, AlertDialogFooter, Checkbox,
} from "@chakra-ui/react";
import {
  FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiClock, FiAlertTriangle,
  FiUser, FiCalendar, FiMessageSquare, FiFlag, FiSearch, FiFilter,
} from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment";

const PRIMARY = "#185f2d";

const PRIORITY_CONFIG = {
  low:    { color: "gray",   label: "Low",    icon: FiFlag },
  medium: { color: "blue",   label: "Medium", icon: FiFlag },
  high:   { color: "orange", label: "High",   icon: FiAlertTriangle },
  urgent: { color: "red",    label: "Urgent", icon: FiAlertTriangle },
};

const STATUS_CONFIG = {
  pending:     { color: "gray",   label: "Pending",     bg: "#f7fafc" },
  in_progress: { color: "blue",   label: "In Progress", bg: "#ebf8ff" },
  done:        { color: "green",  label: "Done",        bg: "#f0fff4" },
  reviewed:    { color: "purple", label: "Reviewed",    bg: "#faf5ff" },
};

function StatCard({ label, value, color = "gray.800", icon: IconComp }) {
  return (
    <Box bg="white" borderRadius="xl" p={5} border="1px solid" borderColor="gray.100" boxShadow="0 2px 8px rgba(0,0,0,0.05)">
      <Flex justify="space-between" align="center">
        <Box>
          <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color="gray.400" mb={1}>{label}</Text>
          <Text fontSize="2xl" fontWeight="800" color={color}>{value}</Text>
        </Box>
        {IconComp && <Box p={3} borderRadius="xl" bg="gray.50"><Icon as={IconComp} boxSize={5} color="gray.400" /></Box>}
      </Flex>
    </Box>
  );
}

function DeadlineBadge({ deadline }) {
  if (!deadline) return null;
  const now = moment();
  const due = moment(deadline);
  const diff = due.diff(now, "days");
  const overdue = diff < 0;
  const soon = diff >= 0 && diff <= 2;
  return (
    <HStack spacing={1} fontSize="xs" color={overdue ? "red.500" : soon ? "orange.500" : "gray.400"}>
      <Icon as={FiCalendar} />
      <Text fontWeight={overdue || soon ? "700" : "400"}>
        {overdue ? `${Math.abs(diff)}d overdue` : diff === 0 ? "Due today" : `${diff}d left`}
      </Text>
    </HStack>
  );
}

export default function TeamTasksPage() {
  const { userInfo } = useSelector((state) => state.auth);
  const toast = useToast();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const deleteRef = useRef();

  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [feedbackText, setFeedbackText] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    title: "", description: "", department: "",
    assignedToId: "", assignedToName: "", assignedToEmail: "",
    deadline: "", priority: "medium", subtasks: [],
  });
  const [newSubtask, setNewSubtask] = useState("");

  const [getTasksApi] = useGetTasksMutation();
  const [createTaskApi] = useCreateTaskMutation();
  const [updateTaskApi] = useUpdateTaskMutation();
  const [deleteTaskApi] = useDeleteTaskMutation();
  const [getTeamApi] = useGetTeamMembersMutation();

  const load = async () => {
    setLoading(true);
    try {
      const [tasksRes, teamRes] = await Promise.all([getTasksApi().unwrap(), getTeamApi().unwrap()]);
      if (tasksRes.status === "Success") setTasks(tasksRes.data);
      if (teamRes.status === "Success") setTeamMembers(teamRes.data);
    } catch { toast({ title: "Failed to load tasks", status: "error", duration: 3000 }); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleFieldChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAssignee = (e) => {
    const member = teamMembers.find((m) => m._id === e.target.value);
    setForm((f) => ({
      ...f,
      assignedToId: e.target.value,
      assignedToName: member ? `${member.firstname || ""} ${member.lastname || ""}`.trim() || member.username : "",
      assignedToEmail: member?.email || "",
    }));
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setForm((f) => ({ ...f, subtasks: [...f.subtasks, { name: newSubtask.trim(), status: "pending" }] }));
    setNewSubtask("");
  };

  const toggleSubtask = (idx) => {
    setForm((f) => ({
      ...f,
      subtasks: f.subtasks.map((s, i) => i === idx ? { ...s, status: s.status === "complete" ? "pending" : "complete" } : s),
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast({ title: "Title is required", status: "warning", duration: 2000 });
    setSaving(true);
    try {
      let res;
      if (editMode && selectedTask) {
        res = await updateTaskApi({ id: selectedTask._id, ...form, deadline: form.deadline || null }).unwrap();
      } else {
        res = await createTaskApi({ ...form, deadline: form.deadline || null }).unwrap();
      }
      if (res.status === "Success") {
        if (editMode) {
          setTasks((prev) => prev.map((t) => t._id === selectedTask._id ? res.data : t));
          toast({ title: "Task updated!", status: "success", duration: 2000 });
        } else {
          setTasks((prev) => [res.data, ...prev]);
          toast({ title: "Task created!", status: "success", duration: 2000 });
        }
        onCreateClose();
        setEditMode(false);
        setSelectedTask(null);
        setForm({ title: "", description: "", department: "", assignedToId: "", assignedToName: "", assignedToEmail: "", deadline: "", priority: "medium", subtasks: [] });
      }
    } catch (err) {
      toast({ title: err?.data?.message || "Failed to save task", status: "error", duration: 3000 });
    }
    setSaving(false);
  };

  const openEdit = (task) => {
    setEditMode(true);
    setSelectedTask(task);
    setForm({
      title: task.title || "", description: task.description || "", department: task.department || "",
      assignedToId: task.assignedToId || "", assignedToName: task.assignedToName || "", assignedToEmail: task.assignedToEmail || "",
      deadline: task.deadline ? moment(task.deadline).format("YYYY-MM-DD") : "",
      priority: task.priority || "medium", subtasks: task.subtasks || [],
    });
    onCreateOpen();
  };

  const openDetail = (task) => { setSelectedTask(task); setFeedbackText(task.feedback || ""); onDetailOpen(); };

  const handleStatusChange = async (task, status) => {
    try {
      const res = await updateTaskApi({ id: task._id, status }).unwrap();
      if (res.status === "Success") {
        setTasks((prev) => prev.map((t) => t._id === task._id ? res.data : t));
        if (selectedTask?._id === task._id) setSelectedTask(res.data);
        toast({ title: `Status updated to "${STATUS_CONFIG[status]?.label}"`, status: "success", duration: 2000 });
      }
    } catch { toast({ title: "Failed to update status", status: "error", duration: 2000 }); }
  };

  const handleFeedback = async () => {
    if (!selectedTask) return;
    try {
      const res = await updateTaskApi({ id: selectedTask._id, feedback: feedbackText, status: "reviewed" }).unwrap();
      if (res.status === "Success") {
        setTasks((prev) => prev.map((t) => t._id === selectedTask._id ? res.data : t));
        setSelectedTask(res.data);
        toast({ title: "Feedback submitted!", status: "success", duration: 2000 });
      }
    } catch { toast({ title: "Failed to submit feedback", status: "error", duration: 2000 }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteTaskApi(deleteId).unwrap();
      setTasks((prev) => prev.filter((t) => t._id !== deleteId));
      toast({ title: "Task deleted", status: "success", duration: 2000 });
    } catch { toast({ title: "Failed to delete task", status: "error", duration: 2000 }); }
    setDeleting(false);
    setDeleteId(null);
  };

  const filtered = tasks.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.title?.toLowerCase().includes(q) || t.assignedToName?.toLowerCase().includes(q) || t.department?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => ["done", "reviewed"].includes(t.status)).length,
    overdue: tasks.filter((t) => t.deadline && moment(t.deadline).isBefore(moment()) && !["done", "reviewed"].includes(t.status)).length,
  };

  if (loading) return <Center minH="60vh"><Spinner size="xl" color={PRIMARY} /></Center>;

  return (
    <Box maxW="full" pb={10}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color="gray.800" fontWeight="800">Team Tasks</Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>Assign, track and review tasks across your remote team</Text>
        </Box>
        <Button leftIcon={<FiPlus />} bg={PRIMARY} color="white" _hover={{ bg: "#1f793a" }} borderRadius="xl" size="sm" px={5} fontWeight="700"
          onClick={() => { setEditMode(false); setForm({ title: "", description: "", department: "", assignedToId: "", assignedToName: "", assignedToEmail: "", deadline: "", priority: "medium", subtasks: [] }); onCreateOpen(); }}>
          New Task
        </Button>
      </Flex>

      {/* Stats */}
      <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mb={6}>
        <StatCard label="Total" value={stats.total} icon={FiFlag} />
        <StatCard label="Pending" value={stats.pending} color="gray.600" icon={FiClock} />
        <StatCard label="In Progress" value={stats.inProgress} color="blue.500" icon={FiClock} />
        <StatCard label="Completed" value={stats.done} color={PRIMARY} icon={FiCheckCircle} />
        <StatCard label="Overdue" value={stats.overdue} color="red.500" icon={FiAlertTriangle} />
      </SimpleGrid>

      {/* Filters */}
      <Flex gap={3} mb={5} flexWrap="wrap">
        <Input placeholder="Search tasks, assignee..." value={search} onChange={(e) => setSearch(e.target.value)}
          maxW="280px" h="38px" fontSize="sm" bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200"
          leftIcon={<FiSearch />} _focus={{ borderColor: PRIMARY, boxShadow: `0 0 0 1px ${PRIMARY}` }} />
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} maxW="160px" h="38px" fontSize="sm" bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" _focus={{ borderColor: PRIMARY }}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
          <option value="reviewed">Reviewed</option>
        </Select>
        <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} maxW="160px" h="38px" fontSize="sm" bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" _focus={{ borderColor: PRIMARY }}>
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </Select>
        <Text fontSize="xs" color="gray.400" alignSelf="center">{filtered.length} task{filtered.length !== 1 ? "s" : ""}</Text>
      </Flex>

      {/* Task list */}
      {filtered.length === 0 ? (
        <Box textAlign="center" py={20} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100">
          <Text fontSize="4xl" mb={3}>✅</Text>
          <Heading size="sm" color="gray.600" mb={2}>{search || filterStatus !== "all" ? "No tasks match your filters" : "No tasks yet"}</Heading>
          <Text color="gray.400" fontSize="sm">{!search && filterStatus === "all" && "Create your first task to get the team moving"}</Text>
        </Box>
      ) : (
        <VStack spacing={3} align="stretch">
          {filtered.map((task) => {
            const pConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
            const sConf = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
            const isOverdue = task.deadline && moment(task.deadline).isBefore(moment()) && !["done", "reviewed"].includes(task.status);
            const completedSubs = (task.subtasks || []).filter((s) => s.status === "complete").length;
            const totalSubs = (task.subtasks || []).length;

            return (
              <Box key={task._id} bg="white" borderRadius="xl" border="1px solid" borderColor={isOverdue ? "red.200" : "gray.100"}
                boxShadow="0 2px 8px rgba(0,0,0,0.05)" p={4} transition="all 0.2s" cursor="pointer"
                _hover={{ boxShadow: "0 6px 20px rgba(0,0,0,0.1)", borderColor: "green.200" }}
                onClick={() => openDetail(task)}>
                <Flex gap={4} flexWrap={{ base: "wrap", md: "nowrap" }}>
                  <Box flex={1} minW={0}>
                    <Flex align="center" gap={2} mb={1} flexWrap="wrap">
                      <Badge colorScheme={pConf.color} borderRadius="full" px={2} fontSize="9px" fontWeight="700">{pConf.label}</Badge>
                      <Badge colorScheme={sConf.color} borderRadius="full" px={2} fontSize="9px" fontWeight="700">{sConf.label}</Badge>
                      {isOverdue && <Badge colorScheme="red" borderRadius="full" px={2} fontSize="9px" fontWeight="700">OVERDUE</Badge>}
                      {task.department && <Text fontSize="xs" color="gray.400">{task.department}</Text>}
                    </Flex>
                    <Text fontWeight="700" fontSize="sm" color="gray.800" mb={1} noOfLines={2}>{task.title}</Text>
                    {task.description && <Text fontSize="xs" color="gray.500" noOfLines={2} mb={2}>{task.description}</Text>}
                    <HStack spacing={4} flexWrap="wrap">
                      {task.assignedToName && (
                        <HStack spacing={1} fontSize="xs" color="gray.500">
                          <Avatar size="2xs" name={task.assignedToName} bg={PRIMARY} color="white" />
                          <Text>{task.assignedToName}</Text>
                        </HStack>
                      )}
                      <DeadlineBadge deadline={task.deadline} />
                      {task.assignedByName && <Text fontSize="xs" color="gray.400">by {task.assignedByName}</Text>}
                    </HStack>
                    {totalSubs > 0 && (
                      <Box mt={2}>
                        <Flex align="center" gap={2} mb={1}>
                          <Text fontSize="xs" color="gray.500">{completedSubs}/{totalSubs} subtasks</Text>
                        </Flex>
                        <Progress value={(completedSubs / totalSubs) * 100} size="xs" colorScheme="green" borderRadius="full" />
                      </Box>
                    )}
                  </Box>
                  {/* Quick actions */}
                  <VStack spacing={2} align="flex-end" flexShrink={0} onClick={(e) => e.stopPropagation()}>
                    {task.status !== "done" && task.status !== "reviewed" && (
                      <Button size="xs" leftIcon={<FiCheckCircle />} colorScheme="green" variant="outline" borderRadius="lg"
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(task, "done"); }}>
                        Done
                      </Button>
                    )}
                    {task.status === "pending" && (
                      <Button size="xs" leftIcon={<FiClock />} colorScheme="blue" variant="ghost" borderRadius="lg"
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(task, "in_progress"); }}>
                        Start
                      </Button>
                    )}
                    <Button size="xs" leftIcon={<FiEdit2 />} variant="ghost" color="gray.500" borderRadius="lg"
                      onClick={(e) => { e.stopPropagation(); openEdit(task); }}>
                      Edit
                    </Button>
                    <Button size="xs" leftIcon={<FiTrash2 />} colorScheme="red" variant="ghost" borderRadius="lg"
                      onClick={(e) => { e.stopPropagation(); setDeleteId(task._id); }}>
                      Delete
                    </Button>
                  </VStack>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      )}

      {/* Create/Edit Task Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => { onCreateClose(); setEditMode(false); }} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius="2xl" mx={3}>
          <ModalHeader fontSize="lg" fontWeight="800" color="gray.800">{editMode ? "Edit Task" : "Create New Task"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="700" color="gray.700">Task Title</FormLabel>
                <Input name="title" value={form.title} onChange={handleFieldChange} placeholder="What needs to be done?" borderRadius="xl" _focus={{ borderColor: PRIMARY }} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700" color="gray.700">Description</FormLabel>
                <Textarea name="description" value={form.description} onChange={handleFieldChange} placeholder="Provide details about this task..." rows={3} borderRadius="xl" resize="vertical" _focus={{ borderColor: PRIMARY }} />
              </FormControl>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700" color="gray.700">Assign To</FormLabel>
                  <Select value={form.assignedToId} onChange={handleAssignee} borderRadius="xl" _focus={{ borderColor: PRIMARY }}>
                    <option value="">-- Select team member --</option>
                    {teamMembers.map((m) => (
                      <option key={m._id} value={m._id}>{m.firstname} {m.lastname} ({m.username}) — {m.accountType}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700" color="gray.700">Department</FormLabel>
                  <Input name="department" value={form.department} onChange={handleFieldChange} placeholder="e.g. Marketing, Tech..." borderRadius="xl" list="dept-options" _focus={{ borderColor: PRIMARY }} />
                  <datalist id="dept-options">
                    {["Engineering", "Marketing", "Sales", "Operations", "Support", "Finance", "HR"].map((d) => <option key={d} value={d} />)}
                  </datalist>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700" color="gray.700">Deadline</FormLabel>
                  <Input type="date" name="deadline" value={form.deadline} onChange={handleFieldChange} borderRadius="xl" _focus={{ borderColor: PRIMARY }} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700" color="gray.700">Priority</FormLabel>
                  <Select name="priority" value={form.priority} onChange={handleFieldChange} borderRadius="xl" _focus={{ borderColor: PRIMARY }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              {/* Subtasks */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700" color="gray.700">Subtasks</FormLabel>
                <HStack>
                  <Input value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} placeholder="Add a subtask..."
                    borderRadius="xl" fontSize="sm" _focus={{ borderColor: PRIMARY }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubtask(); } }} />
                  <Button onClick={addSubtask} bg={PRIMARY} color="white" _hover={{ bg: "#1f793a" }} borderRadius="xl" size="sm" px={4}>Add</Button>
                </HStack>
                {form.subtasks.length > 0 && (
                  <VStack mt={2} align="stretch" spacing={1}>
                    {form.subtasks.map((s, i) => (
                      <Flex key={i} align="center" gap={2} bg="gray.50" p={2} borderRadius="lg">
                        <Checkbox isChecked={s.status === "complete"} onChange={() => toggleSubtask(i)} colorScheme="green" />
                        <Text fontSize="sm" color="gray.700" flex={1} textDecoration={s.status === "complete" ? "line-through" : "none"}>{s.name}</Text>
                        <Button size="xs" variant="ghost" color="red.400" onClick={() => setForm((f) => ({ ...f, subtasks: f.subtasks.filter((_, j) => j !== i) }))}>×</Button>
                      </Flex>
                    ))}
                  </VStack>
                )}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="outline" borderRadius="xl" onClick={() => { onCreateClose(); setEditMode(false); }}>Cancel</Button>
            <Button bg={PRIMARY} color="white" _hover={{ bg: "#1f793a" }} borderRadius="xl" isLoading={saving} onClick={handleSave} fontWeight="700">
              {editMode ? "Update Task" : "Create Task"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="lg" scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent borderRadius="2xl" mx={3}>
            <ModalHeader fontSize="md" fontWeight="800" color="gray.800" pr={10}>{selectedTask.title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={4}>
              <VStack spacing={4} align="stretch">
                <Flex gap={2} flexWrap="wrap">
                  <Badge colorScheme={PRIORITY_CONFIG[selectedTask.priority]?.color || "gray"} borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="700">
                    {PRIORITY_CONFIG[selectedTask.priority]?.label}
                  </Badge>
                  <Badge colorScheme={STATUS_CONFIG[selectedTask.status]?.color || "gray"} borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="700">
                    {STATUS_CONFIG[selectedTask.status]?.label}
                  </Badge>
                </Flex>
                {selectedTask.description && <Text fontSize="sm" color="gray.600" lineHeight="1.7">{selectedTask.description}</Text>}
                <SimpleGrid columns={2} spacing={3} fontSize="sm">
                  {selectedTask.assignedToName && (
                    <Box bg="gray.50" p={3} borderRadius="xl">
                      <Text fontSize="xs" color="gray.400" fontWeight="700" mb={1}>ASSIGNED TO</Text>
                      <HStack><Avatar size="xs" name={selectedTask.assignedToName} bg={PRIMARY} color="white" /><Text fontWeight="600">{selectedTask.assignedToName}</Text></HStack>
                    </Box>
                  )}
                  {selectedTask.assignedByName && (
                    <Box bg="gray.50" p={3} borderRadius="xl">
                      <Text fontSize="xs" color="gray.400" fontWeight="700" mb={1}>ASSIGNED BY</Text>
                      <Text fontWeight="600">{selectedTask.assignedByName}</Text>
                    </Box>
                  )}
                  {selectedTask.deadline && (
                    <Box bg="gray.50" p={3} borderRadius="xl">
                      <Text fontSize="xs" color="gray.400" fontWeight="700" mb={1}>DEADLINE</Text>
                      <DeadlineBadge deadline={selectedTask.deadline} />
                      <Text fontSize="xs" color="gray.500" mt={0.5}>{moment(selectedTask.deadline).format("DD MMM YYYY")}</Text>
                    </Box>
                  )}
                  {selectedTask.department && (
                    <Box bg="gray.50" p={3} borderRadius="xl">
                      <Text fontSize="xs" color="gray.400" fontWeight="700" mb={1}>DEPARTMENT</Text>
                      <Text fontWeight="600">{selectedTask.department}</Text>
                    </Box>
                  )}
                </SimpleGrid>

                {/* Subtasks */}
                {selectedTask.subtasks?.length > 0 && (
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={2}>
                      Subtasks ({selectedTask.subtasks.filter(s => s.status === "complete").length}/{selectedTask.subtasks.length})
                    </Text>
                    <Progress value={(selectedTask.subtasks.filter(s => s.status === "complete").length / selectedTask.subtasks.length) * 100} size="xs" colorScheme="green" borderRadius="full" mb={2} />
                    <VStack align="stretch" spacing={1}>
                      {selectedTask.subtasks.map((s, i) => (
                        <HStack key={i} bg="gray.50" p={2} borderRadius="lg">
                          <Icon as={s.status === "complete" ? FiCheckCircle : FiClock} color={s.status === "complete" ? "green.400" : "gray.400"} />
                          <Text fontSize="sm" color={s.status === "complete" ? "gray.400" : "gray.700"} textDecoration={s.status === "complete" ? "line-through" : "none"} flex={1}>{s.name}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Completion note */}
                {selectedTask.completionNote && (
                  <Box bg="green.50" borderLeft="3px solid" borderColor="green.400" p={3} borderRadius="lg">
                    <Text fontSize="xs" fontWeight="700" color="green.600" mb={1}>COMPLETION NOTE</Text>
                    <Text fontSize="sm" color="gray.700">{selectedTask.completionNote}</Text>
                  </Box>
                )}

                {/* Status update */}
                {!["reviewed"].includes(selectedTask.status) && (
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={2}>Update Status</Text>
                    <HStack flexWrap="wrap">
                      {Object.entries(STATUS_CONFIG).filter(([s]) => s !== selectedTask.status).map(([s, conf]) => (
                        <Button key={s} size="xs" colorScheme={conf.color} variant="outline" borderRadius="full" onClick={() => handleStatusChange(selectedTask, s)}>
                          {conf.label}
                        </Button>
                      ))}
                    </HStack>
                  </Box>
                )}

                <Divider />

                {/* Supervisor feedback */}
                <Box>
                  <Text fontSize="xs" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={2}>
                    <Icon as={FiMessageSquare} mr={1} />Supervisor Feedback
                  </Text>
                  {selectedTask.feedback && (
                    <Box bg="purple.50" borderLeft="3px solid" borderColor="purple.300" p={3} borderRadius="lg" mb={3}>
                      <Text fontSize="sm" color="gray.700">{selectedTask.feedback}</Text>
                    </Box>
                  )}
                  <Textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Add feedback or comments for the team member..."
                    rows={3} borderRadius="xl" fontSize="sm" resize="vertical" _focus={{ borderColor: PRIMARY }} />
                  <Button mt={2} size="sm" bg={PRIMARY} color="white" _hover={{ bg: "#1f793a" }} borderRadius="xl" onClick={handleFeedback} isDisabled={!feedbackText.trim()}>
                    Submit Feedback & Mark Reviewed
                  </Button>
                </Box>

                <Text fontSize="xs" color="gray.400">Created {moment(selectedTask.createdAt).fromNow()}</Text>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Delete confirmation */}
      <AlertDialog isOpen={!!deleteId} leastDestructiveRef={deleteRef} onClose={() => setDeleteId(null)}>
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl" mx={3}>
            <AlertDialogHeader fontSize="md" fontWeight="700">Delete Task</AlertDialogHeader>
            <AlertDialogBody fontSize="sm" color="gray.600">Are you sure? This cannot be undone.</AlertDialogBody>
            <AlertDialogFooter gap={2}>
              <Button ref={deleteRef} variant="outline" borderRadius="xl" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button colorScheme="red" size="sm" borderRadius="xl" isLoading={deleting} onClick={handleDelete}>Delete</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
