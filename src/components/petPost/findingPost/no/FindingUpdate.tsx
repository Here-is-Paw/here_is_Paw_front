// import { Plus } from "lucide-react";
// import FindLocationPicker from "@/components/navBar/findNcpMap.tsx";
// import { useEffect, useState } from "react";
// import { usePetContext } from "@/contexts/PetContext.tsx";
// import axios from "axios";
// import { backUrl } from "@/constants";
// // import { MyPet, FindPet } from "@/types/mypet";
// import { FindingDetailData } from "@/types/finding.ts";

// type FindIdType = string | number;
// // API 호출 함수 추가
// const writeFindPost = async (formData: FormData, findingId: FindIdType) => {
//   try {
//     const response = await axios.put(`${backUrl}/api/v1/finding/${findingId}`, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//       withCredentials: true, // 쿠키(인증 정보) 포함
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Finding post API 오류:", error);
//     throw error;
//   }
// };

// interface FindingFormPopupProps {
//   open: boolean;
//   onFindOpenChange: (open: boolean) => void;
//   findId: number;
//   pet: FindingDetailData;
//   onSuccess?: () => void;
// }

// export const FindingUpdateFormPopup = ({ open, onFindOpenChange, findId, pet, onSuccess }: FindingFormPopupProps) => {
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [imageFile, setImageFile] = useState<File | null>(null);

//   const [breed, setBreed] = useState("");
//   const [geoX, setGeoX] = useState(0);
//   const [geoY, setGeoY] = useState(0);
//   const [location, setLocation] = useState("");
//   const [name, setName] = useState("");
//   const [color, setColor] = useState("");
//   const [etc, setEtc] = useState("");
//   const [situation, setSituation] = useState("");
//   const [title, setTitle] = useState("");
//   const [age, setAge] = useState(0);
//   const [gender, setGender] = useState(0);
//   const [neutered, setNeutered] = useState(0);
//   const { refreshPets } = usePetContext();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");

//   useEffect(() => {
//     setTitle(pet.title ?? "제목");
//     setSituation(pet.situation ?? "상황");
//     setBreed(pet.breed ?? "품종");
//     setLocation(pet.location ?? "위치");
//     setGeoX(pet.x ?? 0);
//     setGeoY(pet.y ?? 0);
//     setName(pet.name ?? "이름");
//     setColor(pet.color ?? "색상");
//     setEtc(pet.etc ?? "기타 정보");
//     setGender(pet.gender ?? 0);
//     setAge(pet.age ?? 0);
//     setNeutered(pet.neutered ?? 0);
// }, [pet]);


//   const handleBreed = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setBreed(e.target.value);
//   };

//   const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setName(e.target.value);
//   };

//   const handleEtc = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setEtc(e.target.value);
//   };

//   const handleColor = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setColor(e.target.value);
//   };

//   const handleSituation = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setSituation(e.target.value);
//   };

//   const handleTitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setTitle(e.target.value);
//   };

//   const handleGender = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setGender(parseInt(e.target.value));
//   };

//   const handleAge = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setAge(parseInt(e.target.value));
//   };

//   const handleNeutered = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setNeutered(parseInt(e.target.value));
//   };

//   const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setImageFile(file);

//       const imageUrl = URL.createObjectURL(file);
//       setImagePreview(imageUrl);
//     }
//   };

//   useEffect(() => {
//     const savedImage = localStorage.getItem("uploadedImage");
//     if (savedImage) {
//       setImagePreview(savedImage);
//     }
//   }, []);

//   // ESC 키 이벤트 핸들러 추가
//   useEffect(() => {
//     const handleEscKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") {
//         onFindOpenChange(false);
//       }
//     };

//     // 모달이 열려있을 때만 이벤트 리스너 추가
//     if (open) {
//       document.addEventListener("keydown", handleEscKey);
//     }

//     // 컴포넌트 언마운트 시 이벤트 리스너 제거
//     return () => {
//       document.removeEventListener("keydown", handleEscKey);
//     };
//   }, [open, onFindOpenChange]);

//   const handleLocationSelect = (location: { x: number; y: number; address: string }) => {
//     setGeoX(location.x);
//     setGeoY(location.y);
//     setLocation(location.address);

//     console.log("발견 위치:", location);
//   };

//   const handleRemoveImage = () => {
//     setImagePreview(null);
//     setImageFile(null);
//     localStorage.removeItem("uploadedImage");
//   };

//   const validateForm = () => {
//     if (!title) {
//       setErrorMessage("제목을 입력해주세요.");
//       return false;
//     }
//     if (!situation) {
//       setErrorMessage("발견 상황을 입력해주세요.");
//       return false;
//     }
//     if (!breed) {
//       setErrorMessage("견종을 입력해주세요.");
//       return false;
//     }
//     if (!location) {
//       setErrorMessage("위치를 선택해주세요.");
//       return false;
//     }
//     return true;
//   };

//   const handleFindSubmit = async () => {
    
//     if (!validateForm()) return;

//     setIsSubmitting(true);
//     setErrorMessage("");

//     const formData = new FormData();

//     // 필수 파일 체크
//     if (!imageFile) {
//       setErrorMessage("반려동물 사진을 등록해주세요.");
//       setIsSubmitting(false);
//       return;
//     }

//     formData.append("file", imageFile);
//     formData.append("title", title);
//     formData.append("situation", situation);
//     formData.append("breed", breed);
//     formData.append("location", location);
//     formData.append("x", geoX.toString());
//     formData.append("y", geoY.toString());
//     formData.append("name", name);
//     formData.append("color", color);
//     formData.append("etc", etc);
//     formData.append("gender", gender.toString());
//     formData.append("age", age.toString());
//     formData.append("neutered", neutered.toString());

//     // 현재 날짜를 ISO 형식으로 생성
//     const today = new Date();
//     const isoDate = today.toISOString().split("T")[0] + "T00:00:00";
//     formData.append("find_date", isoDate);

//     if (!location) {
//       formData.append("shelter_id", "1");
//     }

//     try {
//       await writeFindPost(formData, findId);

//       if (onSuccess) onSuccess();
//       await refreshPets();
//       onFindOpenChange(false);

//       // 성공 후 폼 초기화
//       setTitle("");
//       setSituation("");
//       setBreed("");
//       setLocation("");
//       setGeoX(0);
//       setGeoY(0);
//       setName("");
//       setColor("");
//       setEtc("");
//       setGender(0);
//       setAge(0);
//       setNeutered(0);
//       setImageFile(null);
//       setImagePreview(null);
//     } catch (error: any) {
//       console.error("등록 오류:", error);

//       // 서버에서 에러 메시지가 있다면 표시
//       if (error.response && error.response.data && error.response.data.message) {
//         setErrorMessage(error.response.data.message);
//       } else {
//         setErrorMessage("등록 중 오류가 발생했습니다. 다시 시도해주세요.");
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Modal이 열려있지 않으면 아무것도 렌더링하지 않음
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-50">
//       <div className="absolute inset-0 bg-black/50" onClick={() => onFindOpenChange(false)}></div>

//       <div className="relative w-full max-w-[800px] bg-white rounded-lg shadow-lg p-6 z-50 max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">반려동물 발견 등록하기</h2>
//           <button onClick={() => onFindOpenChange(false)} className="text-gray-500 hover:text-gray-700">
//             ✕
//           </button>
//         </div>

//         <p className="mb-4 text-gray-600">등록 게시글 미 연장시, 7일 후 자동 삭제 됩니다.</p>

//         {errorMessage && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">{errorMessage}</div>}

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[15px]">
//           <div>
//             <div className="mb-4 ">
//               <label className="block font-medium mb-2">* 제목</label>
//               <textarea
//                 className="border p-2 w-full bg-white resize-none"
//                 rows={1}
//                 placeholder="게시글의 제목을 입력해주세요."
//                 onChange={handleTitle}
//                 defaultValue={pet.title}
//               />
//             </div>

//             {imagePreview ? (
//               <div className="mb-4">
//                 <label className="block font-medium mb-2">* 반려동물 사진</label>
//                 <div className="mt-2 flex">
//                   <img src={imagePreview} alt="미리보기" className="w-60 h-60 object-cover rounded" />
//                   <div className="mt-[63%]">
//                     <button className="bg-red-500 h-4 w-4 flex items-center justify-center" onClick={handleRemoveImage}>
//                       <Plus className="text-white rotate-45 w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="mb-4">
//                 <label className="block font-medium mb-2">* 반려동물 사진</label>
//                 <input type="file" className="border p-2 w-full" onChange={handleImageUpload} />
//               </div>
//             )}

//             <div className="mb-4 ">
//               <label className="block font-medium mb-2 ">* 발견 상황</label>
//               <textarea
//                 className="border p-2 w-full bg-white resize-none"
//                 rows={2}
//                 placeholder="발견 당시 상황을 입력해주세요."
//                 onChange={handleSituation}
//                 defaultValue={pet.situation}
//               />
//             </div>

//             <div className="mb-4 flex justify-between">
//               <div className="mr-4 w-20">
//                 <label className="block font-medium mb-2 ">* 견종</label>
//                 <input className="border p-2 w-full bg-white" placeholder="견종" onChange={handleBreed} defaultValue={pet.breed} />
//               </div>
//               <div className="mr-4 w-20">
//                 <label className="block font-medium mb-2 ">색상</label>
//                 <input className="border p-2 w-full bg-white" placeholder="색상" onChange={handleColor} defaultValue={pet.color} />
//               </div>
//               <div className="w-20">
//                 <label className="block font-medium mb-2 ">이름</label>
//                 <input className="border p-2 w-full bg-white" placeholder="이름" onChange={handleName} defaultValue={pet.name} />
//               </div>
//             </div>
//             <div className="mb-4 flex justify-between">
//               <div className="mr-4 w-20">
//                 <label className="block font-medium mb-2 ">성별</label>
//                 <select className="border p-2 w-full bg-white" onChange={handleGender} defaultValue={pet.gender}>
//                   <option value="0">미상</option>
//                   <option value="1">수컷</option>
//                   <option value="2">암컷</option>
//                 </select>
//               </div>
//               <div className="mr-4 w-20">
//                 <label className="block font-medium mb-2 ">중성화</label>
//                 <select className="border p-2 w-full bg-white" onChange={handleNeutered} defaultValue={pet.neutered}>
//                   <option value="0">미상</option>
//                   <option value="1">중성화 됌</option>
//                   <option value="2">중성화 안됌</option>
//                 </select>
//               </div>
//               <div className="w-20">
//                 <label className="block font-medium mb-2 ">나이</label>
//                 <input className="border p-2 w-full bg-white" placeholder="추정 나이" onChange={handleAge} defaultValue={pet.age} />
//               </div>
//             </div>
//           </div>
//           <div>
//             <div className="mb-4">
//               <label className="block font-medium mb-2">* 발견 위치</label>
//               <FindLocationPicker onLocationSelect={handleLocationSelect} initialLocation={{x: pet.x, y: pet.y, location: pet.location}}/>
//               {/* {location && <div className="mt-2 text-sm text-gray-600">선택된 위치: {location}</div>} */}
//             </div>
//             <div className="mb-4 ">
//               <label className="block font-medium mb-2 ">특이 사항</label>
//               <textarea
//                 className="border p-2 w-full bg-white resize-none"
//                 rows={2}
//                 placeholder="특징을 설명해주세요."
//                 onChange={handleEtc}
//                 value={etc}
//               />
//             </div>
//           </div>
//         </div>
//         <div className="flex justify-end gap-2 mt-4">
//           <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => onFindOpenChange(false)} disabled={isSubmitting}>
//             취소하기
//           </button>
//           <button
//             className={`px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
//             onClick={handleFindSubmit}
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? "수정 중..." : "수정하기"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
