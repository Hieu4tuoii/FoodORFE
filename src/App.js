import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import { CartProvider } from "./context/CartContext";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import QRPaymentPage from "./pages/QRPaymentPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import TableRedirectPage from "./pages/TableRedirectPage";
import "./App.css";
import { use, useEffect } from "react";
import Chatbot from "./components/Chatbot";

function App() {
  const [customerId, setCustomerId] = useState("");

  useEffect(() => {
    // Save diningTableId to localStorage if it's in the URL
    const pathname = window.location.pathname;
    if (pathname.length > 1) {
      const potentialTableId = pathname.substring(1); // Remove the leading '/'
      if (potentialTableId && !potentialTableId.includes('/')) {
        if(!localStorage.getItem("diningTableId"))
        localStorage.setItem("diningTableId", potentialTableId);
      }
    }
    
    // Check for stored customerId
    const storedCustomerId = localStorage.getItem("customerId");
    if (storedCustomerId) {
      setCustomerId(storedCustomerId);
    }
  }, []);
  
  const handleLogin = (Id) => {
    setCustomerId(Id);
    localStorage.setItem("customerId", Id);
  };

  return (
    <CartProvider>
      <div className="App">
        {!customerId ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/qr-payment" element={<QRPaymentPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/:diningTableId" element={<TableRedirectPage />} />
            </Routes>
            <Chatbot />
          </>
        )}
      </div>
    </CartProvider>
  );
}

export default App;

