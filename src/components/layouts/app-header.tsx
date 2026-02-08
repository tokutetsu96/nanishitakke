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
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import NanishitakkeLogo from "@/assets/nanishitakke.png";

import { IconButton } from "@chakra-ui/react";
import { FiMenu } from "react-icons/fi";

interface AppHeaderProps {
  onOpen: () => void;
}

export const AppHeader = ({ onOpen }: AppHeaderProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{
    full_name: string | null;
    avatar_url: string | null;
  } | null>(null);

  const headerBg = useColorModeValue("white", "gray.900");
  const headingColor = useColorModeValue("gray.700", "white");
  const textColor = useColorModeValue("gray.700", "white");

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
    <Box
      as="header"
      bg={headerBg}
      shadow="sm"
      position="fixed"
      top="0"
      w="full"
      zIndex="sticky"
    >
      <Container maxW="container.lg" py={4}>
        <Flex align="center">
          <IconButton
            display={{ base: "flex", md: "none" }}
            onClick={onOpen}
            variant="outline"
            aria-label="open menu"
            icon={<FiMenu />}
            mr="4"
          />
          <Link to="/">
            <Flex align="center" cursor="pointer">
              <Heading as="h1" size="md" color={headingColor}>
                なにしたっけ
              </Heading>
              <Image src={NanishitakkeLogo} alt="なにしたっけ Logo" h="40px" />
            </Flex>
          </Link>
          <Spacer />
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            mr={4}
          />
          {user && profile && (
            <Menu>
              <MenuButton>
                <Flex alignItems="center" gap={2}>
                  <Text fontSize="sm" fontWeight="medium" color={textColor}>
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
