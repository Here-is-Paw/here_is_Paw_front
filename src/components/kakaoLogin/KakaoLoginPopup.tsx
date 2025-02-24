import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { backUrl, frontUrl, kakaoUrl } from "@/constants.ts";

interface KakaoLoginPopupProps {
    onLoginSuccess: () => void;
}

export const KakaoLoginPopup = ({ onLoginSuccess }: KakaoLoginPopupProps) => {

    const handleKakaoLogin = () => {
        window.location.href = `${backUrl}${kakaoUrl}?redirectUrl=${frontUrl}`;
        onLoginSuccess();
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost">로그인</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
                <Card className="border-none shadow-none">
                    <CardHeader className="space-y-2 text-center">
                        <CardTitle className="text-2xl font-bold text-primary">환영합니다</CardTitle>
                        <CardDescription>
                            카카오 계정으로 간편하게 로그인하세요
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <button
                            onClick={handleKakaoLogin}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#FEE500] hover:bg-[#FDD800] transition-colors text-[#191919] font-medium"
                        >
                            <img
                                src="../assets/login/kakao_login_large_wide 1.svg"
                                alt="카카오 로그인"
                                className="w-full h-full object-cover"
                            />
                        </button>

                        <p className="mt-6 text-sm text-muted-foreground text-center">
                            로그인 시 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다.
                        </p>
                    </CardContent>
                </Card>
            </AlertDialogContent>
        </AlertDialog>
    );
};