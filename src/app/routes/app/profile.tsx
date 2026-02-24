import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const ProfileRoute = () => {
  const { user } = useAuth();
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
      toast.error("アバターのアップロードに失敗しました。", {
        description: uploadError.message,
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
      toast.error("アバターの更新に失敗しました。", {
        description: updateProfileError.message,
      });
    } else {
      setAvatarUrl(newAvatarUrl);
      toast.success("アバターが更新されました。");
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
      toast.error("プロフィールの更新に失敗しました。", {
        description: error.message,
      });
    } else {
      toast.success("プロフィールが更新されました。");
      navigate("/");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 py-4">
        <h1 className="text-2xl font-bold">読み込み中...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-4">
      <h1 className="text-2xl font-bold">プロフィール</h1>

      <div>
        <div className="flex flex-col items-center gap-4">
          <Avatar
            className="h-24 w-24 cursor-pointer border-2"
            onClick={handleAvatarClick}
          >
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
          </Avatar>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/png, image/jpeg"
          />
          <Button onClick={handleAvatarClick} isLoading={uploading}>
            アバターを変更
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>氏名</Label>
        <Input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="山田 太郎"
        />
      </div>

      <Button onClick={handleUpdateProfile} isLoading={uploading}>
        プロフィールを更新
      </Button>
    </div>
  );
};
