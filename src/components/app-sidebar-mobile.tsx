import { SidebarMainContent } from "./sidebar/SidebarContent";
import { useState } from "react";
import { MyPage } from "@/components/mypage/MyPage.tsx";
import {
    Drawer,
    DrawerContent,
    DrawerPortal,
} from "@/components/ui/drawer";
import { clsx } from "clsx";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { usePetContext } from "@/contexts/PetContext.tsx";
import { MissingList } from "@/components/petPost/missingPost/MissingList.tsx";
import { FindingList } from "@/components/petPost/findingPost/FindingList.tsx";

export function AppSidebarMobile() {
    const [open, setOpen] = useState(true);
    const [snap, setSnap] = useState<number | string | null>("355px");
    const { activeFilter } = usePetContext();

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
            <div className="fixed top-0 left-0 z-10 w-full">
                <SidebarHeader />
            </div>

            {/* 컨텐츠 영역 */}
            <Drawer
                open={open}
                onOpenChange={setOpen}
                modal={false}
                shouldScaleBackground={false}
                dismissible={false}
                snapPoints={["355px", 1]}
                activeSnapPoint={snap}
                setActiveSnapPoint={setSnap}
            >
                <DrawerPortal>
                    <DrawerContent className="min-h-[80vh]">
                        <div
                            className={clsx(
                                "h-full", // 부모 높이를 채우도록
                                {
                                    "overflow-y-auto max-h-[calc(100vh-80px)]": snap === 1, // 전체 화면 모드일 때 스크롤 가능
                                    "overflow-y-auto max-h-[355px]": snap === "355px", // 작은 모드일 때 높이 제한
                                }
                            )}
                        >
                            <div className="min-h-[355px]"> {/* 최소 높이 보장 */}
                                {renderContent()}
                            </div>
                        </div>
                    </DrawerContent>
                </DrawerPortal>
            </Drawer>
        </>
    );
}