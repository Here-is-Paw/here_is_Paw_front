import {Button} from "@/components/ui/button";
import axios from "axios";
import {backUrl} from "@/constants.ts";
import React, {useState} from "react";
import {useAuth} from "@/contexts/AuthContext.tsx";
import {useNavigate} from "react-router-dom";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader,
    AlertDialogOverlay,
    AlertDialogPortal, AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import {X} from "lucide-react";

interface AdminLoginPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface LoginRequest {
    username: string;
    password: string;
}

export const AdminLoginPopup = ({open, onOpenChange}: AdminLoginPopupProps) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const {login} = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const loginData: LoginRequest = {username, password};

        try {
            await axios.post(`${backUrl}/api/v1/members/login`, loginData, {withCredentials: true});
            login();
            onOpenChange(false); // 로그인 팝업 닫기
            setIsLoading(false);
            navigate('/'); // 필요한 경우 홈페이지로 이동
        } catch (error) {
            console.error('로그인 오류:', error);
            alert('로그인 실패');
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogPortal>
                <AlertDialogOverlay className="bg-black/50"/>
                <AlertDialogContent
                    className="max-w-[400px] p-0 rounded-xl bg-white shadow-lg"
                >
                    <AlertDialogCancel asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 z-50"
                        >
                            <X className="h-6 w-6 text-gray-500"/>
                        </Button>
                    </AlertDialogCancel>

                    <div className="p-6 text-center">
                        <AlertDialogHeader>
                            <AlertDialogTitle>관리자 로그인</AlertDialogTitle>
                            <AlertDialogDescription className="pb-5">
                                관리자 계정으로 로그인하세요
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="w-full space-y-4">
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    placeholder="아이디"
                                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                                    autoComplete="current-username"
                                />
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="비밀번호"
                                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                                    autoComplete="current-password"
                                />
                                <Button
                                    type={"submit"}
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? '로그인 중...' : '로그인'}
                                </Button>
                            </div>
                        </form>
                    </div>

                </AlertDialogContent>
            </AlertDialogPortal>
        </AlertDialog>

    );
};