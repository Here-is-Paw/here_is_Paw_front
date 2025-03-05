import {BrowserRouter} from "react-router-dom";
import {SidebarProvider} from "@/components/ui/sidebar";
import RootLayout from "./app/layout";
import AppRoutes from "./routes.tsx";
import { AuthProvider } from "@/contexts/AuthContext";
import { PetProvider } from "./contexts/findPetContext.tsx";
import { RadiusProvider } from "@/contexts/RadiusContext.tsx";
import { ChatProvider } from './contexts/ChatContext';

import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <ChatProvider>
                <RadiusProvider>
                    <AuthProvider>
                        <PetProvider>
                            <SidebarProvider>
                                <RootLayout>
                                    <AppRoutes/>
                                </RootLayout>
                            </SidebarProvider>
                        </PetProvider>
                    </AuthProvider>
                </RadiusProvider>
            </ChatProvider>
        </BrowserRouter>
    );
}

export default App;
