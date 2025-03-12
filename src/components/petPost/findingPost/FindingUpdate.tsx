import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogDescription, DialogTitle } from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import axios from "axios";
import { backUrl, aiUrl } from "@/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { cn } from "@/lib/utils.ts";
import { format } from "date-fns";
import { FindingDetailFormData } from "@/types/finding";
import { Calendar } from "@/components/ui/calendar.tsx";
import { CalendarIcon } from "lucide-react";
import LocationPicker from "@/components/location/locationPickerTest.tsx";
import useGeolocation from "@/hooks/useGeolocation.ts";
import { ko } from "date-fns/locale";
import { usePetContext } from "@/contexts/PetContext.tsx";
import { FindingDetailData } from "@/types/finding.ts";
import { useFileUpload } from "@/hooks/useFileUpload";
import { ToastAlert } from "@/components/alert/ToastAlert.tsx";

interface FindingUpdateFormPopup {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  findId: number;
  pet: FindingDetailData;
  onSuccess?: () => void;
}

export const FindingUpdateFormPopup = ({ open, onOpenChange, findId, pet, onSuccess }: FindingUpdateFormPopup) => {
  const defaultValues: FindingDetailFormData = {
    id: pet.id,
    name: pet.name,
    breed: pet.breed,
    x: pet.x,
    y: pet.y,
    location: pet.location,
    detailAddr: pet.detailAddr,
    color: pet.color,
    serialNumber: pet.serialNumber,
    gender: pet.gender,
    neutered: pet.neutered,
    age: pet.age,
    findDate: pet.findDate,
    etc: pet.etc,
    file: pet.pathUrl,
    pathUrl: pet.pathUrl,
    memberId: pet.memberId,
    nickname: "",
    title: pet.title,
    situation: pet.situation,
    shelterId: pet.shelterId,
  };

  useEffect(() => {
    form.setValue("id", pet.id);
    form.setValue("name", pet.name);
    form.setValue("breed", pet.breed);
    form.setValue("x", pet.x);
    form.setValue("y", pet.y);
    form.setValue("location", pet.location);
    form.setValue("detailAddr", pet.detailAddr);
    form.setValue("color", pet.color);
    form.setValue("serialNumber", pet.serialNumber);
    form.setValue("gender", pet.gender);
    form.setValue("neutered", pet.neutered);
    form.setValue("age", pet.age);
    form.setValue("findDate", pet.findDate);
    form.setValue("etc", pet.etc);
    form.setValue("file", pet.pathUrl);
    form.setValue("memberId", pet.memberId);
    form.setValue("nickname", pet.nickname);
    form.setValue("title", pet.title);
    form.setValue("situation", pet.situation);
    form.setValue("shelterId", pet.shelterId);
    setTimeout(() => {
      // setImagePreview(pet.pathUrl);
      console.log(pet.detailAddr)
    }, 100);
  }, []);

  const form = useForm<FindingDetailFormData>({
    defaultValues,
  });
  const location = useGeolocation();
  const [locationInfo, setLocationInfo] = useState({
    x: location.coordinates.lat,
    y: location.coordinates.lng,
    address: "서울시 용산구",
  });
  const [date, setDate] = React.useState<Date>();

  // const [imagePreview, setImagePreview] = useState<string | null>(pet.pathUrl);
  // const [file, setFile] = useState<File | string>("");
  const [calendarIsOpen, setCalendarIsOpen] = useState(false);
  // const [fileUrl, setFileUrl] = useState<string | "">(pet.pathUrl);
  // const [gender, setGender] = useState("");
  // const [neutered, setNeutered] = useState("");

  const {
    file,
    imagePreview,
    isAnalyzing,
    hasExistingImage,
    handleFileChange,
    resetFileUpload,
    removeImage
  } = useFileUpload({
    aiUrl,
    useAnalysis: true, // AI 분석 사용
    initialImageUrl: pet.pathUrl || null,
    onFileChangeCallback: (selectedFile) => {
      if (selectedFile) {
        form.setValue("file", selectedFile);
      }
    }
  });

  // Toast 알림 상태
  const [toast, setToast] = useState({
    open: false,
    type: "success" as "success" | "error" | "warning",
    title: "",
    message: "",
  });

  const showToast = (type: "success" | "error" | "warning", title: string, message: string) => {
    setToast({
      open: true,
      type,
      title,
      message,
    });
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const selectedFile = e.target.files?.[0]; // 첫 번째 파일만 가져오기
  //
  //   if (selectedFile) {
  //     setFile(selectedFile);
  //     setImagePreview(URL.createObjectURL(selectedFile)); // 이미지 미리보기 생성
  //   } else {
  //     setFileUrl(pet.pathUrl);
  //     setImagePreview(fileUrl);
  //   }
  // };

  const { refreshPets } = usePetContext();

  // 위치 정보가 로드되면 초기 geo 값 설정
  useEffect(() => {
    if (location.loaded && !location.error) {
      // geo 필드 업데이트 (JSON 문자열로 저장)
      form.setValue("x", location.coordinates.lng);
      form.setValue("y", location.coordinates.lat);
    }
  }, [location, form]);

  // 기존 코드는 그대로 유지...

  // 추가 상세 주소 입력을 위한 상태 추가
  // const [additionalAddressDetails, setAdditionalAddressDetails] = useState("");

  // 위치 선택 핸들러
  const handleLocationSelect = (location: { x: number; y: number; address: string }) => {
    setLocationInfo(location);
    // geo 필드 업데이트 (JSON 문자열로 저장)
    form.setValue("x", location.x);
    form.setValue("y", location.y);
    // location 필드 업데이트 (주소 문자열로 저장)
    form.setValue("location", location.address);
  };

  // 추가 상세 주소 변경 핸들러
  // const handleAdditionalAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setAdditionalAddressDetails(e.target.value);

  //   // 지도에서 선택한 주소와 사용자가 입력한 상세 주소 결합
  //   const combinedAddress = locationInfo.address ? `${locationInfo.address} ${e.target.value}`.trim() : e.target.value;

  //   form.setValue("location", combinedAddress);
  // };

  // 팝업이 닫힐 때 폼 초기화
  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
      resetFileUpload();
      // setFile("");
      // setImagePreview(null);
      setLocationInfo({
        x: location.coordinates.lng,
        y: location.coordinates.lat,
        address: "서울시 용산구",
      });
      // setAdditionalAddressDetails("");

      // 날짜 초기화
      setDate(undefined);
      // 혹은 오늘 날짜로 설정하고 싶다면: setDate(new Date());

      // form의 lostDate 필드도 초기화
      form.setValue("findDate", "");
    } else if (location.loaded && !location.error) {
      // 🔥 모달이 열릴 때 현재 위치를 다시 설정
      const currentGeo = {
        x: location.coordinates.lng,
        y: location.coordinates.lat,
      };

      setLocationInfo({
        ...currentGeo,
        address: locationInfo.address || "현재 위치",
      });

      form.setValue("x", currentGeo.x);
      form.setValue("y", currentGeo.y);
    }
  }, [open, location, form]);

  // 팝업 닫기 핸들러
  const handleClose = () => {
    form.reset(defaultValues);
    resetFileUpload();
    // setFile("");
    // setImagePreview(null);
    onOpenChange(false);

    // 날짜 초기화
    setDate(undefined);

    // 🔥 모달이 열릴 때 현재 위치를 다시 설정
    const currentGeo = {
      x: location.coordinates.lng,
      y: location.coordinates.lat,
    };

    setLocationInfo({
      ...currentGeo,
      address: locationInfo.address || "현재 위치",
    });
  };

  const handleSubmit = async (data: FindingDetailFormData) => {
    const formData = new FormData();
    if (pet.findDate) {
      formData.append("findDate", pet.findDate);
    }

    try {
      formData.append("name", data.name);
      formData.append("breed", data.breed);

      // geo 좌표 정보 추가 - 더 이상 임의 값이 아닌 실제 좌표
      if (locationInfo.x && locationInfo.y) {
        formData.append("x", locationInfo.x.toString());
        formData.append("y", locationInfo.y.toString());
      } else {
        showToast("warning", "발견 위치 선택은 필수입니다.", "발견 위치를 지도에서 선택해주세요.");
        return;
      }

      // 지도 주소와 상세 주소를 결합
      const combinedAddress = locationInfo.address ? `${locationInfo.address}`.trim() : data.location;

      formData.append("location", combinedAddress);
      formData.append("detailAddr", data.detailAddr);
      formData.append("color", data.color || "");
      formData.append("serialNumber", data.serialNumber || "");
      formData.append("gender", data.gender?.toString() || "0");
      formData.append("neutered", data.neutered?.toString() || "0");
      formData.append("age", data.age?.toString() || "0");
      formData.append("findDate", data.findDate ? data.findDate : pet.findDate);
      formData.append("etc", data.etc || "");

      if (file) {
        formData.append("file", file);
      } else {
        formData.append("pathUrl", pet.pathUrl);
      }

      await axios.put(`${backUrl}/api/v1/finding/${findId}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("success", "발견 신고 수정 완료", "발견 신고가 성공적으로 업데이트 되었습니다.");

      form.reset(defaultValues);
      resetFileUpload();
      // setImagePreview(null);
      // setFile("");

      await refreshPets();

      onOpenChange(false);

      // 🔥 모달이 열릴 때 현재 위치를 다시 설정
      const currentGeo = {
        x: location.coordinates.lng,
        y: location.coordinates.lat,
      };

      setLocationInfo({
        ...currentGeo,
        address: locationInfo.address || "현재 위치",
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("발견신고 등록 오류:", error);
      // alert("발견신고 등록에 실패했습니다");
      showToast("error", "발견 신고 수정 실패", "발견신고 수정에 실패했습니다.");
    }
  };

  /**
   * 이름, 품종, 유기견 이미지, 지역, 좌표
   * 색상, 동물 등록 번호, 성별, 중성화 유무, 나이, 발견 날짜, 기타(특징)
   */

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          // 팝업이 닫힐 때 폼 초기화
          form.reset(defaultValues);
          setLocationInfo({
            x: location.coordinates.lng,
            y: location.coordinates.lat,
            address: "서울시 용산구",
          });
          // setAdditionalAddressDetails("");
        }
        onOpenChange(newOpen);
      }}
    >
      {/* Toast 알림 */}
      <ToastAlert
            open={toast.open}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={3000}
            onClose={() => setToast(prev => ({ ...prev, open: false }))}
        />
      <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-4xl w-[500px] h-5/6 py-6 px-0 bg-white">
        <DialogHeader className="space-y-2 text-center px-6">
          <DialogTitle className="text-2xl font-bold text-primary">반려동물 발견 신고</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">반려동물 정보를 입력해주세요</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-6">
          <Form {...form}>
            <form id="missing" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-4">
                  {/* 필수 입력 필드 */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이름</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="반려동물 이름" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="breed"
                    rules={{ required: "품종은 필수입니다" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>품종 *</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="품종" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 선택 입력 필드 */}
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>색상</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="털 색상" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>등록번호</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="마이크로칩 등록번호" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>성별</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(parseInt(value));
                            }}
                            defaultValue={pet.gender.toString()}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="성별 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">선택 안함</SelectItem>
                              <SelectItem value="1">수컷</SelectItem>
                              <SelectItem value="2">암컷</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>나이</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="나이" min={0} max={100} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* 파일 업로드 필드 수정 - useFileUpload 훅 사용 */}
                  <FormField
                      control={form.control}
                      name="file"
                      rules={{
                        required: hasExistingImage ? false : "사진은 필수입니다"
                      }}
                      render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel>반려동물 사진 *</FormLabel>
                              {isAnalyzing && (
                                  <div className="flex items-center gap-2 text-green-600 text-sm">
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                      <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                      />
                                      <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      />
                                    </svg>
                                    <span>이미지 분석 중...</span>
                                  </div>
                              )}
                            </div>
                            <FormControl>
                              <Input
                                  type="file"
                                  id="file01"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={handleFileChange}
                                  disabled={isAnalyzing}
                              />
                            </FormControl>

                            {/* 미리보기 (이미지 선택 시만 표시) */}
                            <div className="relative">
                              <label
                                  htmlFor="file01"
                                  className="w-full h-40 rounded-lg border border-dotted m-auto flex justify-center items-center break-all hover:bg-slate-50 cursor-pointer transition-colors"
                              >
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="미리보기"
                                        className="w-full h-full object-contain m-auto"
                                    />
                                ) : (
                                    <span className="text-sm text-muted-foreground p-2">
                                반려견 사진을 첨부해주세요.
                              </span>
                                )}
                              </label>

                              {imagePreview && (
                                  <button
                                      type="button"
                                      onClick={removeImage}
                                      disabled={isAnalyzing}
                                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                                  >
                                    ✕
                                  </button>
                              )}
                            </div>

                            {hasExistingImage && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  * 이미 등록된 사진이 있습니다. 새 사진을 선택하지 않으면 기존 사진이 사용됩니다.
                                </p>
                            )}
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                  {/*<FormField*/}
                  {/*  control={form.control}*/}
                  {/*  name="file"*/}
                  {/*  rules={{ required: "사진은 필수입니다" }}*/}
                  {/*  render={({ field }) => (*/}
                  {/*    <FormItem>*/}
                  {/*      <FormLabel>반려동물 사진 *</FormLabel>*/}
                  {/*      <FormControl>*/}
                  {/*        <Input*/}
                  {/*          type="file"*/}
                  {/*          id="file01"*/}
                  {/*          accept="image/*"*/}
                  {/*          className="sr-only"*/}
                  {/*          onChange={(e) => {*/}
                  {/*            handleFileChange(e);*/}
                  {/*            field.onChange(e.target.files?.[0]);*/}
                  {/*          }}*/}
                  {/*        />*/}
                  {/*      </FormControl>*/}

                  {/*      /!* 미리보기 (이미지 선택 시만 표시) *!/*/}
                  {/*      <label*/}
                  {/*        htmlFor="file01"*/}
                  {/*        className="w-full h-40 rounded-lg border border-dotted m-auto flex justify-center items-center break-all hover:bg-slate-50 cursor-pointer transition-colors"*/}
                  {/*      >*/}
                  {/*        {imagePreview ? (*/}
                  {/*          <img src={imagePreview} alt="미리보기" className="w-full h-full object-contain m-auto" />*/}
                  {/*        ) : (*/}
                  {/*          <span className="text-sm text-muted-foreground p-2">반려견 사진을 첨부해주세요.</span>*/}
                  {/*        )}*/}
                  {/*      </label>*/}
                  {/*    </FormItem>*/}
                  {/*  )}*/}
                  {/*/>*/}

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="findDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>발견 날짜 *</FormLabel>
                          <FormControl>
                            <Popover open={calendarIsOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                                  onClick={() => setCalendarIsOpen((open) => !open)}
                                >
                                  <CalendarIcon />
                                  {
                                    date
                                      ? format(date, "yyyy-MM-dd") // date가 있다면 날짜 포맷 적용
                                      : format(new Date(pet.findDate), "yyyy-MM-dd") // pet.findDate를 Date 객체로 변환 후 포맷 적용
                                  }
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  className="min-h-80"
                                  mode="single"
                                  captionLayout="dropdown"
                                  locale={ko}
                                  selected={date}
                                  onDayClick={() => {
                                    setCalendarIsOpen(false);
                                  }}
                                  onSelect={(newDate) => {
                                    setDate(newDate);
                                    if (newDate) {
                                      // 선택한 날짜의 23:59:59로 시간 설정
                                      const dateWith2359 = new Date(newDate);
                                      dateWith2359.setHours(23, 59, 59);

                                      // ISO 문자열로 변환하되 타임존 오프셋 고려
                                      const isoString = dateWith2359.toISOString().split("Z")[0];
                                      field.onChange(isoString);
                                    }
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="neutered"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>중성화 유무</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(parseInt(value));
                            }}
                            defaultValue={pet.neutered.toString()}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="중성화 유무 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">선택 안함</SelectItem>
                              <SelectItem value="1">유</SelectItem>
                              <SelectItem value="2">무</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="x"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel>발견 위치(지도) *</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="geo" className="sr-only" {...field} readOnly disabled />
                        </FormControl>
                        <LocationPicker
                          onLocationSelect={handleLocationSelect}
                          isMissing={false}
                          initialLocation={{ x: pet.x, y: pet.y, location: pet.location }}
                        />
                      </FormItem>
                    )}
                  />

                  {/* 상세 주소 입력 필드 */}
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="detailAddr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>상세 주소</FormLabel>
                          <Input
                            type="text"
                            placeholder="상세 주소를 입력하세요 (예: 아파트 동/호수, 건물 내 위치 등)"
                            {...field}
                          />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 원래 location 필드는 hidden으로 변경하거나 제거 가능 */}
                  <FormField
                    control={form.control}
                    name="location"
                    rules={{ required: "실종 위치는 필수입니다" }}
                    render={({ field }) => (
                      <FormItem className="sr-only">
                        <FormLabel>전체 위치 (자동 생성됨) *</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="실종 위치" {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="etc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>특이사항</FormLabel>
                        <FormControl>
                          <Textarea placeholder="반려동물에 대한 추가 정보를 입력하세요" className="min-h-[80px]" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </div>
        <DialogFooter className="px-6">
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit" form="missing">
              등록하기
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
