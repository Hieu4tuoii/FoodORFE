"use client";
// import { QRCodeCanvas } from "qrcode.react"; //

import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import CategoryTabs from "../components/CategoryTabs";
import FoodCard from "../components/FoodCard";

const BASE_URL = "https://api.phimhdchill.com";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [categories, setCategories] = useState([{ id: "all", name: "Tất cả" }]);
  const [foodItems, setFoodItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [showSearchBar, setShowSearchBar] = useState(false); // State to toggle search bar visibilityyyyyyyy

  // Lấy danh sách danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${BASE_URL}/category/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Categories response:", data);

        if (data?.status === 200 && Array.isArray(data.data)) {
          setCategories([
            { id: "all", name: "Tất cả" },
            ...data.data.map((cat) => ({ id: cat.id, name: cat.name })),
          ]);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Không thể tải danh mục. Vui lòng thử lại sau.");
      }
    };

    fetchCategories();
  }, []);

  // Lấy danh sách món ăn theo danh mục
  useEffect(() => {
    const fetchFoodsByCategory = async () => {
      try {
        setLoading(true);
        setError(null);

        const categoryObj = categories.find((cat) => cat.name === activeCategory);
        const categoryId = categoryObj?.id === "all" ? "" : categoryObj?.id;

        const endpoint = categoryId
          ? `${BASE_URL}/food/category/${categoryId}`
          : `${BASE_URL}/food/`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        console.log("Fetched food data:", data);

        if (data?.status === 200 && data.data?.items && Array.isArray(data.data.items)) {
          const formattedFoods = data.data.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.imageUrl || "",
            status: item.status || "UNAVAILABLE",
            available: item.status === "AVAILABLE",
            category: item.categoryId,
          }));
          setFoodItems(formattedFoods);
        } else {
          console.warn("Unexpected API response structure:", data);
          setFoodItems([]);
        }
      } catch (err) {
        console.error("Error fetching foods:", err);
        setError("Không thể tải danh sách món ăn. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchFoodsByCategory();
  }, [activeCategory, categories]);

  // Lọc món ăn theo tìm kiếm
  useEffect(() => {
    let filtered = foodItems;

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [foodItems, searchQuery]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-2 text-xl text-red-500">Lỗi</h2>
          <p>{error}</p>
          <button
            className="px-4 py-2 mt-4 text-white bg-orange-500 rounded-lg"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen pb-20 mx-auto bg-white">
        <div className="p-4 text-xl font-bold text-center md:p-6 md:text-2xl lg:text-3xl">ỨNG DỤNG ĐẶT MÓN ĂN</div>
       {/* <QRCodeCanvas value="https://example.com" size={150} />; */}
        {showSearchBar && (
          <div className="flex justify-center p-4 md:p-6">
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-lg p-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-t-2 border-b-2 border-orange-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />

            <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6 md:gap-6 lg:gap-8 md:p-6">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <FoodCard key={item.id} item={item} addToCart={addToCart} disabled={item.status === "UNAVAILABLE"} />
                ))
              ) : (
                <div className="py-10 text-center text-gray-500 col-span-full">
                  Không có món ăn nào phù hợp
                </div>
              )}
            </div>
          </>
        )}

        <Navbar />

        {/* Search button at the bottom */}
        <div className="fixed transform -translate-x-1/2 bottom-4 left-1/2">
          <button
            onClick={() => setShowSearchBar((prev) => !prev)}
            className="flex items-center justify-center p-5 text-white rounded-full shadow-lg bg-gradient-to-r from-orange-400 to-orange-500"
            style={{
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16" y1="16" x2="20" y2="20" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

