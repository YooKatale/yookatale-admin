import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  zIndices: {
    modal: 99999,
    popover: 99998,
    tooltip: 100000,
  },
});

export default theme;
