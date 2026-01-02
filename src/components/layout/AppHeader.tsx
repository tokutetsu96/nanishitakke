import {
  Box,
  Container,
  Flex,
  Heading,
  Spacer,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import NanishitakkeLogo from "@/assets/nanishitakke.png";

interface AppHeaderProps {
  onLogout: () => void;
}

const AppHeader = ({ onLogout }: AppHeaderProps) => {
  const { user } = useAuth();

  return (
    <Box as="header" bg="white" shadow="sm">
      <Container maxW="container.md" py={4}>
        <Flex align="center">
          <Heading as="h1" size="md" color="gray.700">
            なにしたっけ
          </Heading>
          <Image src={NanishitakkeLogo} alt="なにしたっけ Logo" h="40px" />
          <Spacer />
          {user && (
            <Menu>
              <MenuButton>
                <Flex alignItems="center" gap={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    {user.user_metadata?.full_name}
                  </Text>
                  <Avatar
                    size="sm"
                    src={user.user_metadata?.avatar_url}
                    name={user.user_metadata?.full_name}
                  />
                </Flex>
              </MenuButton>
              <MenuList>
                <MenuItem as={Link} to="/profile">
                  プロフィール
                </MenuItem>
                <MenuItem onClick={onLogout} as="button">
                  ログアウト
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      </Container>
    </Box>
  );
};

export default AppHeader;
