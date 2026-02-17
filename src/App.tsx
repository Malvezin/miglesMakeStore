import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminLayout from "@/components/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminUsers from "@/pages/admin/AdminUsers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/produtos" element={<Products />} />
                <Route path="/carrinho" element={<Cart />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
                <Route path="/admin/produtos" element={<AdminLayout><AdminProducts /></AdminLayout>} />
                <Route path="/admin/pedidos" element={<AdminLayout><AdminOrders /></AdminLayout>} />
                <Route path="/admin/usuarios" element={<AdminLayout><AdminUsers /></AdminLayout>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
