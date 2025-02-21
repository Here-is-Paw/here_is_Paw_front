import { PetCard } from "./PetCard"
import { Pet } from "@/types/pet"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './swiper.css'; // 새로운 CSS 파일 추가

interface PetListProps {
  pets: Pet[]
}

export function PetList({ pets }: PetListProps) {
  return (
    <div className="h-auto"> {/* pb-6에서 pb-2로 변경 */}
      <Swiper
        slidesPerView={2}
        spaceBetween={5}
        slidesPerGroup={1}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="relative" // h-full 제거
      >
        {pets.map((pet) => (
          <SwiperSlide key={pet.id}>
            <div className="p-2"> {/* 카드 주변 패딩 추가 */}
              <PetCard pet={pet} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}