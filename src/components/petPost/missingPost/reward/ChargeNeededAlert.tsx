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
import { CreditCard } from "lucide-react";

interface ChargeNeededAlertProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    neededAmount?: number;
    onGoToCharge: () => void;
    onCancel: () => void;
}

export const ChargeNeededAlert: React.FC<ChargeNeededAlertProps> = ({
                                                                        open,
                                                                        onOpenChange,
                                                                        neededAmount,
                                                                        onGoToCharge,
                                                                        onCancel,
                                                                    }) => {

    const handleGoToCharge = () => {
        onOpenChange(false);
        onGoToCharge();
    };

    const handleCancel = () => {
        onOpenChange(false);
        onCancel();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-amber-500" />
                        <span>포인트 충전 필요</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-2">
                            <p>
                                사례금을 전달하기 위한 포인트가 부족합니다.
                                {neededAmount && (
                                    <span className="text-amber-600 font-bold"> {neededAmount.toLocaleString()}원</span>
                                )}
                                의 사례금을 전달하려면 먼저 포인트를 충전해주세요.
                            </p>
                            <p className="text-sm text-gray-500 pt-2">
                                충전 페이지로 이동하시겠습니까?
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCancel}>취소</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleGoToCharge}
                        className="bg-amber-500 hover:bg-amber-600"
                    >
                        충전하러 가기
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};