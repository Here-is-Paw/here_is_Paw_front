import { useState } from "react";
import { MyPage } from "@/components/mypage/MyPage.tsx";
import { MissingList } from "@/components/posts/missingPost/MissingList.tsx";
import { FindingList } from "@/components/posts/findingPost/FindingList.tsx";
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
import {usePetContext} from "@/contexts/PetContext.tsx";

// props 타입을 정의합니다 (사용하지 않지만 타입 오류 해결을 위해 추가)
interface AppSidebarMobileProps {
  lostPets?: any[];
  findPets?: any[];
}

export function AppSidebarMobile(_props: AppSidebarMobileProps) {
  const [open, setOpen] = useState(true);
  const [snap, setSnap] = useState<number | string | null>("355px");

  const {activeFilter} = usePetContext();

  // 컴포넌트 렌더링 선택 함수 추가
  const renderContent = () => {
    switch (activeFilter) {
      case "My":
        return <MyPage />;
      case "잃어버렸개":
        return <MissingList />;
      case "발견했개":
        return <FindingList />;
      default:
        return <div>선택된 필터가 없습니다.</div>;
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 z-10 w-full">
        <SidebarHeader />
      </div>
      {/* 컨텐츠 영역 */}
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
              {renderContent()}
            </div>
          </DrawerContent>
        </DrawerPortal>
      </Drawer>
    </>
  );
}
