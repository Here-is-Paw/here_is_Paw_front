import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { useEffect, useState } from "react";
import { MissingData } from "@/types/missing";
import { MissingCard } from "./missingCard";
import axios from "axios";
import { MissingDetail } from "./missingDetail";

interface MissingListProps {
  backUrl: string;
}

export function MissingList({ backUrl }: MissingListProps) {
  const [pets, setPets] = useState<MissingData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchMissingPoints = async () => {
      try {
        setLoading(true);

        // console.log("backUrl: ", backUrl);

        const response = await axios.get(`${backUrl}`, {
          withCredentials: true,
        });

        // console.log("missing", response.data.data);

        setPets(response.data.data || []);
        setLoading(false);

        return response.data.data;
      } catch (error) {
        console.error("포인트 정보 가져오기 실패:", error);
        setPets([]);
      }
    };

    fetchMissingPoints();
  }, [backUrl]);

  return (
    <>
      {loading ? (
        <p>loading...</p>
      ) : (
        <div className="h-auto">
          {/* pb-6에서 pb-2로 변경 */}
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
            {/* {console.log(pets)} */}
            {/* {pets.map((pet) => (
              <SwiperSlide key={`missing${pet.id}`}>
                <button
                  type="button"
                  className="text-left"
                  onClick={() => {
                    // 실종 신고하기 로직
                    setIsOpen(true);
                  }}
                >
                  <div className="p-2">
                    <MissingCard pet={pet} />
                  </div>
                </button>

                <MissingDetail
                  pet={pet}
                  open={isOpen}
                  onOpenChange={setIsOpen}
                />
              </SwiperSlide>
            ))} */}
          </Swiper>
        </div>
      )}
    </>
  );
}
