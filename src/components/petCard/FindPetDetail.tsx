import { FindPet } from "@/types/FindPet"

const DEFAULT_IMAGE_URL = "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";

interface PetCardProps {
  pet: FindPet
}

export function FindPetCard({ pet }: PetCardProps) {

  const [isFindModalOpen, setIsFindModalOpen] = useState(false);
  return (
    {isFindModalOpen && (
      // 배경 오버레이
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* 반투명 배경 */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsFindModalOpen(false)} // 배경 클릭시 모달 닫기
        ></div>

        {/* 모달 컨테이너 */}
        <div className="relative w-full max-w-[800px] bg-white rounded-lg shadow-lg p-6 z-50">
          {/* 모달 헤더 */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">반려동물 발견 등록하기</h2>
          </div>

          {/* 모달 내용(이미지, 폼 등) */}
          <p className="mb-4 text-gray-600">등록 게시글 미 연장시, 7일 후 자동 삭제 됩니다.</p>

          <div className="space-between text-[15px]">
            {/* 예: 사진 업로드, 위치, 기타 폼 */}
            <div>
              <div className="mb-4 ">
                <label className="block font-medium mb-2">* 제목</label>
                <textarea
                  className="border p-2 w-full bg-white resize-none"
                  rows={1}
                  placeholder="게시글의 제목을 입력해주세요."
                />
              </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2">반려동물 사진</label>
                  <div className="mt-2 flex">
                    <img src=# alt="미리보기" className="w-60 h-60 object-cover rounded" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block font-medium mb-2">반려동물 사진</label>
                  <input type="file" className="border p-2 w-full" onChange={handleImageUpload} />
                </div>

              <div className="mb-4 ">
                <label className="block font-medium mb-2 ">* 발견 상황</label>
                <textarea
                  className="border p-2 w-full bg-white resize-none"
                  rows={2}
                  placeholder="발견 당시 상황을 입력해주세요."
                  onChange={handleSituation}
                />
              </div>

              <div className="mb-4 flex justify-between">
                <div className="mr-4 w-20">
                  <label className="block font-medium mb-2 ">견종</label>
                  <input className="border p-2 w-full bg-white" placeholder="견종" onChange={handleBreed} />
                </div>
                <div className="mr-4 w-20">
                  <label className="block font-medium mb-2 ">색상</label>
                  <input className="border p-2 w-full bg-white" placeholder="색상" onChange={handleColor} />
                </div>
                <div className="w-20">
                  <label className="block font-medium mb-2 ">이름</label>
                  <input className="border p-2 w-full bg-white" placeholder="이름" onChange={handleName} />
                </div>
              </div>
              <div className="mb-4 flex justify-between">
                <div className="mr-4 w-20">
                  <label className="block font-medium mb-2 ">성별</label>
                  <input className="border p-2 w-full bg-white" placeholder="성별" onChange={handleGender} />
                </div>
                <div className="mr-4 w-20">
                  <label className="block font-medium mb-2 ">중성화</label>
                  <input className="border p-2 w-full bg-white" placeholder="중성화 여부" onChange={handleNeutered} />
                </div>
                <div className="w-20">
                  <label className="block font-medium mb-2 ">나이</label>
                  <input className="border p-2 w-full bg-white" placeholder="추정 나이" onChange={handleAge} />
                </div>
              </div>
            </div>
            <div className="w-80">
              <div className="w-20 h-20 bg-pink">지도 들어갈 곳</div>
              <div className="mb-4 ">
                <label className="block font-medium mb-2 ">특이 사항</label>
                <textarea className="border p-2 w-full bg-white resize-none" rows={2} placeholder="특징을 설명해주세요." onChange={handleEtc} />
              </div>
            </div>
          </div>
          {/* 예: 등록/취소 버튼 */}
          <div className="flex justify-end gap-2 h-6">
            <button className="px-4 py-0 rounded bg-gray-200 hover:bg-gray-300 " onClick={() => setIsFindModalOpen(false)}>
              취소하기
            </button>
            <button
              className="px-4 py-0 rounded bg-green-600 text-white hover:bg-green-700"
              onClick={() => {
                // 등록 처리 로직
                handleFindSubmit();
                setIsFindModalOpen(false);
              }}
            >
              등록하기
            </button>
          </div>
        </div>
      </div>
    )}
  )
}
