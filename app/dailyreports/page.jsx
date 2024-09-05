// components/DepartmentModal.js
'use client'
import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Flex,
  Stack,
  useColorModeValue,
  IconButton,
  Select,
  Text,
} from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td, Box, Heading , Textarea, VStack, Checkbox } from '@chakra-ui/react';

import { PlusIcon } from 'lucide-react';
import { AddIcon, DeleteIcon, EditIcon, SettingsIcon } from '@chakra-ui/icons';

import { useDisclosure } from '@chakra-ui/react';

import { useCreateTaskMutation, useUpdateTaskMutation, useGetTaskMutation, useDeleteTaskMutation, useSubmitForReviewMutation } from '@Slices/reportingApiSlice';

const DepartmentModal = ({ isOpen, onClose, taskToEdit, isEditMode, onTaskUpdated }) => {
  const toast = useToast();
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [subtasks, setSubtasks] = useState([{ name: '', status: 'pending' }]);
  const [taskStatus, setTaskStatus]=useState('')
  const { isOpen: isDeleteConfirmOpen, onOpen: openDeleteConfirm, onClose: closeDeleteConfirm } = useDisclosure();
  const [createReportTask] = useCreateTaskMutation();
  const [updateReportTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  useEffect(() => {
    if (isEditMode && taskToEdit) {
      setEmployeeName(taskToEdit.employeeName);
      setDepartment(taskToEdit.department);
      setTaskName(taskToEdit.taskName);
      setTaskDescription(taskToEdit.taskDescription);
      setSubtasks(taskToEdit.subtasks || [{ name: '', status: 'pending' }]);
      setTaskStatus(taskToEdit.taskStatus)
    }else{
      setEmployeeName(null);
      setDepartment(null);
      setTaskName(null);
      setTaskDescription(null);
      setSubtasks([{ name: '', status: 'pending' }]);
      setTaskStatus('')
    }
  }, [taskToEdit, isEditMode, taskStatus]);

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { name: '', status: 'pending' }]);
  };

  const handleSubtaskChange = (index, key, value) => {
    const newSubtasks = subtasks.map((subtask, i) =>
      i === index ? { ...subtask, [key]: value } : subtask
    );
    setSubtasks(newSubtasks);
  };

  const handleRemoveSubtask = (index) => {
    const newSubtasks = subtasks.filter((_, i) => i !== index);
    setSubtasks(newSubtasks);
  };

  const handleSubmit = async () => {
    const taskData = {
      employeeName,
      department,
      taskName,
      taskDescription,
      subtasks,
    };

    try {
      if (isEditMode && taskToEdit?._id) {
        await updateReportTask({ id: taskToEdit._id, data: taskData }).unwrap();
        toast({
          title: 'Success',
          description: 'Task updated successfully.',
          status: 'success',
        });
      } else {
        await createReportTask(taskData).unwrap();
        toast({
          title: 'Success',
          description: 'Task created successfully.',
          status: 'success',
        });
      }
      onTaskUpdated(); // Callback to refresh task list or perform additional actions
      onClose();
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error',
        description: 'Failed to save task.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTask(taskToEdit._id).unwrap();
      toast({
        title: "Task Deleted",
        description: "The task has been successfully deleted.",
        status: "success",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the task.",
        status: "error",
      });
    }
    closeDeleteConfirm();
  };

  return (

    <>
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isEditMode ? 'Edit Task' : 'Create New Task'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl id="employeeName" isRequired>
            <FormLabel>Employee Name</FormLabel>
            <Input
             disabled={isEditMode && taskStatus=='review'}
              placeholder="Employee Name"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
            />
          </FormControl>

          <FormControl id="department" isRequired mt={4}>
            <FormLabel>Department</FormLabel>
            <Input
            disabled={isEditMode && taskStatus=='review'}
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </FormControl>

          <FormControl id="taskName" isRequired mt={4}>
            <FormLabel>Task Name</FormLabel>
            <Input
            disabled={isEditMode && taskStatus=='review'}
              placeholder="Task Name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
          </FormControl>

          <FormControl id="taskDescription" mt={4}>
            <FormLabel>Task Description</FormLabel>
            <Textarea
            disabled={isEditMode && taskStatus=='review'}
              placeholder="Task Description"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
          </FormControl>

          <FormLabel mt={4}>Subtasks</FormLabel>
          {subtasks.map((subtask, index) => (
            <Box key={index} display="flex" alignItems="center" mt={2}>
              <Input
              disabled={isEditMode && taskStatus=='review'}
                placeholder={`Subtask ${index + 1}`}
                value={subtask.name}
                onChange={(e) => handleSubtaskChange(index, 'name', e.target.value)}
              />
              <Select
                disabled
                ml={2}
                value={subtask.status}
                onChange={(e) => handleSubtaskChange(index, 'status', e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="complete">Complete</option>
              </Select>
              <IconButton
              disabled={isEditMode && taskStatus=='review'}
                bg={'red.300'}
                ml={2}
                aria-label="Remove Subtask"
                icon={<DeleteIcon color={'white'} />}
                onClick={() => !isEditMode && !taskStatus=='review'?handleRemoveSubtask(index):alert('This task is in review, cannot delete')}
                _hover={{ bg: 'red.200' }}
              />
            </Box>
          ))}
          <Button
           disabled={isEditMode && taskStatus==='review'}
            mt={4}
            onClick={handleAddSubtask}
            leftIcon={<PlusIcon size={15} />}
            width="full"
            _hover={{
              bg: useColorModeValue('gray.400', 'white'),
            }}
            color={'white'}
            bg={useColorModeValue('gray.500', 'white')}
          >
            Add Subtask
          </Button>
        </ModalBody>

        <ModalFooter>
         


          <Flex width="full" justifyContent="space-between">
              <Button onClick={onClose}>Cancel</Button>
              {/* {isEditMode && ( */}
                <>
                {taskToEdit &&
                  <Button
                  disabled={taskToEdit && taskStatus==='review'}
                    colorScheme="red"
                    //onClick={openDeleteConfirm}
                    onClick={taskStatus!=='review'?openDeleteConfirm:
                      alert('This task is already in review')}

                    mr={3}
                  >
                    Delete Task
                  </Button>}
                  <Button
                  
                    bg={'green.300'}
                    color={'white'}
                    _hover={{ bg: 'green.500' }}
                    // onClick={handleSubmit}
                    onClick={taskStatus!=='review'?handleSubmit:
                      alert('This task is in review, cannot update')}
                  >
                    {taskToEdit ? 'Update Task' : 'Create Task'}
                  </Button>
                </>
              {/* )} */}
            </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>

    <Modal isOpen={isDeleteConfirmOpen} onClose={closeDeleteConfirm}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this task?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={closeDeleteConfirm}>Cancel</Button>
            <Button colorScheme="red" onClick={handleDeleteTask} ml={3}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </>
  );
};

const EmployeeTable = () => {
  const toast = useToast();
  const { isOpen: isSubmitReviewConfirmOpen, onOpen: openSubmitReviewConfirm, onClose: closeSubmitReviewConfirm } = useDisclosure();
  const [modalState, setModalState] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [getReportTasks] = useGetTaskMutation();
  const [submitForReview] = useSubmitForReviewMutation();
  const getTeamTasks = async () => {
    const tasks = await getReportTasks().unwrap();
    setTasks(tasks);
  };

  const handleTaskUpdated = () => {
    getTeamTasks(); // Refresh task list after editing
  };

  useEffect(() => {
    getTeamTasks();
  }, []);

const seTaskToEditApproval=(tasktoedit)=>{
  openSubmitReviewConfirm()
  setTaskToEdit(tasktoedit)
}
  const handleSubmitForReview = async () => {
    // Update subtasks to complete
  const updatedSubtasks = taskToEdit.subtasks.map(subtask => ({
    ...subtask,
    status: 'complete'
  }));

    const taskData = {
      employeeName:taskToEdit.employeeName,
      department:taskToEdit.department,
      taskName:taskToEdit.taskName,
      taskDescription:taskToEdit.taskDescription,
      subtasks:updatedSubtasks,
      taskStatus:'review'
    };
    try {
      await submitForReview({id:taskToEdit._id, data: taskData}).unwrap();
      getTeamTasks()
      toast({
        title: "Task Submitted for Review",
        description: "Task has been submitted to management for Review.",
        status: "success",
      });
      closeSubmitReviewConfirm()
    } catch (error) {
     // console.log(error)
      toast({
        title: "Error",
        description: "Failed to submit task for review.",
        status: "error",
      });
    }
    closeSubmitReviewConfirm();
  };
  return (
    <Flex minH={'100vh'} style={{ marginTop: '4em' }}>
      <DepartmentModal
        isOpen={modalState}
        onClose={() => setModalState(false)}
        taskToEdit={taskToEdit}
        isEditMode={!!taskToEdit}
        onTaskUpdated={handleTaskUpdated}
      />
      <Stack mx={'auto'} width={'100%'} py={4} px={1}>
       
        <div className="p-2 flex justify-between" style={{ backgroundColor: 'white', 
          padding: 8 ,  }}>
          <div className="flex" style={{  padding: 8 }}>
            <Heading size={'lg'}>Team: Daily Task Submission</Heading>
          </div>
          <div className="flex justify-end" style={{padding:8}}>
            <Button
              type='submit'
              loadingText="Submitting"
              size="md"
              bg={'blue.400'}
              color={'white'}
              _hover={{
                bg: 'blue.500',
              }}
              onClick={() => {
                setTaskToEdit(null); // Reset editing state
                setModalState(true);
              }}
            >
              <PlusIcon size={15} /> New Task
            </Button>
          </div>
         
        </div>
   
        <Box p={5} rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} boxShadow={'sm'}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Department</Th>
                <Th>Task Name</Th>
                <Th> Description</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tasks.map((task) => (
                <Tr key={task._id}>
                  <Td>{task.employeeName}</Td>
                  <Td>{task.department}</Td>
                  <Td>{task.taskName}</Td>
                  <Td>{task.taskDescription}</Td>
                  <Td>{task.taskStatus.toUpperCase()}</Td>
                  <Td >
                   <div style={{display:'flex'}}>
                    <Button
                      //colorScheme="blue"
                      bg={'orange.300'}
                      color={'white'}
                      onClick={() => {
                        setTaskToEdit(task);
                        setModalState(true);
                      }}
                      mr={3}
                    >
                    
                      Manage 
                    </Button>
                    <Button
                   bg="green.400"
                   color={'white'}
                   _hover={{}}
                    //onClick={openSubmitReviewConfirm}
                    onClick={()=>seTaskToEditApproval(task)}
                    mr={3}
                  >
                    Submit
                  </Button>
                  </div>
                    
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Stack>

      <Modal isOpen={isSubmitReviewConfirmOpen} onClose={closeSubmitReviewConfirm}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Submission for Review</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to submit this task for review?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={closeSubmitReviewConfirm}>Cancel</Button>
            <Button colorScheme="green" onClick={handleSubmitForReview} ml={3}>Submit for Review</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default EmployeeTable;