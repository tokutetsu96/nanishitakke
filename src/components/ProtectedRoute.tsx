import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";
import { Center, Spinner } from "@chakra-ui/react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
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

  return <>{children}</>;
};

export default ProtectedRoute;
