import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { AppRoot } from "./routes/app/root";
import { LoginRoute } from "./routes/auth/login";

const createRouter = () =>
  createBrowserRouter([
    {
      path: "/login",
      element: <LoginRoute />,
    },
    {
      path: "/",
      element: <AppRoot />,
      children: [
        {
          index: true,
          lazy: async () => {
            const { DashboardRoute } = await import("./routes/app/dashboard");
            return { Component: DashboardRoute };
          },
        },
        {
          path: "activities",
          lazy: async () => {
            const { ActivitiesRoute } = await import("./routes/app/activities");
            return { Component: ActivitiesRoute };
          },
        },
        {
          path: "calendar",
          lazy: async () => {
            const { CalendarRoute } = await import("./routes/app/calendar");
            return { Component: CalendarRoute };
          },
        },
        {
          path: "work-memos",
          lazy: async () => {
            const { WorkMemosRoute } = await import("./routes/app/work-memos");
            return { Component: WorkMemosRoute };
          },
        },
        {
          path: "profile",
          lazy: async () => {
            const { ProfileRoute } = await import("./routes/app/profile");
            return { Component: ProfileRoute };
          },
        },
        {
          path: "reports",
          lazy: async () => {
            const { ReportsRoute } = await import("./routes/app/reports");
            return { Component: ReportsRoute };
          },
        },
      ],
    },
    {
      path: "*",
      lazy: async () => {
        const { NotFoundRoute } = await import("./routes/not-found");
        return { Component: NotFoundRoute };
      },
    },
  ]);

export const AppRouter = () => {
  const router = createRouter();
  return <RouterProvider router={router} />;
};
