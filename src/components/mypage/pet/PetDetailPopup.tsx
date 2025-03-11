import { MyPet } from "@/types/mypet.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
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

  const getNeutered = (neutered: number) => {
    switch (neutered) {
      case 0:
        return "정보없음";
      case 1:
        return "함";
      case 2:
        return "안함";
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

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            className="max-w-[500px] h-5/6 py-6 px-0 bg-white"
        >
          <DialogHeader className="space-y-2 text-center px-6">
            <DialogTitle className="text-2xl font-bold text-primary">
              반려동물 상세정보
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {pet.name || "이름 없음"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto px-6">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                {(pet?.imageUrl || pet?.pathUrl) && (
                    <AvatarImage
                        src={pet.imageUrl || pet.pathUrl}
                        alt={pet.name || "반려동물"}
                        className="object-cover w-full h-full"
                    />
                )}
                <AvatarFallback>{pet.name?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
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
                <p>{getNeutered(pet.neutered)}</p>
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

          <DialogFooter className="px-6">
            <div className="flex justify-end gap-2">
              {onUpdatePet && (
                  <Button
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={handleEditClick}
                  >
                    <Pencil className="h-4 w-4" />
                    <span>정보 수정</span>
                  </Button>
              )}
              <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
              >
                닫기
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};