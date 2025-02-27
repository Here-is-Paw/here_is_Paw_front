import { useState, useEffect } from "react";
import { FindPetCard } from "./FindPetCard";
import { FindPet } from "@/types/FindPet";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './swiper.css';
import { usePetContext } from '@/contexts/findPetContext';

interface FindPetListProps {
  apiUrl: string;
  initialPets?: FindPet[];
}

export function FindPetList({ apiUrl, initialPets = [] }: FindPetListProps) {
  const [pets, setPets] = useState<FindPet[]>(initialPets);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { submissionCount } = usePetContext();

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setPets(data);
      } catch (err) {
        console.error("Error fetching pets:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [apiUrl, submissionCount]);

  if (loading && pets.length === 0) {
    return <div className="h-auto p-4 text-center">데이터를 불러오는 중...</div>;
  }

  if (error && pets.length === 0) {
    return <div className="h-auto p-4 text-center text-red-500">데이터가 없습니다.</div>;
  }

  return (
    <div className="h-auto pb-2">
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
              <FindPetCard pet={pet}/>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}