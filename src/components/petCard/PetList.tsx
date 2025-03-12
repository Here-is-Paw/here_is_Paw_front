import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './swiper.css';
import { PetList as Pet } from "@/types/mypet.ts";
import { Card, CardContent } from "@/components/ui/card";

interface PetCardProps {
  pet: Pet;
}

function PetCard({ pet }: PetCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-2">
        <div className="bg-gray-100 rounded-md overflow-hidden h-36">
          <img
            src={pet.pathUrl || '/default-pet.jpg'}
            alt={pet.breed}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="mt-2">
          <h3 className="font-medium text-sm line-clamp-1">{pet.breed}</h3>
          <p className="text-gray-500 text-xs line-clamp-1">{pet.location}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface PetListProps {
  pets: Pet[]
}

export function PetList({ pets }: PetListProps) {
  return (
    <div className="h-auto">
      <Swiper
        slidesPerView={2}
        spaceBetween={5}
        slidesPerGroup={1}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="relative"
      >
        {pets.map((pet) => (
          <SwiperSlide key={pet.id}>
            <div className="p-2">
              <PetCard pet={pet} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}