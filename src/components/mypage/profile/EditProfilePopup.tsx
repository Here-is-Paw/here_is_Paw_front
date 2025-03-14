import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPortal,
  DialogOverlay,
  DialogFooter,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ImagePlus, Pencil, X } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { User } from "@/types/user.ts";

interface EditProfilePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: User | null;
  onUpdateProfile: (updatedData: {
    id: number;
    nickname?: string;
    profileImage?: File;
  }) => Promise<void>;
}

export const EditProfilePopup: React.FC<EditProfilePopupProps> = ({
  open,
  onOpenChange,
  userData,
  onUpdateProfile,
}) => {
  const [editedNickname, setEditedNickname] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 다이얼로그가 열릴 때마다 초기값 설정
  useEffect(() => {
    if (open && userData) {
      setEditedNickname(userData.nickname || "");
      setPreviewUrl(userData.avatar || null);
      setProfileImage(null);
    }
  }, [open, userData]);

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
      };
      reader.readAsDataURL(file);

      // 파일 상태 설정
      setProfileImage(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setProfileImage(null);

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelectImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpdateProfile = async () => {
    try {
      // 닉네임이나 프로필 이미지 중 하나라도 변경되었다면
      const updateData: {
        id: number;
        nickname?: string;
        profileImage?: File;
      } = {
        id: userData?.id || 0,
      };

      if (editedNickname.trim() !== userData?.nickname) {
        updateData.nickname = editedNickname;
      }

      if (profileImage) {
        updateData.profileImage = profileImage;
      }

      await onUpdateProfile(updateData);
      onOpenChange(false);
    } catch (error) {
      console.error("프로필 업데이트 실패:", error);
      alert("프로필 업데이트에 실패했습니다.");
    }
  };

  const handleClose = () => {
    // 상태 초기화
    setEditedNickname(userData?.nickname || "");
    setPreviewUrl(userData?.avatar || null);
    setProfileImage(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent className="max-w-[500px] w-[calc(100%-1rem)] h-5/6 p-6 rounded bg-white">
          <DialogHeader className="space-y-2 text-left px-3 md:px-6">
            <DialogTitle className="text-2xl font-bold text-primary">
              프로필 수정
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              프로필 정보를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 flex-1 overflow-auto px-3 md:px-6">
            {/* 프로필 이미지 업로더 */}
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
                      {userData?.nickname?.charAt(0) || "?"}
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

            {/* 닉네임 입력 */}
            <div className="flex gap-4 items-center w-full">
              <Label htmlFor="nickname" className="text-right">
                닉네임
              </Label>
              <Input
                id="nickname"
                value={editedNickname}
                onChange={(e) => setEditedNickname(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter className="flex-row flex-wrap-reverse px-3 md:px-6">
            {/* 저장/취소 버튼 */}
            <div className="w-full flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button onClick={handleUpdateProfile}>저장</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
