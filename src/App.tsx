import "./App.css";
import Layout from "./layout";
import "./index.css";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginPage } from './pages/login'
import { PrivateRoute } from "./helpers/PrivateRoute";
import Feedback from "./pages/Feedback";
import { SizesPage } from "./pages/sizes";
import { BrandsPage } from "./pages/Brands";
import { MaterialsPage } from "./pages/Material";
import { CategoryPage } from "./pages/Categories";
import { ContactDetailsPage } from "./pages/Details";
import { CreateProduct } from "./pages/CreateProduct";
import { EditProduct } from "./pages/EditProduct";
import { Orders } from "./pages/Order";
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route element={
          <PrivateRoute>
            <Layout>
              <Outlet />
            </Layout>
          </PrivateRoute>
        }>
          <Route path="/" element={<Navigate to="/feedback" replace />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/sizes" element={<SizesPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/details" element={<ContactDetailsPage />} />
          <Route path="/create-product" element={<CreateProduct />} />
          <Route path="/edit-product/:id" element={<EditProduct />} />
          <Route path="/orders" element={<Orders />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
