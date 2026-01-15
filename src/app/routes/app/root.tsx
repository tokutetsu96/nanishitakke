import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Box, Center, Spinner, useDisclosure } from "@chakra-ui/react";
import { AppHeader } from "@/components/layouts/app-header";
import { AppSidebar } from "@/components/layouts/app-sidebar";

export const AppRoot = () => {
  const { session, loading, user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (loading) {
    return (
      <Center p={10}>
        <Spinner color="pink.500" />
      </Center>
    );
  }

  if (!session || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box bg="gray.50" minH="100vh">
      <AppHeader onOpen={onOpen} />
      <Box pt="16">
        {/* Add padding top for fixed header */}
        <AppSidebar isOpen={isOpen} onClose={onClose} />
        <Box ml={{ base: 0, md: 60 }} p="4">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
