import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Box, Center, Spinner } from "@chakra-ui/react";
import { AppHeader } from "@/components/layouts/app-header";
import { AppSidebar } from "@/components/layouts/app-sidebar";

export const AppRoot = () => {
  const { session, loading, user } = useAuth();

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
      <AppHeader />
      <Box pt="16">
        {" "}
        {/* Add padding top for fixed header */}
        <AppSidebar />
        <Box ml={{ base: 0, md: 60 }} p="4">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
