"use client";
import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from "next/image";
import Link from "next/link";
import { SideNavGroups, isPathAllowedForEditor } from "./NavRoutesConfig";
import PerfectScrollbar from 'react-perfect-scrollbar'
import 'react-perfect-scrollbar/dist/css/styles.css'
import {
  IconButton,
  Avatar,
  Box,
  CloseButton,
  Flex,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
  Text,
  Drawer,
  DrawerContent,
  useDisclosure,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Stack,
} from '@chakra-ui/react'
import {
  FiMenu,
  FiBell,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi'
import { ChevronDown } from 'lucide-react'
import { IsAccountValid, IsLoggedIn } from "@middleware/middleware";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { BACKEND_URL } from "@constants/constant";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Loader2, LogOut, Settings } from "lucide-react";
import { useLogoutMutation } from "@Slices/userApiSlice";
import { logout } from "@Slices/authSlice";
import { useToast } from "./ui/use-toast";
import Signin from '@app/signin/page';
import { motion } from "framer-motion";
import Navbar from "./Navbar";

const NavItem = ({ icon: IconComponent, path, children, index, size, onClose, ...rest }) => {
  const [isActive, setisActive] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (path === pathname) {
      setisActive(true);
    } else {
      setisActive(false);
    }
  }, [pathname, path]);

  return (
    <Link href={path} passHref key={index} onClick={onClose}>
      <motion.div
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Box
          as="a"
          style={{ textDecoration: 'none' }}
          _focus={{ boxShadow: 'none' }}
          {...rest}
        >
          <Flex
            align="center"
            mx={2}
            my="1px"
            px={3}
            py="9px"
            borderRadius="lg"
            role="group"
            cursor="pointer"
            bg={isActive ? '#185f2d' : 'transparent'}
            color={isActive ? 'white' : 'gray.700'}
            _hover={{
              bg: isActive ? '#1f793a' : 'gray.100',
              color: isActive ? 'white' : 'gray.900',
            }}
            transition="all 0.15s"
            boxShadow={isActive ? '0 2px 8px rgba(24, 95, 45, 0.25)' : 'none'}
          >
            {IconComponent && (
              <Box
                mr={3}
                display="flex"
                alignItems="center"
                flexShrink={0}
                color={isActive ? 'white' : 'gray.500'}
              >
                <IconComponent size={17} />
              </Box>
            )}
            <Text
              fontSize="0.8125rem"
              fontWeight={isActive ? '700' : '600'}
              letterSpacing="-0.01em"
              fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif"
            >
              {children}
            </Text>
          </Flex>
        </Box>
      </motion.div>
    </Link>
  )
}

const NavGroup = ({ groupLabel, groupIcon: GroupIcon, items, isEditor, onClose }) => {
  const pathname = usePathname();
  const isAnyActive = items.some((item) => item.path === pathname);
  const [isOpen, setIsOpen] = useState(isAnyActive);

  useEffect(() => {
    if (isAnyActive) setIsOpen(true);
  }, [pathname]);

  const visibleItems = isEditor ? items.filter((i) => i.editorCanAccess) : items;
  if (visibleItems.length === 0) return null;

  return (
    <Box mb={1} mt={4}>
      <Flex
        align="center" justify="space-between"
        mx={2} px={3} py="5px"
        cursor="pointer" onClick={() => setIsOpen((o) => !o)}
        color="gray.400"
        _hover={{ color: 'gray.600' }}
        transition="all 0.15s"
        userSelect="none"
      >
        <Text
          fontSize="10px"
          fontWeight="700"
          letterSpacing="0.08em"
          textTransform="uppercase"
          fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif"
        >
          {groupLabel}
        </Text>
        <Box
          as={ChevronDown}
          size={10}
          style={{
            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s',
          }}
        />
      </Flex>
      {isOpen && (
        <Box>
          {visibleItems.map((link, i) => (
            <NavItem key={link.name} icon={link.icon} path={link.path} index={i} onClose={onClose}>
              {link.name}
            </NavItem>
          ))}
        </Box>
      )}
    </Box>
  );
};

const SidebarContent = ({ onClose, socketConnected = false, ...rest }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const accountType = userInfo?.accountType ?? userInfo?.account ?? "";
  const isEditor = accountType === "editor";

  return (
    <Box
      transition="all 0.3s ease"
      bg="white"
      borderRight="1px solid"
      borderRightColor="gray.200"
      w={{ base: 'full', md: 64 }}
      height="100vh"
      position="fixed"
      boxShadow="4px 0 20px rgba(0, 0, 0, 0.08)"
      {...rest}
    >
      {/* Logo Section */}
      <Flex
        h="80px"
        alignItems="center"
        mx="6"
        justifyContent="space-between"
        borderBottom="1px solid"
        borderColor="gray.200"
        mb={2}
      >
        <Flex align="center" gap={3}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Image
              src="/assets/icons/logo1.png"
              height={50}
              width={50}
              className="object-contain"
              alt="Yookatale Logo"
              priority
              unoptimized
            />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontSize="lg" fontWeight="700" color="gray.800" letterSpacing="-0.02em">
              Yookatale
            </Text>
            <HStack spacing={1.5} align="center">
              <Text fontSize="xs" color="gray.500" fontWeight="600" letterSpacing="0.05em">
                ADMIN PANEL
              </Text>
              <Box
                w="6px" h="6px" borderRadius="full"
                bg={socketConnected ? "green.400" : "gray.300"}
                title={socketConnected ? "Live" : "Offline"}
                style={socketConnected ? { animation: "adm-pulse 2s ease-in-out infinite" } : {}}
              />
            </HStack>
          </VStack>
        </Flex>
        <style>{`@keyframes adm-pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }`}</style>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>

      {/* Navigation Items */}
      <Box overflowY="auto" flex="1" py={2}>
        <PerfectScrollbar options={{ suppressScrollX: true }}>
          <Box
            maxHeight="calc(100vh - 180px)"
            px={3}
            py={2}
          >
            {SideNavGroups.map((group, gi) => {
              if (!group.groupLabel) {
                // Standalone items (Dashboard, Settings)
                const visible = isEditor ? group.items.filter((i) => i.editorCanAccess) : group.items;
                return visible.map((link) => (
                  <NavItem key={link.name} icon={link.icon} path={link.path} onClose={onClose}>
                    {link.name}
                  </NavItem>
                ));
              }
              return (
                <NavGroup
                  key={gi}
                  groupLabel={group.groupLabel}
                  groupIcon={group.groupIcon}
                  items={group.items}
                  isEditor={isEditor}
                  onClose={onClose}
                />
              );
            })}
          </Box>
        </PerfectScrollbar>
      </Box>

      {/* Footer Section */}
      <Box
        p={4}
        borderTop="1px solid"
        borderColor="gray.200"
        bg="gray.50"
      >
        <VStack spacing={2} align="center">
          <Text fontSize="xs" color="gray.500" textAlign="center" fontWeight="500">
            © 2024 Yookatale
          </Text>
          <Text fontSize="xs" color="gray.400" textAlign="center">
            Admin Dashboard v2.0
          </Text>
        </VStack>
      </Box>
    </Box>
  )
}

const SidebarWithHeader = ({ children, ...rest }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { userInfo } = useSelector((state) => state.auth);
  const isAuthenticated = !!(userInfo?._id);
  const accountType = userInfo?.accountType ?? userInfo?.account ?? "";
  const isEditor = accountType === "editor";
  const [socketConnected, setSocketConnected] = useState(false);
  const adminSocketRef = useRef(null);

  useEffect(() => {
    if (!userInfo?._id) {
      router.push("/signin");
    }
    IsAccountValid();
  }, [userInfo, router]);

  useEffect(() => {
    if (!userInfo?._id) return;
    const socket = io(BACKEND_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      auth: { userId: userInfo._id, accountType: accountType || "admin" },
    });
    adminSocketRef.current = socket;
    socket.on("connect",    () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));
    socket.on("connect_error", () => setSocketConnected(false));
    socket.emit("join:admin");
    return () => { socket.disconnect(); };
  }, [userInfo?._id]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Restrict editors to allowed paths only
  useEffect(() => {
    if (!isAuthenticated || !userInfo) return;
    if (isEditor && !isPathAllowedForEditor(pathname)) {
      router.replace("/");
    }
  }, [isAuthenticated, userInfo, isEditor, pathname, router]);

  const MobileNav = ({ onOpen, userInfo, ...rest }) => {
    const [isLoading, setLoading] = useState({ operation: "", status: false });
    const [logoutApiCall] = useLogoutMutation();
    const { toast } = useToast();
    const router = useRouter()
    const dispatch = useDispatch();

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

    return (
      <Box
        w={{ base: 'full' }}
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={999}
        bg="white"
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
        height="80px"
      >
        <Flex
          px={{ base: 4, md: 6 }}
          height="100%"
          alignItems="center"
          justifyContent="space-between"
          {...rest}
        >
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            variant="outline"
            aria-label="open menu"
            icon={<FiMenu />}
            borderRadius="lg"
          />

          <HStack spacing={4}>
            <IconButton
              size="lg"
              variant="ghost"
              aria-label="notifications"
              icon={<FiBell />}
              borderRadius="lg"
              _hover={{ bg: "gray.100" }}
            />
            <Flex alignItems="center">
              <Menu>
                <MenuButton
                  py={2}
                  transition="all 0.3s"
                  _focus={{ boxShadow: 'none' }}
                  borderRadius="lg"
                  _hover={{ bg: "gray.50" }}
                >
                  <HStack>
                    <Avatar
                      size="sm"
                      name={userInfo?.username}
                      bg="green.500"
                      color="white"
                    />
                    <VStack
                      display={{ base: 'none', md: 'flex' }}
                      alignItems="flex-start"
                      spacing="1px"
                      ml="2"
                    >
                      <Text fontSize="sm" fontWeight="600">
                        {userInfo?.username}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {userInfo?.account?.toUpperCase()}
                      </Text>
                    </VStack>
                    <Box display={{ base: 'none', md: 'flex' }}>
                      <FiChevronDown />
                    </Box>
                  </HStack>
                </MenuButton>
                <MenuList
                  bg="white"
                  borderColor="gray.200"
                  borderRadius="lg"
                  boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
                >
                  <MenuItem
                    as={Link}
                    href="/settings"
                    _hover={{ bg: "gray.50" }}
                  >
                    <Settings size={16} style={{ marginRight: "8px" }} />
                    Profile
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem
                    onClick={logoutHandler}
                    _hover={{ bg: "red.50" }}
                    color="red.600"
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
            </Flex>
          </HStack>
        </Flex>
      </Box>
    )
  }

  return (
    isAuthenticated ? (
      <Box bg="gray.50" minH="100vh">
        <SidebarContent
          onClose={() => onClose}
          socketConnected={socketConnected}
          display={{ base: 'none', md: 'block' }}
        />
        <Drawer
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          closeOnEsc
          returnFocusOnClose={false}
          onOverlayClick={onClose}
          size="full"
        >
          <DrawerContent>
            <SidebarContent onClose={onClose} socketConnected={socketConnected} />
          </DrawerContent>
        </Drawer>

        {/* Top Navbar - Only show on desktop, MobileNav handles mobile */}
        <Box display={{ base: 'none', md: 'block' }}>
          <Navbar />
        </Box>

        {/* Mobile Navbar */}
        <Box display={{ base: 'block', md: 'none' }}>
          <MobileNav onOpen={onOpen} userInfo={userInfo} />
        </Box>

        {/* Main Content with proper spacing for navbar */}
        <Box
          ml={{ base: 0, md: 64 }}
          pt={{ base: 24, md: 28 }}
          px={{ base: 4, md: 6 }}
          pb={6}
          minH="calc(100vh - 80px)"
        >
          {children}
        </Box>
      </Box>
    ) : (
      <Box>
        <Signin />
      </Box>
    )
  )
}

export default SidebarWithHeader
