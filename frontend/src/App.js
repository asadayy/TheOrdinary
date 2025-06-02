import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import NotAuthorized from "./AdminDashboard/Pages/NotAuthorized";
import RequireAdmin from "./AdminDashboard/RequireAdmin";
import "./App.css";
import { CartProvider } from "./Context/CartContext";

// Public Components
import AuthModal from "./Components/AuthModal/AuthModal";
import Footer from "./Components/Footer/Footer";
import { Navbar } from "./Components/Navbar/Navbar";
import About from "./Pages/About";
import Checkout from "./Pages/Checkout";
import Home from "./Pages/Home";
import ProductDetail from "./Pages/ProductDetail";
import Products from "./Pages/Products";
import SkinAnalyzer from "./Pages/SkinAnalyzer";

// Admin Components
import AdminLayout from "./AdminDashboard/AdminLayout";
import AddNewProduct from "./AdminDashboard/Pages/AddNewProduct";
import Dashboard from "./AdminDashboard/Pages/Dashboard";
import Orders from "./AdminDashboard/Pages/Orders";
import ProductsAdmin from "./AdminDashboard/Pages/Products";
import SendMail from "./AdminDashboard/Pages/SendMail";
import Subscribers from "./AdminDashboard/Pages/Subscribers";
import Users from "./AdminDashboard/Pages/Users";

function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Home />
                <Footer />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <Navbar />
                <About />
                <Footer />
              </>
            }
          />
          <Route
            path="/skin-analyzer"
            element={
              <>
                <Navbar />
                <SkinAnalyzer />
                <Footer />
              </>
            }
          />
          <Route
            path=":category"
            element={
              <>
                <Navbar />
                <Products />
                <Footer />
              </>
            }
          />
          <Route
            path="/products/:category/:productName"
            element={
              <>
                <Navbar />
                <ProductDetail />
                <Footer />
              </>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/not-authorized" element={<NotAuthorized />} />
          <Route
            path="/admin/*"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="products/add" element={<AddNewProduct />} />
            <Route path="users" element={<Users />} />
            <Route path="subscribers" element={<Subscribers />} />
            <Route path="send-mail" element={<SendMail />} />
          </Route>
        </Routes>
        <AuthModal />
      </CartProvider>
    </Router>
  );
}

export default App;
