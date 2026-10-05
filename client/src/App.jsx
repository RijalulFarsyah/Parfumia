import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import SellerLayout from './components/SellerLayout';
import Dashboard from './pages/seller/Dashboard';
import Products from './pages/seller/Products';
import ProductForm from './pages/seller/ProductForm';
import SellerOrders from './pages/seller/Orders';
import Store from './pages/seller/Store';
import Reports from './pages/seller/Reports';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Sellers from './pages/admin/Sellers';
import AdminProducts from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import AdminOrders from './pages/admin/Orders';

export function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center text-muted">Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<ProtectedRoute role="buyer"><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute role="buyer"><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute role="buyer"><Orders /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute role="buyer"><OrderDetail /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute role="buyer"><Wishlist /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute role="buyer"><Profile /></ProtectedRoute>} />

        <Route path="/seller" element={<ProtectedRoute role="seller"><SellerLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="store" element={<Store />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="sellers" element={<Sellers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
