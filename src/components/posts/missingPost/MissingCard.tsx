import {PetList} from "@/types/mypet.ts";

interface MissingCardProps {
  activeFilter: string;
  pet: PetList;
}

export function MissingCard({ activeFilter, pet }: MissingCardProps) {
  return (
    <>
      <div
        className={
          activeFilter === "전체"
            ? "w-40 bg-white rounded-lg shadow-md overflow-hidden"
            : "bg-white rounded-lg shadow-md overflow-hidden"
        }
      >
        <div className="w-full h-32 overflow-hidden">
          <img
            src={pet.pathUrl}
            alt={`${pet.breed} 실종동물`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-3">
          <div className="font-medium mb-3 truncate">{pet.breed}</div>
          <div className="space-y-1">
            <div className="text-xs flex gap-4">
              <span className="w-11 text-gray-600">지역</span>
              <span className="flex-1 truncate">{pet.location}</span>
            </div>
            <div className="text-xs flex gap-4">
              <span className="w-11 text-gray-600">특이사항</span>
              <span className="flex-1 truncate">{pet.etc}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
