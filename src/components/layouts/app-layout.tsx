import { Outlet } from "react-router-dom";
import { Box, useDisclosure, Container, Flex } from "@chakra-ui/react";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

export const AppLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box bg="gray.50" minH="100vh">
      <AppHeader onOpen={onOpen} />
      <Box pt="16">
        <Container maxW="container.lg">
          <Flex>
            <Box
              w={{ base: "full", md: 60 }}
              display={{ base: "none", md: "block" }}
              mr={{ md: 8 }}
              position="sticky"
              top="20"
              h="calc(100vh - 5rem)"
            >
              <AppSidebar isOpen={isOpen} onClose={onClose} />
            </Box>

            <Box flex="1" minW={0} p="4" bg="white" minH="calc(100vh - 5rem)">
              <Outlet />
            </Box>
          </Flex>
          {/* Mobile Sidebar Triggered by Header, processed here just for Drawer */}
          <Box display={{ base: "block", md: "none" }}>
            <AppSidebar isOpen={isOpen} onClose={onClose} />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
