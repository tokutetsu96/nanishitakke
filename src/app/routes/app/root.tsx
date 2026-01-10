import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Box, Center, Spinner } from "@chakra-ui/react";
import { AppHeader } from "@/components/layouts/app-header";

export const AppRoot = () => {
  const { session, loading, user } = useAuth();
  const [searchParams] = useSearchParams();

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

  if (searchParams.get("after_login") === "true") {
    return <Navigate to="/activities" replace />;
  }

  return (
    <Box bg="gray.50" minH="100vh">
      <AppHeader />
      <Outlet />
    </Box>
  );
};
