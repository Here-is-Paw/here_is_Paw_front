import {BrowserRouter} from "react-router-dom";
import {SidebarProvider} from "@/components/ui/sidebar";
import RootLayout from "./app/layout";
import AppRoutes from "./routes.tsx";
import {AuthProvider} from "@/contexts/AuthContext";
import {PetProvider} from "./contexts/findPetContext.tsx";
import {RadiusProvider} from "@/contexts/RadiusContext.tsx";

import "./App.css";

function App() {
    return (
        <BrowserRouter>
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
        </BrowserRouter>
    );
}

export default App;
