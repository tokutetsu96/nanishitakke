import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Center, Heading, Text, VStack } from "@chakra-ui/react";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const LoginPage = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate("/", { replace: true });
    }
  }, [session, navigate]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          prompt: "select_account",
          access_type: "offline",
        },
      },
    });
  };

  if (loading || session) return null;

  return (
    <Center h="100vh" bg="gray.50">
      <VStack spacing={8}>
        <VStack spacing={2}>
          <Heading as="h1" size="2xl" color="gray.700">
            なにしたっけ？
          </Heading>
          <Text fontSize="lg" color="gray.500">
            今日やったことを記録しよう
          </Text>
        </VStack>
        <Box
          p={8}
          bg="white"
          borderRadius="2xl"
          shadow="lg"
          textAlign="center"
          w="sm"
        >
          <VStack spacing={6}>
            <Heading as="h2" size="md" color="gray.600">
              ログイン
            </Heading>
            <Button
              onClick={handleGoogleLogin}
              colorScheme="pink"
              leftIcon={<FaGoogle />}
              size="lg"
              w="full"
              py={6}
            >
              Googleでログイン
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Center>
  );
};

export default LoginPage;
