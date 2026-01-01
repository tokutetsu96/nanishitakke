import { Box, Container, Heading } from '@chakra-ui/react';

const ProfilePage = () => {
  return (
    <Container maxW="container.md" py={8}>
      <Box>
        <Heading as="h1">プロフィール</Heading>
        <p>This is the profile page.</p>
      </Box>
    </Container>
  );
};

export default ProfilePage;
