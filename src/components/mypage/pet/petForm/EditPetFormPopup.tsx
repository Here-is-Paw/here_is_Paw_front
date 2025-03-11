import React, { useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { backUrl } from "@/constants.ts";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog.tsx";

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
  // Initialize form with validation mode
  const form = useForm<PetFormData>({
    mode: "onChange",
  });

  // Set form values when pet data changes
  useEffect(() => {
    if (petToEdit && open) {
      // Convert from MyPet to PetFormData structure
      const formValues = {
        name: petToEdit.name || "",
        breed: petToEdit.breed || "",
        color: petToEdit.color || "",
        serialNumber: petToEdit.serialNumber || "",
        gender: petToEdit.gender !== undefined ? petToEdit.gender : 0,
        neutered: petToEdit.neutered !== undefined ? petToEdit.neutered : 0, // 1이면 true, 아니면 false
        age: petToEdit.age || undefined,
        etc: petToEdit.etc || "",
        profileImage: null, // Can't pre-fill the File object, only new uploads will be sent
        pathUrl: petToEdit.imageUrl || petToEdit.pathUrl || "", // 기존 이미지 URL 사용
      };

      form.reset(formValues);
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

    // 수정 모드에서는 기존 이미지가 있으면 새 이미지는 필수가 아님
    const hasExistingImage = Boolean(petToEdit.imageUrl || petToEdit.pathUrl);
    if (!data.profileImage && !hasExistingImage) {
      form.setError("profileImage", {
        type: "required",
        message: "반려동물 이미지는 필수입니다"
      });
      return;
    }

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
        formData.append("neutered", data.neutered ? "1" : "0");
      if (data.age !== undefined) formData.append("age", data.age.toString());
      if (data.etc) formData.append("etc", data.etc);

      // 이미지 추가 (새 이미지가 선택된 경우에만)
      if (data.profileImage) {
        formData.append("imageFile", data.profileImage);
      }

      // PATCH 요청 보내기 (수정이므로 PATCH 사용)
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
      <Dialog
          open={open}
          onOpenChange={(newOpen) => {
            if (!newOpen) {
              // 팝업이 닫힐 때 폼 초기화
              form.reset();
            }
            onOpenChange(newOpen);
          }}
      >
        <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            className="max-w-[500px] h-5/6 py-6 px-0 bg-white"
        >
          <DialogHeader className="space-y-2 text-center px-6">
            <DialogTitle className="text-2xl font-bold text-primary">
              반려동물 정보 수정
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              반려동물 정보를 수정해주세요
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto px-6">
            <PetForm
                form={form}
                onSubmit={handleSubmit}
                onClose={handleClose}
                isEditing={true}
            />
          </div>
        </DialogContent>
      </Dialog>
  );
};