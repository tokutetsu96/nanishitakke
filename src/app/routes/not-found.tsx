import { Button, Center, Heading, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export const NotFoundRoute = () => {
  return (
    <Center h="100vh">
      <VStack spacing={4}>
        <Heading>404 - ページが見つかりません</Heading>
        <Button as={Link} to="/" colorScheme="pink">
          ホームに戻る
        </Button>
      </VStack>
    </Center>
  );
};
