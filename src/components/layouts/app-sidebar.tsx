import { NavLink as RouterNavLink } from "react-router-dom";
import {
  FiHome,
  FiBarChart2,
  FiFileText,
  FiArchive,
  FiCalendar,
  FiBookOpen,
} from "react-icons/fi";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ElementType;
  children: string;
  to: string;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, children, to, onClick }: NavItemProps) => {
  return (
    <RouterNavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center p-4 cursor-pointer transition-all duration-200 hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-pink-50/10 dark:hover:text-pink-400 no-underline text-gray-700 dark:text-gray-300",
          isActive &&
            "bg-pink-50 text-pink-600 dark:bg-pink-50/10 dark:text-pink-400 font-bold border-r-4 border-pink-600 dark:border-pink-400",
        )
      }
    >
      <Icon className="mr-4 text-base" />
      <span className="text-base">{children}</span>
    </RouterNavLink>
  );
};

interface SidebarContentProps {
  onClose?: () => void;
}

const SidebarContent = ({ onClose }: SidebarContentProps) => {
  return (
    <div className="flex flex-col gap-0.5 w-full">
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
      <NavItem icon={FiBookOpen} to="/notes" onClick={onClose}>
        ノート
      </NavItem>
      <NavItem icon={FiArchive} to="/reports" onClick={onClose}>
        レポートアーカイブ
      </NavItem>
    </div>
  );
};

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  mobileOnly?: boolean;
}

export const AppSidebar = ({
  isOpen,
  onClose,
  mobileOnly,
}: AppSidebarProps) => {
  if (mobileOnly) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="left" className="p-0 w-[280px]">
          <SheetHeader className="p-4">
            <SheetTitle>メニュー</SheetTitle>
          </SheetHeader>
          <SidebarContent onClose={onClose} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 w-full pt-4">
      <SidebarContent />
    </div>
  );
};
