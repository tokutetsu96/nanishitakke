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
          <Flex alignItems="flex-start">
            <Box
              flexShrink={0}
              w={60}
              display={{ base: "none", md: "block" }}
              mr={8}
              position="sticky"
              top="20"
              h="calc(100vh - 5rem)"
              overflowY="auto"
            >
              <AppSidebar isOpen={isOpen} onClose={onClose} />
            </Box>

            <Box flex="1" minW={0} p="4" bg="white" minH="calc(100vh - 5rem)" maxW="container.md" mx="auto">
              <Outlet />
            </Box>
          </Flex>
        </Container>
      </Box>
      <AppSidebar isOpen={isOpen} onClose={onClose} mobileOnly />
    </Box>
  );
};
