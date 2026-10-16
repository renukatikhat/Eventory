
import { useEffect, useState } from "react";
import "./CustomerDashboard.css";

const API_BASE_URL = "https://eventory-backend.onrender.com/api";

const orderStatuses = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
];

function CustomerDashboard({ customer, onBack, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      setOrdersError("");

      const token = localStorage.getItem(
        "eventory-customer-token"
      );

      if (!token) {
        throw new Error("Customer login session not found.");
      }

      const response = await fetch(
        `${API_BASE_URL}/customer/orders`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load orders.");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (error) {
      console.error("Load orders error:", error);
      setOrdersError(error.message || "Failed to load your orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    return `status-${String(status || "placed")
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
  };

  const getStatusStep = (status) => {
    const statusMap = {
      placed: 0,
      pending: 0,
      processing: 1,
      shipped: 2,
      delivered: 3,
    };

    return statusMap[
      String(status || "pending").trim().toLowerCase()
    ] ?? 0;
  };

  const getAddress = (order) => {
    const address = order.customer?.address || "Address unavailable";
    const city = order.customer?.city;
    const pincode = order.customer?.pincode;

    return [
      address,
      city,
      pincode ? `- ${pincode}` : "",
    ].filter(Boolean).join(", ").replace(", -", " -");
  };

  const getSubtotal = (order) => {
    return (order.items || []).reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  };

  const money = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  return (
    <section className="customer-dashboard-page">
      <div className="customer-dashboard">

        <div className="customer-dashboard-top">
          <button type="button" className="dashboard-back" onClick={onBack}>
            ← Continue Shopping
          </button>

          <button type="button" className="dashboard-logout" onClick={onLogout}>
            Logout
          </button>
        </div>

        <div className="customer-welcome">
          <div className="customer-avatar">
            {customer?.name
              ? customer.name.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div>
            <div className="dashboard-eyebrow">MY ACCOUNT</div>
            <h1>Welcome, {customer?.name || "Customer"} 👋</h1>
            <p>Manage your Eventory account and track your gift orders.</p>
          </div>
        </div>

        <div className="customer-info-grid">
          <div className="customer-info-card">
            <span>👤</span>
            <div>
              <small>Full Name</small>
              <strong>{customer?.name || "Not available"}</strong>
            </div>
          </div>

          <div className="customer-info-card">
            <span>📧</span>
            <div>
              <small>Email Address</small>
              <strong>{customer?.email || "Not available"}</strong>
            </div>
          </div>

          <div className="customer-info-card">
            <span>📦</span>
            <div>
              <small>Total Orders</small>
              <strong>{orders.length}</strong>
            </div>
          </div>
        </div>

        <div className="my-orders-section">
          <div className="orders-heading">
            <div>
              <div className="dashboard-eyebrow">ORDER HISTORY</div>
              <h2>My Orders 📦</h2>
              <p>Track the gifts you have ordered from Eventory.</p>
            </div>

            <button
              type="button"
              className="refresh-orders-btn"
              onClick={loadOrders}
              disabled={loadingOrders}
            >
              {loadingOrders ? "Loading..." : "↻ Refresh Orders"}
            </button>
          </div>

          {loadingOrders && (
            <div className="orders-loading">
              <div className="orders-loading-icon">📦</div>
              <h3>Loading your orders...</h3>
              <p>Please wait a moment.</p>
            </div>
          )}

          {!loadingOrders && ordersError && (
            <div className="orders-error">
              <div>⚠️</div>
              <h3>Could not load orders</h3>
              <p>{ordersError}</p>
              <button type="button" onClick={loadOrders}>Try Again</button>
            </div>
          )}

          {!loadingOrders && !ordersError && orders.length === 0 && (
            <div className="orders-empty">
              <div className="orders-empty-icon">🎁</div>
              <h3>No orders yet</h3>
              <p>Your placed orders will appear here.</p>
              <button type="button" onClick={onBack}>
                Start Shopping →
              </button>
            </div>
          )}

          {!loadingOrders && !ordersError && orders.length > 0 && (
            <div className="orders-list">
              {orders.map((order) => {
                const subtotal = getSubtotal(order);
                const total = Number(order.totalAmount || 0);
                const extraCharges = Math.max(0, total - subtotal);
                const currentStep = getStatusStep(order.status);

                return (
                  <article className="order-card" key={order._id}>
                    <div className="order-card-header">
                      <div className="order-id-block">
                        <small>ORDER ID</small>
                        <strong>
                          #{order._id ? order._id.slice(-8).toUpperCase() : "N/A"}
                        </strong>
                      </div>

                      <div className="order-date">
                        <small>ORDER DATE</small>
                        <strong>{formatDate(order.createdAt)}</strong>
                      </div>

                      <span className={`order-status ${getStatusClass(order.status)}`}>
                        {order.status || "Placed"}
                      </span>
                    </div>

                    <div className="order-items">
                      {order.items?.map((item, index) => (
                        <div
                          className="order-item"
                          key={item._id || `${order._id}-${index}`}
                        >
                          {item.image ? (
                            <img src={item.image} alt={item.name || "Gift"} />
                          ) : (
                            <div className="order-item-image-placeholder">🎁</div>
                          )}

                          <div className="order-item-info">
                            <h4>{item.name || "Gift item"}</h4>
                            <p>
                              {money(item.price)} × {item.quantity || 0}
                            </p>
                          </div>

                          <strong className="order-item-total">
                            {money(
                              Number(item.price || 0) *
                              Number(item.quantity || 0)
                            )}
                          </strong>
                        </div>
                      ))}
                    </div>

                    <div className="order-tracking">
                      <h4>Order Tracking</h4>

                      <div className="tracking-steps">
                        {orderStatuses.map((status, index) => {
                          const completed = index <= currentStep;

                          return (
                            <div
                              key={status}
                              className={`tracking-step ${
                                completed ? "completed" : ""
                              }`}
                            >
                              <div className="tracking-circle">
                                {completed ? "✓" : index + 1}
                              </div>
                              <span>{status}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="order-card-footer">
                      <div className="order-delivery-details">
                        <h4>Delivery Address</h4>
                        <p>{getAddress(order)}</p>
                      </div>

                      <div className="order-price-summary">
                        <h4>Order Summary</h4>

                        <div className="price-row">
                          <span>Items subtotal</span>
                          <span>{money(subtotal)}</span>
                        </div>

                        <div className="price-row">
                          <span>Delivery / other charges</span>
                          <span>{money(extraCharges)}</span>
                        </div>

                        <div className="price-row grand-total">
                          <strong>Total Paid</strong>
                          <strong>{money(total)}</strong>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-section-card">
            <div className="section-icon">🎁</div>
            <div>
              <h2>Gift Finder</h2>
              <p>
                Need help choosing a gift? Let Eventory find suitable gifts for you.
              </p>
            </div>
            <button type="button" onClick={onBack}>Find a Gift</button>
          </div>
        </div>

      </div>
    </section>
  );
}

export default CustomerDashboard;
