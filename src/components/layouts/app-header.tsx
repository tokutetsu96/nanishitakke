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
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import NanishitakkeLogo from "@/assets/nanishitakke.png";

interface AppHeaderProps {
  onLogout: () => void;
}

export const AppHeader = ({ onLogout }: AppHeaderProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{
    full_name: string | null;
    avatar_url: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("プロフィール取得エラー:", error);
      } else if (data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  return (
    <Box as="header" bg="white" shadow="sm">
      <Container maxW="container.md" py={4}>
        <Flex align="center">
          <Heading as="h1" size="md" color="gray.700">
            なにしたっけ
          </Heading>
          <Image src={NanishitakkeLogo} alt="なにしたっけ Logo" h="40px" />
          <Spacer />
          {user && profile && (
            <Menu>
              <MenuButton>
                <Flex alignItems="center" gap={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    {profile.full_name}
                  </Text>
                  <Avatar
                    size="sm"
                    src={profile.avatar_url || ""}
                    name={profile.full_name || ""}
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
