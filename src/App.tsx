import { BrowserRouter } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import RootLayout from "./app/layout";
import AppRoutes from "./routes.tsx";
import { AuthProvider } from "@/contexts/AuthContext";
import { PetProvider } from "./contexts/findPetContext.tsx";

function App() {
  return (
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
  );
}

export default App;
