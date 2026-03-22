"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, LogOut, Settings, Bell, Search, Menu } from "lucide-react";
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
  Menu as ChakraMenu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
} from "@chakra-ui/react";
import Link from "next/link";

const Navbar = ({ onOpenMobileMenu, sidebarWidth = "220px" }) => {
  const [isLoading, setLoading] = useState({ operation: "", status: false });
  const [logoutApiCall] = useLogoutMutation();
  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const logoutHandler = async () => {
    setLoading({ operation: "logout", status: true });
    try {
      await logoutApiCall().unwrap();
      setLoading({ operation: "", status: false });
      dispatch(logout());
      router.push("/signin");
    } catch (err) {
      setLoading({ operation: "", status: false });
      toast({
        variant: "destructive",
        title: "Error occured",
        description: err.data?.message ? err.data?.message : err.data || err.error,
      });
    }
  };

  const initials = `${(userInfo?.firstname?.charAt(0) || "A").toUpperCase()}${(userInfo?.lastname?.charAt(0) || "").toUpperCase()}`;

  return (
    <Box
      position="fixed"
      top={0}
      left={{ base: 0, md: sidebarWidth }}
      right={0}
      height="56px"
      bg="#fff"
      borderBottom="1px solid #e5e7eb"
      zIndex={999}
      px={{ base: 3, md: 4 }}
      transition="left 0.2s"
    >
      <Flex height="100%" align="center" justify="space-between">
        {/* Left side */}
        <HStack spacing={3}>
          {/* Mobile menu button */}
          <IconButton
            display={{ base: "flex", md: "none" }}
            onClick={onOpenMobileMenu}
            variant="ghost"
            aria-label="Open menu"
            icon={<Menu size={18} />}
            borderRadius="8px"
            size="sm"
            _hover={{ bg: "#f3f4f6" }}
          />

          {/* Logo badge for mobile */}
          <Flex display={{ base: "flex", md: "none" }} align="center" gap={2}>
            <Box
              w="28px" h="28px" borderRadius="7px" bg="#0d7c3b"
              display="flex" alignItems="center" justifyContent="center"
            >
              <Text fontSize="12px" fontWeight={800} color="#fff">Y</Text>
            </Box>
            <Text fontSize="14px" fontWeight={800} color="#111">Yookatale</Text>
            <Box
              bg="#fef3c7" px="5px" py="1px" borderRadius="3px"
              fontSize="8px" fontWeight={700} color="#92400e"
              textTransform="uppercase" letterSpacing="0.3px"
            >
              Admin
            </Box>
          </Flex>

          {/* Desktop search */}
          <Box display={{ base: "none", md: "block" }} maxW="360px" w="100%">
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <Search size={14} color="#9ca3af" />
              </InputLeftElement>
              <Input
                placeholder="Search..."
                borderRadius="8px"
                borderColor="#e5e7eb"
                bg="#f9fafb"
                fontSize="13px"
                _focus={{
                  borderColor: "#0d7c3b",
                  boxShadow: "0 0 0 1px #0d7c3b",
                  bg: "#fff",
                }}
                _hover={{ borderColor: "#d1d5db" }}
              />
            </InputGroup>
          </Box>
        </HStack>

        {/* Right side */}
        <HStack spacing={2}>
          {/* Notification bell */}
          <Box
            as="button"
            w="36px" h="36px" borderRadius="8px" bg="#f3f4f6"
            border="1px solid #e5e7eb" cursor="pointer"
            display="flex" alignItems="center" justifyContent="center"
            position="relative"
            _hover={{ bg: "#e5e7eb" }}
            transition="all 0.15s"
          >
            <Bell size={15} color="#111" />
            <Box
              position="absolute" top="6px" right="7px"
              w="5px" h="5px" borderRadius="3px"
              bg="#dc2626" border="1px solid #fff"
            />
          </Box>

          {/* User menu */}
          <ChakraMenu>
            <MenuButton
              as={Box}
              cursor="pointer"
              borderRadius="8px"
              _hover={{ bg: "#f3f4f6" }}
              transition="all 0.15s"
              px={2}
              py={1}
            >
              <HStack spacing={2}>
                <Box
                  w="30px" h="30px" borderRadius="15px" bg="#111"
                  display="flex" alignItems="center" justifyContent="center"
                  fontSize="10px" fontWeight={700} color="#fff"
                >
                  {initials}
                </Box>
                <VStack
                  display={{ base: "none", md: "flex" }}
                  align="start"
                  spacing={0}
                >
                  <Text fontSize="12px" fontWeight={600} color="#111">
                    {userInfo?.firstname || userInfo?.username || "Admin"}
                  </Text>
                  <Text fontSize="10px" color="#9ca3af" fontWeight={500}>
                    {(userInfo?.account || "admin").toUpperCase()}
                  </Text>
                </VStack>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "none" }} className="md-show">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </HStack>
            </MenuButton>
            <MenuList
              borderRadius="10px"
              boxShadow="0 4px 20px rgba(0,0,0,0.12)"
              border="1px solid #e5e7eb"
              minW="180px"
              py={1}
              fontFamily="'Bricolage Grotesque', 'Inter', system-ui, sans-serif"
            >
              <MenuItem
                as={Link}
                href="/settings"
                borderRadius="6px"
                mx={1}
                fontSize="13px"
                fontWeight={500}
                _hover={{ bg: "#f3f4f6" }}
              >
                <Settings size={14} style={{ marginRight: 8 }} />
                Settings
              </MenuItem>
              <MenuDivider borderColor="#f3f4f6" />
              <MenuItem
                onClick={logoutHandler}
                borderRadius="6px"
                mx={1}
                fontSize="13px"
                fontWeight={500}
                color="#dc2626"
                _hover={{ bg: "#fef2f2" }}
              >
                {isLoading.operation === "logout" ? (
                  <Loader2 className="animate-spin" size={14} style={{ marginRight: 8 }} />
                ) : (
                  <LogOut size={14} style={{ marginRight: 8 }} />
                )}
                Sign Out
              </MenuItem>
            </MenuList>
          </ChakraMenu>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
