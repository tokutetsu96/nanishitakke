import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  Avatar,
  useToast,
  Flex,
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export const ProfileRoute = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("プロフィール取得エラー:", error);
      } else if (data) {
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
      }
      setLoading(false);
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const fileName = `${user.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);

    if (uploadError) {
      toast({
        title: "アバターのアップロードに失敗しました。",
        description: uploadError.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const newAvatarUrl = data.publicUrl;

    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({ avatar_url: newAvatarUrl })
      .eq("id", user.id);

    if (updateProfileError) {
      toast({
        title: "アバターの更新に失敗しました。",
        description: updateProfileError.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      setAvatarUrl(newAvatarUrl);
      toast({
        title: "アバターが更新されました。",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
    setUploading(false);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "プロフィールの更新に失敗しました。",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: "プロフィールが更新されました。",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/");
    }
  };

  if (loading) {
    return (
      <Container maxW="container.md" py={8}>
        <Heading as="h1">読み込み中...</Heading>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1">プロフィール</Heading>

        <Box>
          <Flex direction="column" align="center" gap={4}>
            <Avatar
              size="2xl"
              src={avatarUrl}
              name={fullName}
              cursor="pointer"
              onClick={handleAvatarClick}
              showBorder
            />
            <Input
              type="file"
              ref={fileInputRef}
              display="none"
              onChange={handleFileChange}
              accept="image/png, image/jpeg"
            />
            <Button onClick={handleAvatarClick} isLoading={uploading}>
              アバターを変更
            </Button>
          </Flex>
        </Box>

        <FormControl>
          <FormLabel>氏名</FormLabel>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="山田 太郎"
          />
        </FormControl>

        <Button
          colorScheme="pink"
          onClick={handleUpdateProfile}
          isLoading={uploading}
        >
          プロフィールを更新
        </Button>
      </VStack>
    </Container>
  );
};
