import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

import { SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebarMobile } from "@/components/app-sidebar-mobile";

import { useLocation } from "react-router-dom";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const location = useLocation();

  const hideLayout = ["/checkout", "/success", "/fail"].includes(
    location.pathname
  );

  if (hideLayout) {
    return <div>{children}</div>;
  }

  return (
    <>
      {isMobile ? (
        <div className="m-content-wrapper">
          <div>{children}</div>
          <AppSidebarMobile />
        </div>
      ) : (
        <div className="content-wrapper flex">
          <SidebarProvider className="w-auto">
            <AppSidebar />
          </SidebarProvider>
          <div className="flex-1">{children}</div>
        </div>
      )}
    </>
  );
}
