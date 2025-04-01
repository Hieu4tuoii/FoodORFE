import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function TableRedirectPage() {
  const { diningTableId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (diningTableId) {
      // Save dining table ID to localStorage
      localStorage.setItem("diningTableId", diningTableId);
      console.log("Table ID saved:", diningTableId);
      
      // Redirect to home page
      navigate("/");
    } else {
      // If no dining table ID is provided, redirect to home page
      navigate("/");
    }
  }, [diningTableId, navigate]);

  // Show a loading indicator while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-t-4 border-orange-500 border-solid rounded-full animate-spin"></div>
        <p className="text-gray-600">Đang tải thông tin bàn...</p>
      </div>
    </div>
  );
}
