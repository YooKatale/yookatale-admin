"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { SideNavGroups, isPathAllowedForEditor } from "./NavRoutesConfig";
import {
  Box,
  CloseButton,
  Flex,
  VStack,
  HStack,
  Text,
  Drawer,
  DrawerContent,
  useDisclosure,
} from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { IsAccountValid } from "@middleware/middleware";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { BACKEND_URL } from "@constants/constant";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutMutation } from "@Slices/userApiSlice";
import { logout } from "@Slices/authSlice";
import { useToast } from "./ui/use-toast";
import Signin from "@app/signin/page";
import Navbar from "./Navbar";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";

const NavItem = ({ icon: IconComponent, path, children, isCollapsed, onClose }) => {
  const pathname = usePathname();
  const isActive = path === pathname;

  return (
    <Link href={path} passHref style={{ textDecoration: "none" }} onClick={onClose}>
      <Flex
        align="center"
        gap={isCollapsed ? 0 : 2}
        px={isCollapsed ? 0 : 3}
        py="8px"
        mx="6px"
        borderRadius="7px"
        cursor="pointer"
        position="relative"
        bg={isActive ? "rgba(13,124,59,0.1)" : "transparent"}
        color={isActive ? "#fff" : "#9ca3af"}
        _hover={{
          bg: isActive ? "rgba(13,124,59,0.15)" : "rgba(255,255,255,0.04)",
          color: isActive ? "#fff" : "#d1d5db",
        }}
        transition="all 0.15s"
        justify={isCollapsed ? "center" : "flex-start"}
      >
        {isActive && (
          <Box
            position="absolute" left="0" top="50%" transform="translateY(-50%)"
            width="2.5px" height="16px" borderRadius="2px" bg="#0d7c3b"
          />
        )}
        {IconComponent && (
          <Box display="flex" alignItems="center" color={isActive ? "#0d7c3b" : "#6b7280"} flexShrink={0}>
            <IconComponent size={16} />
          </Box>
        )}
        {!isCollapsed && (
          <Text
            fontSize="12px" fontWeight={isActive ? 700 : 500}
            letterSpacing="0.01em" whiteSpace="nowrap"
            overflow="hidden" textOverflow="ellipsis"
          >
            {children}
          </Text>
        )}
      </Flex>
    </Link>
  );
};

const NavGroup = ({ groupLabel, items, isEditor, isCollapsed, onClose }) => {
  const pathname = usePathname();
  const isAnyActive = items.some((item) => item.path === pathname);
  const [isOpen, setIsOpen] = useState(isAnyActive);

  useEffect(() => {
    if (isAnyActive) setIsOpen(true);
  }, [pathname]);

  const visibleItems = isEditor ? items.filter((i) => i.editorCanAccess) : items;
  if (visibleItems.length === 0) return null;

  if (isCollapsed) {
    return visibleItems.map((link) => (
      <NavItem key={link.name} icon={link.icon} path={link.path} isCollapsed onClose={onClose}>
        {link.name}
      </NavItem>
    ));
  }

  return (
    <Box mb={1} mt={3}>
      <Flex
        align="center" justify="space-between"
        mx="6px" px={3} py="4px"
        cursor="pointer" onClick={() => setIsOpen((o) => !o)}
        color="#6b7280" _hover={{ color: "#9ca3af" }}
        transition="all 0.15s" userSelect="none"
      >
        <Text fontSize="9px" fontWeight={700} letterSpacing="0.08em" textTransform="uppercase">
          {groupLabel}
        </Text>
        <Box
          as={ChevronDown} size={10}
          style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}
        />
      </Flex>
      {isOpen && visibleItems.map((link) => (
        <NavItem key={link.name} icon={link.icon} path={link.path} isCollapsed={false} onClose={onClose}>
          {link.name}
        </NavItem>
      ))}
    </Box>
  );
};

const SidebarContent = ({ onClose, isCollapsed, setIsCollapsed, isMobile = false, socketConnected = false, ...rest }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const accountType = userInfo?.accountType ?? userInfo?.account ?? "";
  const isEditor = accountType === "editor";
  const collapsed = isCollapsed && !isMobile;
  const sideW = collapsed ? "60px" : "220px";

  return (
    <Box
      transition="width 0.2s"
      bg="#111"
      borderRight="1px solid rgba(255,255,255,0.05)"
      w={{ base: "full", md: sideW }}
      height="100vh"
      position="fixed"
      display="flex"
      flexDirection="column"
      zIndex={1001}
      {...rest}
    >
      {/* Logo */}
      <Flex
        h="56px" align="center"
        px={collapsed ? "10px" : "14px"}
        borderBottom="1px solid rgba(255,255,255,0.05)"
        flexShrink={0} justify="space-between"
      >
        <Flex align="center" gap={2}>
          <Box
            w="32px" h="32px" borderRadius="8px" bg="#0d7c3b"
            display="flex" alignItems="center" justifyContent="center" flexShrink={0}
          >
            <Text fontSize="14px" fontWeight={800} color="#fff">Y</Text>
          </Box>
          {!collapsed && (
            <VStack align="start" spacing={0}>
              <Text fontSize="14px" fontWeight={800} color="#fff" lineHeight="1">Yookatale</Text>
              <HStack spacing={1.5} align="center">
                <Text fontSize="8px" fontWeight={700} color="#d97706" textTransform="uppercase" letterSpacing="1.5px">
                  Admin
                </Text>
                <Box
                  w="5px" h="5px" borderRadius="full"
                  bg={socketConnected ? "#22c55e" : "#6b7280"}
                  title={socketConnected ? "Live" : "Offline"}
                  style={socketConnected ? { animation: "adm-pulse 2s ease-in-out infinite" } : {}}
                />
              </HStack>
            </VStack>
          )}
        </Flex>
        {isMobile ? (
          <CloseButton color="#6b7280" onClick={onClose} />
        ) : (
          <Box
            as="button" onClick={() => setIsCollapsed?.(!isCollapsed)}
            bg="none" border="none" cursor="pointer" p="2px"
            opacity={0.4} _hover={{ opacity: 0.8 }}
            display={{ base: "none", md: "flex" }} alignItems="center"
          >
            {isCollapsed ? <ChevronRight size={14} color="#fff" /> : <ChevronLeft size={14} color="#fff" />}
          </Box>
        )}
      </Flex>
      <style>{`@keyframes adm-pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }`}</style>

      {/* User info (expanded only) */}
      {!collapsed && (
        <Box px="12px" py="10px" borderBottom="1px solid rgba(255,255,255,0.05)" flexShrink={0}>
          <Flex align="center" gap={2}>
            <Box
              w="34px" h="34px" borderRadius="17px"
              bg="linear-gradient(135deg, #0d7c3b, #d97706)"
              display="flex" alignItems="center" justifyContent="center"
              fontSize="12px" fontWeight={700} color="#fff" flexShrink={0}
            >
              {(userInfo?.firstname?.charAt(0) || "A").toUpperCase()}
              {(userInfo?.lastname?.charAt(0) || "").toUpperCase()}
            </Box>
            <Box>
              <Text fontSize="12px" fontWeight={700} color="#fff">
                {userInfo?.firstname || userInfo?.username || "Admin"}
              </Text>
              <Text fontSize="9px" color="#6b7280" textTransform="uppercase" fontWeight={600} letterSpacing="0.5px">
                {accountType || "admin"}
              </Text>
            </Box>
          </Flex>
        </Box>
      )}

      {/* Navigation */}
      <Box flex={1} overflowY="auto" py={2} className="container__hide__scrollbar">
        {SideNavGroups.map((group, gi) => {
          if (!group.groupLabel) {
            const visible = isEditor ? group.items.filter((i) => i.editorCanAccess) : group.items;
            return visible.map((link) => (
              <NavItem key={link.name} icon={link.icon} path={link.path} isCollapsed={collapsed} onClose={onClose}>
                {link.name}
              </NavItem>
            ));
          }
          return (
            <NavGroup
              key={gi}
              groupLabel={group.groupLabel}
              items={group.items}
              isEditor={isEditor}
              isCollapsed={collapsed}
              onClose={onClose}
            />
          );
        })}
      </Box>

      {/* Footer */}
      <Box
        p={collapsed ? "10px 6px" : "12px"}
        borderTop="1px solid rgba(255,255,255,0.05)"
        flexShrink={0}
      >
        {!collapsed && (
          <VStack spacing={1} align="center">
            <Text fontSize="9px" color="#6b7280" textAlign="center">Yookatale Admin v2.0</Text>
          </VStack>
        )}
      </Box>
    </Box>
  );
};

const SidebarWithHeader = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { userInfo } = useSelector((state) => state.auth);
  const isAuthenticated = !!(userInfo?._id);
  const accountType = userInfo?.accountType ?? userInfo?.account ?? "";
  const isEditor = accountType === "editor";
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));
    socket.on("connect_error", () => setSocketConnected(false));
    socket.emit("join:admin");
    return () => { socket.disconnect(); };
  }, [userInfo?._id]);

  useEffect(() => {
    if (!isAuthenticated || !userInfo) return;
    if (isEditor && !isPathAllowedForEditor(pathname)) {
      router.replace("/");
    }
  }, [isAuthenticated, userInfo, isEditor, pathname, router]);

  const sideW = isCollapsed ? "60px" : "220px";

  return isAuthenticated ? (
    <Box bg="#f4f5f7" minH="100vh">
      {/* Desktop sidebar */}
      <SidebarContent
        onClose={onClose}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        socketConnected={socketConnected}
        display={{ base: "none", md: "flex" }}
      />

      {/* Mobile drawer */}
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
          <SidebarContent onClose={onClose} isCollapsed={false} isMobile socketConnected={socketConnected} />
        </DrawerContent>
      </Drawer>

      {/* Navbar */}
      <Navbar onOpenMobileMenu={onOpen} sidebarWidth={sideW} />

      {/* Main content */}
      <Box
        ml={{ base: 0, md: sideW }}
        pt={{ base: "72px", md: "72px" }}
        px={{ base: 4, md: 5 }}
        pb={6}
        minH="calc(100vh - 72px)"
        transition="margin-left 0.2s"
      >
        {children}
      </Box>
    </Box>
  ) : (
    <Box>
      <Signin />
    </Box>
  );
};

export default SidebarWithHeader;
