"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronDown, ChevronLeft, Minus, Plus } from "lucide-react"
import { useCart } from "../context/CartContext"
import Navbar from "../components/Navbar"

// URL cơ sở cho API
const BASE_URL = "https://api.phimhdchill.com"

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true)

        const response = await fetch(`${BASE_URL}/food/${id}`)
        if (!response.ok) {
          throw new Error("Không tìm thấy sản phẩm")
        }

        const result = await response.json()
        console.log("Fetched product detail:", result)

        if (result && result.status === 200 && result.data) {
          setProduct(result.data) 
        } else {
          throw new Error("Không tìm thấy sản phẩm")
        }

        setLoading(false)
      } catch (err) {
        setError(err.message || "Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.")
        setLoading(false)
        console.error("Error fetching product details:", err)
      }
    }

    if (id) {
      fetchProductDetail()
    }
  }, [id])

  const handleAddToCart = () => {
    if (product) {
      const productWithQuantity = { ...product, quantity }
      addToCart(productWithQuantity)
      navigate("/cart")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-t-2 border-b-2 border-orange-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-2 text-xl text-red-500">Lỗi</h2>
          <p>{error || "Không tìm thấy sản phẩm"}</p>
          <button className="px-4 py-2 mt-4 text-white bg-orange-500 rounded-lg" onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen pb-20 mx-auto bg-white">
        <div className="flex items-center p-4">
          <button onClick={() => navigate(-1)} className="mr-3">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-medium">Chi tiết sản phẩm</h1>
        </div>

        <div className="max-w-md px-4 mx-auto">
          <div className="mb-4 overflow-hidden rounded-2xl">
            <img
              src={"data:image/jpeg;base64,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"}
              alt={product.name}
              className="object-cover w-full h-64"
            />
          </div>

          <h2 className="mb-3 text-xl font-bold text-center">{product.name}</h2>

          <div className="flex items-center justify-center mb-4">
            <div className="inline-block px-6 py-2 border border-gray-300 rounded-full">
              <span className="text-lg font-medium text-red-500">
                {product.price?.toLocaleString() || 0}đ
              </span>
            </div>
          </div>

          <p className={`text-gray-600 text-center mb-4 ${showFullDescription ? "" : "line-clamp-3"}`}>
            {product.description}
          </p>
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="flex items-center justify-center mb-4 text-gray-500"
          >
            <ChevronDown
              size={20}
              className={`transition-transform ${showFullDescription ? "rotate-180" : ""}`}
            />
          </button>

          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center text-white bg-orange-500 rounded-full">
              <button
                className="flex items-center justify-center w-10 h-10"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                <Minus size={18} />
              </button>
              <span className="w-10 text-base text-center">{quantity}</span>
              <button
                className="flex items-center justify-center w-10 h-10"
                onClick={() => setQuantity((prev) => prev + 1)}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              className="w-full py-3 text-base font-medium text-white bg-orange-500 rounded-full"
              onClick={handleAddToCart}
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
        <Navbar />
      </div>
    </div>
  )
}

