"use client";

import { useLoginMutation } from "@/Slices/userApiSlice";


import { Label } from "@/components/ui/label";
import { setCredentials } from "@Slices/authSlice";
import { ToastAction } from "@components/ui/toast";
import { useToast } from "@components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  Link,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

const Signin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  const [login] = useLoginMutation();

  const { toast } = useToast();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    router.prefetch('/')
   if (userInfo) {
    //return router.replace("/")
   }else{
    return router.replace("/signin")
   }
  }, []);
  
  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      // set loading to be true
      setLoading((prevState) => (prevState ? false : true));
      const data ={
        username: username,
        password: password
      }
      const res = await login(data).unwrap();
      dispatch(setCredentials({ ...res }));
      // set loading to be false
      setLoading((prevState) => (prevState ? false : true));
      if (typeof window !== 'undefined') {
      window.location.href = '/';
     }
      toast({
        title: "Logged In",
        description: `Successfully logged in as ${res?.lastname}`,
      });
      
    } catch (err) {
      // set loading to be false
      setLoading((prevState) => (prevState ? false : true));
      toast({
        variant: "destructive",
        title: "Error occured",
        description: err.data?.message
          ? err.data?.message
          : err.data || err.error,
      });
    }
  };
  const [showPassword, setShowPassword] = useState(false)
  return (
    <>
      <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
      >
      <Stack spacing={8} mx={'auto'} width={{ base: '90%', md: '75%', lg: '50%' }} py={12} px={6}>
        
        <Box
          rounded={'md'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'md'}
          p={8}>
            <Stack align={'center'}>
            <p className="text-center text-2xl font-bold">YooKatale Admin</p>
          <p className="text-center text-xl mt-1">Sign in to continue</p>
        </Stack>
        <form onSubmit={submitHandler}>
          <Stack spacing={6} p={4}>
          
          <FormControl id="firstName" isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input type="text" id="username" placeholder="Username is required" name="username"
                        onChange={(e) => setUsername(e.target.value)}/>
                </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel> 
              <InputGroup>
                
                <Input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        placeholder="password is required"
                        name="password"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                <InputRightElement h={'full'}>
                  <Button
                    variant={'ghost'}
                    onClick={() => setShowPassword((showPassword) => !showPassword)}>
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Stack spacing={10} pt={2}>
              <Button
              type='submit'
                loadingText="Submitting"
                size="lg"
                bg={'green.300'}
                color={'white'}
                _hover={{
                  bg: 'green.500',
                }}>
                {isLoading ? (
                          <Loader2 className="animate-spin mx-2" />
                        ) : (
                          ""
                        )}
                        Sign In
              </Button>
            </Stack>
            
          </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
    </>
  );
};

export default Signin;
