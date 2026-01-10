import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Box, Center, Spinner } from "@chakra-ui/react";
import { AppHeader } from "@/components/layouts/app-header";

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
      <Outlet />
    </Box>
  );
};
