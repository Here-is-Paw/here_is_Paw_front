import { PetCard } from "./PetCard"
import { Pet } from "@/types/pet"

interface PetListProps {
  pets: Pet[]
}

export function PetList({ pets }: PetListProps) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </div>
    </div>
  )
}
