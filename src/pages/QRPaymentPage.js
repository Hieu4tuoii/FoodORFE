import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Copy, CheckCircle2 } from "lucide-react";
import Navbar from "../components/Navbar";

// API Constants
const BASE_URL = "http://185.234.247.196:8082";
const POLL_INTERVAL = 2000; // 2 seconds

export default function QRPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { invoiceId, totalAmount } = location.state || {};
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes countdown
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, success, failed
  const [isPolling, setIsPolling] = useState(true);
  const [diningTableId, setDiningTableId] = useState("");
  
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
  
  // Bank information
  const bankInfo = {
    name: "Phạm Huy Tuấn",
    bank: "MBBank",
    accountNumber: "02227912102004",
    branch: "Chi nhánh Hà Nội"
  };

  // Generate QR code URL
  const qrCodeUrl = `https://qr.sepay.vn/img?acc=${bankInfo.accountNumber}&bank=${bankInfo.bank}&amount=${totalAmount || 0}&des=${invoiceId || "PAYMENT"}&template=qronly&download=DOWNLOAD`;
  
  // Payment status checker
  useEffect(() => {
    let intervalId = null;
    
    if (isPolling && diningTableId) {
      // Initial check
      checkPaymentStatus();
      
      // Set up interval for checking
      intervalId = setInterval(checkPaymentStatus, POLL_INTERVAL);
    }
    
    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling, diningTableId]);

  // Function to check payment status
  const checkPaymentStatus = async () => {
    if (!diningTableId) return;
    
    try {
      const response = await fetch(`${BASE_URL}/bank/check/${diningTableId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.status === 200) {
        if (result.data === true) {
          // Payment successful
          setPaymentStatus("success");
          setIsPolling(false);
          // Redirect to success page after a short delay
          setTimeout(() => {
            navigate("/payment-success");
          }, 1500);
        }
      } else {
        console.error("API Error:", result.message);
      }
    } catch (error) {
      console.error("Failed to check payment status:", error);
    }
  };
  
  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format countdown time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Copy account number to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle payment confirmation (manual confirmation)
  const handleConfirmPayment = () => {
    // Force check payment status
    checkPaymentStatus();
  };

  // Render payment status overlay if payment is successful
  const renderPaymentStatusOverlay = () => {
    if (paymentStatus === "success") {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded-lg shadow-lg w-80">
            <div className="flex justify-center mb-4">
              <CheckCircle2 size={64} className="text-green-500" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-center">Thanh toán thành công!</h3>
            <p className="mb-6 text-center text-gray-600">Cảm ơn bạn đã thanh toán</p>
            <p className="text-center text-gray-600">Đang chuyển hướng...</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Payment success overlay */}
      {renderPaymentStatusOverlay()}
      
      <div className="min-h-screen pb-20 mx-auto bg-white">
        <div className="flex items-center p-4 md:p-6">
          <button onClick={() => navigate(-1)} className="mr-3 md:mr-4">
            <ChevronLeft size={24} className="md:w-7 md:h-7 lg:w-8 lg:h-8" />
          </button>
          <h1 className="text-lg font-medium md:text-xl lg:text-2xl">Thanh toán QR</h1>
        </div>

        <div className="max-w-md px-4 mx-auto md:px-6">
          {/* Countdown timer */}
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-500">Mã QR hết hạn sau</p>
            <p className="text-xl font-bold text-orange-500">{formatTime(countdown)}</p>
          </div>

          {/* QR Code Display */}
          <div className="p-4 mb-6 overflow-hidden text-center bg-white border rounded-lg shadow-md">
            <div className="mb-4">
              <img 
                src={qrCodeUrl} 
                alt="QR Payment Code" 
                className="mx-auto"
                style={{ maxWidth: "250px", width: "100%" }}
              />
            </div>
            <p className="mb-1 text-sm text-gray-500">Quét mã QR để thanh toán</p>
            <p className="font-bold text-orange-500">
              {(totalAmount || 0).toLocaleString()}đ
            </p>
          </div>

          {/* Payment Status Indicator */}
          <div className="p-3 mb-6 text-center rounded-lg bg-blue-50">
            <p className="text-blue-700">
              {paymentStatus === "success" 
                ? "Thanh toán thành công! Đang chuyển hướng..." 
                : "Chờ thanh toán... Hệ thống đang kiểm tra giao dịch của bạn"}
            </p>
          </div>

          {/* Bank Information */}
          <div className="p-4 mb-6 bg-white border rounded-lg shadow-md">
            <h2 className="mb-3 text-lg font-medium">Thông tin chuyển khoản</h2>
            
            <div className="mb-3">
              <p className="text-sm text-gray-500">Ngân hàng</p>
              <p className="font-medium">{bankInfo.bank} - {bankInfo.branch}</p>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-500">Chủ tài khoản</p>
              <p className="font-medium">{bankInfo.name}</p>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-500">Số tài khoản</p>
              <div className="flex items-center">
                <p className="mr-2 font-medium">{bankInfo.accountNumber}</p>
                <button 
                  onClick={() => copyToClipboard(bankInfo.accountNumber)}
                  className="p-1 text-orange-500 transition-colors rounded-full hover:bg-orange-50"
                >
                  {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-500">Số tiền</p>
              <p className="font-medium">{(totalAmount || 0).toLocaleString()}đ</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Nội dung chuyển khoản</p>
              <div className="flex items-center">
                <p className="mr-2 font-medium">{invoiceId || "PAYMENT"}</p>
                <button 
                  onClick={() => copyToClipboard(invoiceId || "PAYMENT")}
                  className="p-1 text-orange-500 transition-colors rounded-full hover:bg-orange-50"
                >
                  {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 mb-6 text-sm rounded-lg bg-orange-50">
            <p className="font-medium text-orange-700">Hướng dẫn thanh toán:</p>
            <ol className="pl-5 mt-2 text-orange-700 list-decimal">
              <li>Quét mã QR bằng ứng dụng ngân hàng của bạn</li>
              <li>Kiểm tra thông tin thanh toán</li>
              <li>Xác nhận thanh toán</li>
              <li>Hệ thống sẽ tự động xác nhận sau khi thanh toán hoàn tất</li>
            </ol>
          </div>

        </div>

        <Navbar />
      </div>
    </div>
  );
}
