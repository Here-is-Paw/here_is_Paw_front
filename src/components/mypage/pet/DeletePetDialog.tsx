import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { MyPet } from "@/types/pet.ts";

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
                                                                    onConfirmDelete
                                                                }) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {petToDelete?.name || '이 반려동물'}을(를) 목록에서 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirmDelete}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        삭제
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};