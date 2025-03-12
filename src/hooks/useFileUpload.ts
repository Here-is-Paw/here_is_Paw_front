import { useState, useCallback, useEffect } from "react";
import axios from "axios";

interface UseFileUploadProps {
  /**
   * AI 이미지 분석을 위한 URL
   */
  aiUrl: string;
  /**
   * 파일이 변경될 때 호출될 콜백 함수 (선택사항)
   */
  onFileChangeCallback?: (file: File | null) => void;
  /**
   * 초기 이미지 URL (선택사항)
   */
  initialImageUrl?: string | null;
  /**
   * AI 분석 사용 여부 (기본값: true)
   */
  useAnalysis?: boolean;
}

/**
 * 파일 업로드와 이미지 분석을 위한 커스텀 훅
 */
export const useFileUpload = ({
                                aiUrl,
                                onFileChangeCallback,
                                initialImageUrl = null,
                                useAnalysis = true
                              }: UseFileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialImageUrl);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasExistingImage, setHasExistingImage] = useState(!!initialImageUrl);

  // 초기 이미지 URL이 변경되면 이미지 미리보기 업데이트
  useEffect(() => {
    if (initialImageUrl) {
      setImagePreview(initialImageUrl);
      setHasExistingImage(true);
    }
  }, [initialImageUrl]);

  const handleFileChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];

        if (selectedFile) {
          setFile(selectedFile);
          setHasExistingImage(false);

          // 기본 미리보기 먼저 설정
          const tempPreviewUrl = URL.createObjectURL(selectedFile);
          setImagePreview(tempPreviewUrl);

          // AI 분석 사용이 설정된 경우에만 분석 실행
          if (useAnalysis) {
            setIsAnalyzing(true); // 분석 시작
            console.log('이미지 분석 시작...');
            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
              const response = await axios.post(`${aiUrl}/upload-image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
              console.log('이미지 분석 결과:', response.data);

              if (response.data.image_data) {
                // 이전 URL 해제
                URL.revokeObjectURL(tempPreviewUrl);

                const byteCharacters = atob(response.data.image_data);
                const byteArrays = [];

                for (let i = 0; i < byteCharacters.length; i++) {
                  byteArrays.push(byteCharacters.charCodeAt(i));
                }

                const blob = new Blob([new Uint8Array(byteArrays)], {
                  type: response.data.image_type
                });

                const previewUrl = URL.createObjectURL(blob);
                setImagePreview(previewUrl);
              }
            } catch (error) {
              console.error('이미지 처리 실패:', error);
              // 이미 기본 미리보기를 설정했으므로 여기서는 추가 작업 필요 없음
            } finally {
              setIsAnalyzing(false); // 분석 완료
            }
          }

          // 콜백 함수가 존재하면 호출
          if (onFileChangeCallback) {
            onFileChangeCallback(selectedFile);
          }
        }
      },
      [aiUrl, onFileChangeCallback, useAnalysis]
  );

  const resetFileUpload = useCallback(() => {
    if (imagePreview && !initialImageUrl) {
      URL.revokeObjectURL(imagePreview);
    }
    setFile(null);
    setImagePreview(initialImageUrl);
    setHasExistingImage(!!initialImageUrl);
  }, [initialImageUrl, imagePreview]);

  const removeImage = useCallback(() => {
    if (imagePreview && !initialImageUrl) {
      URL.revokeObjectURL(imagePreview);
    }
    setFile(null);
    setImagePreview(null);
    setHasExistingImage(false);
  }, [imagePreview, initialImageUrl]);

  return {
    file,
    imagePreview,
    isAnalyzing,
    hasExistingImage,
    handleFileChange,
    resetFileUpload,
    removeImage
  };
};