import { Link, useLocation } from "react-router-dom"
import { Home, Search, ShoppingCart } from 'lucide-react'
import { useCart } from "../context/CartContext"

export default function Navbar() {
  const location = useLocation()
  const { cart } = useCart()

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto bg-white border-t border-gray-200">
      <div className="flex items-center justify-between px-8 py-3 md:px-12 lg:px-20 md:py-4">
        <Link to="/" className={`navbar-icon ${location.pathname === "/" ? "text-red-500" : "text-gray-500"}`}>
          <Home size={24} className="md:w-7 md:h-7 lg:w-8 lg:h-8" />
        </Link>

        <div className="relative -mt-6 md:-mt-8 lg:-mt-10">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-full shadow-lg md:w-16 md:h-16 lg:w-20 lg:h-20 search-button">
            <Search size={20} className="text-white md:w-6 md:h-6 lg:w-8 lg:h-8" />
          </div>
        </div>

        <Link
          to="/cart"
          className={`navbar-icon ${location.pathname.includes("/cart") ? "text-red-500" : "text-gray-500"}`}
        >
          <div className="relative">
            <ShoppingCart size={24} className="md:w-7 md:h-7 lg:w-8 lg:h-8" />
            {totalItems > 0 && (
              <div className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -top-2 -right-2 md:w-6 md:h-6">
                {totalItems}
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}