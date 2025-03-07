import { useState, useEffect } from "react";
import { FindPetCard } from "./FindPetCard";
import { FindPet } from "@/types/FindPet";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./swiper.css";
import { usePetContext } from "@/contexts/findPetContext";
import { backUrl } from "@/constants";

export function FindPetList() {
  const [pets, setPets] = useState<FindPet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { submissionCount } = usePetContext();

  // 발견 신고 전체 조회
  useEffect(() => {
    const fetchPets = () => {
      setLoading(true);

      fetch(`${backUrl}/api/v1/finding`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((response) => {
          if (!response.ok) {
            return Promise.reject(new Error(`HTTP error! Status: ${response.status}`));
          }
          return response.json();
        })
        .then((data) => {
          setPets(data.data.content);
          console.log(data.data.content)
        })
        .catch((err) => {
          console.error("Error fetching pets:", err);
          setError(err instanceof Error ? err.message : "Unknown error occurred");
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchPets();
  }, [submissionCount]);

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
        {pets.length > 0 &&
          pets.map((pet) => (
            <SwiperSlide key={pet.id}>
              <div className="p-2">
                <FindPetCard pet={pet} />
              </div>
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
}
