import { MyPet } from "@/types/pet.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Pencil, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog.tsx";
import React from "react";

interface PetDetailDialogProps {
  pet: MyPet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdatePet?: (pet: MyPet) => void;
}

export const PetDetailDialog: React.FC<PetDetailDialogProps> = ({
  pet,
  open,
  onOpenChange,
  onUpdatePet,
}) => {
  if (!pet) return null;

  // gender 값에 따른 표시 문자열 결정
  const getGenderText = (gender: number) => {
    switch (gender) {
      case 0:
        return "정보없음";
      case 1:
        return "수컷";
      case 2:
        return "암컷";
      default:
        return "정보없음";
    }
  };

  // 수정 버튼 클릭 핸들러
  const handleEditClick = () => {
    // 상세 정보 창 닫기
    onOpenChange(false);

    // 상위 컴포넌트의 수정 함수 호출
    if (onUpdatePet && pet) {
      onUpdatePet(pet);
    }
  };

  // 닫기 버튼 핸들러
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-black/50" />
        <AlertDialogHeader>
          <AlertDialogTitle></AlertDialogTitle>
          <AlertDialogDescription></AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogContent className="max-w-[500px] h-5/6 p-0 rounded-xl bg-white shadow-lg overflow-hidden">
          {/* 커스텀 헤더 영역 */}
          <div className="w-full bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">반려동물 상세정보</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            {/* 내용 영역 */}
            <div className="px-6 py-4">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  {pet?.imageUrl && (
                    <AvatarImage
                      src={pet.imageUrl}
                      alt={pet.name || "반려동물"}
                      className="object-cover w-full h-full"
                    />
                  )}
                  <AvatarFallback>{pet.name?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{pet.name || "이름 없음"}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">품종</p>
                  <p>{pet.breed || "품종 미상"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">나이</p>
                  <p>{pet.age ? `${pet.age}살` : "나이 미상"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">성별</p>
                  <p>{getGenderText(pet.gender)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">색상</p>
                  <p>{pet.color || "정보 없음"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    중성화 여부
                  </p>
                  <p>{pet.neutered ? "예" : "아니오"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">등록번호</p>
                  <p>{pet.serialNumber || "정보 없음"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">특이사항</p>
                  <p>{pet.etc || "정보 없음"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 수정 버튼을 하단에 배치 */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
            {onUpdatePet && (
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={handleEditClick}
              >
                <Pencil className="h-4 w-4" />
                <span>반려동물 정보 수정</span>
              </Button>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
};
