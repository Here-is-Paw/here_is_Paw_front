import { BrowserRouter } from 'react-router-dom'
import { SidebarProvider } from "@/components/ui/sidebar"
import RootLayout from './app/layout'
import AppRoutes from './routes.tsx'

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <RootLayout>
          <AppRoutes />
        </RootLayout>
      </SidebarProvider>
    </BrowserRouter>
  )
}

export default App
