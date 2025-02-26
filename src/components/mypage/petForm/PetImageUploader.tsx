import React, { useState, useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { FormProps } from '@/types/pet.ts';

export const PetImageUploader: React.FC<FormProps> = ({ form }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // 파일 선택 핸들러
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // 파일 크기 제한 (예: 5MB)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('파일 크기는 5MB를 초과할 수 없습니다.');
                return;
            }

            // 미리보기 생성
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);

            // 폼 값 설정
            form.setValue('profileImage', file);
        }
    };

    // 이미지 제거 핸들러
    const handleRemoveImage = () => {
        setPreviewUrl(null);
        form.setValue('profileImage', null);

        // 파일 입력 초기화
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // 이미지 선택 버튼 클릭 핸들러
    const handleSelectImageClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            {previewUrl ? (
                <div className="relative">
                    <div className="w-40 h-40 rounded-full overflow-hidden">
                        <img
                            src={previewUrl}
                            alt="반려동물 프로필"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0 w-8 h-8 rounded-full p-0 flex items-center justify-center"
                        onClick={handleRemoveImage}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handleSelectImageClick}
                >
                    <ImagePlus className="w-4 h-4" />
                    반려동물 이미지 선택
                </Button>
            )}
        </div>
    );
};