import { BrowserRouter } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import RootLayout from "./app/layout";
import AppRoutes from "./routes.tsx";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthInit } from "./components/auth/authInit.tsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthInit />
        <SidebarProvider>
          <RootLayout>
            <AppRoutes />
          </RootLayout>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
