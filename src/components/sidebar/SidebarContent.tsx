import {SidebarGroup} from "@/components/ui/sidebar";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {MissingList} from "@/components/petPost/missingPost/MissingList.tsx";
import {FindingList} from "@/components/petPost/findingPost/FindingList.tsx";

export function SidebarMainContent() {

    return (
        <div className="flex-1 overflow-y-auto bg-white md:h-[calc(100vh-120px)]">
            <SidebarGroup className="p-4">
                {/* 하단 패딩 제거 */}
                <h2 className="text-xl font-bold mb-1">잃어버렸개</h2>
                {/* mb-6에서 mb-4로 변경 */}
                <MissingList />
            </SidebarGroup>

            <SidebarGroup className="p-4 pt-2">
                {/* 상단 패딩 줄임 */}
                <h2 className="text-xl font-bold mb-1">발견했개</h2>
                {/* mb-6에서 mb-4로 변경 */}
                <FindingList/>
            </SidebarGroup>

            <SidebarGroup className="p-4 pt-2">
                <Card className="bg-green-600">
                    <CardHeader className="ps-3 pb-0">
                        <CardTitle className="text-white">
                            <div className="flex items-center gap-3">
                                반려동물 등록하기
                                {/* <Dog className="h-4 w-4" /> */}
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 text-white text-sm">
                                <Label className="leading-relaxed tracking-wide block">
                                    반려동물을 잃어 버렸을 때 무선식별장치로 소유자를 쉽게 찾을 수
                                    있습니다.
                                </Label>
                            </div>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="bg-green-700 text-white hover:bg-green-800 whitespace-nowrap h-auto py-2 self-stretch flex items-center"
                            >
                                등록하기
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </SidebarGroup>
            <div className="p-4 mt-auto text-center text-gray-500">
                <div>© 2025 Here Is Paw</div>
            </div>
        </div>
    );
}
