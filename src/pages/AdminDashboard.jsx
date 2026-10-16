import { useEffect, useState } from "react";
import "./AdminDashboard.css";
const API_URL = "https://eventory-backend.onrender.com/api/products";
const ORDERS_API_URL = "https://eventory-backend.onrender.com/api/admin/orders";

const occasionCategories = [
  "Birthday",
  "Anniversary",
  "Wedding",
  "Graduation",
  "Thank You",
  "Just Because",
  "Special Gift",
];

const festivalCategories = [
  "Diwali",
  "Raksha Bandhan",
  "Holi",
  "Christmas",
  "Ganesh Chaturthi",
  "Makar Sankranti",
  "Eid",
];

const orderStatuses = [
  "Placed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function AdminDashboard({
  products,
  setProducts,
  token,
  onBack,
}) {
  // ==========================================
  // PRODUCT STATES
  // ==========================================

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryType, setCategoryType] = useState("Occasion");
  const [category, setCategory] = useState("Birthday");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ==========================================
  // ORDER STATES
  // ==========================================

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const categories =
    categoryType === "Festival"
      ? festivalCategories
      : occasionCategories;

  // ==========================================
  // LOAD ORDERS
  // ==========================================

  const loadOrders = async () => {
    if (!token) {
      setOrdersError(
        "Admin session expired. Please login again."
      );
      setLoadingOrders(false);
      return;
    }

    try {
      setLoadingOrders(true);
      setOrdersError("");

      const response = await fetch(
        ORDERS_API_URL,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Admin session expired. Please login again."
          );
        }

        throw new Error(
          data.message ||
            "Failed to load customer orders."
        );
      }

      setOrders(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Load admin orders error:",
        error
      );

      setOrdersError(
        error.message ||
          "Failed to load customer orders."
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  // ==========================================
  // UPDATE ORDER STATUS
  // ==========================================

  const updateOrderStatus = async (
    orderId,
    status
  ) => {
    if (!orderId) {
      return;
    }

    if (!token) {
      alert(
        "Admin session expired. Please login again."
      );
      return;
    }

    try {
      setUpdatingOrderId(orderId);

      const response = await fetch(
        `${ORDERS_API_URL}/${orderId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      const data =
        await response.json().catch(
          () => ({})
        );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Admin session expired. Please login again."
          );
        }

        throw new Error(
          data.message ||
            "Failed to update order status."
        );
      }

      setOrders((previous) =>
        previous.map((order) =>
          String(order._id) ===
          String(orderId)
            ? {
                ...order,
                status:
                  data.order?.status ||
                  status,
              }
            : order
        )
      );

      alert(
        "Order status updated successfully!"
      );
    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      alert(
        error.message ||
          "Failed to update order status."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // ==========================================
  // PRODUCT TYPE CHANGE
  // ==========================================

  const handleTypeChange = (type) => {
    setCategoryType(type);

    if (type === "Festival") {
      setCategory("Diwali");
    } else {
      setCategory("Birthday");
    }
  };

  // ==========================================
  // RESET PRODUCT FORM
  // ==========================================

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setCategoryType("Occasion");
    setCategory("Birthday");
    setImage("");
    setDescription("");
  };

  // ==========================================
  // AUTH HEADERS
  // ==========================================

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  // ==========================================
  // ADD / UPDATE PRODUCT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanName = name.trim();
    const numericPrice = Number(price);
    const cleanCategory = category.trim();

    if (!cleanName) {
      alert(
        "Please enter a product name."
      );
      return;
    }

    if (
      price === "" ||
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      alert(
        "Please enter a valid price."
      );
      return;
    }

    if (!cleanCategory) {
      alert(
        "Please select a category."
      );
      return;
    }

    if (!token) {
      alert(
        "Admin session expired. Please login again."
      );
      return;
    }

    const productData = {
      name: cleanName,
      price: numericPrice,
      category: cleanCategory,

      categoryType:
        categoryType === "Festival"
          ? "Festival"
          : "Occasion",

      image:
        image.trim() ||
        "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=700",

      description:
        description.trim() ||
        "A thoughtful gift for someone special.",
    };

    try {
      setSaving(true);

      const isEditing =
        editingId !== null;

      const response =
        await fetch(
          isEditing
            ? `${API_URL}/${editingId}`
            : API_URL,
          {
            method: isEditing
              ? "PUT"
              : "POST",

            headers:
              getAuthHeaders(),

            body: JSON.stringify(
              productData
            ),
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        if (
          response.status === 401
        ) {
          throw new Error(
            "Admin session expired. Please login again."
          );
        }

        throw new Error(
          data.message ||
            "Could not save product."
        );
      }

      const productWithId = {
        ...data,
        id:
          data._id ||
          data.id,
      };

      if (!productWithId.id) {
        throw new Error(
          "Product saved but server did not return a valid product ID."
        );
      }

      if (
        !Number.isFinite(
          Number(
            productWithId.price
          )
        )
      ) {
        throw new Error(
          "Invalid product price received from server."
        );
      }

      if (isEditing) {
        setProducts(
          (previous) =>
            previous.map(
              (product) =>
                String(
                  product.id
                ) ===
                String(editingId)
                  ? productWithId
                  : product
            )
        );

        alert(
          "Product updated successfully!"
        );
      } else {
        setProducts(
          (previous) => [
            ...previous,
            productWithId,
          ]
        );

        alert(
          "Product added successfully!"
        );
      }

      resetForm();
    } catch (error) {
      console.error(
        "Save product error:",
        error
      );

      alert(
        error.message ||
          "Failed to connect to the server."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // EDIT PRODUCT
  // ==========================================

  const startEdit = (product) => {
    setEditingId(product.id);

    setName(
      product.name || ""
    );

    const safePrice =
      Number(product.price);

    setPrice(
      Number.isFinite(safePrice)
        ? String(safePrice)
        : ""
    );

    setCategoryType(
      product.categoryType ===
        "Festival"
        ? "Festival"
        : "Occasion"
    );

    setCategory(
      product.category ||
        (product.categoryType ===
        "Festival"
          ? "Diwali"
          : "Birthday")
    );

    setImage(
      product.image || ""
    );

    setDescription(
      product.description || ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const deleteProduct = async (
    id
  ) => {
    if (!id) {
      alert(
        "This product does not have a valid ID."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this product?"
      );

    if (!confirmed) {
      return;
    }

    if (!token) {
      alert(
        "Admin session expired. Please login again."
      );
      return;
    }

    try {
      setDeletingId(id);

      const response =
        await fetch(
          `${API_URL}/${id}`,
          {
            method: "DELETE",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        if (
          response.status === 401
        ) {
          throw new Error(
            "Admin session expired. Please login again."
          );
        }

        throw new Error(
          data.message ||
            `Could not delete product. Server returned ${response.status}.`
        );
      }

      setProducts(
        (previous) =>
          previous.filter(
            (product) =>
              String(
                product.id ||
                  product._id
              ) !==
              String(id)
          )
      );

      if (
        String(editingId) ===
        String(id)
      ) {
        resetForm();
      }

      alert(
        "Product deleted successfully!"
      );
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      alert(
        error.message ||
          "Failed to connect to the server."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // VALID PRODUCTS
  // ==========================================

  const validProducts =
    products.filter(
      (product) => {
        const productId =
          product.id ||
          product._id;

        const productPrice =
          Number(product.price);

        return (
          productId &&
          product.name &&
          Number.isFinite(
            productPrice
          ) &&
          productPrice > 0
        );
      }
    );

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="admin-page content-section">

      {/* =====================================
          ADMIN HEADER
      ====================================== */}

      <div className="admin-header">

        <div>
          <p className="eyebrow">
            EVENTORY STORE MANAGEMENT
          </p>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Manage your gifts,
            occasions and festivals.
          </p>
        </div>

        <button
          type="button"
          className="secondary-btn"
          onClick={onBack}
        >
          ← Back to Store
        </button>

      </div>


      {/* =====================================
          STATISTICS
      ====================================== */}

      <div className="admin-stats">

        <div className="admin-stat-card">
          <span>
            Total Products
          </span>

          <strong>
            {
              validProducts.length
            }
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>
            Occasion Gifts
          </span>

          <strong>
            {
              validProducts.filter(
                (product) =>
                  (
                    product.categoryType ||
                    "Occasion"
                  ) ===
                  "Occasion"
              ).length
            }
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>
            Festival Gifts
          </span>

          <strong>
            {
              validProducts.filter(
                (product) =>
                  product.categoryType ===
                  "Festival"
              ).length
            }
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>
            Total Orders
          </span>

          <strong>
            {orders.length}
          </strong>
        </div>

      </div>


      {/* =====================================
          ADD / EDIT PRODUCT
      ====================================== */}

      <div className="admin-form-section">

        <div className="section-heading">

          <p className="eyebrow">
            {editingId !== null
              ? "UPDATE YOUR COLLECTION"
              : "ADD TO YOUR COLLECTION"}
          </p>

          <h2>
            {editingId !== null
              ? "Edit Product"
              : "Add New Product"}
          </h2>

        </div>

        <form
          className="admin-form"
          onSubmit={
            handleSubmit
          }
        >

          <label>
            Product Name

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Enter product name"
              required
            />
          </label>

          <label>
            Price (₹)

            <input
              type="number"
              min="1"
              step="1"
              value={price}
              onChange={(event) =>
                setPrice(
                  event.target.value
                )
              }
              placeholder="Enter price"
              required
            />
          </label>

          <label>
            Product Type

            <select
              value={
                categoryType
              }
              onChange={(event) =>
                handleTypeChange(
                  event.target.value
                )
              }
            >
              <option value="Occasion">
                Events & Occasions
              </option>

              <option value="Festival">
                Festival
              </option>
            </select>
          </label>

          <label>
            Category

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
            >
              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </label>

          <label className="admin-full-width">
            Image URL

            <input
              type="url"
              value={image}
              onChange={(event) =>
                setImage(
                  event.target.value
                )
              }
              placeholder="Paste image URL (optional)"
            />
          </label>

          <label className="admin-full-width">
            Product Description

            <textarea
              value={
                description
              }
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe your gift..."
              rows="4"
            />
          </label>

          <div className="admin-full-width">

            <button
              type="submit"
              className="primary-btn"
              disabled={
                saving ||
                deletingId !==
                  null
              }
            >
              {saving
                ? "Saving..."
                : editingId !== null
                ? "Update Product"
                : "+ Add Product"}
            </button>

            {editingId !==
              null && (
              <button
                type="button"
                className="secondary-btn"
                onClick={
                  resetForm
                }
                disabled={
                  saving
                }
                style={{
                  marginLeft:
                    "10px",
                }}
              >
                Cancel Edit
              </button>
            )}

          </div>

        </form>

      </div>


      {/* =====================================
          MANAGE PRODUCTS
      ====================================== */}

      <div className="admin-products-section">

        <div className="section-heading">

          <p className="eyebrow">
            YOUR COLLECTION
          </p>

          <h2>
            Manage Products
          </h2>

        </div>

        {validProducts.length ===
        0 ? (
          <div className="empty-state">

            <h2>
              No products yet
            </h2>

            <p>
              Add your first gift
              using the form above.
            </p>

          </div>
        ) : (
          <div className="admin-product-list">

            {validProducts.map(
              (product) => {

                const productId =
                  product.id ||
                  product._id;

                const productPrice =
                  Number(
                    product.price
                  );

                return (
                  <div
                    className="admin-product-row"
                    key={
                      productId
                    }
                  >

                    <img
                      src={
                        product.image ||
                        "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=700"
                      }
                      alt={
                        product.name
                      }
                    />

                    <div className="admin-product-info">

                      <h3>
                        {
                          product.name
                        }
                      </h3>

                      <p>
                        {
                          product.categoryType ||
                          "Occasion"
                        }
                        {" · "}
                        {
                          product.category ||
                          "Uncategorized"
                        }
                      </p>

                      <strong>
                        ₹
                        {productPrice.toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() =>
                        startEdit(
                          product
                        )
                      }
                      disabled={
                        saving ||
                        deletingId !==
                          null
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() =>
                        deleteProduct(
                          productId
                        )
                      }
                      disabled={
                        deletingId !==
                          null ||
                        saving
                      }
                    >
                      {String(
                        deletingId
                      ) ===
                      String(
                        productId
                      )
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>


      {/* =====================================
          CUSTOMER ORDERS
      ====================================== */}

      <div className="admin-orders-section">

        <div className="section-heading">

          <p className="eyebrow">
            ORDER MANAGEMENT
          </p>

          <h2>
            Customer Orders 📦
          </h2>

          <p>
            View and manage orders
            placed by Eventory
            customers.
          </p>

        </div>


        {/* REFRESH */}

        <div className="admin-orders-toolbar">

          <button
            type="button"
            className="secondary-btn"
            onClick={
              loadOrders
            }
            disabled={
              loadingOrders
            }
          >
            {loadingOrders
              ? "Loading..."
              : "↻ Refresh Orders"}
          </button>

        </div>


        {/* LOADING */}

        {loadingOrders && (
          <div className="admin-orders-message">

            <div>
              📦
            </div>

            <h3>
              Loading customer orders...
            </h3>

            <p>
              Please wait a moment.
            </p>

          </div>
        )}


        {/* ERROR */}

        {!loadingOrders &&
          ordersError && (
            <div className="admin-orders-message admin-orders-error">

              <div>
                ⚠️
              </div>

              <h3>
                Could not load orders
              </h3>

              <p>
                {ordersError}
              </p>

              <button
                type="button"
                className="primary-btn"
                onClick={
                  loadOrders
                }
              >
                Try Again
              </button>

            </div>
          )}


        {/* EMPTY */}

        {!loadingOrders &&
          !ordersError &&
          orders.length === 0 && (
            <div className="admin-orders-message">

              <div>
                🎁
              </div>

              <h3>
                No customer orders yet
              </h3>

              <p>
                Orders placed by
                customers will
                appear here.
              </p>

            </div>
          )}


        {/* ORDERS */}

        {!loadingOrders &&
          !ordersError &&
          orders.length > 0 && (
            <div className="admin-orders-list">

              {orders.map(
                (order) => (
                  <div
                    className="admin-order-card"
                    key={
                      order._id
                    }
                  >

                    {/* ORDER HEADER */}

                    <div className="admin-order-header">

                      <div>
                        <small>
                          ORDER ID
                        </small>

                        <strong>
                          #
                          {order._id
                            ? order._id
                                .slice(
                                  -8
                                )
                                .toUpperCase()
                            : "N/A"}
                        </strong>
                      </div>

                      <div>
                        <small>
                          ORDER DATE
                        </small>

                        <strong>
                          {formatDate(
                            order.createdAt
                          )}
                        </strong>
                      </div>

                      <div className="admin-order-status-control">

                        <small>
                          STATUS
                        </small>

                        <select
                          value={
                            order.status ||
                            "Placed"
                          }
                          onChange={(
                            event
                          ) =>
                            updateOrderStatus(
                              order._id,
                              event
                                .target
                                .value
                            )
                          }
                          disabled={
                            String(
                              updatingOrderId
                            ) ===
                            String(
                              order._id
                            )
                          }
                        >
                          {orderStatuses.map(
                            (
                              status
                            ) => (
                              <option
                                key={
                                  status
                                }
                                value={
                                  status
                                }
                              >
                                {status}
                              </option>
                            )
                          )}
                        </select>

                        {String(
                          updatingOrderId
                        ) ===
                          String(
                            order._id
                          ) && (
                          <span className="order-updating-text">
                            Updating...
                          </span>
                        )}

                      </div>

                    </div>


                    {/* CUSTOMER DETAILS */}

                    <div className="admin-order-customer">

                      <div>

                        <small>
                          CUSTOMER
                        </small>

                        <strong>
                          {
                            order
                              .customer
                              ?.name ||
                            "N/A"
                          }
                        </strong>

                      </div>

                      <div>

                        <small>
                          PHONE
                        </small>

                        <strong>
                          {
                            order
                              .customer
                              ?.phone ||
                            "N/A"
                          }
                        </strong>

                      </div>

                      <div>

                        <small>
                          DELIVERY ADDRESS
                        </small>

                        <strong>
                          {
                            order
                              .customer
                              ?.address ||
                            "N/A"
                          }
                          {order
                            .customer
                            ?.city
                            ? `, ${order.customer.city}`
                            : ""}

                          {order
                            .customer
                            ?.pincode
                            ? ` - ${order.customer.pincode}`
                            : ""}
                        </strong>

                      </div>

                    </div>


                    {/* ORDER ITEMS */}

                    <div className="admin-order-items">

                      <h3>
                        Ordered Products
                      </h3>

                      {order.items?.map(
                        (
                          item,
                          index
                        ) => (
                          <div
                            className="admin-order-item"
                            key={
                              item._id ||
                              `${order._id}-${index}`
                            }
                          >

                            {item.image ? (
                              <img
                                src={
                                  item.image
                                }
                                alt={
                                  item.name
                                }
                              />
                            ) : (
                              <div className="admin-order-item-placeholder">
                                🎁
                              </div>
                            )}

                            <div className="admin-order-item-info">

                              <strong>
                                {
                                  item.name
                                }
                              </strong>

                              <span>
                                ₹
                                {Number(
                                  item.price ||
                                    0
                                ).toLocaleString(
                                  "en-IN"
                                )}{" "}
                                ×{" "}
                                {
                                  item.quantity
                                }
                              </span>

                            </div>

                            <strong>
                              ₹
                              {(
                                Number(
                                  item.price ||
                                    0
                                ) *
                                Number(
                                  item.quantity ||
                                    0
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

                    <div className="admin-order-footer">

                      <span>
                        Total Amount
                      </span>

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
                )
              )}

            </div>
          )}

      </div>

    </section>
  );
}

export default AdminDashboard;