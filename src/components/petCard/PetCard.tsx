import { Pet } from "@/types/pet"

interface PetCardProps {
  pet: Pet
}

export function PetCard({ pet }: PetCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={pet.imageUrl} 
        alt={`${pet.breed} 실종동물`} 
        className="w-full h-30 object-cover"
      />
      <div className="p-4">
        <div className="font-medium mb-3">{pet.breed}</div>
        <div className="space-y-2">
        <div className="text-xs flex gap-4">
          <span className="text-gray-600 w-12">특징</span>
          <span className="flex-1 truncate">{pet.features}</span>
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
