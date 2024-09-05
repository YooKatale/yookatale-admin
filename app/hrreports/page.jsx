// components/DepartmentModal.js
'use client'
import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td, Box, Heading } from '@chakra-ui/react';
const DepartmentModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [managerId, setManagerId] = useState('');
  const toast = useToast();

  const handleCreateDepartment = async () => {
    // Simulate API call
    try {
      // Replace with your API call
      console.log('Creating department:', { name, managerId });

      toast({
        title: 'Department created.',
        description: `Department ${name} has been created successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error.',
        description: 'Failed to create department.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Department</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl id="name" isRequired>
            <FormLabel>Department Name</FormLabel>
            <Input
              placeholder="Department Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl id="managerId" isRequired mt={4}>
            <FormLabel>Manager ID</FormLabel>
            <Input
              placeholder="Manager ID"
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="teal" mr={3} onClick={handleCreateDepartment}>
            Create
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// components/EmployeeTable.js




const EmployeeTable = () => {
  const employees = [
    {
      id: 1,
      name: 'John Doe',
      department: 'Engineering',
      email: 'john.doe@example.com',
      role: 'Software Engineer',
    },
    {
      id: 2,
      name: 'Jane Smith',
      department: 'Marketing',
      email: 'jane.smith@example.com',
      role: 'Marketing Specialist',
    },
    {
      id: 3,
      name: 'Michael Brown',
      department: 'Human Resources',
      email: 'michael.brown@example.com',
      role: 'HR Manager',
    },
    // Add more employee data here
  ];

  return (
    <Flex
    minH={'100vh'}
      align={'center'}
      justify={'center'}
    >
       
        <Stack mx={'auto'} width={'100%'} py={4} px={1}>
        <div className="p-2 flex justify-between">
        <div></div>
                  <div className="flex justify-end">
                    <Button
                       type='submit'
                       loadingText="Submitting"
                       size="md"
                       bg={'blue.400'}
                       color={'white'}
                       _hover={{
                         bg: 'blue.500',
                       }}
                     // onClick={() => handleModal("addProduct")}
                    >
                      Add Department
                    </Button>
                  </div>
                </div>
    <Box p={5} rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          >
     
      <Table variant="simple">
        <Thead>
        <div><Heading size={'md'}>Employees and Departments</Heading></div>
          <Tr>
            <Th>Name</Th>
            <Th>Department</Th>
            <Th>Email</Th>
            <Th>Role</Th>
          </Tr>
        </Thead>
        <Tbody>
          {employees.map((employee) => (
            <Tr key={employee.id}>
              <Td>{employee.name}</Td>
              <Td>{employee.department}</Td>
              <Td>{employee.email}</Td>
              <Td>{employee.role}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
    </Stack>
    </Flex>
  );
};

//export default EmployeeTable;


function page() {
  return (
    // <DepartmentModal isOpen={false}/>
    <EmployeeTable/>
  )
}

export default page
//export default DepartmentModal;
