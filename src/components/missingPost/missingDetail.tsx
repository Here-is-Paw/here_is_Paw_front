import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import React from "react";
import { MissingData } from "@/types/missing";
import { X } from "lucide-react";

interface MissingDetailProps {
  pet: MissingData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MissingDetail: React.FC<MissingDetailProps> = ({
  pet,
  open,
  onOpenChange,
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

  // 닫기 버튼 핸들러
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50" />
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogContent className="max-w-[450px] p-0 rounded-xl bg-white shadow-lg overflow-hidden">
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

          {/* 내용 영역 */}
          <div className="px-6 py-4">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                {pet?.pathUrl && (
                  <AvatarImage
                    src={pet.pathUrl}
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
                <p>{getGenderText(pet.gender || 0)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">색상</p>
                <p>{pet.color || "정보 없음"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">중성화 여부</p>
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
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
