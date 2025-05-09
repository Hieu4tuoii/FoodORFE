"use client"

import { QRCodeCanvas } from "qrcode.react"
import { useState, useEffect } from "react"
const BASE_URL = "https://api.phimhdchill.com"
const DOMAIN_URL = "http://localhost:3000"

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("tables")
  const [selectedTable, setSelectedTable] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleTableSelect = (table) => {
    console.log("Selected table:", table)
    setSelectedTable(table)
    setActiveTab("orders")
    setIsMobileMenuOpen(false) // Close mobile menu when selecting a table
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 md:flex-row">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 text-white bg-blue-600 md:hidden">
        <h1 className="text-xl font-bold">Quản lý nhà hàng</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded hover:bg-blue-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar - Hidden on mobile unless menu is open */}
      <div
        className={`${isMobileMenuOpen ? "block" : "hidden"} md:block md:w-1/4 lg:w-1/5 bg-blue-600 text-white flex flex-col p-4 z-10 ${isMobileMenuOpen ? "fixed inset-0 pt-16" : ""}`}
      >
        <div className="hidden mb-6 md:block">
          <h1 className="text-xl font-bold">Quản lý nhà hàng</h1>
        </div>
        <button
          className={`py-3 px-4 mb-2 rounded ${activeTab === "tables" ? "bg-blue-800" : "hover:bg-blue-700"}`}
          onClick={() => {
            setActiveTab("tables")
            setIsMobileMenuOpen(false)
          }}
        >
          Quản lý bàn
        </button>
        <button
          className={`py-3 px-4 mb-2 rounded ${activeTab === "dishes" ? "bg-blue-800" : "hover:bg-blue-700"}`}
          onClick={() => {
            setActiveTab("dishes")
            setIsMobileMenuOpen(false)
          }}
        >
          Quản lý món ăn
        </button>
        <button
          className={`py-3 px-4 mb-2 rounded ${activeTab === "orders" ? "bg-blue-800" : "hover:bg-blue-700"}`}
          onClick={() => {
            setActiveTab("orders")
            setIsMobileMenuOpen(false)
          }}
        >
          Đặt món
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto bg-white md:p-6">
        {activeTab === "tables" && <TablesManagement onTableSelect={handleTableSelect} />}
        {activeTab === "dishes" && <DishesManagement />}
        {activeTab === "orders" && <OrdersManagement selectedTable={selectedTable} />}
      </div>
    </div>
  )
}

const TablesManagement = ({ onTableSelect }) => {
  const [tables, setTables] = useState([]) // Ensure initial state is an array
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTableName, setNewTableName] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const fetchTables = async () => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(`${BASE_URL}/dining-tables/`)
      if (response.ok) {
        const responseData = await response.json()
        console.log("API response:", responseData) // Debug log

        // Check if the response has the expected structure
        if (responseData && typeof responseData.status !== "undefined") {
          // Check if message contains "success" or similar words
          const isSuccessMessage =
            responseData.message &&
            (responseData.message.toLowerCase().includes("success") ||
              responseData.message.toLowerCase().includes("successfully"))

          if (responseData.status === 0 || isSuccessMessage) {
            // Success status
            // If there's a success message, display it
            if (responseData.message) {
              setSuccessMessage(responseData.message)
            }

            // Parse the data field which might be a JSON string or empty
            let tablesData = []

            if (responseData.data) {
              try {
                // Try to parse if it's a JSON string
                if (typeof responseData.data === "string") {
                  tablesData = JSON.parse(responseData.data)
                } else if (Array.isArray(responseData.data)) {
                  tablesData = responseData.data
                } else if (typeof responseData.data === "object") {
                  // If data is an object but not an array, it might be a single table
                  tablesData = [responseData.data]
                }
              } catch (parseError) {
                console.error("Error parsing tables data:", parseError)
                // Don't set error, just log it and continue with empty array
              }
            }

            // If we have a success message but no data, we might need to fetch again
            if (isSuccessMessage && (!tablesData || tablesData.length === 0)) {
              console.log("Success message received but no data, will try to fetch again")
              setTimeout(fetchTables, 1000) // Try again after 1 second
            } else {
              // Ensure tablesData is an array
              if (Array.isArray(tablesData)) {
                setTables(tablesData)
              } else {
                console.error("Tables data is not an array:", tablesData)
                setTables([])
              }
            }
          } else {
            // API returned an error status
            console.error("API error:", responseData.message)
            setError(responseData.message || "Lỗi từ máy chủ")
            setTables([])
          }
        } else {
          // Direct array response (fallback to previous behavior)
          if (Array.isArray(responseData)) {
            setTables(responseData)
          } else {
            console.error("Unexpected API response format:", responseData)
            setError("Định dạng dữ liệu không hợp lệ")
            setTables([])
          }
        }
      } else {
        console.error("Failed to fetch tables, status:", response.status)
        setError("Không thể tải dữ liệu bàn")
      }
    } catch (error) {
      console.error("Error fetching tables:", error)
      setError("Lỗi kết nối đến máy chủ")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(fetchTables, 30000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  const handleAddTable = async () => {
    if (!newTableName.trim()) return

    try {
      const response = await fetch(`${BASE_URL}/dining-tables/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTableName,
          status: "EMPTY", // Set default status for new table
        }),
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log("Add table response:", responseData) // Debug log

        if (responseData && typeof responseData.status !== "undefined") {
          // Check if message contains "success" or similar words
          const isSuccessMessage =
            responseData.message &&
            (responseData.message.toLowerCase().includes("success") ||
              responseData.message.toLowerCase().includes("successfully"))

          if (responseData.status === 0 || isSuccessMessage) {
            // Success status
            setNewTableName("")
            setIsModalOpen(false)
            setSuccessMessage(responseData.message || "Thêm bàn thành công")
            // Refresh the table list to ensure we have the latest data
            setTimeout(fetchTables, 500)
          } else {
            // API returned an error status
            console.error("API error when adding table:", responseData.message)
            alert(responseData.message || "Không thể thêm bàn. Vui lòng thử lại sau.")
          }
        } else {
          // Direct response (fallback to previous behavior)
          setTables((prevTables) => [...prevTables, responseData])
          setNewTableName("")
          setIsModalOpen(false)
          setSuccessMessage("Thêm bàn thành công")
          setTimeout(fetchTables, 500)
        }
      } else {
        const errorData = await response.text()
        console.error("Failed to add table:", errorData)
        alert("Không thể thêm bàn. Vui lòng thử lại sau.")
      }
    } catch (error) {
      console.error("Error adding table:", error)
      alert("Lỗi kết nối. Vui lòng thử lại sau.")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "EMPTY":
        return "bg-gray-400"
      case "ORDERING":
        return "bg-yellow-500"
      case "BOOKED":
        return "bg-blue-500"
      default:
        return "bg-gray-300"
    }
  }

  if (loading && tables.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">Đang tải dữ liệu...</div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold md:text-2xl">Quản lý bàn</h2>

      {/* Success or Error Message */}
      {successMessage && (
        <div className="flex flex-col items-center justify-center p-3 mb-4 rounded md:flex-row bg-green-50">
          <div className="mb-2 font-medium text-center text-green-600 md:text-left md:mb-0">{successMessage}</div>
          <button
            className="px-3 py-1 ml-0 text-sm text-white bg-blue-600 rounded md:ml-4"
            onClick={() => setSuccessMessage(null)}
          >
            Đóng
          </button>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center p-3 mb-4 rounded md:flex-row bg-red-50">
          <div className="mb-2 font-medium text-center text-red-600 md:text-left md:mb-0">{error}</div>
          <button className="px-3 py-1 ml-0 text-sm text-white bg-blue-600 rounded md:ml-4" onClick={fetchTables}>
            Thử lại
          </button>
        </div>
      )}

      <button
        className="w-full px-4 py-2 mb-4 text-white bg-blue-600 rounded md:w-auto"
        onClick={() => setIsModalOpen(true)}
      >
        Thêm bàn
      </button>

      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm md:gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 bg-gray-400"></div>
          <span>Bàn trống</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 bg-blue-500"></div>
          <span>Bàn đã đặt</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 bg-yellow-500"></div>
          <span>Bàn đang gọi món</span>
        </div>
      </div>

      {tables.length === 0 ? (
        <div className="py-8 text-center text-gray-500">Chưa có bàn nào. Hãy thêm bàn mới.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {tables.map((table, index) => (
            <div
              key={table.id || index}
              className="overflow-hidden transition-shadow border border-gray-300 rounded-md shadow-sm cursor-pointer hover:shadow-md"
              onClick={() => {
                console.log("Clicking on table:", table)
                onTableSelect(table)
              }}
            >
              <div
                className={`w-full relative h-24 md:h-32 flex flex-col items-center justify-center text-white font-bold ${getStatusColor(table.status)}`}
              >
                <div className="mb-1 md:mb-2">
                  {table.status === "EMPTY" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="md:w-8 md:h-8"
                    >
                      <rect x="4" y="8" width="16" height="9" rx="1" />
                      <path d="M8 8v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  )}
                  {table.status === "BOOKED" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="md:w-8 md:h-8"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  )}
                  {table.status === "ORDERING" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="md:w-8 md:h-8"
                    >
                      <path d="M17 8h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2v4a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-4H8v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4H3a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2h-4z" />
                    </svg>
                  )}
                </div>
                <div className="text-base font-bold md:text-lg">{table.name || `Bàn ${table.id || index + 1}`}</div>
                <div className="mt-1 text-xs md:mt-2 md:text-sm">Nhấn để xem đơn hàng</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-4 bg-white rounded shadow-md md:p-6">
            <h3 className="mb-4 text-lg font-bold md:text-xl">Thêm bàn mới</h3>
            <input
              type="text"
              className="w-full p-2 mb-4 border"
              placeholder="Tên bàn"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleAddTable()
              }}
            />
            <div className="flex justify-end">
              <button className="px-4 py-2 mr-2 text-black bg-gray-300 rounded" onClick={() => setIsModalOpen(false)}>
                Hủy
              </button>
              <button className="px-4 py-2 text-white bg-blue-600 rounded" onClick={handleAddTable}>
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const DishesManagement = () => (
  <div>
    <h2 className="mb-4 text-xl font-bold md:text-2xl">Quản lý món ăn</h2>
    {/* Add dish management functionality here */}
    <p>Chức năng quản lý món ăn sẽ được thêm vào đây.</p>
  </div>
)

const OrdersManagement = ({ selectedTable }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)
  const [expandedOrderId, setExpandedOrderId] = useState(null)

  // Toggle order details expansion for mobile view
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId)
  }

  // Hàm để tạo dữ liệu mẫu cho việc kiểm tra giao diện
  const createMockData = () => {
    return [
      {
        id: 1,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        orderDetail: [
          {
            id: 1,
            food: { name: "Món 1", id: 1, price: 50000 },
            quantity: 2,
            status: "PENDING",
          },
          {
            id: 2,
            food: { name: "Món 2", id: 2, price: 45000 },
            quantity: 1,
            status: "PENDING",
          },
          {
            id: 3,
            food: { name: "Món 3", id: 3, price: 35000 },
            quantity: 3,
            status: "PENDING",
          },
        ],
        totalPrice: 250000,
      },
    ]
  }

  useEffect(() => {
    const fetchOrders = async () => {
      if (!selectedTable) {
        return
      }

      // Kiểm tra ID bàn
      if (!selectedTable.id) {
        setError("ID bàn không hợp lệ")
        return
      }

      setLoading(true)
      setError(null)
      setDebugInfo(null)

      try {
        console.log(`Fetching orders for table ID: ${selectedTable.id}`)

        // Tạo URL API
        const apiUrl = `${BASE_URL}/order/diningTable/${selectedTable.id}`
        console.log("API URL:", apiUrl)

        // Gọi API
        const response = await fetch(apiUrl)

        // Lấy dữ liệu thô để debug
        const responseText = await response.text()
        console.log("Raw API response:", responseText)
        setDebugInfo({
          url: apiUrl,
          rawResponse: responseText,
        })

        // Kiểm tra dữ liệu trống
        if (!responseText || responseText.trim() === "") {
          setError("API trả về dữ liệu trống")
          setOrders([])
          setLoading(false)
          return
        }

        // Parse JSON
        let responseData
        try {
          responseData = JSON.parse(responseText)
        } catch (e) {
          console.error("Failed to parse JSON response:", e)
          setError(`Lỗi định dạng dữ liệu từ API: ${e.message}`)
          setLoading(false)
          return
        }

        console.log("Parsed API response:", responseData)

        // Xử lý dữ liệu
        let ordersData = []

        if (responseData) {
          // Kiểm tra cấu trúc phản hồi
          if (responseData.status === 200 && responseData.data) {
            // Trường hợp 1: Phản hồi chuẩn với status=200 và data
            if (typeof responseData.data === "string") {
              try {
                ordersData = JSON.parse(responseData.data)
              } catch (e) {
                console.error("Error parsing data string:", e)
              }
            } else if (Array.isArray(responseData.data)) {
              ordersData = responseData.data
            } else if (typeof responseData.data === "object") {
              ordersData = [responseData.data]
            }
          } else if (Array.isArray(responseData)) {
            // Trường hợp 2: Phản hồi là mảng trực tiếp
            ordersData = responseData
          } else if (typeof responseData === "object" && !responseData.status) {
            // Trường hợp 3: Phản hồi là đối tượng đơn lẻ
            ordersData = [responseData]
          } else if (responseData.status !== 200) {
            // Trường hợp 4: Lỗi từ API
            setError(responseData.message || "Không thể tải đơn hàng")
            setOrders([])
            setLoading(false)
            return
          }
        }

        console.log("Processed orders data:", ordersData)

        // Kiểm tra dữ liệu sau khi xử lý
        if (Array.isArray(ordersData) && ordersData.length > 0) {
          // Không cần chuẩn hóa dữ liệu nữa, sử dụng cấu trúc API trả về
          setOrders(ordersData)
        } else {
          // Không có đơn hàng
          setOrders([])
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        setError(`Lỗi kết nối đến máy chủ: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [selectedTable])

  const handleUpdateOrderDetailStatus = async (orderId, orderDetailId, newStatus) => {
    // Kiểm tra ID hợp lệ
    if (!orderDetailId) {
      console.error("orderDetailId is null or undefined:", orderDetailId)
      setError("ID chi tiết đơn hàng không hợp lệ")
      return
    }

    setLoading(true)
    try {
      console.log("Updating order detail status:", { orderDetailId, status: newStatus })

      // Tạo URL API - Đúng theo API Controller
      const apiUrl = `${BASE_URL}/order/orderDetail/changeStatus`
      console.log("API URL for update:", apiUrl)

      // Ghi log body request để debug
      const requestBody = {
        id: orderDetailId,
        status: newStatus,
      }
      console.log("Request body:", JSON.stringify(requestBody))

      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const responseText = await response.text()
      console.log("Update response:", responseText)

      // Show appropriate notification based on status
      let notificationMessage = ""
      let notificationColor = "bg-green-500"

      if (newStatus === "CANCELLED") {
        notificationMessage = "Hủy thành công"
        notificationColor = "bg-red-500"
      } else if (newStatus === "DELIVERED") {
        notificationMessage = "Xác nhận đã giao thành công"
      }

      // Create and show notification
      const notification = document.createElement("div")
      notification.className = `fixed top-4 right-4 ${notificationColor} text-white p-3 rounded shadow-lg z-50 max-w-xs md:max-w-md`
      notification.innerHTML = `
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${newStatus === "CANCELLED" ? "M6 18L18 6M6 6l12 12" : "M5 13l4 4L19 7"}" />
          </svg>
          <span class="text-sm md:text-base">${notificationMessage}</span>
        </div>
      `
      document.body.appendChild(notification)

      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.classList.add("opacity-0", "transition-opacity", "duration-500")
        setTimeout(() => {
          document.body.removeChild(notification)
        }, 500)
      }, 3000)

      // Update state and continue with existing logic
      const updatedOrders = orders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            orderDetail: order.orderDetail.map((detail) => {
              if (detail.id === orderDetailId) {
                return { ...detail, status: newStatus }
              }
              return detail
            }),
          }
        }
        return order
      })

      setOrders(updatedOrders)

      // Refresh data from API
      setTimeout(() => {
        const apiUrl = `${BASE_URL}/order/diningTable/${selectedTable.id}`
        fetch(apiUrl)
          .then((response) => response.json())
          .then((data) => {
            if (data && Array.isArray(data.data)) {
              setOrders(data.data)
            } else if (data && typeof data === "object" && !data.status) {
              // Trường hợp API trả về đối tượng đơn lẻ
              setOrders([data])
            }
          })
          .catch((err) => {
            console.error("Error refreshing after update:", err)
          })
      }, 1000)
    } catch (error) {
      console.error("Error updating order detail:", error)
      setError(`Lỗi kết nối: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    // Kiểm tra ID hợp lệ
    if (!orderId) {
      console.error("orderId is null or undefined:", orderId)
      setError("ID đơn hàng không hợp lệ")
      return
    }

    setLoading(true)
    try {
      console.log("Updating order status:", { orderId, status: newStatus })

      // Tạo URL API - Đúng theo API Controller
      const apiUrl = `${BASE_URL}/order/changeStatus`
      console.log("API URL for update:", apiUrl)

      // Ghi log body request để debug
      const requestBody = {
        id: orderId,
        status: newStatus,
      }
      console.log("Request body:", JSON.stringify(requestBody))

      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const responseText = await response.text()
      console.log("Update order response:", responseText)

      // Create notification message based on status
      let notificationMessage = "Cập nhật trạng thái thành công"
      if (newStatus === "DELIVERED") {
        notificationMessage = "Cập nhật trạng thái thành công"
      }

      // Show notification
      const notification = document.createElement("div")
      notification.className =
        "fixed z-50 max-w-xs p-3 text-white bg-green-500 rounded shadow-lg top-4 right-4 md:max-w-md"
      notification.innerHTML = `
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="text-sm md:text-base">${notificationMessage}</span>
        </div>
    `
      document.body.appendChild(notification)

      // Remove the notification after 3 seconds with fade effect
      setTimeout(() => {
        notification.classList.add("opacity-0", "transition-opacity", "duration-500")
        setTimeout(() => {
          document.body.removeChild(notification)
        }, 500)
      }, 3000)

      // Update local state
      const updatedOrders = orders.map((o) => {
        if (o.id === orderId) {
          return { ...o, status: newStatus }
        }
        return o
      })
      setOrders(updatedOrders)

      // Refresh data from API
      setTimeout(() => {
        const apiUrl = `${BASE_URL}/order/diningTable/${selectedTable.id}`
        fetch(apiUrl)
          .then((response) => response.json())
          .then((data) => {
            if (data && data.status === 200 && Array.isArray(data.data)) {
              setOrders(data.data)
            } else if (data && typeof data === "object" && !data.status) {
              setOrders([data])
            }
          })
          .catch((err) => {
            console.error("Error refreshing after update:", err)
          })
      }, 1000)
    } catch (error) {
      console.error("Error updating order status:", error)
      setError(`Lỗi kết nối: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const updateAllDetails = async (order) => {
    setLoading(true)
    try {
      // Lọc ra các chi tiết có ID hợp lệ
      const validDetails = order.orderDetail.filter((detail) => detail.id)

      if (validDetails.length === 0) {
        setError("Không có chi tiết đơn hàng nào có ID hợp lệ")
        setLoading(false)
        return
      }

      console.log(
        "Updating all order details:",
        validDetails.map((d) => d.id),
      )

      // Create an array of promises for all update requests
      const updatePromises = validDetails.map((detail) => {
        const requestBody = {
          id: detail.id,
          status: "DELIVERED",
        }
        console.log("Request body for detail", detail.id, ":", JSON.stringify(requestBody))

        return fetch(`${BASE_URL}/order/orderDetail/changeStatus`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }).then((res) =>
          res.text().then((text) => {
            console.log(`Response for detail ${detail.id}:`, text)
            try {
              return JSON.parse(text)
            } catch (e) {
              console.error(`Error parsing response for detail ${detail.id}:`, e)
              return { status: -1, message: e.message }
            }
          }),
        )
      })

      // Show notification for bulk action
      const notification = document.createElement("div")
      notification.className =
        "fixed z-50 max-w-xs p-3 text-white bg-green-500 rounded shadow-lg top-4 right-4 md:max-w-md"
      notification.innerHTML = `
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="text-sm md:text-base">Xác nhận giao toàn bộ thành công</span>
        </div>
    `
      document.body.appendChild(notification)

      // Remove the notification after 3 seconds
      setTimeout(() => {
        notification.classList.add("opacity-0", "transition-opacity", "duration-500")
        setTimeout(() => {
          document.body.removeChild(notification)
        }, 500)
      }, 3000)

      // Update local state
      const updatedOrders = orders.map((o) => {
        if (o.id === order.id) {
          return {
            ...o,
            orderDetail: o.orderDetail.map((detail) => ({
              ...detail,
              status: "DELIVERED",
            })),
          }
        }
        return o
      })
      setOrders(updatedOrders)

      // Wait for all updates to complete
      Promise.all(updatePromises)
        .then((results) => {
          console.log("All update results:", results)

          // Check if any updates failed
          const failures = results.filter((r) => r && r.status !== 0 && r.status !== 200)
          if (failures.length > 0) {
            console.error("Some updates failed:", failures)
          }
        })
        .catch((error) => {
          console.error("Error in batch update:", error)
        })

      // Refresh data from API
      setTimeout(() => {
        const apiUrl = `${BASE_URL}/order/diningTable/${selectedTable.id}`
        fetch(apiUrl)
          .then((response) => response.json())
          .then((data) => {
            if (data && Array.isArray(data.data)) {
              setOrders(data.data)
            } else if (data && typeof data === "object" && !data.status) {
              // Trường hợp API trả về đối tượng đơn lẻ
              setOrders([data])
            }
          })
          .catch((err) => {
            console.error("Error refreshing after update:", err)
          })
      }, 1000)
    } catch (error) {
      console.error("Error updating all details:", error)
      setError(`Lỗi kết nối: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!selectedTable) {
    return (
      <div className="py-8 text-center">
        <h2 className="mb-4 text-xl font-bold md:text-2xl">Đặt món</h2>
        <p className="text-gray-500">Vui lòng chọn một bàn để xem đơn hàng.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 mb-4 border-b-2 border-blue-500 rounded-full animate-spin md:h-12 md:w-12"></div>
        <div className="text-lg md:text-xl">Đang tải dữ liệu đơn hàng...</div>
        <div className="mt-2 text-xs text-gray-500 md:text-sm">Đang kết nối đến bàn {selectedTable.id}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-4">
        <h2 className="mb-4 text-xl font-bold md:text-2xl">
          Đơn hàng - {selectedTable.name || `Bàn ${selectedTable.id}`}
        </h2>
        <div className="max-w-lg mb-4 font-medium text-center text-red-600">
          <p>{error}</p>
          <p className="mt-2 text-sm">Bàn ID: {selectedTable.id || "Không có ID"}</p>
          {debugInfo && (
            <div className="p-2 mt-4 overflow-auto text-xs text-left bg-gray-100 rounded max-h-40">
              <p>API URL: {debugInfo.url}</p>
              <p className="mt-1">Phản hồi thô:</p>
              <pre className="mt-1 text-xs whitespace-pre-wrap">{debugInfo.rawResponse}</pre>
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <button
            className="px-4 py-2 text-white bg-blue-600 rounded"
            onClick={() => {
              setError(null)
              setLoading(true)
              // Thử lại việc tải dữ liệu
              setTimeout(() => {
                const apiUrl = `${BASE_URL}/order/diningTable/${selectedTable.id}`
                fetch(apiUrl)
                  .then((response) => response.text())
                  .then((text) => {
                    console.log("Raw response:", text)
                    try {
                      if (!text || text.trim() === "") {
                        throw new Error("API trả về dữ liệu trống")
                      }

                      const data = JSON.parse(text)
                      console.log("Parsed response:", data)

                      // Xử lý dữ liệu
                      if (data && data.status === 200 && Array.isArray(data.data)) {
                        setOrders(data.data)
                        setError(null)
                      } else {
                        setOrders([])
                      }

                      setLoading(false)
                    } catch (e) {
                      console.error("Error processing response:", e)
                      setError(`Lỗi xử lý dữ liệu: ${e.message}`)
                      setLoading(false)
                    }
                  })
                  .catch((err) => {
                    console.error("Fetch error:", err)
                    setError(`Lỗi kết nối: ${err.message}`)
                    setLoading(false)
                  })
              }, 500)
            }}
          >
            Thử lại
          </button>
          <button
            className="px-4 py-2 text-white bg-gray-500 rounded"
            onClick={() => {
              // Sử dụng dữ liệu mẫu
              console.log("Using mock data")
              setOrders(createMockData())
              setError(null)
            }}
          >
            Dùng dữ liệu mẫu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col items-start justify-between mb-4 md:flex-row md:items-center md:mb-6">
        <h2 className="mb-2 text-xl font-bold md:text-2xl md:mb-0">
          Đơn hàng - {selectedTable.name || `Bàn ${selectedTable.id}`}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLoading(true)
              setError(null)

              // Làm mới dữ liệu
              setTimeout(() => {
                const apiUrl = `${BASE_URL}/order/diningTable/${selectedTable.id}`
                fetch(apiUrl)
                  .then((response) => response.json())
                  .then((data) => {
                    try {
                      if (data && data.status === 200 && Array.isArray(data.data)) {
                        setOrders(data.data)
                        setError(null)
                      } else {
                        setOrders([])
                      }
                      setLoading(false)
                    } catch (e) {
                      console.error("Error refreshing data:", e)
                      setError(`Lỗi làm mới dữ liệu: ${e.message}`)
                      setLoading(false)
                    }
                  })
                  .catch((err) => {
                    console.error("Refresh error:", err)
                    setError(`Lỗi kết nối khi làm mới: ${err.message}`)
                    setLoading(false)
                  })
              }, 500)
            }}
            className="flex items-center gap-1 px-3 py-1 text-white bg-blue-500 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden sm:inline">Làm mới</span>
          </button>
          <div className={`px-3 py-1 rounded text-white text-sm ${getStatusBadgeColor(selectedTable.status)}`}>
            {getStatusText(selectedTable.status)}
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="py-8 text-center rounded-lg bg-gray-50">
          <p className="text-gray-500">Bàn này chưa có đơn hàng nào.</p>
          <QRCodeCanvas className="mx-auto" value={`${DOMAIN_URL}/${selectedTable?selectedTable.id:""}`} size={300} />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div key={order.id || index} className="overflow-hidden border rounded-lg shadow-sm">
              {/* Order Header - Always visible */}
              <div
                className="flex items-center justify-between p-3 bg-gray-100 cursor-pointer md:p-4"
                onClick={() => toggleOrderExpansion(order.id)}
              >
                <div>
                  <h3 className="text-base font-bold md:text-lg">Đơn hàng #{order.id || index + 1}</h3>
                  <p className="text-xs text-gray-600 md:text-sm">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Không có thời gian"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 rounded text-white text-xs ${getOrderStatusBadgeColor(order.status)}`}>
                    {getOrderStatusText(order.status)}
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-transform duration-200 ${expandedOrderId === order.id ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Order Details - Expandable on mobile */}
              <div className={`${expandedOrderId === order.id || "hidden md:block"}`}>
                <div className="p-3 md:p-4">
                  <h4 className="mb-2 text-sm font-semibold md:text-base">Chi tiết đơn hàng:</h4>
                  {order.orderDetail && order.orderDetail.length > 0 ? (
                    <div>
                      {/* Mobile-friendly order details card */}
                      <div className="p-3 mb-4 text-white bg-gray-800 rounded-lg md:p-4">
                        {order.orderDetail.map((detail, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col py-2 border-b border-gray-700 sm:flex-row sm:items-center sm:justify-between last:border-0"
                          >
                            <div className="flex items-center mb-2 sm:mb-0">
                              <span className="text-sm font-medium md:text-base">
                                {detail.food?.name || `Món ${idx + 1}`}
                              </span>
                              <span className="ml-2 text-xs text-gray-300 md:text-sm">x{detail.quantity || 0}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="mr-2 text-sm md:text-base">
                                {formatCurrency(detail.food?.price || 0)}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  className="px-2 py-1 text-xs text-white bg-gray-700 rounded hover:bg-gray-600 md:px-3 md:text-sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (!detail.id) {
                                      console.error("orderDetailId is null or undefined")
                                      setError("ID chi tiết đơn hàng không hợp lệ")
                                      return
                                    }
                                    handleUpdateOrderDetailStatus(order.id, detail.id, "CANCELLED")
                                  }}
                                >
                                  Hủy
                                </button>
                                <button
                                  className="px-2 py-1 text-xs text-gray-800 bg-gray-100 rounded hover:bg-white md:px-3 md:text-sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (!detail.id) {
                                      console.error("orderDetailId is null or undefined")
                                      setError("ID chi tiết đơn hàng không hợp lệ")
                                      return
                                    }
                                    handleUpdateOrderDetailStatus(order.id, detail.id, "DELIVERED")
                                  }}
                                >
                                  Xác nhận đã giao
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-end pt-2 mt-4 border-t border-gray-700">
                          <button
                            className="px-3 py-1 text-xs text-gray-800 bg-gray-100 rounded hover:bg-white md:py-2 md:px-4 md:text-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              updateAllDetails(order)
                            }}
                          >
                            Xác nhận giao toàn bộ
                          </button>
                        </div>
                      </div>

                      {/* Responsive table - Hidden on small screens */}
                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="p-2 text-left border">Món</th>
                              <th className="p-2 text-center border">Số lượng</th>
                              <th className="p-2 text-right border">Đơn giá</th>
                              <th className="p-2 text-right border">Thành tiền</th>
                              <th className="p-2 text-center border">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.orderDetail.map((detail, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="p-2 border">{detail.food?.name || `Món ${idx + 1}`}</td>
                                <td className="p-2 text-center border">{detail.quantity || 0}</td>
                                <td className="p-2 text-right border">{formatCurrency(detail.food?.price || 0)}</td>
                                <td className="p-2 text-right border">
                                  {formatCurrency((detail.food?.price || 0) * (detail.quantity || 0))}
                                </td>
                                <td className="p-2 text-center border">
                                  <span
                                    className={`px-2 py-1 rounded text-xs text-white ${getOrderDetailStatusColor(detail.status || "PENDING")}`}
                                  >
                                    {getOrderDetailStatusText(detail.status || "PENDING")}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="font-bold bg-gray-100">
                              <td colSpan="3" className="p-2 text-right border">
                                Tổng cộng:
                              </td>
                              <td className="p-2 text-right border">
                                {formatCurrency(order.totalPrice || calculateOrderTotal(order))}
                              </td>
                              <td className="p-2 border"></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Mobile list view - Visible only on small screens */}
                      <div className="mt-4 md:hidden">
                        <div className="p-3 rounded-lg bg-gray-50">
                          <div className="flex justify-between mb-2 text-sm font-bold">
                            <span>Tổng cộng:</span>
                            <span>{formatCurrency(order.totalPrice || calculateOrderTotal(order))}</span>
                          </div>
                          {order.orderDetail.map((detail, idx) => (
                            <div key={idx} className="pt-2 mt-2 border-t">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">{detail.food?.name || `Món ${idx + 1}`}</span>
                                <span className="text-sm">
                                  {formatCurrency(detail.food?.price || 0)} x {detail.quantity || 0}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span
                                  className={`px-2 py-0.5 rounded text-xs text-white ${getOrderDetailStatusColor(detail.status || "PENDING")}`}
                                >
                                  {getOrderDetailStatusText(detail.status || "PENDING")}
                                </span>
                                <span className="text-sm font-medium">
                                  {formatCurrency((detail.food?.price || 0) * (detail.quantity || 0))}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center bg-gray-100 rounded-lg">
                      <p className="text-sm text-gray-500">Không có chi tiết đơn hàng.</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end p-3 bg-gray-50 md:p-4">
                  <button
                    className="px-3 py-1 text-sm text-white bg-green-500 rounded md:text-base"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUpdateOrderStatus(order.id, "DELIVERED")
                    }}
                  >
                    Cập nhật
                  </button>
                </div>
              </div>
            </div>
          ))}
          <QRCodeCanvas className="mx-auto" value="https://example.com" size={300} />
        </div>
      )}
    </div>
  )
}

// Helper functions
const getStatusBadgeColor = (status) => {
  switch (status) {
    case "EMPTY":
      return "bg-gray-400"
    case "BOOKED":
      return "bg-blue-500"
    case "ORDERING":
      return "bg-yellow-500"
    default:
      return "bg-gray-500"
  }
}

const getStatusText = (status) => {
  switch (status) {
    case "EMPTY":
      return "Bàn trống"
    case "BOOKED":
      return "Đã đặt"
    case "ORDERING":
      return "Đang gọi món"
    default:
      return "Không xác định"
  }
}

const getOrderStatusBadgeColor = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-500"
    case "PROCESSING":
      return "bg-blue-500"
    case "COMPLETED":
      return "bg-green-500"
    case "CANCELLED":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

const getOrderStatusText = (status) => {
  switch (status) {
    case "PENDING":
      return "Chờ xử lý"
    case "PROCESSING":
      return "Đang xử lý"
    case "COMPLETED":
      return "Hoàn thành"
    case "CANCELLED":
      return "Đã hủy"
    default:
      return status || "Không xác định"
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
}

const calculateOrderTotal = (order) => {
  if (!order.orderDetail || !Array.isArray(order.orderDetail)) {
    return 0
  }

  return order.orderDetail.reduce((total, detail) => {
    const price = detail.food?.price || 0
    const quantity = detail.quantity || 0
    return total + price * quantity
  }, 0)
}

const getOrderDetailStatusColor = (status) => {
  switch (status) {
    case "DELIVERED":
      return "bg-green-500"
    case "CANCELLED":
      return "bg-red-500"
    case "PENDING":
    default:
      return "bg-yellow-500"
  }
}

const getOrderDetailStatusText = (status) => {
  switch (status) {
    case "DELIVERED":
      return "Đã giao"
    case "CANCELLED":
      return "Đã hủy"
    case "PENDING":
    default:
      return "Chờ xử lý"
  }
}

export default AdminPage

