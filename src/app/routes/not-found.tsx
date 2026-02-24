import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const NotFoundRoute = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold">404 - ページが見つかりません</h1>
        <Button asChild>
          <Link to="/login">ログインページへ戻る</Link>
        </Button>
      </div>
    </div>
  );
};
