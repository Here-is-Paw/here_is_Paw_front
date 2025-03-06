import {useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import axios from 'axios';

// UI Components
import {SidebarGroup} from "@/components/ui/sidebar";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

// Context and Constants
import {useAuth} from "@/contexts/AuthContext";
import {backUrl} from "@/constants";

// Types
import {User} from "@/types/user";
import {MyPet} from "@/types/pet";

// Custom Components
import {KakaoLoginPopup} from "@/components/kakaoLogin/KakaoLoginPopup";
import {AddPetFormPopup} from "@/components/mypage/pet/petForm/AddPetFormPopup.tsx";
import {EditPetFormPopup} from "@/components/mypage/pet/petForm/EditPetFormPopup.tsx";
import {RadiusSlider} from "@/components/mypage/RadiusSlider";

// Internal Components
import {ProfileSection} from './profile/ProfileSection.tsx';
import {PetsSection} from './pet/PetsSection.tsx';
import {DeletePetDialog} from './pet/DeletePetDialog.tsx';
import {useRadius} from "@/contexts/RadiusContext.tsx";

export function MyPage() {
    const navigate = useNavigate();
    const { radius } = useRadius();

    // Authentication and State Management
    const {isLoggedIn, logout} = useAuth();
    const [userData, setUserData] = useState<User | null>(null);
    const [userPets, setUserPets] = useState<MyPet[]>([]);
    const [loading, setLoading] = useState(true);
    const [points, setPoints] = useState<number>(0);

    // Modal and Interaction States
    const [isAddPetOpen, setIsAddPetOpen] = useState(false);
    const [isEditPetOpen, setIsEditPetOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [petToDelete, setPetToDelete] = useState<MyPet | null>(null);
    const [petToEdit, setPetToEdit] = useState<MyPet | null>(null);

    // Data Loading Effect
    useEffect(() => {
        const loadUserData = async () => {
            setLoading(true);
            if (isLoggedIn) {
                await Promise.all([
                    fetchUserInfo(),
                    fetchUserPets(),
                    fetchUserPoints()
                ]);
            }
            setLoading(false);
        };
        console.log(userData?.id)
        loadUserData();
    }, [isLoggedIn]);


    // 사용자 포인트 조회하기
    const fetchUserPoints = async () => {
        try {
            const response = await axios.get(`${backUrl}/api/v1/payment/points`, {
                withCredentials: true,
            });
            setPoints(response.data.data);
            return response.data.data;
        } catch (error) {
            console.error("포인트 정보 가져오기 실패:", error);
            setPoints(0);
        }
    };

    // 사용자 정보 가져오기
    const fetchUserInfo = async () => {
        try {
            const response = await axios.get(`${backUrl}/api/v1/members/me`, {
                withCredentials: true,
            });
            setUserData(response.data.data);
        } catch (error) {
            console.error("유저 정보 가져오기 실패:", error);
            setUserData(null);
        }
    };

    // 사용자 펫 가져오기
    const fetchUserPets = async () => {
        try {
            const response = await axios.get(`${backUrl}/api/v1/mypets`, {
                withCredentials: true,
            });
            setUserPets(response.data.data || []);
        } catch (error) {
            console.error("반려동물 정보 가져오기 실패:", error);
            setUserPets([]);
        }
    };

    const updateUserProfile = async (updatedData: {
        id : number;
        nickname?: string;
        profileImage?: File;
    }) => {
        try {
            // FormData 생성
            const formData = new FormData();

            console.log("유저 이름: ", userData?.id);

            formData.append("id", String(userData?.id ?? 0));

            // 닉네임 추가 (변경된 경우)
            if (updatedData.nickname) {
                formData.append('nickname', updatedData.nickname);
            }

            // 프로필 이미지 추가 (변경된 경우)
            if (updatedData.profileImage) {
                formData.append('profileImage', updatedData.profileImage);
            }

            // API 요청
            const response = await axios.patch(`${backUrl}/api/v1/members/modify`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            // 성공 시 사용자 데이터 업데이트 - 새 객체로 만들어서 확실히 재렌더링 되도록 함
            setUserData({...response.data.data});

            // 포인트 정보도 함께 갱신
            await fetchUserPoints();

            // 성공 메시지 표시
            alert('프로필이 성공적으로 업데이트되었습니다.');

            return response.data;
        } catch (error) {
            console.error('프로필 업데이트 실패:', error);

            // 에러 처리
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.data?.message || '프로필 업데이트에 실패했습니다.';
                alert(errorMessage);
            } else {
                alert('프로필 업데이트 중 알 수 없는 오류가 발생했습니다.');
            }

            throw error;
        }
    };

    // 반려동물 삭제 함수
    const deletePet = async (petId: string | number) => {
        try {
            await axios.delete(`${backUrl}/api/v1/mypets/${petId}`, {
                withCredentials: true,
            });

            // 삭제 성공 시 목록 갱신
            await fetchUserPets();
            return true;
        } catch (error) {
            console.error("반려동물 삭제 실패:", error);
            return false;
        }
    };

    // 삭제 버튼 클릭 핸들러
    const handleDeleteClick = (pet: MyPet) => {
        setPetToDelete(pet);
        setIsDeleteDialogOpen(true);
    };

    // 수정 버튼 클릭 핸들러
    const handleEditClick = (pet: MyPet) => {
        setPetToEdit(pet);
        setIsEditPetOpen(true);
    };

    // 삭제 확인 핸들러
    const handleConfirmDelete = async () => {
        if (petToDelete?.id) {
            const success = await deletePet(petToDelete.id);
            if (!success) {
                alert("반려동물 삭제에 실패했습니다.");
            }
        }
        setIsDeleteDialogOpen(false);
        setPetToDelete(null);
    };

    const handlePayment = async () => {
        try {
            navigate('/checkout');
        } catch (error) {
            console.error("결제 페이지 이동 실패:", error);
            alert("결제 페이지로 이동할 수 없습니다.");
        }
    };

    const handleLogout = async () => {
        try {

            console.log("radius 값: ", radius);

            await axios.patch(`${backUrl}/api/v1/members/radius`,
                { radius },
                { withCredentials: true, }
            )

            // 백엔드 로그아웃 API 호출 (필요한 경우)
            await axios.delete(`${backUrl}/api/v1/members/logout`, {
                withCredentials: true,
            });

            logout(); // Context 상태 업데이트
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };


    // Render Loading State for Non-Logged In Users
    if (!isLoggedIn) {
        return (
            <div className="flex-1 overflow-y-auto bg-white md:h-[calc(100vh-120px)]">
                <SidebarGroup className="p-4">
                    <Card className="mb-4">
                        <CardContent className="p-6 flex flex-col items-center justify-center">
                            <h3 className="font-medium text-lg mb-2">로그인이 필요합니다</h3>
                            <p className="text-gray-500 text-sm mb-4">서비스를 이용하려면 로그인하세요.</p>
                            <KakaoLoginPopup/>
                        </CardContent>
                    </Card>
                </SidebarGroup>
            </div>
        );
    }

    // Render Loading Indicator
    if (loading) {
        return (
            <div className="flex-1 overflow-y-auto bg-white md:h-[calc(100vh-120px)] flex items-center justify-center">
                <p>데이터를 불러오는 중...</p>
            </div>
        );
    }

    // Main Page Render
    return (
        <div className="flex-1 overflow-y-auto bg-white md:h-[calc(100vh-120px)]">
            {/* 프로필 섹션 */}
            <SidebarGroup className="p-4">
                <ProfileSection
                    userData={userData}
                    points={points}
                    handlePayment={handlePayment}
                    onUpdateProfile={updateUserProfile}
                />
            </SidebarGroup>

            {/* 검색 반경 슬라이더 섹션 */}
            <SidebarGroup className="p-4 pt-0">
                <RadiusSlider />
            </SidebarGroup>

            {/* 내 반려동물 섹션 */}
            <SidebarGroup className="p-4 pt-0">
                <PetsSection
                    userPets={userPets}
                    userData={userData}
                    onAddPetClick={() => setIsAddPetOpen(true)}
                    onDeletePet={handleDeleteClick}
                    onUpdatePet={handleEditClick}
                />
            </SidebarGroup>

            {/* 반려동물 추가 팝업 */}
            <AddPetFormPopup
                open={isAddPetOpen}
                onOpenChange={setIsAddPetOpen}
                onSuccess={fetchUserPets}
            />

            {/* 반려동물 수정 팝업 */}
            <EditPetFormPopup
                open={isEditPetOpen}
                onOpenChange={setIsEditPetOpen}
                petToEdit={petToEdit}
                onSuccess={fetchUserPets}
            />

            {/* 로그아웃 버튼 */}
            <SidebarGroup className="p-4">
                <Button className="w-full" variant="ghost" onClick={handleLogout}>
                    로그아웃
                </Button>
            </SidebarGroup>

            {/* 저작권 정보 */}
            <div className="p-4 mt-auto text-center text-gray-500">
                <div>© 2025 Here Is Paw</div>
            </div>

            {/* 반려동물 삭제 확인 대화상자 */}
            <DeletePetDialog
                isOpen={isDeleteDialogOpen}
                petToDelete={petToDelete}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirmDelete={handleConfirmDelete}
            />
        </div>
    );
}