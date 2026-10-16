import { useEffect, useState } from "react";
import "./CustomerDashboard.css";

const API_BASE_URL = "http://127.0.0.1:5000/api";

function CustomerDashboard({
  customer,
  onBack,
  onLogout,
}) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  // ==========================================
  // LOAD CUSTOMER ORDERS
  // ==========================================

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      setOrdersError("");

      const token = localStorage.getItem(
        "eventory-customer-token"
      );

      if (!token) {
        throw new Error(
          "Customer login session not found."
        );
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
        throw new Error(
          data.message ||
            "Failed to load orders."
        );
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );
    } catch (error) {
      console.error(
        "Load orders error:",
        error
      );

      setOrdersError(
        error.message ||
          "Failed to load your orders."
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  // ==========================================
  // LOAD ORDERS WHEN DASHBOARD OPENS
  // ==========================================

  useEffect(() => {
    loadOrders();
  }, []);

  // ==========================================
  // ORDER DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // ORDER STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    if (!status) {
      return "status-default";
    }

    return `status-${status
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
  };

  return (
    <section className="customer-dashboard-page">
      <div className="customer-dashboard">

        {/* ================================= */}
        {/* TOP BAR */}
        {/* ================================= */}

        <div className="customer-dashboard-top">
          <button
            type="button"
            className="dashboard-back"
            onClick={onBack}
          >
            ← Continue Shopping
          </button>

          <button
            type="button"
            className="dashboard-logout"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>

        {/* ================================= */}
        {/* WELCOME */}
        {/* ================================= */}

        <div className="customer-welcome">
          <div className="customer-avatar">
            {customer?.name
              ? customer.name
                  .charAt(0)
                  .toUpperCase()
              : "U"}
          </div>

          <div>
            <div className="dashboard-eyebrow">
              MY ACCOUNT
            </div>

            <h1>
              Welcome,{" "}
              {customer?.name || "Customer"} 👋
            </h1>

            <p>
              Manage your Eventory account
              and track your gift orders.
            </p>
          </div>
        </div>

        {/* ================================= */}
        {/* CUSTOMER INFORMATION */}
        {/* ================================= */}

        <div className="customer-info-grid">

          <div className="customer-info-card">
            <span>👤</span>

            <div>
              <small>Full Name</small>

              <strong>
                {customer?.name ||
                  "Not available"}
              </strong>
            </div>
          </div>

          <div className="customer-info-card">
            <span>📧</span>

            <div>
              <small>Email Address</small>

              <strong>
                {customer?.email ||
                  "Not available"}
              </strong>
            </div>
          </div>

          <div className="customer-info-card">
            <span>📦</span>

            <div>
              <small>Total Orders</small>

              <strong>
                {orders.length}
              </strong>
            </div>
          </div>
        </div>

        {/* ================================= */}
        {/* MY ORDERS */}
        {/* ================================= */}

        <div className="my-orders-section">

          <div className="orders-heading">
            <div>
              <div className="dashboard-eyebrow">
                ORDER HISTORY
              </div>

              <h2>My Orders 📦</h2>

              <p>
                Track the gifts you have
                ordered from Eventory.
              </p>
            </div>

            <button
              type="button"
              className="refresh-orders-btn"
              onClick={loadOrders}
              disabled={loadingOrders}
            >
              {loadingOrders
                ? "Loading..."
                : "↻ Refresh Orders"}
            </button>
          </div>

          {/* LOADING */}

          {loadingOrders && (
            <div className="orders-loading">
              <div className="orders-loading-icon">
                📦
              </div>

              <h3>
                Loading your orders...
              </h3>

              <p>
                Please wait a moment.
              </p>
            </div>
          )}

          {/* ERROR */}

          {!loadingOrders &&
            ordersError && (
              <div className="orders-error">
                <div>⚠️</div>

                <h3>
                  Could not load orders
                </h3>

                <p>
                  {ordersError}
                </p>

                <button
                  type="button"
                  onClick={loadOrders}
                >
                  Try Again
                </button>
              </div>
            )}

          {/* EMPTY ORDERS */}

          {!loadingOrders &&
            !ordersError &&
            orders.length === 0 && (
              <div className="orders-empty">
                <div className="orders-empty-icon">
                  🎁
                </div>

                <h3>
                  No orders yet
                </h3>

                <p>
                  Your placed orders will
                  appear here.
                </p>

                <button
                  type="button"
                  onClick={onBack}
                >
                  Start Shopping →
                </button>
              </div>
            )}

          {/* ORDERS */}

          {!loadingOrders &&
            !ordersError &&
            orders.length > 0 && (
              <div className="orders-list">

                {orders.map((order) => (
                  <div
                    className="order-card"
                    key={order._id}
                  >

                    {/* ORDER HEADER */}

                    <div className="order-card-header">

                      <div>
                        <small>
                          ORDER ID
                        </small>

                        <strong>
                          #
                          {order._id
                            ? order._id
                                .slice(-8)
                                .toUpperCase()
                            : "N/A"}
                        </strong>
                      </div>

                      <div className="order-date">
                        <small>
                          ORDER DATE
                        </small>

                        <strong>
                          {formatDate(
                            order.createdAt
                          )}
                        </strong>
                      </div>

                      <span
                        className={`order-status ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status ||
                          "Placed"}
                      </span>
                    </div>

                    {/* ORDER ITEMS */}

                    <div className="order-items">

                      {order.items?.map(
                        (item, index) => (
                          <div
                            className="order-item"
                            key={
                              item._id ||
                              `${order._id}-${index}`
                            }
                          >

                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                              />
                            ) : (
                              <div className="order-item-image-placeholder">
                                🎁
                              </div>
                            )}

                            <div className="order-item-info">

                              <h4>
                                {item.name}
                              </h4>

                              <p>
                                ₹
                                {Number(
                                  item.price || 0
                                ).toLocaleString(
                                  "en-IN"
                                )}{" "}
                                ×{" "}
                                {item.quantity}
                              </p>

                            </div>

                            <strong>
                              ₹
                              {(
                                Number(
                                  item.price || 0
                                ) *
                                Number(
                                  item.quantity || 0
                                )
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </strong>

                          </div>
                        )
                      )}

                    </div>

                    {/* ORDER FOOTER */}

                    <div className="order-card-footer">

                      <div>
                        <small>
                          DELIVERY TO
                        </small>

                        <p>
                          {order.customer
                            ?.address ||
                            "Address unavailable"}
                          {order.customer
                            ?.city
                            ? `, ${order.customer.city}`
                            : ""}
                          {order.customer
                            ?.pincode
                            ? ` - ${order.customer.pincode}`
                            : ""}
                        </p>
                      </div>

                      <div className="order-total">
                        <small>
                          TOTAL AMOUNT
                        </small>

                        <strong>
                          ₹
                          {Number(
                            order.totalAmount ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>

                    </div>

                  </div>
                ))}

              </div>
            )}
        </div>

        {/* ================================= */}
        {/* GIFT FINDER */}
        {/* ================================= */}

        <div className="dashboard-sections">

          <div className="dashboard-section-card">

            <div className="section-icon">
              🎁
            </div>

            <div>
              <h2>Gift Finder</h2>

              <p>
                Need help choosing a gift?
                Let Eventory find suitable
                gifts for you.
              </p>
            </div>

            <button
              type="button"
              onClick={onBack}
            >
              Find a Gift
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}

export default CustomerDashboard;