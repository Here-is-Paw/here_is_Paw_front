import React, { useState } from 'react';
import axios from 'axios';
import {backUrl} from "@/constants.ts";

interface LoginRequest {
    username: string;
    password: string;
}

const AdminLoginPage: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const loginData: LoginRequest = { username, password };

        try {
            const response = await axios.post(`${backUrl}/api/v1/members/login`, loginData, { withCredentials: true });
            alert(response.data); // 성공 메시지 표시
        } catch (error) {
            console.error('로그인 오류:', error);
            alert('로그인 실패');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-primary to-primary-foreground">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-primary mb-6">관리자 로그인</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-primary-foreground">아이디</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="아이디를 입력하세요"
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-primary-foreground">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="비밀번호를 입력하세요"
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <button type="submit" className="w-full py-3 bg-primary text-white rounded-md hover:bg-primary-foreground focus:outline-none">
                        로그인
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;