import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay,
  AlertDialogPortal,
} from "@/components/ui/alert-dialog.tsx";
import { MyPet } from "@/types/mypet.ts";

interface DeletePetDialogProps {
  isOpen: boolean;
  petToDelete: MyPet | null;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export const DeletePetDialog: React.FC<DeletePetDialogProps> = ({
  isOpen,
  petToDelete,
  onOpenChange,
  onConfirmDelete,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-black/50" />
        <AlertDialogContent className="bg-white max-w-[350px] p-4 rounded-lg">
          <AlertDialogHeader className="space-y-1">
            <AlertDialogTitle className="text-base">
              정말 삭제하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {petToDelete?.name || "이 반려동물"}을(를) 목록에서 삭제합니다.
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-3">
            <AlertDialogCancel className="h-8 text-xs">취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              className="bg-red-600 hover:bg-red-700 h-8 text-xs"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
};
