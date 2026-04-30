"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Loader2, LogOut, Bell, Search, Settings } from "lucide-react";
import { useLogoutMutation } from "@Slices/userApiSlice";
import { logout } from "@Slices/authSlice";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Badge,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const Navbar = () => {
  const [isLoading, setLoading] = useState({ operation: "", status: false });
  const [logoutApiCall] = useLogoutMutation();
  const [isAuthenticated, setisAuthenticated] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const logoutHandler = async () => {
    setLoading({ ...isLoading, operation: "logout", status: true });

    try {
      const res = await logoutApiCall().unwrap();
      setLoading({ ...isLoading, operation: "", status: false });
      dispatch(logout());
      router.push("/signin");
    } catch (err) {
      setLoading({ ...isLoading, operation: "", status: false });

      toast({
        variant: "destructive",
        title: "Error occured",
        description: err.data?.message
          ? err.data?.message
          : err.data || err.error,
      });
    }
  };

  useEffect(() => {
    // IsLoggedIn()
    // IsAccountValid();
  }, []);

  return (
    <Box
      position="fixed"
      top={0}
      left={{ base: 0, md: "256px" }}
      right={0}
      height="80px"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      zIndex={999}
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
      px={{ base: 4, md: 6 }}
    >
      <Flex
        height="100%"
        align="center"
        justify="space-between"
      >
        {/* Left Section - Search */}
        <Box flex={1} maxW="500px" display={{ base: "none", md: "block" }}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Search size={18} color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Search..."
              borderRadius="lg"
              borderColor="gray.300"
              _focus={{
                borderColor: "green.500",
                boxShadow: "0 0 0 1px #48BB78",
              }}
              bg="gray.50"
            />
          </InputGroup>
        </Box>

        {/* Right Section - User Menu */}
        <HStack spacing={4}>
          {/* Notifications */}
          <IconButton
            aria-label="Notifications"
            icon={<Bell size={20} />}
            variant="ghost"
            borderRadius="lg"
            position="relative"
            _hover={{ bg: "gray.100" }}
          >
            <Badge
              position="absolute"
              top="8px"
              right="8px"
              colorScheme="red"
              borderRadius="full"
              w="8px"
              h="8px"
            />
          </IconButton>

          {/* Settings */}
          <IconButton
            aria-label="Settings"
            icon={<Settings size={20} />}
            variant="ghost"
            borderRadius="lg"
            _hover={{ bg: "gray.100" }}
            as="a"
            href="/settings"
          />

          {/* User Menu */}
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              borderRadius="lg"
              _hover={{ bg: "gray.50" }}
              _active={{ bg: "gray.100" }}
            >
              <HStack spacing={3}>
                <Avatar
                  size="sm"
                  name={userInfo?.username || "Admin"}
                  bg="green.500"
                  color="white"
                  fontWeight="bold"
                />
                <VStack
                  display={{ base: "none", md: "flex" }}
                  align="start"
                  spacing={0}
                >
                  <Text fontSize="sm" fontWeight="600" color="gray.800">
                    {userInfo?.username || "Admin"}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {userInfo?.account?.toUpperCase() || "ADMIN"}
                  </Text>
                </VStack>
              </HStack>
            </MenuButton>
            <MenuList
              borderRadius="lg"
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.15)"
              border="1px solid"
              borderColor="gray.200"
              minW="200px"
            >
              <MenuItem
                as="a"
                href="/settings"
                _hover={{ bg: "gray.50" }}
                borderRadius="md"
                mb={1}
              >
                <Settings size={16} style={{ marginRight: "8px" }} />
                Settings
              </MenuItem>
              <MenuDivider />
              <MenuItem
                onClick={logoutHandler}
                _hover={{ bg: "red.50" }}
                color="red.600"
                borderRadius="md"
              >
                {isLoading && isLoading.operation == "logout" ? (
                  <Loader2 className="animate-spin mr-2" size={16} />
                ) : (
                  <LogOut className="mr-2" size={16} />
                )}
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
