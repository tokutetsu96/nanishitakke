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
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import NanishitakkeLogo from "@/assets/nanishitakke.png";

export const AppHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn("ログアウト警告:", error);
      }
    } catch (error) {
      console.error("ログアウトエラー:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <Box as="header" bg="white" shadow="sm">
      <Container maxW="container.md" py={4}>
        <Flex align="center">
          <Link to="/">
            <Flex align="center" cursor="pointer">
              <Heading as="h1" size="md" color="gray.700">
                なにしたっけ
              </Heading>
              <Image src={NanishitakkeLogo} alt="なにしたっけ Logo" h="40px" />
            </Flex>
          </Link>
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
                <MenuItem as={Link} to="/dashboard">
                  統計レポート
                </MenuItem>
                <MenuItem as={Link} to="/profile">
                  プロフィール
                </MenuItem>
                <MenuItem onClick={handleLogout} as="button">
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
