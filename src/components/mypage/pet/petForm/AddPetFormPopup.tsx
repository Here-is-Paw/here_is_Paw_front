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
  DialogFooter,
} from "@/components/ui/dialog.tsx";
import { PetForm } from "./PetForm.tsx";
import { PetFormData, defaultValues } from "@/types/mypet.ts";
import { Button } from "@/components/ui/button.tsx";

interface AddPetFormPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddPetFormPopup: React.FC<AddPetFormPopupProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  // Initialize the form with default values
  const form = useForm<PetFormData>({
    defaultValues,
    mode: "onChange", // 입력 변경시마다 유효성 검사
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
    // 이미지가 없으면 제출 중단
    if (!data.profileImage) {
      form.setError("profileImage", {
        type: "required",
        message: "반려동물 이미지는 필수입니다",
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
        formData.append("neutered", data.neutered.toString());
      if (data.age !== undefined) formData.append("age", data.age.toString());
      if (data.etc) formData.append("etc", data.etc);

      // 이미지 추가
      if (data.profileImage) {
        formData.append("imageFile", data.profileImage);
      }

      // 요청 보내기
      await axios.post(`${backUrl}/api/v1/mypets`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      // 성공 시 폼 초기화 후 팝업 닫기
      form.reset(defaultValues);
      onOpenChange(false);

      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("반려동물 등록 오류:", error);
      alert("반려동물 등록에 실패했습니다");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          // 팝업이 닫힐 때 폼 초기화
          form.reset(defaultValues);
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-[500px] w-[calc(100%-1rem)] h-5/6 py-6 px-0 bg-white rounded"
      >
        <DialogHeader className="space-y-2 text-left px-3 md:px-6">
          <DialogTitle className="text-2xl font-bold text-primary">
            반려동물 등록
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            반려동물 정보를 입력해주세요
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-3 md:px-6">
          <PetForm form={form} onSubmit={handleSubmit} isEditing={false} />
        </div>

        <DialogFooter className="flex-row flex-wrap-reverse px-3 md:px-6">
          <div className="w-full flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit" onClick={form.handleSubmit(handleSubmit)}>
              등록하기
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
