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
import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const ProfilePage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || ""
  );
  const [avatarUrl, setAvatarUrl] = useState(
    user?.user_metadata?.avatar_url || ""
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    setAvatarUrl(newAvatarUrl);

    const { error: updateUserError } = await supabase.auth.updateUser({
      data: { avatar_url: newAvatarUrl },
    });

    if (updateUserError) {
      toast({
        title: "アバターの更新に失敗しました。",
        description: updateUserError.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
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

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

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
    }
  };

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

export default ProfilePage;
