"use client";
import React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Image from "next/image";
import Link from "next/link";
import { SideNavRoutes } from "./NavRoutesConfig";
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
  BoxProps,
  FlexProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Stack,
} from '@chakra-ui/react'
import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
  FiMenu,
  FiBell,
  FiChevronDown,
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import { IsAccountValid, IsLoggedIn } from "@middleware/middleware";
import { useEffect, useState } from "react";
import { HiMenuAlt2 } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Loader2, LogOut } from "lucide-react";
import { useLogoutMutation } from "@Slices/userApiSlice";
import { logout } from "@Slices/authSlice";
import { useToast } from "./ui/use-toast";
import Signin from '@app/signin/page';
import { motion } from "framer-motion";

const NavItem = ({ icon, path, children, index, size, ...rest }) => {
  const [routepath, setRoutepath] = useState("")
  const [isActive, setisActive] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleClick = async (e, path2) => {
    setRoutepath(path2)
    setisActive(path === pathname ? true : false)
  }

  useEffect(() => {
    if (path === pathname) {
      setisActive(true);
    } else {
      setisActive(false);
      setRoutepath(pathname);
    }
  }, [pathname]);

  return (
    <Link href={path} passHref key={index} onClick={(e) => handleClick(e, path)}>
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
          onClick={(e) => handleClick(e, path)}
        >
          <Flex
            align="center"
            m="2"
            p={3}
            borderRadius="lg"
            role="group"
            cursor="pointer"
            bg={isActive ? 'green.500' : 'transparent'}
            color={isActive ? 'white' : 'gray.700'}
            _hover={{
              bg: isActive ? 'green.600' : 'gray.100',
              color: isActive ? 'white' : 'gray.800',
            }}
            transition="all 0.2s"
            boxShadow={isActive ? '0 4px 12px rgba(72, 187, 120, 0.3)' : 'none'}
          >
            {icon && (
              <Icon
                mr="3"
                fontSize="20"
                as={icon}
                color={isActive ? 'white' : 'gray.600'}
              />
            )}
            <Text
              fontSize="sm"
              fontWeight={isActive ? '600' : '500'}
            >
              {children}
            </Text>
          </Flex>
        </Box>
      </motion.div>
    </Link>
  )
}

const SidebarContent = ({ onClose, ...rest }) => {
  return (
    <Box
      transition="all 0.3s ease"
      bg="white"
      borderRight="1px"
      borderRightColor="gray.200"
      w={{ base: 'full', md: 64 }}
      height="100vh"
      position="fixed"
      boxShadow="2px 0 10px rgba(0, 0, 0, 0.05)"
      {...rest}
    >
      {/* Logo Section */}
      <Flex
        h="20"
        alignItems="center"
        mx="6"
        justifyContent="space-between"
        borderBottom="1px solid"
        borderColor="gray.200"
        mb={4}
      >
        <Flex align="center" gap={3}>
          <Image
            src="/assets/icons/logo1.png"
            height={50}
            width={50}
            className="object-contain"
            alt="logo"
          />
          <VStack align="start" spacing={0}>
            <Text fontSize="lg" fontWeight="700" color="gray.800">
              Yookatale
            </Text>
            <Text fontSize="xs" color="gray.500" fontWeight="500">
              Admin Panel
            </Text>
          </VStack>
        </Flex>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>

      {/* Navigation Items */}
      <Box overflowY="auto" flex="1">
        <PerfectScrollbar options={{ suppressScrollX: true }}>
          <Box
            maxHeight="calc(100vh - 120px)"
            px={3}
            py={2}
          >
            {SideNavRoutes.map((link, index) => (
              <NavItem
                key={link.name}
                icon={link.icon}
                path={link.path}
                index={index}
                size={SideNavRoutes.length}
              >
                {link.name}
              </NavItem>
            ))}
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
        <Text fontSize="xs" color="gray.500" textAlign="center">
          © 2024 Yookatale Admin
        </Text>
      </Box>
    </Box>
  )
}

const SidebarWithHeader = ({ children, ...rest }) => {
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isAuthenticated, setisAuthenticated] = useState(false)
  const { userInfo, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo?._id !== undefined) {
      setisAuthenticated(true)
    } else {
      router.push("/signin")
    }
    IsAccountValid();
  }, []);

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
        setisAuthenticated(false)
        router.push("/signin");
      } catch (err) {
        console.log({ err });
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
        zIndex="10"
        bg="white"
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
      >
        <Flex
          ml={{ base: 0, md: 64 }}
          px={{ base: 4, md: 6 }}
          height="20"
          alignItems="center"
          justifyContent={{ base: 'space-between', md: 'flex-end' }}
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

          <HStack spacing={{ base: '2', md: '6' }}>
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
                    Profile
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem
                    onClick={logoutHandler}
                    _hover={{ bg: "red.50" }}
                    color="red.600"
                  >
                    {isLoading && isLoading.operation == "logout" ? (
                      <Loader2 className="animate-spin mr-2" />
                    ) : (
                      <LogOut className="mr-2" />
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
            <SidebarContent onClose={onClose} />
          </DrawerContent>
        </Drawer>

        <Box>
          <MobileNav onOpen={onOpen} userInfo={userInfo} />
        </Box>

        <Box
          ml={{ base: 0, md: 64 }}
          pt={{ base: 20, md: 6 }}
          p={{ base: 4, md: 6 }}
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
