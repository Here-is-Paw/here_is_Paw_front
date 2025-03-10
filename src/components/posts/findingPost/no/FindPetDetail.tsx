// import { Finding } from "@/types/Finding";
// import { useState } from "react";
//
// const DEFAULT_IMAGE_URL =
//   "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";
//
// interface PetCardProps {
//   pet: Finding;
// }
//
// export function FindPetCard({ pet }: PetCardProps) {
//   const [isFindModalOpen, setIsFindModalOpen] = useState(false);
//   const [imagePreview, setImagePreview] = useState<string>(pet.path_url || DEFAULT_IMAGE_URL);
//   const [title, setTitle] = useState("");
//   const [situation, setSituation] = useState("");
//   const [breed, setBreed] = useState("");
//   const [color, setColor] = useState("");
//   const [name, setName] = useState("");
//   const [gender, setGender] = useState("");
//   const [neutered, setNeutered] = useState("");
//   const [age, setAge] = useState("");
//   const [etc, setEtc] = useState("");
//
//   const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };
//
//   const handleFindSubmit = () => {
//     console.log("등록 완료!", { title, situation, breed, color, name, gender, neutered, age, etc, imagePreview });
//     setIsFindModalOpen(false);
//   };
//
//   return (
//     <>
//       {isFindModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center z-50">
//           <div className="absolute inset-0 bg-black/50" onClick={() => setIsFindModalOpen(false)}></div>
//           <div className="relative w-full max-w-[800px] bg-white rounded-lg shadow-lg p-6 z-50">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-semibold">반려동물 발견 등록하기</h2>
//             </div>
//
//             <p className="mb-4 text-gray-600">등록 게시글 미 연장시, 7일 후 자동 삭제됩니다.</p>
//
//             <div className="mb-4">
//               <label className="block font-medium mb-2">* 제목</label>
//               <textarea className="border p-2 w-full resize-none" rows={1} placeholder="게시글의 제목을 입력해주세요." onChange={(e) => setTitle(e.target.value)} />
//             </div>
//
//             <div className="mb-4">
//               <label className="block font-medium mb-2">반려동물 사진</label>
//               <div className="mt-2 flex">
//                 <img src={imagePreview} alt="미리보기" className="w-60 h-60 object-cover rounded" />
//               </div>
//               <input type="file" className="border p-2 w-full" onChange={handleImageUpload} />
//             </div>
//
//             <div className="mb-4">
//               <label className="block font-medium mb-2">* 발견 상황</label>
//               <textarea className="border p-2 w-full resize-none" rows={2} placeholder="발견 당시 상황을 입력해주세요." onChange={(e) => setSituation(e.target.value)} />
//             </div>
//
//             <div className="mb-4 flex justify-between">
//               <div className="mr-4 w-20">
//                 <label className="block font-medium mb-2">견종</label>
//                 <input className="border p-2 w-full" placeholder="견종" onChange={(e) => setBreed(e.target.value)} />
//               </div>
//               <div className="mr-4 w-20">
//                 <label className="block font-medium mb-2">색상</label>
//                 <input className="border p-2 w-full" placeholder="색상" onChange={(e) => setColor(e.target.value)} />
//               </div>
//               <div className="w-20">
//                 <label className="block font-medium mb-2">이름</label>
//                 <input className="border p-2 w-full" placeholder="이름" onChange={(e) => setName(e.target.value)} />
//               </div>
//             </div>
//
//             <div className="mb-4 flex justify-between">
//               <div className="mr-4 w-20">
//                 <label className="block font-medium mb-2">성별</label>
//                 <input className="border p-2 w-full" placeholder="성별" onChange={(e) => setGender(e.target.value)} />
//               </div>
//               <div className="mr-4 w-20">
//                 <label className="block font-medium mb-2">중성화</label>
//                 <input className="border p-2 w-full" placeholder="중성화 여부" onChange={(e) => setNeutered(e.target.value)} />
//               </div>
//               <div className="w-20">
//                 <label className="block font-medium mb-2">나이</label>
//                 <input className="border p-2 w-full" placeholder="추정 나이" onChange={(e) => setAge(e.target.value)} />
//               </div>
//             </div>
//
//             <div className="mb-4">
//               <label className="block font-medium mb-2">특이 사항</label>
//               <textarea className="border p-2 w-full resize-none" rows={2} placeholder="특징을 설명해주세요." onChange={(e) => setEtc(e.target.value)} />
//             </div>
//
//             <div className="flex justify-end gap-2">
//               <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setIsFindModalOpen(false)}>
//                 취소하기
//               </button>
//               <button className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700" onClick={handleFindSubmit}>
//                 등록하기
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
