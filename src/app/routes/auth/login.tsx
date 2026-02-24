import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const GoogleIcon = () => (
  <svg viewBox="0 0 488 512" width="16" height="16" fill="currentColor">
    <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
  </svg>
);

export const LoginRoute = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate("/", { replace: true });
    }
  }, [session, navigate]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          prompt: "select_account",
          access_type: "offline",
        },
      },
    });
  };

  if (loading || session) return null;

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold text-gray-700">
            なにしたっけ？
          </h1>
          <p className="text-lg text-gray-500">
            今日やったことを記録しよう
          </p>
        </div>
        <div className="p-8 bg-white rounded-2xl shadow-lg text-center w-80">
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-md font-semibold text-gray-600">
              ログイン
            </h2>
            <Button
              onClick={handleGoogleLogin}
              size="lg"
              className="w-full py-6"
            >
              <GoogleIcon />
              Googleでログイン
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
