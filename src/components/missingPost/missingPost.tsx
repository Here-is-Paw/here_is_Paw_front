import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { backUrl } from "@/constants.ts";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { MissingFormData, defaultValues } from "@/types/missing";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import LocationPicker from "../locaion/locationPicker";

interface MissingFormPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const MissingFormPopup = ({
  open,
  onOpenChange,
  onSuccess,
}: MissingFormPopupProps) => {
  const form = useForm<MissingFormData>({
    defaultValues,
  });
  const [date, setDate] = React.useState<Date>();

  const [locationInfo, setLocationInfo] = useState({
    x: 0,
    y: 0,
    address: "",
  });

  // 추가 상세 주소 입력을 위한 상태 추가
  const [additionalAddressDetails, setAdditionalAddressDetails] = useState("");

  // 위치 선택 핸들러
  const handleLocationSelect = (location: {
    x: number;
    y: number;
    address: string;
  }) => {
    setLocationInfo(location);
    // geo 필드 업데이트 (JSON 문자열로 저장)
    form.setValue("geo", JSON.stringify({ x: location.x, y: location.y }));
    // location 필드 업데이트 (주소 문자열로 저장)
    form.setValue("location", location.address);
  };

  // 추가 상세 주소 변경 핸들러
  const handleAdditionalAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAdditionalAddressDetails(e.target.value);

    // 지도에서 선택한 주소와 사용자가 입력한 상세 주소 결합
    const combinedAddress = locationInfo.address
      ? `${locationInfo.address} ${e.target.value}`.trim()
      : e.target.value;

    form.setValue("location", combinedAddress);
  };

  // 팝업이 닫힐 때 폼 초기화
  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
      setLocationInfo({ x: 0, y: 0, address: "" });
      setAdditionalAddressDetails("");
    }
  }, [open, form]);

  // 팝업 닫기 핸들러
  const handleClose = () => {
    form.reset(defaultValues);
    setLocationInfo({ x: 0, y: 0, address: "" });
    setAdditionalAddressDetails("");
    onOpenChange(false);
  };

  const handleSubmit = async (data: MissingFormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("breed", data.breed);

      // geo 좌표 정보 추가 - 더 이상 임의 값이 아닌 실제 좌표
      if (locationInfo.x && locationInfo.y) {
        formData.append(
          "geo",
          JSON.stringify({ x: locationInfo.x, y: locationInfo.y })
        );
      } else {
        alert("실종 위치를 지도에서 선택해주세요.");
        return;
      }

      // 지도 주소와 상세 주소를 결합
      const combinedAddress = locationInfo.address
        ? `${locationInfo.address} ${additionalAddressDetails}`.trim()
        : data.location;

      formData.append("location", combinedAddress);

      formData.append("color", data.color || "");
      formData.append("serialNumber", data.serialNumber || "");
      formData.append("gender", data.gender?.toString() || "0");
      formData.append("neutered", data.neutered?.toString() || "0");
      formData.append("age", data.age?.toString() || "0");
      formData.append("lostDate", new Date().toISOString().split("Z")[0]);
      formData.append("etc", data.etc || "");
      formData.append("reward", data.reward?.toString() || "0");
      formData.append("missingState", data.missingState?.toString() || "0");

      if (data.file) {
        formData.append("file", data.file);
      } else {
        alert("반려동물 사진을 업로드해야 합니다.");
        return;
      }

      await axios.post(`${backUrl}/api/v1/missings/write`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      form.reset(defaultValues);
      setLocationInfo({ x: 0, y: 0, address: "" });
      setAdditionalAddressDetails("");
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("반려동물 등록 오류:", error);
      alert("반려동물 등록에 실패했습니다");
    }
  };

  /**
   * 이름, 견종, 유기견 이미지, 지역, 좌표
   * 색상, 동물 등록 번호, 성별, 중성화 유무, 나이, 실종 날짜, 기타(특징), 사례금
   */

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          // 팝업이 닫힐 때 폼 초기화
          form.reset(defaultValues);
          setLocationInfo({ x: 0, y: 0, address: "" });
          setAdditionalAddressDetails("");
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-[500px] h-5/6 py-6 px-0 bg-white"
      >
        <DialogHeader className="space-y-2 text-center px-6">
          <DialogTitle className="text-2xl font-bold text-primary">
            반려동물 실종 신고
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            반려동물 정보를 입력해주세요
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-6">
          <Form {...form}>
            <form
              id="missing"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                {/* 필수 입력 필드 */}
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: "반려동물 이름은 필수입니다" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름 *</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="반려동물 이름"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="breed"
                  rules={{ required: "견종은 필수입니다" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>견종 *</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="견종" {...field} />
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
                        <Input
                          type="text"
                          placeholder="마이크로칩 등록번호"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

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
                        defaultValue={"0"}
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
                        <Input
                          type="number"
                          placeholder="나이"
                          min={0}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>반려동물 사진 *</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="geo"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>실종 위치(geo) *</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="geo" {...field} />
                    </FormControl>
                    <LocationPicker onLocationSelect={handleLocationSelect} />
                  </FormItem>
                )}
              />

              {/* 상세 주소 입력 필드 */}
              <div className="space-y-2">
                <FormLabel>상세 주소</FormLabel>
                <Input
                  type="text"
                  placeholder="상세 주소를 입력하세요 (예: 아파트 동/호수, 건물 내 위치 등)"
                  value={additionalAddressDetails}
                  onChange={handleAdditionalAddressChange}
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
                      <Input
                        type="text"
                        placeholder="실종 위치"
                        {...field}
                        disabled
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lostDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>실종 날짜</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon />
                              {date ? (
                                format(date, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              className="calendar-custom"
                              mode="single"
                              selected={date}
                              onSelect={(newDate) => {
                                setDate(newDate);
                                if (newDate) {
                                  field.onChange(
                                    newDate.toISOString().split("Z")[0]
                                  );
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
                        defaultValue={"0"}
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

              <FormField
                control={form.control}
                name="reward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사례금</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="사례금"
                        min={0}
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="etc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>기타 정보</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="반려동물에 대한 추가 정보를 입력하세요"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="missingState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>상태</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="상태" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">실종</SelectItem>
                        <SelectItem value="1">완료</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
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
