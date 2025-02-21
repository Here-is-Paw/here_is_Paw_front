import {BrowserRouter} from 'react-router-dom'
import {SidebarProvider} from "@/components/ui/sidebar"
import RootLayout from './app/layout'
import AppRoutes from './routes.tsx'
import axios from "axios";
import {useEffect} from "react";
import {backUrl} from "@/constants.ts";

function App() {
    const fetchAuthData = () => {
        axios.get(`${backUrl}/api/v1/members/auth`, {withCredentials: true})
            .then(response => {
                console.log('응답:', response.data);
            })
            .catch(error => {
                console.error('에러:', error);
            });
        console.log("요청 보냄")
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

export default App
