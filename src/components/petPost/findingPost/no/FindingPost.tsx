// import { Plus, Calendar as CalendarIcon } from "lucide-react";
// import FindLocationPicker from "@/components/navBar/findNcpMap.tsx";
// import { useEffect, useState } from "react";
// import { usePetContext } from "@/contexts/PetContext.tsx";
// import axios from "axios";
// import { backUrl } from "@/constants";
// import { format } from "date-fns";
// import { ko } from "date-fns/locale";

// // API 호출 함수 추가
// const writeFindPost = async (formData: FormData) => {
//   try {
//     const response = await axios.post(`${backUrl}/api/v1/finding/write`, formData, {
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
//   onOpenChange: (open: boolean) => void;
//   onSuccess?: () => void;
// }

// export const FindingFormPopup = ({ open, onOpenChange, onSuccess }: FindingFormPopupProps) => {
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
  
//   // 날짜 선택 관련 상태 추가
//   const [findDate, setFindDate] = useState<String>("");
//   const [calendarOpen, setCalendarOpen] = useState(false);
//   const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

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

//   // 달력 월 변경 핸들러
//   const changeMonth = (amount: number) => {
//     const newDate = new Date(currentMonth);
//     newDate.setMonth(newDate.getMonth() + amount);
//     setCurrentMonth(newDate);
//   };

//   // 년도 변경 핸들러
//   const changeYear = (amount: number) => {
//     const newDate = new Date(currentMonth);
//     newDate.setFullYear(newDate.getFullYear() + amount);
//     setCurrentMonth(newDate);
//   };

//   // 날짜 선택 핸들러
//   const handleDateSelect = (date: Date) => {
//     setFindDate(date.toISOString().slice(0, 19));
//     console.log(date.toISOString().slice(0, 19))
//     setCalendarOpen(false);
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
//         onOpenChange(false);
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
//   }, [open, onOpenChange]);

//   // 캘린더 외부 클릭 시 닫기
//   useEffect(() => {
//     if (!calendarOpen) return;

//     const handleOutsideClick = (e: MouseEvent) => {
//       const target = e.target as HTMLElement;
//       if (!target.closest('.calendar-container') && !target.closest('.date-picker-button')) {
//         setCalendarOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleOutsideClick);
//     return () => {
//       document.removeEventListener('mousedown', handleOutsideClick);
//     };
//   }, [calendarOpen]);

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

//     // 선택한 날짜를 ISO 형식으로 변환
    
//     // formData.append("findDate", findDate);

//     if (!location) {
//       formData.append("shelterId", "1");
//     }

//     try {
//       await writeFindPost(formData);

//       if (onSuccess) onSuccess();
//       await refreshPets();
//       onOpenChange(false);

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
//       setFindDate(new Date());
//       setCurrentMonth(new Date());
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

//   // 날짜 렌더링 함수
//   const renderCalendar = () => {
//     if (!calendarOpen) return null;

//     const year = currentMonth.getFullYear();
//     const month = currentMonth.getMonth();
    
//     // 현재 월의 첫째 날과 마지막 날
//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
    
//     // 첫째 날의 요일 (0: 일요일, 1: 월요일, ...)
//     const firstDayOfWeek = firstDay.getDay();
    
//     // 이전 달의 날짜들 (첫째 주 빈 칸)
//     const prevMonthDays = [];
//     const prevMonthLastDay = new Date(year, month, 0).getDate();
//     for (let i = firstDayOfWeek - 1; i >= 0; i--) {
//       prevMonthDays.push(prevMonthLastDay - i);
//     }
    
//     // 현재 달의 날짜들
//     const days = [];
//     for (let i = 1; i <= lastDay.getDate(); i++) {
//       days.push(i);
//     }
    
//     // 다음 달의 날짜들 (마지막 주 빈 칸)
//     const nextMonthDays = [];
//     const remainingCells = 42 - (prevMonthDays.length + days.length); // 6주 * 7일 = 42
//     for (let i = 1; i <= remainingCells; i++) {
//       nextMonthDays.push(i);
//     }
    
//     // 선택된 날짜
//     const selectedDay = findDate.getDate();
//     const selectedMonth = findDate.getMonth();
//     const selectedYear = findDate.getFullYear();
    
//     // 오늘 날짜
//     const today = new Date();
//     const todayDay = today.getDate();
//     const todayMonth = today.getMonth();
//     const todayYear = today.getFullYear();

//     return (
//       <div className="absolute mt-1 bg-white border rounded-md shadow-md z-10 calendar-container">
//         <div className="p-2 flex justify-between items-center border-b">
//           <div className="flex items-center">
//             <button 
//               className="p-1 hover:bg-gray-100 rounded-full mr-1"
//               onClick={() => changeYear(-1)}
//               title="이전 년도"
//             >
//               &lt;&lt;
//             </button>
//             <button 
//               className="p-1 hover:bg-gray-100 rounded-full"
//               onClick={() => changeMonth(-1)}
//               title="이전 달"
//             >
//               &lt;
//             </button>
//           </div>
//           <div>{format(currentMonth, 'yyyy년 MM월', { locale: ko })}</div>
//           <div className="flex items-center">
//             <button 
//               className="p-1 hover:bg-gray-100 rounded-full"
//               onClick={() => changeMonth(1)}
//               title="다음 달"
//             >
//               &gt;
//             </button>
//             <button 
//               className="p-1 hover:bg-gray-100 rounded-full ml-1"
//               onClick={() => changeYear(1)}
//               title="다음 년도"
//             >
//               &gt;&gt;
//             </button>
//           </div>
//         </div>
//         <div className="p-2">
//           <div className="grid grid-cols-7 text-center text-sm font-medium">
//             <div className="p-2 text-red-500">일</div>
//             <div className="p-2">월</div>
//             <div className="p-2">화</div>
//             <div className="p-2">수</div>
//             <div className="p-2">목</div>
//             <div className="p-2">금</div>
//             <div className="p-2 text-blue-500">토</div>
//           </div>
//           <div className="grid grid-cols-7 text-center text-sm">
//             {/* 이전 달 날짜 */}
//             {prevMonthDays.map((day, index) => (
//               <div 
//                 key={`prev-${index}`} 
//                 className="p-2 text-gray-400 cursor-pointer hover:bg-gray-100"
//                 onClick={() => {
//                   const newDate = new Date(year, month - 1, day);
//                   handleDateSelect(newDate);
//                 }}
//               >
//                 {day}
//               </div>
//             ))}
            
//             {/* 현재 달 날짜 */}
//             {days.map((day) => {
//               const isSelected = day === selectedDay && month === selectedMonth && year === selectedYear;
//               const isToday = day === todayDay && month === todayMonth && year === todayYear;
              
//               return (
//                 <div 
//                   key={`current-${day}`} 
//                   className={`p-2 cursor-pointer ${
//                     isSelected 
//                       ? 'bg-blue-500 text-white rounded-full' 
//                       : isToday 
//                         ? 'border border-blue-500 rounded-full' 
//                         : 'hover:bg-gray-100'
//                   }`}
//                   onClick={() => {
//                     const newDate = new Date(year, month, day);
//                     handleDateSelect(newDate);
//                   }}
//                 >
//                   {day}
//                 </div>
//               );
//             })}
            
//             {/* 다음 달 날짜 */}
//             {nextMonthDays.map((day, index) => (
//               <div 
//                 key={`next-${index}`} 
//                 className="p-2 text-gray-400 cursor-pointer hover:bg-gray-100"
//                 onClick={() => {
//                   const newDate = new Date(year, month + 1, day);
//                   handleDateSelect(newDate);
//                 }}
//               >
//                 {day}
//               </div>
//             ))}
//           </div>
//         </div>
//         <div className="p-2 border-t flex justify-center">
//           <button 
//             className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
//             onClick={() => {
//               const today = new Date();
//               setCurrentMonth(today);
//               setFindDate(today);
//               setCalendarOpen(false);
//             }}
//           >
//             오늘
//           </button>
//         </div>
//       </div>
//     );
//   };

//   // Modal이 열려있지 않으면 아무것도 렌더링하지 않음
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-50">
//       <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)}></div>

//       <div className="relative w-full max-w-[800px] bg-white rounded-lg shadow-lg p-6 z-50 max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">반려동물 발견 등록하기</h2>
//           <button onClick={() => onOpenChange(false)} className="text-gray-500 hover:text-gray-700">
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
//                 value={title}
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
//                 value={situation}
//               />
//             </div>

//             <div className="mb-4 flex justify-between">
//               <div className="mr-4 w-60">
//                 <label className="block font-medium mb-2">* 견종</label>
//                 <input className="border p-2 w-full bg-white mb-4" placeholder="견종" onChange={handleBreed} value={breed} />
//               </div>
//               <div className="mr-4 w-20">
//                 <label className="block font-medium mb-2 ">성별</label>
//                 <select className="border p-2 w-full bg-white" onChange={handleGender} value={gender}>
//                   <option value="0">미상</option>
//                   <option value="1">수컷</option>
//                   <option value="2">암컷</option>
//                 </select>
//               </div>
//             </div>
//             <div className="mb-4 flex justify-between">
//               <div className="mr-4 w-60">
//                 <label className="block font-medium mb-2">색상</label>
//                 <input className="border p-2 w-full bg-white mb-4" placeholder="색상" onChange={handleColor} value={color} />
//               </div>
//               <div className="mr-4 w-20">
//                 <label className="block font-medium mb-2 ">중성화</label>
//                 <select className="border p-2 w-full bg-white" onChange={handleNeutered} value={neutered}>
//                   <option value="0">미상</option>
//                   <option value="1">중성화 됌</option>
//                   <option value="2">중성화 안됌</option>
//                 </select>
//               </div>
//             </div>

//             <div className="mb-4 flex justify-between">
//               <div className="mr-4 w-60">
//                 <label className="block font-medium mb-2">이름</label>
//                 <input className="border p-2 w-full bg-white mb-4" placeholder="이름" onChange={handleName} value={name} />
//               </div>
//               <div className="w-20">
//                 <label className="block font-medium mb-2 ">나이</label>
//                 <input className="border p-2 w-full bg-white" placeholder="추정 나이" onChange={handleAge} value={age} />
//               </div>
//             </div>
//           </div>
//           <div>
//             <div className="mb-4">
//               <label className="block font-medium mb-2">* 발견 위치</label>
//               <FindLocationPicker onLocationSelect={handleLocationSelect} />
             
//             </div>
            
//             {/* 날짜 선택 컴포넌트 추가 */}
//             <div className="mb-4">
//               <label className="block font-medium mb-2">* 발견 날짜</label>
//               <div className="relative border">
//                 <button 
//                   className="date-picker-button flex items-center justify-between bg-white w-full border p-2 rounded"
//                   onClick={() => setCalendarOpen(!calendarOpen)}
//                   type="button"
//                 >
//                   <span>{format(findDate, 'yyyy-MM-dd', { locale: ko })}</span>
//                   <CalendarIcon className="h-4 w-4" />
//                 </button>
//                 {renderCalendar()}
//               </div>
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
//           <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
//             취소하기
//           </button>
//           <button
//             className={`px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
//             onClick={handleFindSubmit}
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? "등록 중..." : "등록하기"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };