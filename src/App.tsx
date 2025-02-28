import { BrowserRouter } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import RootLayout from "./app/layout";
import AppRoutes from "./routes.tsx";
import { AuthProvider } from "@/contexts/AuthContext";
import { PetProvider } from "./contexts/findPetContext.tsx";
import { ChatProvider } from './contexts/ChatContext';

function App() {
  return (
    <ChatProvider>
      <BrowserRouter>
        <AuthProvider>
          <PetProvider>
            <SidebarProvider>
              <RootLayout>
                <AppRoutes />
              </RootLayout>
            </SidebarProvider>
          </PetProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChatProvider>
  );
}

export default App;
