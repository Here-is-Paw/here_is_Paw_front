import React, { useState, useRef, useEffect } from "react";
import { ImagePlus, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { FormProps } from "@/types/mypet.ts";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";

export const PetImageUploader: React.FC<FormProps> = ({ form, isEditing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasExistingImage, setHasExistingImage] = useState<boolean>(false);

  // 컴포넌트 마운트 시 초기 이미지 설정
  useEffect(() => {
    // 수정 모드에서 기존 이미지 URL 가져오기
    const values = form.watch();
    if (values && values.pathUrl) {
      setPreviewUrl(values.pathUrl);
      setHasExistingImage(true);
    }
  }, [form, isEditing]);

  // 파일 선택 핸들러
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 제한 (예: 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("파일 크기는 5MB를 초과할 수 없습니다.");
        return;
      }

      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setHasExistingImage(false); // 새 이미지를 선택했으므로 기존 이미지 상태 재설정
      };
      reader.readAsDataURL(file);

      // 폼 값 설정
      form.setValue("profileImage", file);
    }
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setPreviewUrl(null);
    form.setValue("profileImage", null);
    setHasExistingImage(false);

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 이미지 선택 버튼 클릭 핸들러
  const handleSelectImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <FormField
      control={form.control}
      name="profileImage"
      rules={{
        validate: (value) => {
          // 수정 모드이고 기존 이미지가 있으면 유효성 검사 통과
          console.log("-----------", hasExistingImage);
          console.log("-----------", isEditing);
          if (isEditing && hasExistingImage) {
            return true;
          }
          // 그렇지 않으면 이미지 필수
          return value ? true : "반려동물 이미지는 필수입니다";
        },
      }}
      render={({ fieldState }) => (
        <FormItem className="flex flex-col items-center space-y-4">
          <div className="relative flex flex-col items-center mx-auto w-40 h-40">
            <input
              id="myProfile"
              type="file"
              ref={fileInputRef}
              className="sr-only"
              accept="image/*"
              onChange={handleFileChange}
            />
            <label
              htmlFor="myProfile"
              className="relative flex shrink-0 w-40 h-40 rounded-full bg-muted hover:shadow-lg cursor-pointer transition-colors"
            >
              {previewUrl ? (
                <div className="relative">
                  <div className="w-40 h-40 rounded-full overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="프로필 이미지"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <span className="flex h-full w-full items-center justify-center rounded-full">
                    반려동물 이미지 *
                  </span>

                  <span className="absolute bottom-0 left-0 inline-flex justify-center items-center w-8 h-8 border rounded-full bg-white">
                    <Pencil className="w-4 h-4" />
                  </span>
                </>
              )}
            </label>

            {previewUrl && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-0 right-0 w-8 h-8 rounded-full p-0 flex items-center justify-center"
                onClick={handleRemoveImage}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
