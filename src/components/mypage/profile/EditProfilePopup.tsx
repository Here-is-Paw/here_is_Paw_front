import React, { useState, useRef, useEffect } from 'react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogCancel,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogPortal,
    AlertDialogOverlay,
} from "@/components/ui/alert-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ImagePlus, X } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { User } from "@/types/user.ts";

interface EditProfilePopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userData: User | null;
    onUpdateProfile: (updatedData: {
        username: string,
        nickname?: string,
        profileImage?: File
    }) => Promise<void>;
}

export const EditProfilePopup: React.FC<EditProfilePopupProps> = ({
                                                                      open,
                                                                      onOpenChange,
                                                                      userData,
                                                                      onUpdateProfile
                                                                  }) => {
    const [editedNickname, setEditedNickname] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 다이얼로그가 열릴 때마다 초기값 설정
    useEffect(() => {
        if (open && userData) {
            setEditedNickname(userData.nickname || '');
            setPreviewUrl(userData.avatar || null);
            setProfileImage(null);
        }
    }, [open, userData]);

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
        try {
            // 닉네임이나 프로필 이미지 중 하나라도 변경되었다면
            const updateData: {
                username: string,
                nickname?: string,
                profileImage?: File
            } = {
                username: userData?.username || ''
            };


            if (editedNickname.trim() !== userData?.nickname) {
                updateData.nickname = editedNickname;
            }

            if (profileImage) {
                updateData.profileImage = profileImage;
            }

            await onUpdateProfile(updateData);
            onOpenChange(false);
        } catch (error) {
            console.error('프로필 업데이트 실패:', error);
            alert('프로필 업데이트에 실패했습니다.');
        }
    };

    const handleClose = () => {
        // 상태 초기화
        setEditedNickname(userData?.nickname || '');
        setPreviewUrl(userData?.avatar || null);
        setProfileImage(null);
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogPortal>
                <AlertDialogOverlay className="bg-black/50" />
                <AlertDialogContent className="max-w-[500px] p-6 rounded-xl bg-white shadow-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle>프로필 수정</AlertDialogTitle>
                        <AlertDialogDescription>
                            프로필 정보를 수정할 수 있습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogCancel asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-4"
                            onClick={handleClose}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </AlertDialogCancel>

                    {/* 프로필 이미지 업로더 */}
                    <div className="flex flex-col items-center space-y-4 mt-4">
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
                        <Button variant="outline" onClick={handleClose}>
                            취소
                        </Button>
                        <Button onClick={handleUpdateProfile}>
                            저장
                        </Button>
                    </div>
                </AlertDialogContent>
            </AlertDialogPortal>
        </AlertDialog>
    );
};