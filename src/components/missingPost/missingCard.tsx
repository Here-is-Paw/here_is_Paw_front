import { MissingData } from "@/types/missing";

interface MissingCardProps {
  pet: MissingData;
}

export function MissingCard({ pet }: MissingCardProps) {
  return (
    <>
      <div className="w-40 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="w-full h-32 overflow-hidden">
          <img
            src={pet.pathUrl}
            alt={`${pet.breed} 실종동물`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-3">
          <div className="font-medium mb-3">{pet.breed}</div>
          <div className="space-y-1">
            <div className="text-xs flex gap-4">
              <span className="flex-auto text-gray-600">특징</span>
              <span className="flex-1 truncate">{pet.etc}</span>
            </div>
            <div className="text-xs flex gap-4">
              <span className="flex-auto text-gray-600">발견장소</span>
              <span className="flex-1 truncate">{pet.location}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
