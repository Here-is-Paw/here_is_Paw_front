import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { PawPrint } from "lucide-react";

interface PetAlertProps {
  petName: string;
  petImage: string;
  petType: string;
  location: string;
  date: string;
  onViewDetails: () => void;
  position: { x: number; y: number };
}

export const PetAlert: React.FC<PetAlertProps> = ({
  petName,
  petImage,
  petType,
  location,
  date,
  onViewDetails,
  position,
}) => {
  return (
    <div
      className="absolute shadow-lg rounded-lg z-10"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <Card className="w-56 bg-white border-0">
        <CardContent className="p-2">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium pt-1 pb-1 text-center bg-gray-100 rounded">
              {petName && petName !== "" ? petName : "이름 모름"} / {petType}
            </div>

            <div className="relative">
              <img
                src={petImage}
                alt={`${petName || "발견된"} ${petType}`}
                className="w-full h-32 object-cover rounded"
              />
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {date}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <PawPrint className="h-4 w-4 text-red-500" />
                <span className="text-xs text-gray-600">{location}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={onViewDetails}
                className="text-xs h-7"
              >
                자세히 보기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="w-0 h-0 mx-auto border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></div>
    </div>
  );
};

// Map component that would use the PetAlert
export const PetMap: React.FC = () => {
  const [pets, setPets] = React.useState<
    Array<{
      id: string;
      name: string;
      image: string;
      type: string;
      location: string;
      date: string;
      position: { x: number; y: number };
    }>
  >([
    {
      id: "1",
      name: "믹스견",
      image: "/api/placeholder/200/150", // Placeholder image
      type: "갈색/검정",
      location: "동국대학교 인근",
      date: "2023-02-18",
      position: { x: 500, y: 300 },
    },
    // Add more sample pets as needed
  ]);

  const handleViewDetails = (id: string) => {
    console.log(`View details for pet ${id}`);
    // Navigate to details page or show modal
  };

  return (
    <div className="relative w-full h-screen bg-gray-100">
      {/* Map would go here - This is just a placeholder */}
      <div className="w-full h-full bg-gray-200 relative">
        <img
          src="/api/placeholder/1200/800"
          alt="Map"
          className="w-full h-full object-cover"
        />

        {/* Pet alert markers */}
        {pets.map((pet) => (
          <PetAlert
            key={pet.id}
            petName={pet.name}
            petImage={pet.image}
            petType={pet.type}
            location={pet.location}
            date={pet.date}
            position={pet.position}
            onViewDetails={() => handleViewDetails(pet.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default PetMap;
