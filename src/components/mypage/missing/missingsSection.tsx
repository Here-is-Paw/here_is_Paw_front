import { Card, CardContent } from "@/components/ui/card.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { X, Pencil } from "lucide-react";
import { MyPet } from "@/types/mypet.ts";
import { User } from "@/types/user.ts";
import { useState } from "react";
import { PetDetailDialog } from "@/components/mypage/pet/PetDetailPopup.tsx";

interface MissingsSectionProps {
  userPets: MyPet[];
  userData: User | null;
  onAddPetClick: () => void;
  onDeletePet: (pet: MyPet) => void;
  onUpdatePet?: (pet: MyPet) => void;
}

export const MissingsSection: React.FC<MissingsSectionProps> = ({
  userPets,
  onDeletePet,
  onUpdatePet,
}) => {
  const [selectedPet, setSelectedPet] = useState<MyPet | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);

  const handlePetCardClick = (pet: MyPet) => {
    setSelectedPet(pet);
    setDetailModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, pet: MyPet) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    if (onUpdatePet) {
      onUpdatePet(pet);
    }
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-1">실종 신고한 반려동물</h2>

      {userPets.length > 0 ? (
        userPets.map((pet, index) => (
          <Card
            key={pet.id || index}
            className="mb-4 relative cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handlePetCardClick(pet)}
          >
            <div className="absolute top-2 right-2 flex gap-2">
              {onUpdatePet && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => handleEditClick(e, pet)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={(e) => {
                  e.stopPropagation(); // 이벤트 버블링 방지
                  onDeletePet(pet);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 h-12 w-12 rounded-full flex items-center justify-center">
                  <Avatar className="h-16 w-16 rounded-full">
                    {pet?.imageUrl && (
                      <AvatarImage
                        src={pet.imageUrl}
                        alt={pet.name || "반려동물"}
                        className="object-cover w-full h-full"
                      />
                    )}
                    <AvatarFallback>
                      {pet.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{pet.name || "이름 없음"}</h3>
                  <p className="text-gray-500 text-sm">
                    {pet.breed || "품종 미상"} •{" "}
                    {pet.age ? `${pet.age}살` : "나이 미상"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="mb-4">
          <CardContent className="p-4 text-center text-gray-500">
            잃어버린 반려동물이 없습니다.
          </CardContent>
        </Card>
      )}

      {/* <Button className="w-full" variant="outline" onClick={onAddPetClick}>
        반려동물 추가하기
      </Button> */}

      {/* AlertDialog를 사용한 상세보기 컴포넌트 */}
      <PetDetailDialog
        pet={selectedPet}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onUpdatePet={onUpdatePet}
      />
    </>
  );
};
