import {BrowserRouter} from "react-router-dom";
import {SidebarProvider} from "@/components/ui/sidebar";
import RootLayout from "./app/layout";
import AppRoutes from "./routes.tsx";
import {AuthProvider} from "@/contexts/AuthContext";
// import {PetProvider} from "./contexts/findPetContext.tsx";
import {RadiusProvider} from "@/contexts/RadiusContext.tsx";
import {ChatProvider} from "./contexts/ChatContext";

import "./App.css";
import {MapLocationProvider} from "@/contexts/MapLocationContext.tsx";
import {PetProvider} from "@/contexts/PetContext.tsx";


// RadiusProvider, MapLocationProvider가 PetProvider보다 상위여야함
// > Pet에서 두개의 전역을 사용하기 때문
function App() {
    return (
        <BrowserRouter>
            <RadiusProvider>
                <MapLocationProvider>
                    <PetProvider>
                        <ChatProvider>
                            <AuthProvider>
                                <SidebarProvider>
                                    <RootLayout>
                                        <AppRoutes/>
                                    </RootLayout>
                                </SidebarProvider>
                            </AuthProvider>
                        </ChatProvider>
                    </PetProvider>
                </MapLocationProvider>
            </RadiusProvider>
        </BrowserRouter>
    );
}

export default App;
