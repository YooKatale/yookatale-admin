"use client";

import { useResetPasswordMutation } from "@/Slices/userApiSlice";
import { useToast } from "@components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Stack,
  Button,
  Heading,
  Text,
  InputGroup,
  InputRightElement,
  Link,
  VStack,
  Container,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import Image from "next/image";

const MIN_PASSWORD_LENGTH = 8;

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const id = searchParams.get("id");

  const [resetPassword] = useResetPasswordMutation();
  const { toast } = useToast();

  const validate = () => {
    const nextErrors = {};

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!token) {
      toast({
        variant: "destructive",
        title: "Invalid link",
        description: "This password reset link is missing or invalid. Please request a new one.",
      });
      return;
    }

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

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await resetPassword({ id, token, password }).unwrap();
      setSubmitAttempts(0);
      setLockUntil(null);
      setSuccess(true);
      toast({
        title: "Password updated",
        description: "Your password has been reset successfully.",
      });
      setTimeout(() => {
        router.replace("/signin");
      }, 2000);
    } catch (err) {
      const attempts = submitAttempts + 1;
      setSubmitAttempts(attempts);
      if (attempts >= 5) {
        setLockUntil(Date.now() + 30000);
        setSubmitAttempts(0);
      }
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: err?.data?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

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
                    Reset Password
                  </Heading>
                  <Text
                    fontSize="md"
                    color="gray.600"
                    fontWeight="500"
                  >
                    {success
                      ? "Redirecting you to sign in..."
                      : "Enter a new password for your account"}
                  </Text>
                  <Box
                    height="3px"
                    width="60px"
                    margin="1rem auto 0"
                    background="green.500"
                    borderRadius="full"
                  />
                </Box>

                {!token && (
                  <Text fontSize="sm" color="red.500" textAlign="center">
                    This reset link is invalid or has expired. Please request a new one.
                  </Text>
                )}

                {/* Form */}
                {!success && (
                  <form onSubmit={submitHandler} noValidate>
                    <VStack spacing={5} align="stretch">
                      <motion.div variants={itemVariants}>
                        <FormControl id="password" isRequired isInvalid={!!errors.password}>
                          <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                            color="gray.700"
                            mb={2}
                          >
                            New Password
                          </FormLabel>
                          <InputGroup>
                            <Input
                              type={showPassword ? "text" : "password"}
                              id="password"
                              placeholder="Enter your new password"
                              name="password"
                              autoComplete="new-password"
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
                                type="button"
                                variant="ghost"
                                size="sm"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                onClick={() => setShowPassword((prev) => !prev)}
                                _hover={{ bg: "gray.100" }}
                              >
                                {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                              </Button>
                            </InputRightElement>
                          </InputGroup>
                          {errors.password && (
                            <FormErrorMessage>{errors.password}</FormErrorMessage>
                          )}
                        </FormControl>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <FormControl id="confirmPassword" isRequired isInvalid={!!errors.confirmPassword}>
                          <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                            color="gray.700"
                            mb={2}
                          >
                            Confirm Password
                          </FormLabel>
                          <InputGroup>
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              id="confirmPassword"
                              placeholder="Re-enter your new password"
                              name="confirmPassword"
                              autoComplete="new-password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
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
                                type="button"
                                variant="ghost"
                                size="sm"
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                _hover={{ bg: "gray.100" }}
                              >
                                {showConfirmPassword ? <ViewIcon /> : <ViewOffIcon />}
                              </Button>
                            </InputRightElement>
                          </InputGroup>
                          {errors.confirmPassword && (
                            <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                          )}
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
                          loadingText="Resetting..."
                          spinner={<Loader2 className="animate-spin" size={18} />}
                          isDisabled={!token}
                          w="100%"
                        >
                          Reset Password
                        </Button>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <Button
                          size="lg"
                          bg="white"
                          color="green.500"
                          borderRadius="lg"
                          fontWeight="600"
                          fontSize="md"
                          _hover={{
                            bg: "green.500",
                            color: "white",
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(72, 187, 120, 0.4)",
                          }}
                          _active={{
                            bg: "green.700",
                            transform: "translateY(0)",
                          }}
                          transition="all 0.2s"
                          isLoading={isLoading}
                          loadingText="Resetting..."
                          spinner={<Loader2 className="animate-spin" size={18} />}
                          isDisabled={!token}
                          w="100%"
                          onClick={() => router.push("/signin")}
                        >
                          Sign In
                        </Button>
                      </motion.div>
                    </VStack>
                  </form>
                )}
              </VStack>
            </Box>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ResetPassword;