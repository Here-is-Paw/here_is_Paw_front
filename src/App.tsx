import {BrowserRouter} from 'react-router-dom'
import {SidebarProvider} from "@/components/ui/sidebar"
import RootLayout from './app/layout'
import AppRoutes from './routes.tsx'
import axios from "axios";
import {useEffect} from "react";
import {backUrl} from "@/constants.ts";

function App() {
    const fetchAuthData = () => {
        console.log("apiKey : ", document.cookie)
        axios.get(`${backUrl}/api/v1/members/me`, { withCredentials: true })
            .then(response => {
                console.log('응답:', response.data);
            })
            .catch(error => {
                if (error.response) {
                    console.info(error.response.data);
                } else {
                    console.error('요청 중 알 수 없는 오류 발생', error);
                }
            });
        console.log("요청 보냄");
    };

    useEffect(() => {
        fetchAuthData();
    }, []);

    return (
        <BrowserRouter>
            <SidebarProvider>
                <RootLayout>
                    <AppRoutes/>
                </RootLayout>
            </SidebarProvider>
        </BrowserRouter>
    )
}

export default App;
