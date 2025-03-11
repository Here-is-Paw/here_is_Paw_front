import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogHeader,
    DialogFooter,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Search, User, Award } from "lucide-react";
import axios from "axios";
import { backUrl } from "@/constants.ts";
import { ConfirmationAlert } from "@/components/petPost/missingPost/reward/ConfirmationAlert"; // 새로 만든 Alert 컴포넌트 임포트

interface UserSearchPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    petId: number;
    rewardAmount: number;
    onSuccess?: () => void;
}

interface UserSearchResult {
    id: number;
    nickname: string;
    imageUrl?: string;
    email?: string;
}

export const UserSearchPopup: React.FC<UserSearchPopupProps> = ({
                                                                    open,
                                                                    onOpenChange,
                                                                    petId,
                                                                    rewardAmount,
                                                                    onSuccess,
                                                                }) => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
    const [transferring, setTransferring] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

    const DEFAULT_IMAGE_URL =
        "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";

    // 사용자가 검색어를 입력할 때마다 검색 결과 초기화
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setSearchResults([]);
        }
        handleSearch()
    }, [searchQuery]);

    // 사용자 검색 함수
    const handleSearch = async () => {
        if (searchQuery.trim() === "") {
            setError("검색어를 입력해주세요.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${backUrl}/api/v1/searchMember`, {
                params: { kw: searchQuery },
                withCredentials: true,
            });

            if (response.data.statusCode === 200) {
                setSearchResults(response.data.data.content || []);
                if (response.data.data.length === 0) {
                    setError("검색 결과가 없습니다.");
                }
            } else {
                setError(response.data.message || "검색 중 오류가 발생했습니다.");
                setSearchResults([]);
            }
        } catch (err: any) {
            console.error("사용자 검색 오류:", err);
            setError(err.response?.data?.message || "검색 중 오류가 발생했습니다.");
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    // 사용자 선택 처리
    const handleUserSelect = (userId: number) => {
        // 이미 같은 유저가 선택된 경우, 선택 해제
        if (userId === selectedUserId) {
            setSelectedUserId(null);
            setSelectedUser(null);
            return;
        }

        // 선택된 사용자 찾기
        const user = searchResults.find(user => user.id === userId);
        if (user) {
            setSelectedUserId(userId);
            setSelectedUser(user);
        }
    };

    // 사례금 전달 버튼 클릭 핸들러
    const handleRewardButtonClick = () => {
        if (!selectedUserId || !selectedUser) {
            setError("사례금을 전달할 사용자를 선택해주세요.");
            return;
        }

        // 확인 대화상자 표시
        setShowConfirmation(true);
    };

    // 사례금 전달 처리
    const handleRewardTransfer = async () => {
        if (!selectedUserId || !selectedUser) {
            setError("사례금을 전달할 사용자를 선택해주세요.");
            return;
        }

        setTransferring(true);
        setError(null);

        try {
            // 사례금 전달 API 호출
            const response = await axios.post(
                `${backUrl}/api/v1/payments/reward`,
                {
                    petId: petId,
                    receiverId: selectedUserId,
                },
                { withCredentials: true }
            );

            if (response.data.success) {
                alert(`${selectedUser.nickname}님에게 사례금 전달이 완료되었습니다.`);
                onOpenChange(false);
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                setError(response.data.message || "사례금 전달 중 오류가 발생했습니다.");
            }
        } catch (err: any) {
            console.error("사례금 전달 오류:", err);
            setError(err.response?.data?.message || "사례금 전달 중 오류가 발생했습니다.");
        } finally {
            setTransferring(false);
        }
    };

    // 이미지 URL 유효성 검사
    const getValidImageUrl = (imageUrl: string | undefined) => {
        if (!imageUrl || imageUrl === "profile" || (imageUrl && imageUrl.includes("kakaocdn.net") && imageUrl.includes("default_profile"))) {
            return DEFAULT_IMAGE_URL;
        }
        return imageUrl;
    };

    // Enter 키로 검색 처리
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    // 확인 대화상자 설명 텍스트 생성 - DOM 중첩 오류 수정
    const getConfirmationDescription = () => {
        if (!selectedUser) return "";

        return (
            <>
                <span className="text-blue-600 font-medium">{selectedUser.nickname}</span>님에게
                <span className="text-amber-600 font-bold"> {rewardAmount.toLocaleString()}원</span>의
                사례금을 전달합니다.
                <br />
                <span className="text-sm text-gray-500 block mt-2">
                    전달된 사례금은 취소할 수 없습니다. 계속하시겠습니까?
                </span>
            </>
        );
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-md w-full py-6 px-6 bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            사례금 전달하기
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="text-sm mb-2">
                            반려동물을 찾는데 도움을 준 사용자를 검색하여 사례금을 전달해보세요.
                        </div>

                        <div className="flex gap-2 mb-4">
                            <Input
                                placeholder="닉네임 또는 이메일로 검색"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleSearch}
                                disabled={loading}
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                <Search className="h-4 w-4 mr-2" />
                                검색
                            </Button>
                        </div>

                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                        <div className="max-h-[200px] overflow-y-auto border rounded-md">
                            {loading ? (
                                <div className="flex justify-center items-center h-20">
                                    <p className="text-gray-500">검색 중...</p>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <ul className="divide-y">
                                    {searchResults.map((user) => (
                                        <li
                                            key={user.id}
                                            className={`p-3 flex items-center hover:bg-gray-50 cursor-pointer ${
                                                selectedUserId === user.id ? "bg-blue-50" : ""
                                            }`}
                                            onClick={() => handleUserSelect(user.id)}
                                        >
                                            <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                                                <img
                                                    src={getValidImageUrl(user.imageUrl)}
                                                    alt={user.nickname}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{user.nickname}</p>
                                                {user.email && <p className="text-sm text-gray-500">{user.email}</p>}
                                            </div>
                                            <div className="w-5 h-5 rounded-full border border-blue-500 flex-shrink-0">
                                                {selectedUserId === user.id && (
                                                    <div className="w-3 h-3 bg-blue-500 rounded-full m-auto" />
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex flex-col justify-center items-center h-20">
                                    <User className="h-8 w-8 text-gray-300 mb-2" />
                                    <p className="text-gray-500 text-sm">검색 결과가 없습니다</p>
                                </div>
                            )}
                        </div>

                        {selectedUser && (
                            <div className="mt-4 bg-amber-50 p-3 rounded-md border border-amber-200">
                                <p className="text-sm font-medium">
                                    <span className="text-blue-600 font-bold">{selectedUser.nickname}</span>님에게
                                    <span className="text-amber-600 font-bold"> {rewardAmount.toLocaleString()}원</span>의
                                    사례금을 전달합니다.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            취소
                        </Button>
                        <Button
                            onClick={handleRewardButtonClick}
                            disabled={!selectedUserId || transferring}
                            className="bg-amber-500 hover:bg-amber-600"
                        >
                            사례금 전달하기
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 확인 대화상자 */}
            <ConfirmationAlert
                open={showConfirmation}
                onOpenChange={setShowConfirmation}
                title="사례금 전달 확인"
                description={getConfirmationDescription()}
                confirmLabel="전달하기"
                cancelLabel="취소"
                onConfirm={handleRewardTransfer}
                confirmColor="bg-amber-500 hover:bg-amber-600"
            />
        </>
    );
};