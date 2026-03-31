import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { TemplateManagerModal } from "@/features/activity-templates/components/template-manager-modal";
import NanishitakkeLogo from "@/assets/nanishitakke.png";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useProfile } from "@/lib/use-profile";

interface AppHeaderProps {
  onOpen: () => void;
}

export const AppHeader = ({ onOpen }: AppHeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    isOpen: isTemplateOpen,
    onOpen: onOpenTemplate,
    onClose: onCloseTemplate,
  } = useDisclosure();
  const { data: profile } = useProfile();

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
    <header className="bg-white shadow-sm fixed top-0 w-full z-40">
      <div className="mx-auto max-w-5xl px-4 py-4">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="flex md:hidden mr-4"
            onClick={onOpen}
            aria-label="open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/" className="flex items-center cursor-pointer no-underline">
            <h1 className="text-lg font-semibold text-gray-700">
              なにしたっけ
            </h1>
            <img
              src={NanishitakkeLogo}
              alt="なにしたっけ Logo"
              className="h-10"
            />
          </Link>
          <div className="flex-1" />
          {user && profile && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 cursor-pointer bg-transparent border-none">
                  <span className="text-sm font-medium text-gray-700">
                    {profile.full_name}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.avatar_url || ""} />
                    <AvatarFallback>
                      {profile.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  プロフィール
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onOpenTemplate}>
                  テンプレート管理
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <TemplateManagerModal
        isOpen={isTemplateOpen}
        onClose={onCloseTemplate}
      />
    </header>
  );
};
