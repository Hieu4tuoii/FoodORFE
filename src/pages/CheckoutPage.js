"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { useCart } from "../context/CartContext"
import Navbar from "../components/Navbar"

// URL cơ sở cho API
const BASE_URL = "https://api.phimhdchill.com"

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [diningTableId, setDiningTableId] = useState("")

  // Get dining table ID from localStorage
  useEffect(() => {
    const tableid = localStorage.getItem("diningTableId")
    if (tableid) {
      setDiningTableId(tableid)
    } else {
      console.warn("No dining table ID found in localStorage")
      // Set default value if not found
      setDiningTableId("cc764bec-79d7-4a0a-a7c7-6c0ec8eae01a")
    }
  }, [])

  // Lấy thông tin hóa đơn từ API
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!diningTableId) return; // Don't fetch if diningTableId is not set yet
      
      try {
        setLoading(true)
        const response = await fetch(`${BASE_URL}/invoice/diningTable/${diningTableId}`)
        const result = await response.json()
        
        if (result.status === 200) {
          setInvoice(result.data)
        } else {
          setError("Không thể lấy thông tin hóa đơn")
        }
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải dữ liệu hóa đơn")
        console.error("Error fetching invoice:", err)
      } finally {
        setLoading(false)
      }
    }

    if (diningTableId) {
      fetchInvoice()
    }
  }, [diningTableId])

  // Lấy danh sách phương thức thanh toán
  useEffect(() => {
    setPaymentMethods([
      { id: "CASH", name: "Tiền mặt", color: "green", icon: "/icons/cash.png" },
      { id: "QR", name: "Thanh toán QR", color: "blue", icon: "/icons/zalopay.png" },
    ])
  }, [])

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (!invoice) {
      alert("Không tìm thấy thông tin hóa đơn");
      return;
    }

    try {
      setSubmitting(true);

      if (paymentMethod === "CASH") {
        // Hiển thị thông báo thanh toán bằng tiền mặt với giao diện đẹp hơn
        const cashPaymentMessage = document.createElement('div');
        cashPaymentMessage.innerHTML = `
          <div class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 animate-fade-in">
              <div class="flex justify-center mb-4">
                <img src="/icons/cash.png" alt="Cash" class="w-16 h-16" />
              </div>
              <h3 class="text-xl font-bold text-center mb-2">Thanh toán tiền mặt</h3>
              <p class="text-gray-600 text-center mb-6">Vui lòng ra quầy thu ngân để hoàn tất thanh toán</p>
              <button class="w-full py-3 bg-orange-500 text-white rounded-lg font-medium">Đã hiểu</button>
            </div>
          </div>
        `;
        document.body.appendChild(cashPaymentMessage);

        // Đóng thông báo khi nhấn nút "Đã hiểu"
        cashPaymentMessage.querySelector('button').addEventListener('click', () => {
          cashPaymentMessage.remove();
        });

        return;
      } else if (paymentMethod === "QR") {
        // Chuyển hướng đến trang thanh toán QR với thông tin cần thiết
        navigate("/qr-payment", { 
          state: { 
            invoiceId: invoice.id,
            totalAmount: invoice.totalPrice 
          } 
        });
      }
    } catch (err) {
      setError("Không thể xử lý thanh toán. Vui lòng thử lại sau.");
      console.error("Error processing payment:", err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-t-4 border-orange-500 border-solid rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang tải thông tin hóa đơn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen pb-20 mx-auto bg-white">
        <div className="flex items-center p-4 md:p-6">
          <button onClick={() => navigate(-1)} className="mr-3 md:mr-4">
            <ChevronLeft size={24} className="md:w-7 md:h-7 lg:w-8 lg:h-8" />
          </button>
          <h1 className="text-lg font-medium md:text-xl lg:text-2xl">Thanh toán</h1>
        </div>

        <div className="max-w-4xl px-4 mx-auto md:px-6">
          {invoice ? (
            <>
              <div className="p-4 mb-6 border rounded-lg bg-gray-50">
                <h2 className="mb-3 text-lg font-medium">Thông tin hóa đơn</h2>
                {/* Removed invoice ID display */}
                <p className="mb-2 text-sm">Bàn: <span className="font-medium">{invoice.dinningTableName || "Không có thông tin"}</span></p>
                <p className="mb-4 text-sm">Khách hàng: <span className="font-medium">{invoice.customer?.name || "Khách lẻ"}</span></p>
                
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-medium">Danh sách món</h3>
                  <div className="pt-2 border-t">
                    {invoice.items.map((item, index) => (
                      <div key={index} className="flex py-2 border-b">
                        {/* Added image for food item */}
                        <div className="w-16 h-16 mr-3 overflow-hidden rounded-md shrink-0">
                          <img 
                            src={item.imageUrl || "/placeholder-food.png"} 
                            alt={item.name}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder-food.png";
                            }}
                          />
                        </div>
                        <div className="flex justify-between flex-1">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">{item.quantity} x {item.priceAtOrder.toLocaleString()}đ</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{item.totalPrice.toLocaleString()}đ</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-3 mt-2 font-medium">
                    <p>Tổng cộng</p>
                    <p>{invoice.totalPrice.toLocaleString()}đ</p>
                  </div>
                </div>
              </div>

              <h2 className="mb-4 text-base font-medium md:mb-6 md:text-xl">Phương thức thanh toán</h2>

              {error && <div className="p-4 mb-4 text-red-500 rounded-lg bg-red-50">{error}</div>}

              <div className="mb-6 space-y-3 md:space-y-4 md:mb-8">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-3 md:p-5 border rounded-lg cursor-pointer ${
                      paymentMethod === method.id ? "border-orange-500 bg-orange-50" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="w-4 h-4 mr-3 md:mr-4 md:h-5 md:w-5"
                    />
                    <div
                      className={`w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-${method.color}-100 rounded-full flex items-center justify-center mr-3 md:mr-4`}
                    >
                      <img
                        src={method.icon || "/placeholder.svg"}
                        alt={method.name}
                        className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8"
                      />
                    </div>
                    <span className="text-sm md:text-base lg:text-lg">{method.name}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  className="w-full py-3 text-base font-medium text-white bg-orange-500 rounded-full md:w-2/3 lg:w-1/2 md:py-4 md:text-lg"
                  onClick={handlePayment}
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <span className="w-5 h-5 mr-3 border-t-2 border-b-2 border-white rounded-full animate-spin"></span>
                      Đang xử lý...
                    </span>
                  ) : (
                    `Thanh toán ${invoice.totalPrice.toLocaleString()}đ`
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 text-center rounded-lg bg-yellow-50">
              <p className="mb-2 text-yellow-700">Không tìm thấy thông tin hóa đơn</p>
              <button 
                onClick={() => navigate('/')} 
                className="px-4 py-2 text-white bg-orange-500 rounded-lg"
              >
                Quay lại trang chủ
              </button>
            </div>
          )}
        </div>

        <Navbar />
      </div>
    </div>
  )
}

