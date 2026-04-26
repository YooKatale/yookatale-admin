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
  VStack,
  Container,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import Image from "next/image";

const Signin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);

  const router = useRouter();
  const dispatch = useDispatch();
  const [login] = useLoginMutation();
  const { toast } = useToast();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    router.prefetch('/')
    if (userInfo) {
      //return router.replace("/")
    } else {
      return router.replace("/signin")
    }
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    // Client-side rate limiting
    if (lockUntil && Date.now() < lockUntil) {
      const seconds = Math.ceil((lockUntil - Date.now()) / 1000);
      toast({
        variant: "destructive",
        title: "Too many attempts",
        description: `Please wait ${seconds}s before trying again.`,
      });
      return;
    }

    // Input validation
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Username and password are required.",
      });
      return;
    }

    try {
      setLoading(true);
      const data = {
        username: trimmedUsername,
        password: password
      }
      const res = await login(data).unwrap();
      setLoginAttempts(0);
      setLockUntil(null);
      dispatch(setCredentials({ ...res }));
      setLoading(false);
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      toast({
        title: "Logged In",
        description: `Successfully logged in as ${res?.lastname}`,
      });
    } catch (err) {
      setLoading(false);
      const attempts = loginAttempts + 1;
      setLoginAttempts(attempts);
      if (attempts >= 5) {
        setLockUntil(Date.now() + 30000);
        setLoginAttempts(0);
      }
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err.data?.message || "Invalid credentials. Please try again.",
      });
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, green.50, white, green.50)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={8}
      px={4}
    >
      <Container maxW="md" centerContent>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: "100%" }}
        >
          {/* Logo Section */}
          <motion.div variants={itemVariants}>
            <Flex justify="center" mb={8}>
              <Box
                as={Link}
                href="/"
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s"
              >
                <Image
                  src="/assets/icons/logo1.png"
                  alt="Yookatale Admin Logo"
                  width={120}
                  height={120}
                  style={{ objectFit: "contain" }}
                />
              </Box>
            </Flex>
          </motion.div>

          {/* Card Container */}
          <motion.div variants={itemVariants}>
            <Box
              bg="white"
              borderRadius="2xl"
              boxShadow="0 20px 60px rgba(0, 0, 0, 0.15)"
              p={{ base: 6, md: 8 }}
              w="100%"
              border="1px solid"
              borderColor="gray.100"
            >
              <VStack spacing={6} align="stretch">
                {/* Header */}
                <Box textAlign="center">
                  <Heading
                    as="h1"
                    fontSize={{ base: "2xl", md: "3xl" }}
                    fontWeight="700"
                    color="gray.800"
                    mb={2}
                    letterSpacing="-0.02em"
                  >
                    Admin Dashboard
                  </Heading>
                  <Text
                    fontSize="md"
                    color="gray.600"
                    fontWeight="500"
                  >
                    Sign in to access the admin panel
                  </Text>
                  <Box
                    height="3px"
                    width="60px"
                    margin="1rem auto 0"
                    background="green.500"
                    borderRadius="full"
                  />
                </Box>

                {/* Form */}
                <form onSubmit={submitHandler}>
                  <VStack spacing={5} align="stretch">
                    <motion.div variants={itemVariants}>
                      <FormControl id="username" isRequired>
                        <FormLabel
                          fontSize="sm"
                          fontWeight="600"
                          color="gray.700"
                          mb={2}
                        >
                          Username
                        </FormLabel>
                        <Input
                          type="text"
                          id="username"
                          placeholder="Enter your username"
                          name="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          size="lg"
                          borderRadius="lg"
                          borderColor="gray.300"
                          _hover={{ borderColor: "green.500" }}
                          _focus={{
                            borderColor: "green.500",
                            boxShadow: "0 0 0 1px #48BB78",
                          }}
                          transition="all 0.2s"
                        />
                      </FormControl>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <FormControl id="password" isRequired>
                        <FormLabel
                          fontSize="sm"
                          fontWeight="600"
                          color="gray.700"
                          mb={2}
                        >
                          Password
                        </FormLabel>
                        <InputGroup>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            placeholder="Enter your password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            size="lg"
                            borderRadius="lg"
                            borderColor="gray.300"
                            _hover={{ borderColor: "green.500" }}
                            _focus={{
                              borderColor: "green.500",
                              boxShadow: "0 0 0 1px #48BB78",
                            }}
                            transition="all 0.2s"
                          />
                          <InputRightElement h="full" pr={2}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowPassword((showPassword) => !showPassword)}
                              _hover={{ bg: "gray.100" }}
                            >
                              {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div variants={itemVariants}>
                      <Button
                        type="submit"
                        size="lg"
                        bg="green.500"
                        color="white"
                        borderRadius="lg"
                        fontWeight="600"
                        fontSize="md"
                        _hover={{
                          bg: "green.600",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(72, 187, 120, 0.4)",
                        }}
                        _active={{
                          bg: "green.700",
                          transform: "translateY(0)",
                        }}
                        transition="all 0.2s"
                        isLoading={isLoading}
                        loadingText="Signing in..."
                        w="100%"
                      >
                        {isLoading ? (
                          <Loader2 className="animate-spin mx-2" />
                        ) : null}
                        Sign In
                      </Button>
                    </motion.div>
                  </VStack>
                </form>
              </VStack>
            </Box>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Signin;
