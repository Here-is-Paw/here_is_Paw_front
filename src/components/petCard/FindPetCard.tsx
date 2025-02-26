import { FindPet } from "@/types/FindPet";
import { findDetail } from "@/types/findDetail";
import { useState } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { backUrl } from "@/constants";
import axios from "axios";

const DEFAULT_IMAGE_URL = "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";

interface PetCardProps {
  pet: FindPet;
  findDetail: findDetail;
}

export function FindPetCard({ pet }: PetCardProps) {
  const [isFindDetailModalOpen, setIsFindDetailModalOpen] = useState(false);
  // 명시적으로 FindPet[] 타입을 지정합니다
  const [findDetail, setFindDetail] = useState<findDetail | null>(null);

  const handleFindDetail = async (postId: number) => {
    try {
      const detailResponse = await axios.get(`${backUrl}/find/${postId}`, {});
      setFindDetail(detailResponse.data);
      // console.log(findDetail);
    } catch (error) {
      console.error("Failed to fetch pet details:", error);
    }
  };

  const openDetailModal = async (postId: number) => {
    handleFindDetail(postId);
    // console.log(findDetail);
    console.log("Updated findDetail:", findDetail);
    setIsFindDetailModalOpen(true);
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-md overflow-hidden"
        onClick={() => {
          openDetailModal(pet.id);
        }}
      >
        <img src={pet.path_url ? pet.path_url : DEFAULT_IMAGE_URL} alt={`${pet.breed} 실종동물`} className="w-full h-30 object-cover" />
        <div className="p-3">
          <div className="font-medium mb-3">{pet.breed}</div>
          <div className="space-y-1">
            <div className="text-xs flex gap-4">
              <span className="text-gray-600 w-12">특징</span>
              <span className="flex-1 truncate">{pet.etc}</span>
            </div>
            <div className="text-xs flex gap-4">
              <span className="text-gray-600 w-12">발견장소</span>
              <span className="flex-1 truncate">{pet.location}</span>
            </div>
          </div>
        </div>
      </div>

      {isFindDetailModalOpen &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* 반투명 배경 */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsFindDetailModalOpen(false)} // 배경 클릭시 모달 닫기
            ></div>

            {/* findDetail 매핑은 모달 컨테이너 안에서 수행 */}
            {findDetail ? (
              <div className="relative w-full max-w-[800px] bg-white rounded-lg shadow-lg p-6 z-50">
                {/* 모달 헤더 */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">반려동물 발견</h2>
                </div>

                {/* 모달 내용(이미지, 폼 등) */}
                <p className="mb-4 text-gray-600">등록 게시글 미 연장시, 7일 후 자동 삭제 됩니다.</p>

                <div className="space-between text-[15px]">
                  {/* 예: 사진 업로드, 위치, 기타 폼 */}
                  <div className="w-80">
                    <div className="mb-4 ">
                      <label className="block font-medium mb-2">* 제목</label>
                      <div className="border p-2 w-full bg-white">{findDetail.title}</div>
                    </div>

                    <div className="mb-4">
                      <label className="block font-medium mb-2">반려동물 사진</label>
                      <div className="mt-2 flex">
                        <img src={findDetail.path_url || DEFAULT_IMAGE_URL} alt="반려동물 사진" className="w-60 h-60 object-cover rounded" />
                      </div>
                    </div>

                    <div className="mb-4 ">
                      <label className="block font-medium mb-2 ">* 발견 상황</label>
                      <div className="border p-2 w-full bg-white">{findDetail.situation}</div>
                    </div>

                    <div className="mb-4 flex justify-between">
                      <div className="mr-4 w-20">
                        <label className="block font-medium mb-2 ">견종</label>
                        <div className="border p-2 w-full bg-white">{findDetail.breed}</div>
                      </div>
                      <div className="mr-4 w-20">
                        <label className="block font-medium mb-2 ">색상</label>
                        <div className="border p-2 w-full bg-white">{findDetail.color}</div>
                      </div>
                      <div className="w-20">
                        <label className="block font-medium mb-2 ">이름</label>
                        <div className="border p-2 w-full bg-white">{findDetail.name}</div>
                      </div>
                    </div>
                    <div className="mb-4 flex justify-between">
                      <div className="mr-4 w-20">
                        <label className="block font-medium mb-2 ">성별</label>
                        <div className="border p-2 w-full bg-white">{findDetail.gender}</div>
                      </div>
                      <div className="mr-4 w-20">
                        <label className="block font-medium mb-2 ">중성화</label>
                        <div className="border p-2 w-full bg-white">{findDetail.neutered ? "했음" : "안함"}</div>
                      </div>
                      <div className="w-20">
                        <label className="block font-medium mb-2 ">나이</label>
                        <div className="border p-2 w-full bg-white">{findDetail.age}</div>
                      </div>
                    </div>
                  </div>
                  <div className="w-80">
                    <div className="w-20 h-20 bg-pink">지도 들어갈 곳</div>
                    <div className="mb-4 ">
                      <label className="block font-medium mb-2 ">특이 사항</label>
                      <div className="border p-2 w-full bg-white">{findDetail.etc}</div>
                    </div>
                  </div>
                </div>
                {/* 예: 등록/취소 버튼 */}
                <div className="flex justify-end gap-2 h-6">
                  <button className="px-4 py-0 rounded bg-gray-200 hover:bg-gray-300 " onClick={() => setIsFindDetailModalOpen(false)}>
                    취소하기
                  </button>
                  <button
                    className="px-4 py-0 rounded bg-green-600 text-white hover:bg-green-700"
                    onClick={() => {
                      // 등록 처리 로직
                      setIsFindDetailModalOpen(false);
                    }}
                  >
                    등록하기
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative w-full max-w-[800px] bg-white rounded-lg shadow-lg p-6 z-50">
                <p className="text-center py-4">데이터를 불러오는 중입니다...</p>
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
