// import { Finding } from "@/types/Finding";
// import { useState, useEffect } from "react";
// import { createPortal } from "react-dom";
// import { backUrl } from "@/constants";
// import { Plus } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import { ChatModal } from "@/components/chat/ChatModal";
// import { chatEventBus } from "@/contexts/ChatContext";
// import axios from "axios";
// import GetFindLocationPicker from "./findedNcpMap";
// import { useFindDetail } from "@/hooks/useFindDetail";
// import { useFindUpdate } from "@/hooks/useFindUpdate";
// import { useFindDelete } from "@/hooks/useFindDelete";

// const DEFAULT_IMAGE_URL = "https://i.pinimg.com/736x/22/48/0e/22480e75030c2722a99858b14c0d6e02.jpg";

// const isKakaoDefaultProfile = (url: string) => {
//   return url && url.includes('kakaocdn.net') && url.includes('default_profile');
// };

// const getValidImageUrl = (imageUrl: string | undefined) => {
//   if (!imageUrl || imageUrl === 'profile' || isKakaoDefaultProfile(imageUrl)) {
//     return DEFAULT_IMAGE_URL;
//   }
//   return imageUrl;
// };

// interface PetCardProps {
//   pet: Finding;
// }

// export function FindPetCard({ pet }: PetCardProps) {
//   const { isLoggedIn } = useAuth();
//   const [member, setMember] = useState(null);

//   // findpost 모달
//   const [isFindDetailModalOpen, setIsFindDetailModalOpen] = useState(false);

//   // findpost에 담아야 할 정보
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [title, setTitle] = useState<string | "">("제목"); // findpost 제목
//   const [breed, setBreed] = useState("미상"); // findpost 견종
//   const [name, setName] = useState("미상"); // findpost 개 이름
//   const [color, setColor] = useState("미상"); // findpost 개 색상
//   const [situation, setSituation] = useState("발견 상황"); // findpost 발견 상황
//   const [etc, setEtc] = useState("특이 사항"); // findpost 특이 사항
//   const [gender, setGender] = useState(0); // findpost 성별
//   const [age, setAge] = useState(0); // findpost 개 나이
//   const [neutered, setNeutered] = useState(0); // findpost 개 중성화 여부
//   const [geoX, setGeoX] = useState(0); // X 좌표
//   const [geoY, setGeoY] = useState(0); // Y 좌표
//   const [location, setLocation] = useState(""); // 발견 장소

//   // fondpost hooks
//   const { updateFindPost } = useFindUpdate();
//   const { deleteFindPost } = useFindDelete();
//   const { findDetail, fetchFindDetail, updateFormFields } = useFindDetail({
//     setImagePreview,
//     setTitle,
//     setAge,
//     setBreed,
//     setColor,
//     setEtc,
//     setGender,
//     setSituation,
//     setName,
//     setNeutered,
//     setGeoX,
//     setGeoY,
//     setLocation
//   });

//   const [isChatModalOpen, setIsChatModalOpen] = useState(false);
//   const [currentChatRoomId, setCurrentChatRoomId] = useState<number | null>(null);

//   const [targetUserImageUrl, setTargetUserImageUrl] = useState<string | null>(null);
//   const [targetUserNickname, setTargetUserNickname] = useState<string | null>(null);

//   // input하면 발생하는 이벤트 ex)제목입력, 견종 입력, ...
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

//   const handleLocationSelect = (location: {
//     x: number;
//     y: number;
//     address: string;
//   }) => {
//     setGeoX(location.x);
//     setGeoY(location.y);
//     setLocation(location.address);

//   };

//   useEffect(() => {
//     const fetchUserInfo = async () => {
//       try {
//         const memberResponse = await axios.get(`${backUrl}/api/v1/members/me`, {
//           withCredentials: true,
//         });
//         setMember(memberResponse.data.data.id);
//       } catch (error) {
//         console.error("유저 정보 가져오기 실패:", error);
//       }
//     };

//     fetchUserInfo();
//   }, []);

//   // 파일 업로드 핸들러
//   const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       // 파일 객체 자체를 저장
//       setImageFile(file);

//       // 미리보기용 URL 생성 (필요한 경우)
//       const imageUrl = URL.createObjectURL(file);
//       setImagePreview(imageUrl);
//     };
//   };

//   // 이미지 삭제 핸들러
//   const handleRemoveImage = () => {
//     setImagePreview(null);
//     setImageFile(null);

//     localStorage.removeItem("uploadedImage");
//   };

//   // findpost 상세보기
//   const openDetailModal = async (postId: number) => {
//     await fetchFindDetail(postId);
//     // console.log("Updated findDetail:", findDetail);
//     updateFormFields();

//   };

//   useEffect(() => {
//     if (findDetail) {
//       console.log("Uploaded findDetail:", findDetail);
//       setIsFindDetailModalOpen(true);
//     }
//   }, [findDetail]);

//   // findpost 수정
//   const handleFindUpdateSubmit = async (postId: number) => {
//     const formData = new FormData();
//     if (imageFile) {
//       formData.append("file", imageFile);
//     }
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
//     formData.append("find_date", "2025-02-20T00:00:00");
//     formData.append("shelter_id", "1");

//     await updateFindPost(postId, formData);
//   };

//   // findpost 삭제
//   const handleFindDeleteSubmit = async (postId: number) => {
//     if (confirm("정말 삭제하시겠습니까?")) {
//       deleteFindPost(postId);
//     }
//   };

//   return (
//     <>
//       <div
//         className="bg-white rounded-lg shadow-md overflow-hidden"
//         onClick={() => {
//           openDetailModal(pet.id);
//         }}
//       >
//         <img src={pet.path_url ? pet.path_url : DEFAULT_IMAGE_URL} alt={`실종동물`} className="w-full h-20 object-cover" />
//         <div className="p-3">
//           <div className="font-medium mb-3">{pet.breed}</div>
//           <div className="space-y-1">
//             <div className="text-xs flex gap-4">
//               <span className="text-gray-600 w-12">특징</span>
//               <span className="flex-1 truncate">{pet.etc}</span>
//             </div>
//             <div className="text-xs flex gap-4">
//               <span className="text-gray-600 w-12">발견장소</span>
//               <span className="flex-1 truncate">{pet.location}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {isFindDetailModalOpen &&
//         createPortal(
//           <div className="fixed inset-0 flex items-center justify-center z-50">
//             {/* 반투명 배경 */}
//             <div
//               className="absolute inset-0 bg-black/50"
//               onClick={() => setIsFindDetailModalOpen(false)} // 배경 클릭시 모달 닫기
//             ></div>

//             {/* findDetail 매핑은 모달 컨테이너 안에서 수행 */}
//             {findDetail ? (
//               findDetail.member_id === member ? (
//                 <div className="relative w-full max-w-[800px] bg-white rounded-lg shadow-lg p-6 z-50">
//                   {/* 모달 헤더 */}
//                   <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-xl font-semibold">반려동물 발견 등록하기</h2>
//                   </div>

//                   {/* 모달 내용(이미지, 폼 등) */}
//                   <p className="mb-4 text-gray-600">등록 게시글 미 연장시, 7일 후 자동 삭제 됩니다.</p>

//                   <div className="space-between text-[15px]">
//                     {/* 예: 사진 업로드, 위치, 기타 폼 */}
//                     <div className="w-80">
//                       <div className="mb-4 ">
//                         <label className="block font-medium mb-2">* 제목</label>
//                         <textarea
//                           className="border p-2 w-full bg-white resize-none"
//                           rows={1}
//                           placeholder="게시글의 제목을 입력해주세요."
//                           onChange={handleTitle}
//                           defaultValue={findDetail.title}
//                         />
//                       </div>

//                       {imagePreview ? (
//                         <div className="mb-4">
//                           <label className="block font-medium mb-2">반려동물 사진</label>
//                           <div className="mt-2 flex">
//                             <img src={imagePreview} alt="미리보기" className="w-60 h-60 object-cover rounded" />
//                             <div className="mt-[77%]">
//                               <button className=" bg-red-500 h-4 w-4 " onClick={handleRemoveImage}>
//                                 <Plus className="text-white rotate-45 absolute top-[54.7%] left-[34%]" />
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="mb-4">
//                           <label className="block font-medium mb-2">반려동물 사진</label>
//                           <input type="file" className="border p-2 w-full" onChange={handleImageUpload} />
//                         </div>
//                       )}

//                       <div className="mb-4 ">
//                         <label className="block font-medium mb-2 ">* 발견 상황</label>
//                         <textarea
//                           className="border p-2 w-full bg-white resize-none"
//                           rows={2}
//                           placeholder="발견 당시 상황을 입력해주세요."
//                           onChange={handleSituation}
//                           defaultValue={findDetail.situation}
//                         />
//                       </div>

//                       <div className="mb-4 flex justify-between">
//                         <div className="mr-4 w-20">
//                           <label className="block font-medium mb-2 ">견종</label>
//                           <input className="border p-2 w-full bg-white" placeholder="견종" defaultValue={findDetail.breed} onChange={handleBreed} />
//                         </div>
//                         <div className="mr-4 w-20">
//                           <label className="block font-medium mb-2 ">색상</label>
//                           <input className="border p-2 w-full bg-white" placeholder="색상" defaultValue={findDetail.color} onChange={handleColor} />
//                         </div>
//                         <div className="w-20">
//                           <label className="block font-medium mb-2 ">이름</label>
//                           <input className="border p-2 w-full bg-white" placeholder="이름" defaultValue={findDetail.name} onChange={handleName} />
//                         </div>
//                       </div>
//                       <div className="mb-4 flex justify-between">
//                         <div className="mr-4 w-20">
//                           <label className="block font-medium mb-2 ">성별</label>
//                           {/* <input className="border p-2 w-full bg-white" placeholder="성별" onChange={handleGender} /> */}
//                           <select className="border p-2 w-full bg-white" onChange={handleGender}>
//                             <option value="0">미상</option>
//                             <option value="1">수컷</option>
//                             <option value="2">암컷</option>
//                           </select>
//                         </div>
//                         <div className="mr-4 w-20">
//                           <label className="block font-medium mb-2 ">중성화</label>
//                           {/* <input className="border p-2 w-full bg-white" placeholder="중성화 여부" onChange={handleNeutered} /> */}
//                           <select className="border p-2 w-full bg-white" onChange={handleNeutered}>
//                             <option value="0">미상</option>
//                             <option value="1">중성화 됌</option>
//                             <option value="2">중성화 안됌</option>
//                           </select>
//                         </div>
//                         <div className="w-20">
//                           <label className="block font-medium mb-2 ">나이</label>
//                           <input className="border p-2 w-full bg-white" placeholder="나이" defaultValue={findDetail.age} onChange={handleAge} />
//                         </div>
//                       </div>
//                     </div>
//                     <div className="w-80">
//                       {/* <div className="w-20 h-20 bg-pink">지도 들어갈 곳</div> */}
//                       <GetFindLocationPicker onLocationSelect={handleLocationSelect} initialLocation={{ "x": findDetail.x, "y": findDetail.y, "location":findDetail.location }}/>
//                       <div className="mb-4 ">
//                         <label className="block font-medium mb-2 ">특이 사항</label>
//                         <textarea
//                           className="border p-2 w-full bg-white resize-none"
//                           rows={2}
//                           placeholder="특이사항"
//                           defaultValue={findDetail.etc}
//                           onChange={handleEtc}
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex justify-end gap-2 h-6">
//                     <button
//                       className="px-4 py-0 rounded bg-green-600 text-white hover:bg-green-700"
//                       onClick={() => {
//                         handleFindUpdateSubmit(pet.id);
//                         setIsFindDetailModalOpen(false);
//                       }}
//                     >
//                       수정하기
//                     </button>
//                     <button
//                       className="px-4 py-0 rounded bg-red-600 text-white hover:bg-green-700"
//                       onClick={() => {
//                         handleFindDeleteSubmit(pet.id);
//                         setIsFindDetailModalOpen(false);
//                       }}
//                     >
//                       삭제하기
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="relative w-full max-w-[800px] bg-white rounded-lg shadow-lg p-6 z-50">
//                   {/* 모달 헤더 */}
//                   <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-xl font-semibold">반려동물 발견</h2>
//                   </div>

//                   {/* 모달 내용(이미지, 폼 등) */}
//                   <p className="mb-4 text-gray-600">등록 게시글 미 연장시, 7일 후 자동 삭제 됩니다.</p>

//                   <div className="space-between text-[15px]">
//                     {/* 예: 사진 업로드, 위치, 기타 폼 */}
//                     <div className="w-80">
//                       <div className="mb-4 ">
//                         <label className="block font-medium mb-2">* 제목</label>
//                         <div className="w-full bg-white text-gray-500 text-gray-500">{findDetail.title}</div>
//                       </div>

//                       <div className="mb-4">
//                         <label className="block font-medium mb-2">반려동물 사진</label>
//                         <div className="mt-2 flex">
//                           <img src={findDetail.path_url || DEFAULT_IMAGE_URL} alt="반려동물 사진" className="w-60 h-60 object-cover rounded" />
//                         </div>
//                       </div>

//                       <div className="mb-4 ">
//                         <label className="block font-medium mb-2 ">* 발견 상황</label>
//                         <div className="w-full bg-white text-gray-500">{findDetail.situation}</div>
//                       </div>

//                       <div className="mb-4 flex justify-between">
//                         <div className="mr-4 w-20">
//                           <label className="block font-medium mb-2 ">견종</label>
//                           <div className="w-full bg-white text-gray-500">{findDetail.breed}</div>
//                         </div>
//                         <div className="mr-4 w-20">
//                           <label className="block font-medium mb-2 ">색상</label>
//                           <div className="w-full bg-white text-gray-500">{findDetail.color}</div>
//                         </div>
//                         <div className="w-20">
//                           <label className="block font-medium mb-2 ">이름</label>
//                           <div className="w-full bg-white text-gray-500">{findDetail.name}</div>
//                         </div>
//                       </div>
//                       <div className="mb-4 flex justify-between">
//                         <div className="mr-4 w-20">
//                           <label className="block font-medium mb-2 ">성별</label>
//                           <div className="w-full bg-white text-gray-500">{findDetail.gender}</div>
//                         </div>
//                         <div className="mr-4 w-20">
//                           <label className="block font-medium mb-2 ">중성화</label>
//                           <div className="w-full bg-white text-gray-500">{findDetail.neutered ? "했음" : "안함"}</div>
//                         </div>
//                         <div className="w-20">
//                           <label className="block font-medium mb-2 ">나이</label>
//                           <div className="w-full bg-white text-gray-500">{findDetail.age}</div>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="w-80">
//                     <GetFindLocationPicker onLocationSelect={handleLocationSelect} initialLocation={{ "x": findDetail.x, "y": findDetail.y, "location":findDetail.location }}/>
//                       <div className="mb-4 ">
//                         <label className="block font-medium mb-2 ">특이 사항</label>
//                         <div className="w-full bg-white text-gray-500">{findDetail.etc}</div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex justify-end gap-2 h-6">
//                     <button
//                       className="px-4 py-0 rounded bg-gray-200 hover:bg-gray-300"
//                       onClick={async (e) => {
//                         e.stopPropagation();

//                         if (!isLoggedIn) {
//                           alert("로그인이 필요한 서비스입니다.");
//                           window.location.href = "/login"; // 로그인 페이지로 이동
//                           return;
//                         }

//                         try {
//                           const response = await axios.post(`${backUrl}/api/v1/chat/rooms`,
//                             { targetUserId: findDetail.member_id },
//                             { withCredentials: true }
//                           );
//                           console.log("채팅방 생성/조회 응답:", response.data);
//                           // 생성된 채팅방 ID 확인
//                           console.log("생성된 채팅방 ID:", response.data.data.id);

//                           // 타켓 유저 프로필 사진 처리
//                           const validImageUrl = getValidImageUrl(response.data.data.targetUserImageUrl);
//                           setTargetUserImageUrl(validImageUrl);

//                           // 타켓 유저 닉네임
//                           setTargetUserNickname(response.data.data.targetUserNickname);

//                           const chatRoomId = response.data.data.id;
//                           setCurrentChatRoomId(chatRoomId);

//                           // 중요: 채팅방 데이터 메시지 배열 초기화 확인
//                           if (!response.data.data.chatMessages) {
//                             console.log("채팅 메시지 배열 초기화");
//                             response.data.data.chatMessages = [];
//                           }

//                           // 채팅방 목록에 새 채팅방 추가 이벤트 발행
//                           chatEventBus.emitAddChatRoom({
//                             id: chatRoomId,
//                             chatUserNickname: response.data.data.chatUserNickname,
//                             chatUserImageUrl: getValidImageUrl(response.data.data.chatUserImageUrl),
//                             chatUserId: response.data.data.chatUserId,
//                             targetUserNickname: response.data.data.targetUserNickname,
//                             targetUserImageUrl: validImageUrl,
//                             targetUserId: response.data.data.targetUserId,
//                             chatMessages: [],
//                             modifiedDate: new Date().toISOString()
//                           });

//                           // 채팅 모달 표시
//                           setIsChatModalOpen(true);
//                           setIsFindDetailModalOpen(false);

//                           // 채팅방 목록 갱신 이벤트 발행 (기존 코드)
//                           chatEventBus.emitRefreshChatRooms();
//                           console.log("채팅방 목록 갱신 이벤트 발행됨");

//                         } catch (err: any) {
//                           console.error("채팅방 생성 오류:", err);

//                           // 이미 존재하는 채팅방인 경우 (HTTP 409 Conflict)
//                           if (err.response && err.response.status === 409) {
//                             console.log("이미 존재하는 채팅방:", err.response.data);

//                             // 이미 존재하는 채팅방 데이터가 있는 경우
//                             if (err.response.data && err.response.data.data && err.response.data.data.id) {
//                               const existingChatRoom = err.response.data.data;
//                               const chatRoomId = existingChatRoom.id;

//                               // 기존 채팅방 정보 활용하여 채팅방 열기
//                               const validImageUrl = getValidImageUrl(existingChatRoom.targetUserImageUrl);
//                               setTargetUserImageUrl(validImageUrl);
//                               setTargetUserNickname(existingChatRoom.targetUserNickname);
//                               setCurrentChatRoomId(chatRoomId);

//                               // 중요: 채팅방 데이터 메시지 배열 초기화 확인
//                               if (!existingChatRoom.chatMessages) {
//                                 console.log("기존 채팅방 메시지 배열 초기화");
//                                 existingChatRoom.chatMessages = [];
//                               }

//                               // 채팅방 목록에 추가
//                               chatEventBus.emitAddChatRoom({
//                                 id: chatRoomId,
//                                 chatUserNickname: existingChatRoom.chatUserNickname || "사용자",
//                                 chatUserImageUrl: getValidImageUrl(existingChatRoom.chatUserImageUrl),
//                                 chatUserId: existingChatRoom.chatUserId,
//                                 targetUserNickname: existingChatRoom.targetUserNickname || "상대방",
//                                 targetUserImageUrl: validImageUrl,
//                                 targetUserId: existingChatRoom.targetUserId,
//                                 chatMessages: existingChatRoom.chatMessages || [],
//                                 modifiedDate: existingChatRoom.modifiedDate || new Date().toISOString()
//                               });

//                               setIsChatModalOpen(true);
//                               setIsFindDetailModalOpen(false);

//                               // 채팅방 목록 갱신
//                               chatEventBus.emitRefreshChatRooms();
//                               return;
//                             }
//                           }

//                           // 오류 메시지 구성
//                           let errorMessage = "채팅방을 생성하는 중 오류가 발생했습니다.";

//                           if (err.response) {
//                             if (err.response.status === 400) {
//                               errorMessage = "잘못된 요청입니다. 입력한 정보를 확인해주세요.";
//                             } else if (err.response.status === 401 || err.response.status === 403) {
//                               errorMessage = "로그인이 필요하거나 권한이 없습니다.";
//                               window.location.href = "/login";
//                               return;
//                             } else if (err.response.status === 500) {
//                               errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
//                             }

//                             // 서버 응답에 메시지가 있으면 사용
//                             if (err.response.data && err.response.data.message) {
//                               errorMessage = err.response.data.message;
//                             }
//                           }

//                           alert(errorMessage);
//                         }
//                       }}
//                     >
//                       연락하기
//                     </button>
//                     <button
//                       className="px-4 py-0 rounded bg-green-600 text-white hover:bg-green-700"
//                       onClick={() => {
//                         // 등록 처리 로직
//                         setIsFindDetailModalOpen(false);
//                       }}
//                     >
//                       닫기
//                     </button>
//                   </div>
//                 </div>
//               )
//             ) : (
//               <div className="relative w-full max-w-[800px] bg-white rounded-lg shadow-lg p-6 z-50">
//                 <p className="text-center py-4">데이터를 불러오는 중입니다...</p>
//               </div>
//             )}
//           </div>,
//           document.body
//         )}
//       {/* 채팅 모달 컴포넌트 사용 */}
//       <ChatModal
//         isOpen={isChatModalOpen}
//         onClose={() => setIsChatModalOpen(false)}
//         targetUserImageUrl={targetUserImageUrl}
//         targetUserNickname={targetUserNickname}
//         defaultImageUrl={DEFAULT_IMAGE_URL}
//         chatRoomId={currentChatRoomId}
//       />
//     </>
//   );
// }
