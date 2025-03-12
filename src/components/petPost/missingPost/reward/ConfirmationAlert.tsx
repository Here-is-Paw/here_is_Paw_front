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
} from "@/components/ui/alert-dialog";

interface ConfirmationAlertProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    confirmColor?: string;
}

export const ConfirmationAlert: React.FC<ConfirmationAlertProps> = ({
                                                                        open,
                                                                        onOpenChange,
                                                                        title,
                                                                        description,
                                                                        confirmLabel = "확인",
                                                                        cancelLabel = "취소",
                                                                        onConfirm,
                                                                        onCancel,
                                                                        // confirmVariant = "default",
                                                                        confirmColor,
                                                                    }) => {
    const handleCancel = () => {
        onOpenChange(false);
        if (onCancel) onCancel();
    };

    const handleConfirm = () => {
        onOpenChange(false);
        onConfirm();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {/* AlertDialogDescription 내부에서는 <p> 태그가 자동으로 생성되므로,
              내용이 단순 텍스트가 아니라면 Fragment(<></>) 사용 */}
                    <AlertDialogDescription asChild>
                        <div>{description}</div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCancel}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={confirmColor}
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};