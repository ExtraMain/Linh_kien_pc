import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "./useCart";
import "../../style/checkout.css";

const Checkout = () => {
  const { cartItems, totalAmount, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Get product data from location state if coming from direct product purchase
  const directProduct = location.state?.product;
  const cartItemsFromRoute = location.state?.products;

  // State for checkout data
  const [finalCartItems, setFinalCartItems] = useState([]);
  const [finalTotalAmount, setFinalTotalAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // Customer information form
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    note: ""
  });

  // Validation states
  const [formErrors, setFormErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Format price with VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Calculate final cart items and total
  useEffect(() => {
    let calculatedCartItems = [];
    let calculatedTotal = 0;

    // If coming from direct product purchase
    if (directProduct) {
      calculatedCartItems.push({
        id_product: directProduct.id,
        ten: directProduct.ten,
        gia: directProduct.gia,
        so_luong: 1,
        danh_muc: directProduct.danh_muc,
        images: directProduct.images?.[0] || "/placeholder.jpg",
      });
      calculatedTotal = directProduct.gia;
    } 
    // If coming from cart page with products in route state
    else if (cartItemsFromRoute && cartItemsFromRoute.length > 0) {
      calculatedCartItems = cartItemsFromRoute;
      calculatedTotal = cartItemsFromRoute.reduce(
        (total, item) => total + (item.gia * item.so_luong), 0
      );
    } 
    // Use cart context data
    else if (cartItems && cartItems.length > 0) {
      calculatedCartItems = cartItems;
      calculatedTotal = totalAmount;
    }
    
    setFinalCartItems(calculatedCartItems);
    setFinalTotalAmount(calculatedTotal);
  }, [directProduct, cartItems, cartItemsFromRoute, totalAmount]);

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    
    if (!customerInfo.fullName.trim()) {
      errors.fullName = "Vui lòng nhập họ và tên";
    }
    
    if (!customerInfo.email.trim()) {
      errors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      errors.email = "Email không hợp lệ";
    }
    
    if (!customerInfo.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^\d{10,11}$/.test(customerInfo.phone.replace(/[^0-9]/g, ""))) {
      errors.phone = "Số điện thoại không hợp lệ";
    }
    
    if (!customerInfo.address.trim()) {
      errors.address = "Vui lòng nhập địa chỉ";
    }
    
    if (!customerInfo.city.trim()) {
      errors.city = "Vui lòng chọn tỉnh/thành phố";
    }
    
    if (!customerInfo.district.trim()) {
      errors.district = "Vui lòng chọn quận/huyện";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setError("");
    try {
      const orderData = {
        cartItems: finalCartItems.map((item) => ({
          id_product: item.id_product,
          ten: item.ten || "Sản phẩm không xác định",
          gia: item.gia,
          so_luong: item.so_luong || 1,
          danh_muc: item.danh_muc || "Linh kiện",
        })),
        customerInfo,
        paymentMethod,
        totalAmount: finalTotalAmount,
        orderDate: new Date().toISOString(),
      };

      const response = await fetch("http://localhost/backend/payments.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        if (paymentMethod === "vnpay" && result.payUrl) {
          window.location.href = result.payUrl; // Redirect to VNPay payment page
        } else {
          clearCart();
          navigate("/thankyou", { state: { orderId: result.orderId } });
        }
      } else {
        setError(result.message || "Có lỗi xảy ra trong quá trình xử lý");
        setIsProcessing(false);
      }
    } catch (err) {
      setError("Có lỗi xảy ra: " + err.message);
      setIsProcessing(false);
    }
  };

  // Calculate shipping cost (simplified)
  const shippingCost = finalTotalAmount > 1000000 ? 0 : 30000;

  // Calculate total with shipping
  const orderTotal = finalTotalAmount + shippingCost;

  return (
    <div className="checkout-page">
      <h2>Thanh Toán</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="checkout-container">
        <div className="checkout-form-container">

        <div className="checkout-summary">
          <h3>Đơn hàng của bạn</h3>
          <div className="cart-summary">
            <div className="cart-items">
              {finalCartItems.length > 0 ? (
                <>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Giá</th>
                        <th>SL</th>
                        <th>Tổng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {finalCartItems.map((item, index) => (
                        <tr key={`${item.id_product}-${index}`} className="cart-item">
                          <td className="item-info">
                            <div className="item-image-name">
                              {item.images && (
                                <img
                                  src={item.images}
                                  alt={item.ten}
                                  className="item-thumbnail"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/placeholder.jpg";
                                  }}
                                />
                              )}
                              <span className="item-name">{item.ten}</span>
                            </div>
                          </td>
                          <td className="item-price">{formatCurrency(item.gia)}</td>
                          <td className="item-quantity">{item.so_luong}</td>
                          <td className="item-total">{formatCurrency(item.gia * item.so_luong)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="cart-totals">
                    <div className="totals-row">
                      <span>Tạm tính:</span>
                      <span>{formatCurrency(finalTotalAmount)}</span>
                    </div>
                    <div className="totals-row">
                      <span>Phí vận chuyển:</span>
                      <span>{shippingCost === 0 ? "Miễn phí" : formatCurrency(shippingCost)}</span>
                    </div>
                    {shippingCost === 0 && (
                      <div className="shipping-note">
                        <small>Miễn phí vận chuyển cho đơn hàng trên 1.000.000₫</small>
                      </div>
                    )}
                    <div className="totals-row grand-total">
                      <span>Tổng thanh toán:</span>
                      <span>{formatCurrency(orderTotal)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="empty-cart-message">Không có sản phẩm nào trong giỏ hàng</p>
              )}
            </div>
          </div>
        </div>
          <form onSubmit={handleSubmit} className="checkout-form">
            <h3>Thông tin giao hàng</h3>

            <div className={`form-group ${formErrors.fullName ? "error" : ""}`}>
              <label htmlFor="fullName">Họ và tên</label>
              <input
                id="fullName"
                type="text"
                placeholder="Nhập họ và tên"
                value={customerInfo.fullName}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, fullName: e.target.value })
                }
                required
              />
              {formErrors.fullName && <div className="error-text">{formErrors.fullName}</div>}
            </div>

            <div className={`form-group ${formErrors.email ? "error" : ""}`}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Nhập địa chỉ email"
                value={customerInfo.email}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, email: e.target.value })
                }
                required
              />
              {formErrors.email && <div className="error-text">{formErrors.email}</div>}
            </div>

            <div className={`form-group ${formErrors.phone ? "error" : ""}`}>
              <label htmlFor="phone">Số điện thoại</label>
              <input
                id="phone"
                type="tel"
                placeholder="Nhập số điện thoại"
                value={customerInfo.phone}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, phone: e.target.value })
                }
                required
              />
              {formErrors.phone && <div className="error-text">{formErrors.phone}</div>}
            </div>

            <div className={`form-group ${formErrors.address ? "error" : ""}`}>
              <label htmlFor="address">Địa chỉ</label>
              <input
                id="address"
                type="text"
                placeholder="Nhập địa chỉ nhận hàng"
                value={customerInfo.address}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, address: e.target.value })
                }
                required
              />
              {formErrors.address && <div className="error-text">{formErrors.address}</div>}
            </div>

            <div className="form-row">
              <div className={`form-group ${formErrors.city ? "error" : ""}`}>
                <label htmlFor="city">Tỉnh/Thành phố</label>
                <select
                  id="city"
                  value={customerInfo.city}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, city: e.target.value })
                  }
                  required
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP HCM">TP HCM</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                </select>
                {formErrors.city && <div className="error-text">{formErrors.city}</div>}
              </div>

              <div className={`form-group ${formErrors.district ? "error" : ""}`}>
                <label htmlFor="district">Quận/Huyện</label>
                <select
                  id="district"
                  value={customerInfo.district}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, district: e.target.value })
                  }
                  required
                >
                  <option value="">Chọn quận/huyện</option>
                  <option value="Quận 1">Quận 1</option>
                  <option value="Quận 2">Quận 2</option>
                  <option value="Quận 3">Quận 3</option>
                  <option value="Quận 4">Quận 4</option>
                  <option value="Quận 5">Quận 5</option>
                </select>
                {formErrors.district && <div className="error-text">{formErrors.district}</div>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="ward">Phường/Xã</label>
              <select
                id="ward"
                value={customerInfo.ward}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, ward: e.target.value })
                }
              >
                <option value="">Chọn phường/xã</option>
                <option value="Phường 1">Phường 1</option>
                <option value="Phường 2">Phường 2</option>
                <option value="Phường 3">Phường 3</option>
                <option value="Phường 4">Phường 4</option>
                <option value="Phường 5">Phường 5</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="note">Ghi chú đơn hàng</label>
              <textarea
                id="note"
                placeholder="Nhập ghi chú nếu có..."
                value={customerInfo.note}
                onChange={(e) =>
                  setCustomerInfo({
                    ...customerInfo,
                    note: e.target.value,
                  })
                }
              />
            </div>

            <h3>Phương thức thanh toán</h3>
            <div className="payment-methods">
              <div className="payment-option">
                <input
                  type="radio"
                  id="cod"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <label htmlFor="cod">
                  <span className="payment-icon">💵</span>
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </label>
              </div>
              <div className="payment-option">
                <input
                  type="radio"
                  id="vnpay"
                  name="payment"
                  value="vnpay"
                  checked={paymentMethod === "vnpay"}
                  onChange={() => setPaymentMethod("vnpay")}
                />
                <label htmlFor="vnpay">
                  <span className="payment-icon">💳</span>
                  <span>VNPay (Thẻ ATM/Visa/Master/JCB)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="checkout-button"
              disabled={isProcessing || finalCartItems.length === 0}
            >
              {isProcessing ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
