import React, {useState, useRef} from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Wallet, Pencil, ImagePlus, X} from 'lucide-react';
import {User} from "@/types/user";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

interface ProfileSectionProps {
    userData: User | null;
    points: number;
    onUpdateProfile?: (updatedData: {
        nickname?: string,
        profileImage?: File
    }) => Promise<void>;
    handlePayment?: () => Promise<void>
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
                                                                  userData,
                                                                  points,
                                                                  onUpdateProfile,
                                                                  handlePayment
                                                              }) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editedNickname, setEditedNickname] = useState(userData?.nickname || '');
    const [previewUrl, setPreviewUrl] = useState<string | null>(userData?.avatar || null);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // 파일 크기 제한 (예: 5MB)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('파일 크기는 5MB를 초과할 수 없습니다.');
                return;
            }

            // 미리보기 생성
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);

            // 파일 상태 설정
            setProfileImage(file);
        }
    };

    const handleRemoveImage = () => {
        setPreviewUrl(null);
        setProfileImage(null);

        // 파일 입력 초기화
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSelectImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleUpdateProfile = async () => {
        if (onUpdateProfile) {
            try {
                // 닉네임이나 프로필 이미지 중 하나라도 변경되었다면
                const updateData: {
                    nickname?: string,
                    profileImage?: File
                } = {};

                if (editedNickname.trim() !== userData?.nickname) {
                    updateData.nickname = editedNickname;
                }

                if (profileImage) {
                    updateData.profileImage = profileImage;
                }

                await onUpdateProfile(updateData);
                setIsEditDialogOpen(false);
            } catch (error) {
                console.error('프로필 업데이트 실패:', error);
                alert('프로필 업데이트에 실패했습니다.');
            }
        }
    };

    return (
        <>
            <Card className="mb-4">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">내 프로필</CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditDialogOpen(true)}
                    >
                        <Pencil className="h-4 w-4"/>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 rounded-full">
                            {userData?.avatar && (
                                <AvatarImage
                                    src={userData.avatar}
                                    alt={userData.nickname || '사용자'}
                                    className="object-cover w-full h-full"
                                />
                            )}
                            <AvatarFallback>{userData?.nickname?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="justify-start">
                            <h3 className="font-medium text-lg">{userData?.nickname || '사용자'}</h3>
                            <div className="flex items-center justify-start space-x-1">
                                <Wallet className="text-gray-600 w-5 h-5"/>
                                <span className="text-xl font-bold text-green-700">
                                    {points.toLocaleString()} P
                                </span>
                                <Button
                                    onClick={handlePayment}
                                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 scale-75"
                                >
                                    충전하기
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>프로필 수정</DialogTitle>
                        <DialogDescription>
                            프로필 정보를 수정할 수 있습니다.
                        </DialogDescription>
                    </DialogHeader>

                    {/* 프로필 이미지 업로더 */}
                    <div className="flex flex-col items-center space-y-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />

                        {previewUrl ? (
                            <div className="relative">
                                <div className="w-40 h-40 rounded-full overflow-hidden">
                                    <img
                                        src={previewUrl}
                                        alt="프로필 이미지"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-0 right-0 w-8 h-8 rounded-full p-0 flex items-center justify-center"
                                    onClick={handleRemoveImage}
                                >
                                    <X className="w-4 h-4"/>
                                </Button>
                            </div>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                className="flex items-center gap-2"
                                onClick={handleSelectImageClick}
                            >
                                <ImagePlus className="w-4 h-4"/>
                                프로필 이미지 선택
                            </Button>
                        )}
                    </div>

                    {/* 닉네임 입력 */}
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nickname" className="text-right">
                                닉네임
                            </Label>
                            <Input
                                id="nickname"
                                value={editedNickname}
                                onChange={(e) => setEditedNickname(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>

                    {/* 저장/취소 버튼 */}
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            취소
                        </Button>
                        <Button onClick={handleUpdateProfile}>
                            저장
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};