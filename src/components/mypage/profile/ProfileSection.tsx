import React, { useState } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from "@/components/ui/card.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Wallet, Pencil } from 'lucide-react';
import { User } from "@/types/user.ts";
import { EditProfilePopup } from './EditProfilePopup.tsx';

interface ProfileSectionProps {
    userData: User | null;
    points: number;
    handlePayment?: () => Promise<void>;
    onUpdateProfile?: (updatedData: {
        username: string,
        nickname?: string,
        profileImage?: File
    }) => Promise<void>;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
                                                                  userData,
                                                                  points,
                                                                  handlePayment,
                                                                  onUpdateProfile
                                                              }) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    return (
        <>
            <Card className="mb-4">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">내 프로필</CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setIsEditDialogOpen(true)}
                    >
                        <Pencil className="h-4 w-4" />
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

            {/* 프로필 수정 팝업 */}
            {onUpdateProfile && (
                <EditProfilePopup
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    userData={userData}
                    onUpdateProfile={onUpdateProfile}
                />
            )}
        </>
    );
};