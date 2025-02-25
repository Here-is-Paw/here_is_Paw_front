import { FindPet } from "@/types/FindPet"

const DEFAULT_IMAGE_URL = "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";

interface PetCardProps {
  pet: FindPet
}

export function FindPetCard({ pet }: PetCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={pet.path_url ? pet.path_url : DEFAULT_IMAGE_URL}
        alt={`${pet.breed} 실종동물`} 
        className="w-full h-30 object-cover"
      />
      <div className="p-3">
        <div className="font-medium mb-3">{pet.breed}</div>
        <div className="space-y-1">
        <div className="text-xs flex gap-4">
          <span className="text-gray-600 w-12">특징</span>
          <span className="flex-1 truncate">{pet.etc}</span>
          </div>
          <div className="text-xs flex gap-4">
            <span className="text-gray-600 w-12">발견장소</span>
            <span className="flex-1 truncate">{pet.location}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
