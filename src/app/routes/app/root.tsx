import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Center, Spinner } from "@chakra-ui/react";

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

  return <Outlet />;
};
