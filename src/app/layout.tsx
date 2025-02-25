import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

import { SidebarProvider } from "@/components/ui/sidebar";

import petsData from "../../mocks/data/pets.json";
import { AppSidebarMobile } from "@/components/app-sidebar-mobile";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="m-content-wrapper">
        <div>{children}</div>
        <AppSidebarMobile
          lostPets={petsData.lostPets}
          findPets={petsData.findPets}
        />
      </div>
    );
  }

  return (
    <div className="content-wrapper flex">
      <SidebarProvider className="w-auto">
        <AppSidebar lostPets={petsData.lostPets} findPets={petsData.findPets} />
      </SidebarProvider>
      <div className="flex-1">{children}</div>
    </div>
  );
}
