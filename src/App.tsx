import { BrowserRouter } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import RootLayout from "./app/layout";
import AppRoutes from "./routes.tsx";
import { AuthProvider } from "@/contexts/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
