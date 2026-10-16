import { useEffect, useState } from "react";

import "./App.css";

import Auth from "./Auth";

import CustomerAuth from "./CustomerAuth";

import CustomerDashboard from "./CustomerDashboard";

import AdminDashboard from "./pages/AdminDashboard";

import GiftRecommender from "./GiftRecommender";


const API_BASE_URL = "https://eventory-backend.onrender.com/api";

const initialProducts = [
  {
    id: "demo-1",
    name: "Premium Birthday Gift Box",
    price: 799,
    category: "Birthday",
    categoryType: "Occasion",
    image:
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=700",
    description:
      "A beautiful premium gift box for birthdays.",
  },
  {
    id: "demo-2",
    name: "Romantic Anniversary Gift",
    price: 999,
    category: "Anniversary",
    categoryType: "Occasion",
    image:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=700",
    description:
      "A thoughtful romantic gift for your special person.",
  },
  {
    id: "demo-3",
    name: "Elegant Wedding Gift",
    price: 1499,
    category: "Wedding",
    categoryType: "Occasion",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=700",
    description:
      "An elegant gift for a beautiful wedding celebration.",
  },
  {
    id: "demo-4",
    name: "Diwali Gift Box",
    price: 599,
    category: "Diwali",
    categoryType: "Festival",
    image:
      "https://images.unsplash.com/photo-1603905179139-db12ab535c38?w=700",
    description:
      "A festive Diwali gift box for family and friends.",
  },
  {
    id: "demo-5",
    name: "Chocolate Celebration Box",
    price: 499,
    category: "Special Gift",
    categoryType: "Occasion",
    image:
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=700",
    description:
      "A delicious chocolate gift for someone special.",
  },
  {
    id: "demo-6",
    name: "Festive Celebration Hamper",
    price: 1199,
    category: "Christmas",
    categoryType: "Festival",
    image:
      "https://images.unsplash.com/photo-1513884923967-4b182ef167ab?w=700",
    description:
      "A festive hamper perfect for celebrations.",
  },
];

function App() {
  // ==========================================
  // CUSTOMER ACCOUNT
  // ==========================================

  const [showCustomerAuth, setShowCustomerAuth] =
    useState(false);

  const [customer, setCustomer] = useState(() => {
    try {
      const savedCustomer =
        localStorage.getItem("eventory-customer");

      return savedCustomer
        ? JSON.parse(savedCustomer)
        : null;
    } catch {
      return null;
    }
  });

  // ==========================================
  // PRODUCTS
  // ==========================================

  const [products, setProducts] = useState([]);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [productsError, setProductsError] =
    useState("");

  // ==========================================
  // CART
  // ==========================================

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart =
        localStorage.getItem("eventory-cart");

      return savedCart
        ? JSON.parse(savedCart)
        : [];
    } catch {
      return [];
    }
  });

  // ==========================================
  // FILTERS
  // ==========================================

  const [selectedType, setSelectedType] =
    useState("All");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [search, setSearch] = useState("");

  // ==========================================
  // PRODUCT MODAL
  // ==========================================

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  // ==========================================
  // CART DRAWER
  // ==========================================

  const [showCart, setShowCart] = useState(false);

  // ==========================================
  // ADMIN
  // ==========================================

  const [isAdminView, setIsAdminView] =
    useState(false);

  const [adminToken, setAdminToken] = useState(
    () =>
      localStorage.getItem(
        "eventory-admin-token"
      ) || ""
  );

  // ==========================================
  // ACTIVE PAGE
  // ==========================================

  const [activePage, setActivePage] =
    useState("home");

  // ==========================================
  // CHECKOUT CUSTOMER DETAILS
  // ==========================================

  const [checkoutCustomer, setCheckoutCustomer] =
    useState({
      name: "",
      phone: "",
      address: "",
      city: "",
      pincode: "",
    });

  const [orderMessage, setOrderMessage] =
    useState("");

  const [placingOrder, setPlacingOrder] =
    useState(false);

  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductsError("");

        const response = await fetch(
          `${API_BASE_URL}/products`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load products"
          );
        }

        const data = await response.json();

        const normalizedProducts =
          Array.isArray(data)
            ? data.map((product) => ({
                ...product,
                id:
                  product._id ||
                  product.id,
              }))
            : [];

        setProducts(normalizedProducts);
      } catch (error) {
        console.error(
          "Product loading error:",
          error
        );

        setProductsError(
          "Could not load products from server."
        );

        setProducts(initialProducts);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  // ==========================================
  // SAVE CART
  // ==========================================

  useEffect(() => {
    localStorage.setItem(
      "eventory-cart",
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  // ==========================================
  // CUSTOMER LOGIN
  // ==========================================

  const handleCustomerLogin = (
    customerData
  ) => {
    setCustomer(customerData);
    setShowCustomerAuth(false);

    // Prefill checkout name
    setCheckoutCustomer((previous) => ({
      ...previous,
      name: customerData?.name || "",
    }));
  };

  // ==========================================
  // CUSTOMER LOGOUT
  // ==========================================

  const handleCustomerLogout = () => {
    localStorage.removeItem(
      "eventory-customer-token"
    );

    localStorage.removeItem(
      "eventory-customer"
    );

    setCustomer(null);

    setCheckoutCustomer({
      name: "",
      phone: "",
      address: "",
      city: "",
      pincode: "",
    });
  };

  // ==========================================
  // CART
  // ==========================================

  const addToCart = (product) => {
    setCartItems((currentCart) => {
      const existingProduct =
        currentCart.find(
          (item) =>
            item.id === product.id
        );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    setShowCart(true);
  };

  const increaseQuantity = (id) => {
    setCartItems((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );
  };

  const removeFromCart = (id) => {
    setCartItems((currentCart) =>
      currentCart.filter(
        (item) => item.id !== id
      )
    );
  };

  const cartCount = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.quantity || 0),
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  // ==========================================
  // DELIVERY CHARGE
  // ==========================================

  const deliveryCharge =
    subtotal >= 999 ? 0 : 49;

  const finalTotal =
    subtotal + deliveryCharge;

  // ==========================================
  // CATEGORIES
  // ==========================================

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

  const allCategories = [
    ...occasionCategories,
    ...festivalCategories,
  ];

  // ==========================================
  // FILTER PRODUCTS
  // ==========================================

  const filteredProducts = products.filter(
    (product) => {
      const matchesType =
        selectedType === "All" ||
        product.categoryType ===
          selectedType;

      const matchesCategory =
        selectedCategory === "All" ||
        product.category ===
          selectedCategory;

      const searchText =
        search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        product.name
          ?.toLowerCase()
          .includes(searchText) ||
        product.description
          ?.toLowerCase()
          .includes(searchText) ||
        product.category
          ?.toLowerCase()
          .includes(searchText);

      return (
        matchesType &&
        matchesCategory &&
        matchesSearch
      );
    }
  );

  // ==========================================
  // THEME
  // ==========================================

  const themeClass =
    selectedCategory === "Diwali"
      ? "theme-diwali"
      : selectedCategory ===
        "Raksha Bandhan"
      ? "theme-raksha"
      : selectedCategory === "Holi"
      ? "theme-holi"
      : selectedCategory ===
        "Christmas"
      ? "theme-christmas"
      : selectedCategory ===
        "Ganesh Chaturthi"
      ? "theme-ganesh"
      : selectedCategory ===
        "Makar Sankranti"
      ? "theme-makar"
      : selectedCategory === "Eid"
      ? "theme-eid"
      : "";

  // ==========================================
  // ADMIN LOGIN
  // ==========================================

  const handleAdminLogin = (token) => {
    localStorage.setItem(
      "eventory-admin-token",
      token
    );

    setAdminToken(token);
    setIsAdminView(true);
  };

  // ==========================================
  // ADMIN LOGOUT
  // ==========================================

  const handleAdminLogout = () => {
    localStorage.removeItem(
      "eventory-admin-token"
    );

    setAdminToken("");
    setIsAdminView(false);
  };

  // ==========================================
  // CHECKOUT INPUT
  // ==========================================

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;

    setCheckoutCustomer((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // PLACE ORDER
  // ==========================================

  const placeOrder = async (e) => {
    e.preventDefault();

    if (!customer) {
      setOrderMessage(
        "Please login before placing an order."
      );
      return;
    }

    if (cartItems.length === 0) {
      setOrderMessage(
        "Your cart is empty."
      );
      return;
    }

    setOrderMessage("");
    setPlacingOrder(true);

    try {
      const customerToken =
        localStorage.getItem(
          "eventory-customer-token"
        );

      if (!customerToken) {
        throw new Error(
          "Customer login session not found. Please login again."
        );
      }

      const orderData = {
        customer: {
          name: checkoutCustomer.name,
          phone: checkoutCustomer.phone,
          address: checkoutCustomer.address,
          city: checkoutCustomer.city,
          pincode: checkoutCustomer.pincode,
        },

        items: cartItems.map((item) => ({
          product:
            item.id || item._id,
          name: item.name,
          price: Number(item.price),
          quantity:
            Number(item.quantity),
          image: item.image || "",
        })),

        totalAmount: finalTotal,
      };

      const response = await fetch(
        `${API_BASE_URL}/orders`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${customerToken}`,
          },

          body: JSON.stringify(
            orderData
          ),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to place order."
        );
      }

      setOrderMessage(
        "🎉 Order placed successfully!"
      );

      setCartItems([]);

      setCheckoutCustomer({
        name: customer?.name || "",
        phone: "",
        address: "",
        city: "",
        pincode: "",
      });
    } catch (error) {
      console.error(
        "Order error:",
        error
      );

      setOrderMessage(
        error.message ||
          "Failed to place order."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // ==========================================
  // CUSTOMER DASHBOARD
  // ==========================================

  if (
    customer &&
    activePage === "customer-dashboard"
  ) {
    return (
      <CustomerDashboard
        customer={customer}
        onBack={() =>
          setActivePage("home")
        }
        onLogout={handleCustomerLogout}
      />
    );
  }

  // ==========================================
  // CUSTOMER AUTH PAGE
  // ==========================================

  if (showCustomerAuth) {
    return (
      <CustomerAuth
        onLogin={handleCustomerLogin}
        onBack={() =>
          setShowCustomerAuth(false)
        }
      />
    );
  }

  // ==========================================
  // ADMIN VIEW
  // ==========================================

  if (isAdminView) {
    return adminToken ? (
      <AdminDashboard
        products={products}
        setProducts={setProducts}
        token={adminToken}
        onBack={handleAdminLogout}
      />
    ) : (
      <Auth
        onLogin={handleAdminLogin}
        onCancel={() =>
          setIsAdminView(false)
        }
      />
    );
  }

  // ==========================================
  // MAIN WEBSITE
  // ==========================================

  return (
    <div
      className={`app ${themeClass}`}
    >
      {/* ========================= */}
      {/* NAVBAR */}
      {/* ========================= */}

      <header className="navbar">
        <div
          className="logo"
          onClick={() => {
            setActivePage("home");
            setSelectedCategory("All");
            setSelectedType("All");
          }}
        >
          🎁 Eventory
        </div>

        <div className="nav-search">
          <input
            type="text"
            placeholder="Search gifts..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="nav-actions">
          <button
            onClick={() =>
              setActivePage("home")
            }
          >
            Home
          </button>

          <button
            onClick={() =>
              setActivePage("ai")
            }
          >
            ✨ AI Gift Finder
          </button>

          <button
            onClick={() =>
              setShowCart(true)
            }
          >
            🛒 Cart ({cartCount})
          </button>

          {/* CUSTOMER LOGIN */}

          {customer ? (
            <>
              <button
                type="button"
                className="customer-welcome customer-dashboard-link"
                onClick={() =>
                  setActivePage(
                    "customer-dashboard"
                  )
                }
              >
                Hi, {customer.name} 👋
              </button>

              <button
                onClick={
                  handleCustomerLogout
                }
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() =>
                setShowCustomerAuth(true)
              }
            >
              Login / Register
            </button>
          )}

          {/* ADMIN */}

          <button
            onClick={() =>
              setIsAdminView(true)
            }
          >
            Admin
          </button>
        </div>
      </header>

      {/* ========================= */}
      {/* AI PAGE */}
      {/* ========================= */}

      {activePage === "ai" ? (
  <main className="main-content ai-page">
    <GiftRecommender
      products={products}
      onAddToCart={addToCart}
    />

    <button
      className="ai-back-shopping"
      onClick={() => setActivePage("home")}
    >
      ← Back to Eventory
    </button>
  </main>
) : (
  <>
      
          {/* ========================= */}
          {/* HERO */}
          {/* ========================= */}

          {/* ================= PREMIUM HERO ================= */}

<section className="eventory-hero">

  <div className="eventory-hero-bg"></div>

  <div className="eventory-hero-overlay"></div>

  <div className="eventory-hero-content">

    <div className="eventory-hero-badge">
      ✨ GIFTS MADE MEANINGFUL
    </div>

    <h1>
      Find the perfect gift
      <br />
      for every occasion.
    </h1>

    <p>
      Discover thoughtful gifts for birthdays, anniversaries,
      weddings, festivals and every special moment.
    </p>

    <div className="eventory-hero-buttons">

      <button
        className="eventory-shop-btn"
        onClick={() => {
          document
            .getElementById("products")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        Shop Gifts
      </button>

      <button
        className="eventory-ai-btn"
        onClick={() => setActivePage("ai")}
      >
        ✨ Find Gift With AI
      </button>

    </div>

  </div>

</section>

          {/* ========================= */}
          {/* AI FEATURE BANNER */}
          {/* ========================= */}

          <section className="ai-banner">
            <div>
              <span>
                ✨ SMART GIFTING
              </span>

              <h2>
                Don't know what to gift?
              </h2>

              <p>
                Tell us who you're buying
                for, the occasion and your
                budget. Eventory will suggest
                gifts for you.
              </p>
            </div>

            <button
              onClick={() =>
                setActivePage("ai")
              }
            >
              Try AI Gift Finder →
            </button>
          </section>

          {/* ========================= */}
          {/* CATEGORY SECTION */}
          {/* ========================= */}

          <section className="category-section">
            <div className="section-heading">
              <span>
                EXPLORE
              </span>

              <h2>
                Shop by Occasion
              </h2>
            </div>

            <div className="category-buttons">
              <button
                className={
                  selectedType ===
                    "All" &&
                  selectedCategory ===
                    "All"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setSelectedType("All");
                  setSelectedCategory(
                    "All"
                  );
                }}
              >
                All Gifts
              </button>

              <button
                className={
                  selectedType ===
                    "Occasion"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setSelectedType(
                    "Occasion"
                  );

                  setSelectedCategory(
                    "All"
                  );
                }}
              >
                🎉 Occasions
              </button>

              <button
                className={
                  selectedType ===
                    "Festival"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setSelectedType(
                    "Festival"
                  );

                  setSelectedCategory(
                    "All"
                  );
                }}
              >
                🪔 Festivals
              </button>
            </div>

            <div className="subcategory-buttons">
              {allCategories.map(
                (category) => (
                  <button
                    key={category}
                    className={
                      selectedCategory ===
                      category
                        ? "active"
                        : ""
                    }
                    onClick={() => {
                      setSelectedCategory(
                        category
                      );

                      if (
                        festivalCategories.includes(
                          category
                        )
                      ) {
                        setSelectedType(
                          "Festival"
                        );
                      } else {
                        setSelectedType(
                          "Occasion"
                        );
                      }
                    }}
                  >
                    {category}
                  </button>
                )
              )}
            </div>
          </section>

          {/* ========================= */}
          {/* PRODUCTS */}
          {/* ========================= */}

          <section
            className="products-section"
            id="products"
          >
            <div className="section-heading">
              <span>
                OUR COLLECTION
              </span>

              <h2>
                Popular Occasions
              </h2>
            </div>

            {loadingProducts ? (
              <div className="loading">
                Loading gifts...
              </div>
            ) : productsError ? (
              <div className="products-error">
                {productsError}
              </div>
            ) : null}

            <div className="product-grid">
              {filteredProducts.length >
              0 ? (
                filteredProducts.map(
                  (product) => (
                    <div
                      className="product-card"
                      key={
                        product.id
                      }
                    >
                      <div
                        className="product-image"
                        onClick={() =>
                          setSelectedProduct(
                            product
                          )
                        }
                      >
                        {product.image ? (
                          <img
                            src={
                              product.image
                            }
                            alt={
                              product.name
                            }
                          />
                        ) : (
                          <div className="no-product-image">
                            🎁
                          </div>
                        )}

                        <span className="product-category">
                          {
                            product.category
                          }
                        </span>
                      </div>

                      <div className="product-info">
                        <h3>
                          {
                            product.name
                          }
                        </h3>

                        <p>
                          {
                            product.description
                          }
                        </p>

                        <div className="product-bottom">
                          <strong>
                            ₹
                            {Number(
                              product.price ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                          <button
                            onClick={() =>
                              addToCart(
                                product
                              )
                            }
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="empty-products">
                  <h3>
                    No gifts found
                  </h3>

                  <p>
                    Try another category
                    or search.
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ========================= */}
      {/* PRODUCT MODAL */}
      {/* ========================= */}

      {selectedProduct && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedProduct(null)
          }
        >
          <div
            className="product-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                setSelectedProduct(null)
              }
            >
              ×
            </button>

            {selectedProduct.image && (
              <img
                src={
                  selectedProduct.image
                }
                alt={
                  selectedProduct.name
                }
              />
            )}

            <div className="modal-content">
              <span>
                {
                  selectedProduct.category
                }
              </span>

              <h2>
                {
                  selectedProduct.name
                }
              </h2>

              <p>
                {
                  selectedProduct.description
                }
              </p>

              <h3>
                ₹
                {Number(
                  selectedProduct.price ||
                    0
                ).toLocaleString(
                  "en-IN"
                )}
              </h3>

              <button
                className="primary-btn"
                onClick={() => {
                  addToCart(
                    selectedProduct
                  );

                  setSelectedProduct(
                    null
                  );
                }}
              >
                🛒 Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* CART */}
      {/* ========================= */}

      {showCart && (
        <div
          className="cart-overlay"
          onClick={() =>
            setShowCart(false)
          }
        >
          <div
            className="cart-drawer"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="cart-header">
              <h2>
                Your Cart
              </h2>

              <button
                onClick={() =>
                  setShowCart(false)
                }
              >
                ×
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <div>
                  🛒
                </div>

                <h3>
                  Your cart is empty
                </h3>

                <p>
                  Add some beautiful
                  gifts to your cart.
                </p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map(
                    (item) => (
                      <div
                        className="cart-item"
                        key={
                          item.id
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
                          <div className="cart-image-placeholder">
                            🎁
                          </div>
                        )}

                        <div className="cart-item-info">
                          <h4>
                            {
                              item.name
                            }
                          </h4>

                          <strong>
                            ₹
                            {Number(
                              item.price
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                          <div className="quantity-controls">
                            <button
                              onClick={() =>
                                decreaseQuantity(
                                  item.id
                                )
                              }
                            >
                              −
                            </button>

                            <span>
                              {
                                item.quantity
                              }
                            </span>

                            <button
                              onClick={() =>
                                increaseQuantity(
                                  item.id
                                )
                              }
                            >
                              +
                            </button>
                          </div>

                          <button
                            className="remove-cart-item"
                            onClick={() =>
                              removeFromCart(
                                item.id
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="cart-summary">
                  <div>
                    <span>
                      Subtotal
                    </span>

                    <strong>
                      ₹
                      {subtotal.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  {/* DELIVERY CHARGE */}

                  <div>
                    <span>
                      Delivery
                    </span>

                    <strong>
                      {deliveryCharge ===
                      0
                        ? "FREE"
                        : `₹${deliveryCharge}`}
                    </strong>
                  </div>

                  {/* FINAL TOTAL */}

                  <div className="checkout-total-row">
                    <span>
                      Total
                    </span>

                    <strong>
                      ₹
                      {finalTotal.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <h3>
                    Checkout
                  </h3>

                  <form
                    onSubmit={
                      placeOrder
                    }
                  >
                    <input
                      name="name"
                      placeholder="Full Name"
                      value={
                        checkoutCustomer.name
                      }
                      onChange={
                        handleCustomerChange
                      }
                      required
                    />

                    <input
                      name="phone"
                      placeholder="10-digit Phone"
                      value={
                        checkoutCustomer.phone
                      }
                      onChange={
                        handleCustomerChange
                      }
                      maxLength="10"
                      pattern="[0-9]{10}"
                      required
                    />

                    <textarea
                      name="address"
                      placeholder="Delivery Address"
                      value={
                        checkoutCustomer.address
                      }
                      onChange={
                        handleCustomerChange
                      }
                      required
                    />

                    <input
                      name="city"
                      placeholder="City"
                      value={
                        checkoutCustomer.city
                      }
                      onChange={
                        handleCustomerChange
                      }
                      required
                    />

                    <input
                      name="pincode"
                      placeholder="6-digit Pincode"
                      value={
                        checkoutCustomer.pincode
                      }
                      onChange={
                        handleCustomerChange
                      }
                      maxLength="6"
                      pattern="[0-9]{6}"
                      required
                    />

                    {orderMessage && (
                      <div className="order-message">
                        {
                          orderMessage
                        }
                      </div>
                    )}

                    <button
                      type="submit"
                      className="checkout-btn"
                      disabled={
                        placingOrder
                      }
                    >
                      {placingOrder
                        ? "Placing Order..."
                        : "Place Order"}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* FOOTER */}
      {/* ========================= */}

      <footer className="footer">
        <div>
          <h2>
            🎁 Eventory
          </h2>

          <p>
            Making every occasion more
            memorable with thoughtful gifts.
          </p>
        </div>

        <div>
          <h3>
            Quick Links
          </h3>

          <button
            onClick={() =>
              setActivePage("home")
            }
          >
            Home
          </button>

          <button
            onClick={() =>
              setActivePage("ai")
            }
          >
            AI Gift Finder
          </button>

          {!customer && (
            <button
              onClick={() =>
                setShowCustomerAuth(true)
              }
            >
              Login / Register
            </button>
          )}
        </div>

        <div>
          <h3>
            Admin
          </h3>

          <button
            onClick={() =>
              setIsAdminView(true)
            }
          >
            Admin Login
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;