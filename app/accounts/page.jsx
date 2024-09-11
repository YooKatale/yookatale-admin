"use client";

import { useAccountsGetMutation, useDeleteUserAccountMutation, useUpdateAdminUserAccountMutation } from "@Slices/userApiSlice";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Table, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue, useDisclosure } from "@chakra-ui/react";
import Navbar from "@components/Navbar";
import Sidenav from "@components/Sidenav";
import AddAccount from "@components/modals/AddAccount";

import { useToast } from "@components/ui/use-toast";
import { PlusIcon, User2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Accounts = () => {
  const [modalState, setModalState] = useState(false);
  const [modal, setModal] = useState("");
  const [Accounts, setAccounts] = useState([]);
  const { isOpen: isSubmitReviewConfirmOpen, onOpen: openSubmitReviewConfirm, onClose: closeSubmitReviewConfirm } = useDisclosure();
  const { userInfo } = useSelector((state) => state.auth);

  const [fetchAccounts] = useAccountsGetMutation();
const[deleteAccount]=useDeleteUserAccountMutation()
  const { toast } = useToast();

  // function to set modal data
  const handleModal = (modal) => {
    setModalState((prevState) => (prevState ? false : true));
    setModal(modal);
    setEditmode(false)
  };

  // function handle fetching data
  const handleDataFetch = async () => {
    try {
      const res = await fetchAccounts().unwrap();

      if (res?.status == "Success") {
        setAccounts(res?.data);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error occured",
        description: err.data?.message
          ? err.data?.message
          : err.data || err.error,
      });
    }
  };

  // fetch product categories
  useEffect(() => {
    
    handleDataFetch();
  }, []);
  const [accountData,setaccountData]=useState({})
  const [editmode, setEditmode]=useState(false)
const [accountToDelete, setAccountToDelete]=useState(null)
 const openEditMode =(data)=>{

  handleModal("editAccount")
   setEditmode(true)
  setaccountData(data)
  
 
  }

  const deleteUserAccount=async(data)=>{
    closeSubmitReviewConfirm()

try {
const res = await deleteAccount(accountToDelete).unwrap()

if (res?.status == "Success") {
  toast({
    title: "Success",
    description: `Account Deleted Successfully`,
  });
  handleDataFetch();
}
}catch(err){
  toast({
    variant: "destructive",
    title: "Error occured",
    description: err.data?.message
      ? err.data?.message
      : err.data || err.error,
  });
}
  }
// Custom function to set account ID and return a promise
function setAccountToDeleteFunction(id) {
  return new Promise((resolve) => {
    setAccountToDelete(id);  
    resolve(id);  
  });
}

// Async function to handle deleting the user account
const handledeleteUserAccountQuery = async (id) => {
  try {
    // Set the account to delete and wait for the promise to resolve
    await setAccountToDeleteFunction(id);
    openSubmitReviewConfirm()
    
  } catch (error) {
    console.error("Error in deleting user account:", error);
  }
};

  return (
    <>
      
      {modalState && (modal === "addAccount" ||modal === "editAccount"  ) ? (
        <AddAccount closeModal={setModalState} accountData={accountData} editmode={editmode} reloadAccounts={handleDataFetch}/>
      ) : (
        <></>
      )}
      <Flex minH={'100vh'} style={{ marginTop: '4em' }}>
      <Stack mx={'auto'} width={'100%'} py={4} px={1}>
     
             
          <div className="p-2 flex justify-between" style={{
            backgroundColor: 'white',
            padding: 8,
          }}>
            <div className="flex" style={{ padding: 10 }}>
              <Heading size={'lg'} style={{ fontSize: 20, fontWeight: '500' }}>Admin Account Users</Heading>
            </div>
            <div className="flex justify-end" >
              <Button
                type='submit'
                loadingText="Submitting"
                size="md"
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}
                onClick={() => handleModal("addAccount")}
              >
                <PlusIcon size={15} /> New User

              </Button>
            </div>

          </div>
             
                {Accounts.length > 0 ? (
                  <>
                    <Box p={5} rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} boxShadow={'sm'}>
          <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>#</Th>
                      <Th>First Name</Th>
                      <Th>Last Name</Th>
                      <Th>Phone</Th>
                      <Th> Gender</Th>
                      <Th>Account Type</Th>
                      {userInfo?.account==='editor' &&
                      <Th style={{ textAlign: "center" }}>Actions</Th>}
                    </Tr>
                  </Thead>
            <Tbody>
              {Accounts.map((account, index) => (
                <Tr key={account._id} style={{textTransform:'capitalize'}}>
                  <Td>{index+1}</Td>
                  <Td>{account.firstname}</Td>
                  <Td>{account.lastname}</Td>
                  <Td>{account.phone}</Td>
                  <Td >{account.gender}</Td>
                  <Td >{account.accountType}</Td>
                  <Td >
                    {userInfo?.account==='editor' &&
                   <div style={{display: 'flex', justifyContent: 'center' }}>
                  
                    <Button
                      title="Edit"
                      bg="transparent"
                      color={'white'}
                      onClick={()=>openEditMode(account)}
                      _hover={{}}
                    >
                    
                    <EditIcon fontSize={20} color={useColorModeValue('orange.200')}/>
                    </Button>
                    <Button
                   bg="transparent"
                   color={'white'}
                   _hover={{}}
                    title="Delete"
                    onClick={()=>handledeleteUserAccountQuery(account._id)} 
                  >
                    <DeleteIcon fontSize={20} color={'red'}/> 
                  </Button>
                  </div>
                 }
                    
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
                    {/* {Accounts.map((account, index) => (
                      <div
                        className="p-4 mx-2 border border-slate-100 rounded-md"
                        key={index}
                      >
                        <div className="flex">
                          <div className="w-2/5 ">
                            <div className="p-0 max-h-20 max-w-20 rounded-full">
                              {account?.image ? (
                                <img
                                  src={account?.image}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <User2 size={40} />
                              )}
                            </div>
                          </div>
                          <div className="w-3/5">
                            <div className="">
                              <p className="text-lg">{`${account?.firstname} ${account?.lastname}`}</p>
                            </div>
                            <div className="">
                              <p className="text-md">{account?.username}</p>
                            </div>
                            <div className="py-2">
                              <p className="text-md font-bold">
                                {account?.accountType}
                              </p>
                            </div>
                          </div>
                          <div>
                              <EditIcon onClick={()=>openEditMode(account)}/>
                            
                          </div>
                        </div>
                      </div>
                    ))} */}
                  </>
                ) : (
                  <div className="py-4">
                    <p className="text-center text-2xl">No accounts</p>
                  </div>
                )}
            
          </Stack> 
          <Modal isOpen={isSubmitReviewConfirmOpen} onClose={closeSubmitReviewConfirm}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete User Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this account?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={closeSubmitReviewConfirm}>Cancel</Button>
            <Button colorScheme="red"  ml={3} onClick={()=>deleteUserAccount()}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </Flex>
    </>
  );
};

export default Accounts;
