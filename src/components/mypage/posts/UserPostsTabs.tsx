import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertCircle, Search } from "lucide-react";
import { PetList } from "@/types/mypet";
import { FindingDetail } from "@/components/petPost/findingPost/FindingDetail";
import { FindingFormPopup } from "@/components/petPost/findingPost/FindingPost";
import { MissingDetail } from "@/components/petPost/missingPost/MissingDetail";
import { MissingFormPopup } from "@/components/petPost/missingPost/MissingPost";

// 게시글 타입 정의
type PostType = "missing" | "finding";

// 게시글 타입 상수
const POST_TYPE = {
  MISSING: "missing" as PostType,
  FINDING: "finding" as PostType,
};

interface UserPostsTabsProps {
  userMissing: PetList[];
  userFinding: PetList[];
  refreshPosts: () => Promise<void>;
}

export function UserPostsTabs({
  userMissing,
  userFinding,
  refreshPosts,
}: UserPostsTabsProps) {
  const [activeTab, setActiveTab] = useState<PostType>(POST_TYPE.MISSING);

  // 상세보기 관련 상태
  const [selectedMissingId, setSelectedMissingId] = useState<
    number | undefined
  >(undefined);
  const [selectedFindingId, setSelectedFindingId] = useState<
    number | undefined
  >(undefined);
  const [isMissingDetailOpen, setIsMissingDetailOpen] = useState(false);
  const [isFindingDetailOpen, setIsFindingDetailOpen] = useState(false);

  // 작성 모달 관련 상태
  const [isMissingFormOpen, setIsMissingFormOpen] = useState(false);
  const [isFindingFormOpen, setIsFindingFormOpen] = useState(false);

  // 게시글 작성 모달 열기
  const handleAddPost = (type: PostType) => {
    if (type === POST_TYPE.MISSING) {
      setIsMissingFormOpen(true);
    } else if (type === POST_TYPE.FINDING) {
      setIsFindingFormOpen(true);
    }
  };

  // 게시글 상세 보기 (모달로 열기)
  const handleViewPost = (id: number, type: PostType) => {
    if (type === POST_TYPE.MISSING) {
      setSelectedMissingId(id);
      setIsMissingDetailOpen(true);
    } else if (type === POST_TYPE.FINDING) {
      setSelectedFindingId(id);
      setIsFindingDetailOpen(true);
    }
  };

  // 채팅 모달 열기 처리
  const handleChatModalOpen = (chatInfo: any) => {
    console.log(chatInfo);
    // 실제 채팅 모달을 열기 위한 코드는 여기에 추가해야 합니다.
    // 부모 컴포넌트에서 처리하는 방식이나 채팅 컨텍스트를 이용하는 방식 등이 있을 수 있습니다.
  };

  // 작성 성공 후 처리
  const handlePostSuccess = () => {
    // 필요한 경우 여기에 게시글 목록을 새로고침하는 로직을 추가할 수 있습니다.
    refreshPosts();
    console.log("게시글이 성공적으로 추가되었습니다.");
  };

  return (
    <>
      <Card>
        <CardHeader className="max-md:px-4 pb-3">
          <CardTitle className="text-lg font-medium">나의 게시글</CardTitle>
          <CardDescription>
            등록한 실종/발견 게시글을 확인하고 관리하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as PostType)}
            className="w-full"
          >
            <div className="px-3 md:px-6 md:pb-3">
              <TabsList className="grid w-full grid-cols-2 h-auto">
                <TabsTrigger
                  value={POST_TYPE.MISSING}
                  className="flex flex-col gap-1 h-full"
                >
                  {userMissing.length > 0 && (
                    <Badge variant="secondary" className="flex-1">
                      {userMissing.length}
                    </Badge>
                  )}
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-auto" />
                    <span className="flex-auto">실종 게시글</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value={POST_TYPE.FINDING}
                  className="flex flex-col gap-1 h-full"
                >
                  {userFinding.length > 0 && (
                    <Badge variant="secondary" className="flex-1">
                      {userFinding.length}
                    </Badge>
                  )}
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span className="flex-auto">발견 게시글</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* 실종 게시글 탭 내용 */}
            <TabsContent
              value={POST_TYPE.MISSING}
              className="space-y-4 mt-0 px-3 md:px-6 pb-6 pt-3 h-96 overflow-y-auto"
            >
              {userMissing.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    등록된 실종 게시글이 없습니다
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button
                      onClick={() => handleAddPost(POST_TYPE.MISSING)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      실종 게시글 추가
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-4">
                    {userMissing.map((post) => (
                      <Card
                        key={post.id}
                        className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() =>
                          handleViewPost(post.id, POST_TYPE.MISSING)
                        }
                      >
                        <div className="flex flex-row">
                          <div
                            className="w-24 h-24 bg-gray-200 flex-shrink-0"
                            style={{
                              backgroundImage: post.pathUrl
                                ? `url(${post.pathUrl})`
                                : "none",
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          />
                          <div className="p-4 flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium line-clamp-1">
                                {post.breed}
                              </h4>
                              <Badge variant="destructive">실종</Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                              {post.location}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button
                      onClick={() => handleAddPost(POST_TYPE.MISSING)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      실종 게시글 추가
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            {/* 발견 게시글 탭 내용 */}
            <TabsContent
              value={POST_TYPE.FINDING}
              className="space-y-4 px-3 md:px-6 pb-6 h-96 overflow-y-auto"
            >
              {userFinding.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    등록된 발견 게시글이 없습니다
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button
                      onClick={() => handleAddPost(POST_TYPE.FINDING)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      발견 게시글 추가
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-4">
                    {userFinding.map((post) => (
                      <Card
                        key={post.id}
                        className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() =>
                          handleViewPost(post.id, POST_TYPE.FINDING)
                        }
                      >
                        <div className="flex flex-row">
                          <div
                            className="w-24 h-24 bg-gray-200 flex-shrink-0"
                            style={{
                              backgroundImage: post.pathUrl
                                ? `url(${post.pathUrl})`
                                : "none",
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          />
                          <div className="p-4 flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium line-clamp-1">
                                {post.breed}
                              </h4>
                              <Badge variant="secondary">발견</Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                              {post.location}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button
                      onClick={() => handleAddPost(POST_TYPE.FINDING)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      발견 게시글 추가
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 실종 게시글 상세 보기 모달 */}
      {selectedMissingId && (
          <MissingDetail
              petId={selectedMissingId}
              open={isMissingDetailOpen}
              onOpenChange={setIsMissingDetailOpen}
              onChatModalOpen={handleChatModalOpen}
              onSuccess={refreshPosts} // 이 부분 추가
          />
      )}

      {/* 발견 게시글 상세 보기 모달 */}
      {selectedFindingId && (
          <FindingDetail
              petId={selectedFindingId}
              open={isFindingDetailOpen}
              onOpenChange={setIsFindingDetailOpen}
              onChatModalOpen={handleChatModalOpen}
              onSuccess={refreshPosts} // 이 부분 추가
          />
      )}

      {/* 실종 게시글 작성 모달 */}
      <MissingFormPopup
        open={isMissingFormOpen}
        onOpenChange={setIsMissingFormOpen}
        onSuccess={handlePostSuccess}
      />

      {/* 발견 게시글 작성 모달 */}
      <FindingFormPopup
        open={isFindingFormOpen}
        onOpenChange={setIsFindingFormOpen}
        onSuccess={handlePostSuccess}
      />
    </>
  );
}
