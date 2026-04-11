import { Outlet } from "react-router-dom";
import { useCallback, useState } from "react";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleOpen = useCallback(() => setSidebarOpen(true), []);
  const handleClose = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader onOpen={handleOpen} />
      <div className="pt-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-start">
            <div className="hidden md:block w-60 shrink-0 mr-8 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
              <AppSidebar
                isOpen={sidebarOpen}
                onClose={handleClose}
              />
            </div>
            <div className="flex-1 min-w-0 p-4 bg-white min-h-[calc(100vh-5rem)] overflow-x-hidden">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={handleClose}
        mobileOnly
      />
    </div>
  );
};
