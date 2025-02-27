import React, {useEffect} from 'react';
import axios from "axios";
import {useForm} from "react-hook-form";
import {backUrl} from "@/constants.ts";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card.tsx";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogCancel,
    AlertDialogPortal,
    AlertDialogOverlay, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
} from "@/components/ui/alert-dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {X} from "lucide-react";

import {PetForm} from './PetForm.tsx';
import {PetFormData, defaultValues} from '@/types/pet.ts';

interface AddPetFormPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export const AddPetFormPopup: React.FC<AddPetFormPopupProps> = ({
                                                                    open,
                                                                    onOpenChange,
                                                                    onSuccess
                                                                }) => {
    // Initialize the form with default values
    const form = useForm<PetFormData>({
        defaultValues
    });

    // Reset form when popup closes
    useEffect(() => {
        if (!open) {
            form.reset(defaultValues);
        }
    }, [open, form]);

    // Close handler
    const handleClose = () => {
        form.reset(defaultValues);
        onOpenChange(false);
    };

    // Submit handler
    const handleSubmit = async (data: PetFormData) => {
        try {
            // FormData 생성
            const formData = new FormData();

            // 텍스트 필드 추가
            formData.append('name', data.name);
            formData.append('breed', data.breed);

            // 선택적 필드 추가
            if (data.color) formData.append('color', data.color);
            if (data.serialNumber) formData.append('serialNumber', data.serialNumber);
            if (data.gender !== undefined) formData.append('gender', data.gender.toString());
            if (data.neutered !== undefined) formData.append('neutered', data.neutered.toString());
            if (data.age !== undefined) formData.append('age', data.age.toString());
            if (data.etc) formData.append('etc', data.etc);

            // 이미지 추가
            if (data.profileImage) {
                formData.append('imageFile', data.profileImage);
            }

            // 요청 보내기
            await axios.post(`${backUrl}/api/v1/mypets`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            // 성공 시 폼 초기화 후 팝업 닫기
            form.reset(defaultValues);
            onOpenChange(false);

            // 성공 콜백 호출
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('반려동물 등록 오류:', error);
            alert('반려동물 등록에 실패했습니다');
        }
    };

    return (
        <AlertDialog
            open={open}
            onOpenChange={(newOpen) => {
                if (!newOpen) {
                    // 팝업이 닫힐 때 폼 초기화
                    form.reset(defaultValues);
                }
                onOpenChange(newOpen);
            }}
        >
            <AlertDialogPortal>
                <AlertDialogOverlay className="bg-black/50"/>
                <AlertDialogHeader>
                    <AlertDialogTitle></AlertDialogTitle>
                    <AlertDialogDescription></AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogContent className="max-w-[500px] p-6 rounded-xl bg-white shadow-lg">
                    <AlertDialogCancel asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-4"
                            onClick={handleClose}
                        >
                            <X className="h-4 w-4"/>
                            <span className="sr-only">Close</span>
                        </Button>
                    </AlertDialogCancel>

                    <Card className="border-none shadow-none">
                        <CardHeader className="space-y-2 text-center px-0 pt-0">
                            <CardTitle className="text-2xl font-bold text-primary">
                                반려동물 등록
                            </CardTitle>
                            <CardDescription>
                                반려동물 정보를 입력해주세요
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <PetForm form={form} onSubmit={handleSubmit} onClose={handleClose}/>
                        </CardContent>
                    </Card>
                </AlertDialogContent>
            </AlertDialogPortal>
        </AlertDialog>
    );
};