import React, { useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { backUrl } from "@/constants.ts";

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
  AlertDialogOverlay,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { X } from "lucide-react";

import { PetForm } from "@/components/mypage/pet/petForm/PetForm.tsx";
import { MyPet, PetFormData } from "@/types/mypet.ts";

interface EditPetFormPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petToEdit: MyPet | null;
  onSuccess?: () => void;
}

export const EditPetFormPopup: React.FC<EditPetFormPopupProps> = ({
  open,
  onOpenChange,
  petToEdit,
  onSuccess,
}) => {
  // Initialize form
  const form = useForm<PetFormData>();

  // Set form values when pet data changes
  useEffect(() => {
    if (petToEdit && open) {
      // Convert from MyPet to PetFormData structure
      form.reset({
        name: petToEdit.name || "",
        breed: petToEdit.breed || "",
        color: petToEdit.color || "",
        serialNumber: petToEdit.serialNumber || "",
        gender: petToEdit.gender !== undefined ? petToEdit.gender : 0,
        neutered: petToEdit.neutered ? true : false,
        age: petToEdit.age || undefined,
        etc: petToEdit.etc || "",
        profileImage: null, // Can't pre-fill the File object, only new uploads will be sent
      });
    }
  }, [petToEdit, open, form]);

  // Close handler
  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  // Submit handler for editing
  const handleSubmit = async (data: PetFormData) => {
    if (!petToEdit?.id) return;

    try {
      // FormData 생성
      const formData = new FormData();

      // 텍스트 필드 추가
      formData.append("name", data.name);
      formData.append("breed", data.breed);

      // 선택적 필드 추가
      if (data.color) formData.append("color", data.color);
      if (data.serialNumber) formData.append("serialNumber", data.serialNumber);
      if (data.gender !== undefined)
        formData.append("gender", data.gender.toString());
      if (data.neutered !== undefined)
        formData.append("neutered", data.neutered.toString());
      if (data.age !== undefined) formData.append("age", data.age.toString());
      if (data.etc) formData.append("etc", data.etc);

      // 이미지 추가 (새 이미지가 선택된 경우에만)
      if (data.profileImage) {
        formData.append("imageFile", data.profileImage);
      }

      // PUT 요청 보내기 (수정이므로 PUT 사용)
      await axios.patch(`${backUrl}/api/v1/mypets/${petToEdit.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      // 성공 시 폼 초기화 후 팝업 닫기
      form.reset();
      onOpenChange(false);

      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("반려동물 수정 오류:", error);
      alert("반려동물 정보 수정에 실패했습니다");
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          // 팝업이 닫힐 때 폼 초기화
          form.reset();
        }
        onOpenChange(newOpen);
      }}
    >
      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-black/50" />
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
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </AlertDialogCancel>

          <Card className="border-none shadow-none">
            <CardHeader className="space-y-2 text-center px-0 pt-0">
              <CardTitle className="text-2xl font-bold text-primary">
                반려동물 정보 수정
              </CardTitle>
              <CardDescription>반려동물 정보를 수정해주세요</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <PetForm
                form={form}
                onSubmit={handleSubmit}
                onClose={handleClose}
                isEditing={true}
              />
            </CardContent>
          </Card>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
};
