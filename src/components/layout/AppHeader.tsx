import {
  Box,
  Container,
  Flex,
  Heading,
  IconButton,
  Spacer,
  Image,
} from '@chakra-ui/react';
import { FaSignOutAlt } from 'react-icons/fa';
import NanishitakkeLogo from '@/assets/nanishitakke.png';

interface AppHeaderProps {
  onLogout: () => void;
}

const AppHeader = ({ onLogout }: AppHeaderProps) => {
  return (
    <Box as="header" bg="white" shadow="sm">
      <Container maxW="container.md" py={4}>
        <Flex align="center">
          <Heading as="h1" size="md" color="gray.700">
            なにしたっけ
          </Heading>
          <Spacer />
          <Image src={NanishitakkeLogo} alt="なにしたっけ Logo" h="40px" />
          <Spacer />
          <IconButton
            aria-label="Logout"
            icon={<FaSignOutAlt />}
            variant="ghost"
            colorScheme="pink"
            onClick={onLogout}
          />
        </Flex>
      </Container>
    </Box>
  );
};

export default AppHeader;