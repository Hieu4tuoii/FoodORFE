"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Check, ChevronLeft } from "lucide-react"
import { useCart } from "../context/CartContext"
import Navbar from "../components/Navbar"

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const { clearCart } = useCart()

  useEffect(() => {
    // Xóa giỏ hàng sau khi thanh toán thành công
    clearCart()
  }, [clearCart])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl min-h-screen pb-20 mx-auto bg-white">
        <div className="flex items-center p-6">
          <button onClick={() => navigate("/")} className="mr-4">
            <ChevronLeft size={28} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-20">
          <div className="flex items-center justify-center w-32 h-32 mb-8 border-4 border-green-500 rounded-full success-icon">
            <Check size={64} className="text-green-500" />
          </div>

          <h1 className="mb-4 text-3xl font-bold">Bạn đã thanh toán thành công</h1>
          <p className="max-w-2xl mb-16 text-xl text-center text-gray-500">
            Cảm ơn quý khách đã ủng hộ chúng tôi, hẹn gặp lại quý khách!
          </p>

          <div className="flex justify-center w-full">
            <button
              className="w-full max-w-md px-8 py-4 text-lg font-medium text-white transition-colors bg-orange-500 rounded-full hover:bg-orange-600"
              onClick={() => navigate("/")}
            >
              Trở về trang chủ
            </button>
          </div>
        </div>

        <Navbar />
      </div>
    </div>
  )
}

