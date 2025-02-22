import React from "react";
import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { clsx } from "clsx";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarHeader } from "@/components/sidebar/SidebarHeader";
import { SidebarMainContent } from "@/components/sidebar/SidebarContent";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
} from "@/components/ui/drawer";
import petsData from '../../mocks/data/pets.json';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(true);
  const [snap, setSnap] = useState<number | string | null>("355px");

  if (isMobile) {
    return (
      <div className="m-content-wrapper">
        <div className="fixed top-0 left-0 z-10 w-full">
          <SidebarHeader activeFilter="전체" onFilterChange={() => {}} />
        </div>

        <div>{children}</div>

        <Drawer
          open={open}
          onOpenChange={setOpen}
          modal={false} // 뒷배경을 클릭 가능하게 유지
          shouldScaleBackground={false} // 배경 스케일링 효과 비활성화
          dismissible={false} // 스와이프로 닫을 수 있도록 설정
          snapPoints={["355px", 1]}
          activeSnapPoint={snap}
          setActiveSnapPoint={setSnap}
        >
          {/* <DrawerTrigger asChild>
            <Button
              className="fixed bottom-4 right-4 rounded-full w-12 h-12"
              variant="secondary"
            >
              메뉴
            </Button>
          </DrawerTrigger> */}
          <DrawerPortal>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                <DrawerDescription>
                  This action cannot be undone.
                </DrawerDescription>
              </DrawerHeader>
              <div
                className={clsx({
                  "overflow-y-auto": snap === 1,
                  "overflow-hidden": snap !== 1,
                })}
              >
                <SidebarMainContent 
                lostPets={petsData.lostPets}
                findPets={petsData.findPets}/>
              </div>
            </DrawerContent>
          </DrawerPortal>
        </Drawer>
      </div>
    );
  }

  return (
    <div className="content-wrapper flex">
      <SidebarProvider className="w-auto">
        <AppSidebar 
        lostPets={petsData.lostPets}
        findPets={petsData.findPets}/>
      </SidebarProvider>
      <div className="flex-1">{children}</div>
    </div>
  );
}