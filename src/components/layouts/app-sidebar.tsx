import { Box, Flex, Icon, Link, Text, VStack, As } from "@chakra-ui/react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { FiHome, FiBarChart2, FiFileText } from "react-icons/fi";

interface NavItemProps {
  icon: As;
  children: string;
  to: string;
}

const NavItem = ({ icon, children, to }: NavItemProps) => {
  return (
    <Link
      as={RouterNavLink}
      to={to}
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
      w="full"
      _activeLink={{
        bg: "pink.50",
        color: "pink.600",
        fontWeight: "bold",
        borderRight: "4px solid",
        borderColor: "pink.600",
      }}
    >
      <Flex
        align="center"
        p="4"
        mx="0"
        borderRadius="0"
        role="group"
        cursor="pointer"
        _hover={{
          bg: "pink.50",
          color: "pink.600",
        }}
        transition="all 0.2s"
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            as={icon}
            _groupHover={{
              color: "pink.600",
            }}
          />
        )}
        <Text fontSize="md">{children}</Text>
      </Flex>
    </Link>
  );
};

export const AppSidebar = () => {
  return (
    <Box
      bg="white"
      borderRight="1px"
      borderRightColor="gray.200"
      w={{ base: "full", md: 60 }}
      pos="fixed"
      top="0"
      left="0"
      h="full"
      pt="20" // Adjust based on header height
      overflowY="auto"
      zIndex="docked"
    >
      <VStack spacing={1} align="stretch" w="full">
        <NavItem icon={FiHome} to="/">
          活動履歴
        </NavItem>
        <NavItem icon={FiBarChart2} to="/dashboard">
          統計レポート
        </NavItem>
        <NavItem icon={FiFileText} to="/work-memos">
          仕事メモ
        </NavItem>
      </VStack>
    </Box>
  );
};
