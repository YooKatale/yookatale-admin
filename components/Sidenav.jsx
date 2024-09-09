
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




const NavItem = ({ icon, path, children, index, size, ...rest }) => {
  const [routepath, setRoutepath]=useState("")
  const [isActive, setisActive]=useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const handleClick = async(e, path2) => {
  //router.push(path2)
  setRoutepath(path2)
  setisActive(path===pathname?true:false)
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
    <Link href={path} passHref key={index} onClick={(e)=>handleClick(e,path)}>
      <Box
        as="a"
        style={{ textDecoration: 'none' }}
        _focus={{ boxShadow: 'none' }}
        {...rest}
        onClick={(e)=>handleClick(e,path)}
      >
        <Flex
          align="center"
          m="4"
          p={3}
          borderRadius="lg"
          role="group"
          cursor="pointer"
          bg={isActive ? 'green.600' : 'transparent'}
          color={isActive ? 'white' : 'inherit'}
          _hover={{
            bg: isActive ? 'green.600' : 'gray.100',
          }}
        >
          {icon && (
            <Icon
              mr="2"
              fontSize="20"
              _groupHover={{
                //color: 'white',
              }}
              as={icon}
            />
          )}
          {children}
        </Flex>
      </Box>
    </Link>
  )
}
const SidebarContent = ({ onClose, ...rest }) => {
  return (
    <Box
  transition="3s ease"
  bg={useColorModeValue('white', 'gray.900')}
  borderRight="1px"
  borderRightColor={useColorModeValue('gray.200', 'gray.700')}
  w={{ base: 'full', md: 60 }}
  height="100%"
  position={'fixed'}
  {...rest}
>
  <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
    <Image
      src="/assets/icons/logo1.png"
      height={90}
      width={90}
      className="object-contain"
      alt="logo"
    />
    <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
  </Flex>
  <Box overflowY="auto" >
  <PerfectScrollbar options={{ suppressScrollX: true }}  >
  <Box
     maxHeight="calc(100vh - 100px)"
    px={2}
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
</Box>
    
  )
}



// const MobileNav = ({ onOpen,userInfo, ...rest }) => {

  

// const [isLoading, setLoading] = useState({ operation: "", status: false });
// const [logoutApiCall] = useLogoutMutation();

// const { toast } = useToast();
// const router = useRouter()


// const dispatch = useDispatch();

// const logoutHandler = async () => {
//   // set loading to be true
//   setLoading({ ...isLoading, operation: "logout", status: true });

//   try {
//     const res = await logoutApiCall().unwrap();

//     // set loading to be false
//     setLoading({ ...isLoading, operation: "", status: false });

//     dispatch(logout());

//     router.push("/signin");
//   } catch (err) {
//     console.log({ err });
//     // set loading to be false
//     setLoading({ ...isLoading, operation: "", status: false });

//     toast({
//       variant: "destructive",
//       title: "Error occured",
//       description: err.data?.message
//         ? err.data?.message
//         : err.data || err.error,
//     });
//   }
// };


//   return (
//    <Box w={{ base: 'full'}} position={'fixed'} zIndex="10" >
//     <Flex
//       ml={{ base: 0, md: 60 }}
//       px={{ base: 4, md: 4 }}
//       height="20"
//       alignItems="center"
//       bg={useColorModeValue('white', 'gray.900')}
//       borderBottomWidth="1px"
//       borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
//       justifyContent={{ base: 'space-between', md: 'flex-end' }}
//       {...rest}>
//       <IconButton
//         display={{ base: 'flex', md: 'none' }}
//         onClick={onOpen}
//         variant="outline"
//         aria-label="open menu"
//         icon={<FiMenu />}
//       />


//       <HStack spacing={{ base: '0', md: '6' }} >
//         <IconButton size="lg" variant="ghost" aria-label="open menu" icon={<FiBell />} />
//         <Flex alignItems={'center'}>
//           <Menu>
//             <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
//               <HStack>
//                 {/* JULIUS Future -> Include user Avar */}
//                 <VStack
//                   display={{ base: 'none', md: 'flex' }}
//                   alignItems="flex-start"
//                   spacing="1px"
//                   ml="2">
//                   <Text fontSize="sm">{userInfo?.username}</Text>
//                   <Text fontSize="xs" color="gray.600">
//                   {userInfo?.account.toUpperCase()}
//                   </Text>
//                 </VStack>
//                 <Box display={{ base: 'none', md: 'flex' }}>
//                   <FiChevronDown />
//                 </Box>
//               </HStack>
//             </MenuButton>
//             <MenuList
//               bg={useColorModeValue('white', 'gray.900')}
//               borderColor={useColorModeValue('gray.200', 'gray.700')}>
//               <MenuItem><Link href={'/settings'}>Profile</Link></MenuItem>
//               {/* <MenuItem>Settings</MenuItem>
//               <MenuItem>Billing</MenuItem> */}
//               <MenuDivider />
             

//               <MenuItem onClick={logoutHandler}>
//                   {isLoading && isLoading.operation == "logout" ? (
//                     <Loader2 />
//                   ) : (
//                     <LogOut />
//                   )}{" "}
//                   Logout
//                 </MenuItem>

//             </MenuList>
//           </Menu>
//         </Flex>
//       </HStack>
//     </Flex>
//     </Box>
//   )
// }

const SidebarWithHeader = ({children, ...rest}) => {
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const  [isAuthenticated, setisAuthenticated]=useState(false)
  const { userInfo, loading } = useSelector((state) => state.auth);
  useEffect(() => {
    if(userInfo?._id !==undefined ){
      router.push("/")
     setisAuthenticated(true)
    }else{
      router.push("/signin")
    }
    //IsLoggedIn()
    IsAccountValid();
  }, []);

  const MobileNav = ({ onOpen,userInfo, ...rest }) => {

  

    const [isLoading, setLoading] = useState({ operation: "", status: false });
    const [logoutApiCall] = useLogoutMutation();
    
    const { toast } = useToast();
    const router = useRouter()
    
    
    const dispatch = useDispatch();
    
    const logoutHandler = async () => {
      // set loading to be true
      setLoading({ ...isLoading, operation: "logout", status: true });
    
      try {
        const res = await logoutApiCall().unwrap();
    
        // set loading to be false
        setLoading({ ...isLoading, operation: "", status: false });
    
        dispatch(logout());
    setisAuthenticated(false)
        router.push("/signin");
      } catch (err) {
        console.log({ err });
        // set loading to be false
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
       <Box w={{ base: 'full'}} position={'fixed'} zIndex="10" >
        <Flex
          ml={{ base: 0, md: 60 }}
          px={{ base: 4, md: 4 }}
          height="20"
          alignItems="center"
          bg={useColorModeValue('white', 'gray.900')}
          borderBottomWidth="1px"
          borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
          justifyContent={{ base: 'space-between', md: 'flex-end' }}
          {...rest}>
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            variant="outline"
            aria-label="open menu"
            icon={<FiMenu />}
          />
    
    
          <HStack spacing={{ base: '0', md: '6' }} >
            <IconButton size="lg" variant="ghost" aria-label="open menu" icon={<FiBell />} />
            <Flex alignItems={'center'}>
              <Menu>
                <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
                  <HStack>
                    {/* JULIUS Future -> Include user Avar */}
                    <VStack
                      display={{ base: 'none', md: 'flex' }}
                      alignItems="flex-start"
                      spacing="1px"
                      ml="2">
                      <Text fontSize="sm">{userInfo?.username}</Text>
                      <Text fontSize="xs" color="gray.600">
                      {userInfo?.account.toUpperCase()}
                      </Text>
                    </VStack>
                    <Box display={{ base: 'none', md: 'flex' }}>
                      <FiChevronDown />
                    </Box>
                  </HStack>
                </MenuButton>
                <MenuList
                  bg={useColorModeValue('white', 'gray.900')}
                  borderColor={useColorModeValue('gray.200', 'gray.700')}>
                  <MenuItem><Link href={'/settings'}>Profile</Link></MenuItem>
                  {/* <MenuItem>Settings</MenuItem>
                  <MenuItem>Billing</MenuItem> */}
                  <MenuDivider />
                 
    
                  <MenuItem onClick={logoutHandler}>
                      {isLoading && isLoading.operation == "logout" ? (
                        <Loader2 />
                      ) : (
                        <LogOut />
                      )}{" "}
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
    isAuthenticated?(<Box bg={useColorModeValue('gray.100', 'gray.900')}>
      <SidebarContent onClose={() => onClose} display={{ base: 'none', md: 'block' }} />
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
      <MobileNav onOpen={onOpen} userInfo={userInfo}/>
      </Box>
      
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
      
    </Box>):(
<Box>
  <Signin/>
</Box>
    )
  )
}

export default SidebarWithHeader