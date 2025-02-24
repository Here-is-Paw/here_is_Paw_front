import { BrowserRouter } from "react-router-dom";

import RootLayout from "./app/layout";
import AppRoutes from "./routes.tsx";

function App() {
  return (
    <BrowserRouter>
      <RootLayout>
        <AppRoutes />
      </RootLayout>
    </BrowserRouter>
  );
}

export default App;
