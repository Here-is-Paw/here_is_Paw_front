import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import axios from "axios";
import {backUrl} from "@/constants.ts";
import React, {useState} from "react";

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const loginData: LoginRequest = { username, password };

        try {
            await axios.post(`${backUrl}/api/v1/members/login`, loginData, { withCredentials: true });
            location.reload();
        } catch (error) {
            console.error('로그인 오류:', error);
            alert('로그인 실패');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[470px]">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4"
                    onClick={() => onOpenChange(false)}
                >
                    <span className="sr-only">Close</span>
                </Button>
                <Card className="border-none shadow-none">
                    <CardHeader className="space-y-2 text-center">
                        <CardTitle className="text-2xl font-bold text-primary">
                            관리자 로그인
                        </CardTitle>
                        <CardDescription>
                            관리자 계정으로 로그인하세요
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
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
                                />
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="비밀번호"
                                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <Button
                                    type={"submit"}
                                    className="w-full"
                                >
                                    로그인
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
};