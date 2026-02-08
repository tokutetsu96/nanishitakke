import {
  Box,
  Flex,
  Icon,
  Link,
  Text,
  VStack,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  CloseButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { NavLink as RouterNavLink } from "react-router-dom";
import {
  FiHome,
  FiBarChart2,
  FiFileText,
  FiArchive,
  FiCalendar,
} from "react-icons/fi";

interface NavItemProps {
  icon: React.ElementType;
  children: string;
  to: string;
  onClick?: () => void;
}

const NavItem = ({ icon, children, to, onClick }: NavItemProps) => {
  return (
    <Link
      as={RouterNavLink}
      to={to}
      onClick={onClick}
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

interface SidebarContentProps {
  onClose?: () => void;
}

const SidebarContent = ({ onClose }: SidebarContentProps) => {
  return (
    <VStack spacing={1} align="stretch" w="full">
      <NavItem icon={FiBarChart2} to="/" onClick={onClose}>
        統計レポート
      </NavItem>
      <NavItem icon={FiHome} to="/activities" onClick={onClose}>
        活動履歴
      </NavItem>
      <NavItem icon={FiCalendar} to="/calendar" onClick={onClose}>
        カレンダー
      </NavItem>
      <NavItem icon={FiFileText} to="/work-memos" onClick={onClose}>
        仕事メモ
      </NavItem>
      <NavItem icon={FiArchive} to="/reports" onClick={onClose}>
        レポートアーカイブ
      </NavItem>
    </VStack>
  );
};

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppSidebar = ({ isOpen, onClose }: AppSidebarProps) => {
  return (
    <>
      {/* Desktop Sidebar */}
      {/* Desktop Sidebar */}
      <Box
        bg={useColorModeValue("white", "gray.800")}
        w={{ base: "full", md: 60 }}
        display={{ base: "none", md: "block" }}
        pt={4}
      >
        <SidebarContent />
      </Box>

      {/* Mobile Sidebar (Drawer) */}
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="xs"
      >
        <DrawerOverlay />
        <DrawerContent>
          <Flex
            alignItems="center"
            h="20"
            px="4"
            justifyContent="space-between"
          >
            <Text fontSize="xl" fontWeight="bold">
              メニュー
            </Text>
            <CloseButton onClick={onClose} />
          </Flex>
          <DrawerBody p="0">
            <SidebarContent onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
