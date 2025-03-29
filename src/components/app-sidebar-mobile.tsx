import { SidebarMainContent } from "./sidebar/SidebarContent";
import { useEffect, useState } from "react";
import { MyPage } from "@/components/mypage/MyPage.tsx";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
} from "@/components/ui/drawer";
import { clsx } from "clsx";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { usePetContext } from "@/contexts/PetContext.tsx";
import { MissingList } from "@/components/petPost/missingPost/MissingList.tsx";
import { FindingList } from "@/components/petPost/findingPost/FindingList.tsx";
import { SideMenu } from "./sidebar/SideMenu";
import { SearchTabs } from "./sidebar/SearchTabs";
import { IntegratedSearch } from "./sidebar/IntegratedSearch";
import { SearchMenu } from "./sidebar/SearchMenu";

export function AppSidebarMobile() {
  const [open, setOpen] = useState(true);
  const [snap, setSnap] = useState<number | string | null>("130px");
  const { activeFilter } = usePetContext();

  const handleSearchStart = () => {
    // setIsSearching(true);
  };

  // 컴포넌트 렌더링 선택
  const renderContent = () => {
    switch (activeFilter) {
      case "My":
        return <MyPage />;
      case "잃어버렸개":
        return <MissingList />;
      case "발견했개":
        return <FindingList />;
      default:
        return <SidebarMainContent />;
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 z-0 w-full">
        <SidebarHeader />
      </div>

      {/* 컨텐츠 영역 */}
      <Drawer
        open={open}
        onOpenChange={setOpen}
        modal={false} // Make it modal when an input is focused
        shouldScaleBackground={false}
        dismissible={false}
        snapPoints={["130px", 1]}
        activeSnapPoint={snap}
        setActiveSnapPoint={setSnap}
        // 추가: 자동 포커스 비활성화
        autoFocus={false} // 대부분의 drawer 라이브러리에 있는 옵션
      >
        <DrawerPortal>
          <DrawerContent className={`h-[calc(100%-40px)] z-10"`}>
            <DrawerHeader className="px-3 pb-0 gap-0">
              <DrawerTitle className="font-normal text-left">
                <div className="border-b border-gray-200 pb-4">
                  <SearchMenu />
                </div>
              </DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <div
              className={clsx(
                "h-full", // 부모 높이를 채우도록
                {
                  "overflow-y-auto h-[calc(100%-40px)]": snap === 1, // 전체 화면 모드일 때 스크롤 가능
                  "overflow-y-auto h-[130px]": snap === "130px", // 작은 모드일 때 높이 제한
                }
              )}
            >
              <div className="">
                {/* 최소 높이 보장 */}
                {renderContent()}
              </div>
            </div>
          </DrawerContent>
        </DrawerPortal>
      </Drawer>
    </>
  );
}
