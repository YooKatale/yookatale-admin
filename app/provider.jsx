"use client";

import store from "@/store";
import { Provider } from "react-redux";
import { ChakraProvider } from "@chakra-ui/react";
import chakraTheme from "@/lib/chakraTheme";
import { Toaster } from "@components/ui/toaster";

const Providers = ({ children }) => {
  return (
    <ChakraProvider theme={chakraTheme}>
      <Provider store={store}>{children}</Provider>
      <Toaster />
    </ChakraProvider>
  );
};

export default Providers;
