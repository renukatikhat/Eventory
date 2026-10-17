const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Product = require("./models/Product");
const Order = require("./models/Order");
const Customer = require("./models/Customer");

const app = express();

const PORT = process.env.PORT || 5000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// ADMIN AUTH MIDDLEWARE
// ===============================

const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    req.admin = decoded;

    next();
  } catch (error) {
    console.error("Admin auth error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};


// ===============================
// CUSTOMER AUTH MIDDLEWARE
// ===============================

const customerAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Customer login required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "customer") {
      return res.status(403).json({
        message: "Customer access only",
      });
    }

    req.customer = decoded;

    next();
  } catch (error) {
    console.error("Customer auth error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired customer token",
    });
  }
};


// ===============================
// BASIC TEST ROUTE
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "Eventory backend is running successfully!",
  });
});


// =====================================================
// ADMIN LOGIN
// =====================================================

app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPasswordHash =
      process.env.ADMIN_PASSWORD_HASH;

    if (!adminUsername || !adminPasswordHash) {
      return res.status(500).json({
        message: "Admin credentials are not configured",
      });
    }

if (username.trim() !== adminUsername.trim()) {
    return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      adminPasswordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      {
        username: adminUsername,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    return res.json({
      message: "Admin login successful",
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      message: "Server error during admin login",
    });
  }
});


// =====================================================
// VERIFY ADMIN TOKEN
// =====================================================

app.get("/api/admin/verify", verifyAdmin, (req, res) => {
  res.json({
    valid: true,
    admin: req.admin,
  });
});


// =====================================================
// CUSTOMER REGISTER
// =====================================================

app.post("/api/customer/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingCustomer = await Customer.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingCustomer) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const customer = await Customer.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Customer registered successfully",

      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error(
      "Customer registration error:",
      error
    );

    res.status(500).json({
      message: "Registration failed",
    });
  }
});


// =====================================================
// CUSTOMER LOGIN
// =====================================================

app.post("/api/customer/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const customer = await Customer.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!customer) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      customer.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        customerId: customer._id,
        email: customer.email,
        role: "customer",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",

      token,

      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error("Customer login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});


// =====================================================
// PRODUCTS
// =====================================================

// GET ALL PRODUCTS

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
});


// GET SINGLE PRODUCT

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    console.error(
      "Get single product error:",
      error
    );

    res.status(400).json({
      message: "Invalid product ID",
    });
  }
});


// =====================================================
// ADD PRODUCT - ADMIN ONLY
// =====================================================

app.post(
  "/api/products",
  verifyAdmin,
  async (req, res) => {
    try {
      const {
        name,
        price,
        categoryType,
        category,
        image,
        description,
      } = req.body;

      if (!name || price === undefined || !category) {
        return res.status(400).json({
          message:
            "Name, price and category are required",
        });
      }

      const product = await Product.create({
        name: name.trim(),

        price: Number(price),

        categoryType:
          categoryType === "Festival"
            ? "Festival"
            : "Occasion",

        category: category.trim(),

        image: image ? image.trim() : "",

        description: description
          ? description.trim()
          : "",
      });

      
res.status(201).json({
  message: "Product added successfully",
  id: product._id.toString(),
  product: {
    ...product.toObject(),
    id: product._id.toString(),
  },
});

    } catch (error) {
      console.error("Add product error:", error);

      res.status(500).json({
        message: "Failed to add product",
        error: error.message,
      });
    }
  }
);


// =====================================================
// UPDATE PRODUCT - ADMIN ONLY
// =====================================================

app.put(
  "/api/products/:id",
  verifyAdmin,
  async (req, res) => {
    try {
      const {
        name,
        price,
        categoryType,
        category,
        image,
        description,
      } = req.body;

      if (!name || price === undefined || !category) {
        return res.status(400).json({
          message:
            "Name, price and category are required",
        });
      }

      const product =
        await Product.findByIdAndUpdate(
          req.params.id,
          {
            name: name.trim(),

            price: Number(price),

            categoryType:
              categoryType === "Festival"
                ? "Festival"
                : "Occasion",

            category: category.trim(),

            image: image ? image.trim() : "",

            description: description
              ? description.trim()
              : "",
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.json({
        message: "Product updated successfully",
        product,
      });
    } catch (error) {
      console.error(
        "Update product error:",
        error
      );

      res.status(500).json({
        message: "Failed to update product",
        error: error.message,
      });
    }
  }
);


// =====================================================
// DELETE PRODUCT - ADMIN ONLY
// =====================================================

app.delete(
  "/api/products/:id",
  verifyAdmin,
  async (req, res) => {
    try {
      const product =
        await Product.findByIdAndDelete(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.json({
        message: "Product deleted successfully",
        product,
      });
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      res.status(400).json({
        message: "Invalid product ID",
      });
    }
  }
);


// =====================================================
// AI GIFT RECOMMENDATION
// =====================================================

app.post("/api/recommendations", async (req, res) => {
  try {
    const {
      relation,
      occasion,
      budget,
      interests,
      products,
    } = req.body;

    // -----------------------------
    // BASIC VALIDATION
    // -----------------------------

    if (!relation || !occasion || !budget) {
      return res.status(400).json({
        message:
          "Relation, occasion and budget are required",
      });
    }

    if (!Array.isArray(products)) {
      return res.status(400).json({
        message: "Products data is required",
      });
    }

    const userBudget = Number(budget);

    if (!Number.isFinite(userBudget) || userBudget <= 0) {
      return res.status(400).json({
        message: "Invalid budget",
      });
    }

    const relationText = String(relation)
      .toLowerCase()
      .trim();

    const occasionText = String(occasion)
      .toLowerCase()
      .trim();

    const interestText = String(interests || "")
      .toLowerCase()
      .trim();


    // -----------------------------
    // RELATION KEYWORDS
    // -----------------------------

    const relationKeywords = {
      friend: [
        "fun",
        "cute",
        "personal",
        "chocolate",
        "friend",
        "gift",
      ],

      mother: [
        "mother",
        "mom",
        "mommy",
        "elegant",
        "self-care",
        "home",
        "flower",
      ],

      father: [
        "father",
        "dad",
        "useful",
        "classic",
        "premium",
      ],

      sister: [
        "sister",
        "cute",
        "fashion",
        "beauty",
        "personal",
      ],

      brother: [
        "brother",
        "tech",
        "cool",
        "gaming",
        "useful",
      ],

      partner: [
        "romantic",
        "love",
        "personal",
        "couple",
        "heart",
        "chocolate",
      ],

      colleague: [
        "office",
        "professional",
        "useful",
        "classic",
        "premium",
      ],
    };


    // -----------------------------
    // FESTIVAL / OCCASION KEYWORDS
    // -----------------------------

    const occasionKeywords = {
      birthday: [
        "birthday",
        "cake",
        "celebration",
        "balloon",
        "birthday gift",
      ],

      anniversary: [
        "anniversary",
        "couple",
        "romantic",
        "love",
        "heart",
      ],

      wedding: [
        "wedding",
        "marriage",
        "couple",
        "bride",
        "groom",
      ],

      graduation: [
        "graduation",
        "graduate",
        "success",
        "achievement",
      ],

      diwali: [
        "diwali",
        "deepavali",
        "diya",
        "lights",
        "festival",
      ],

      "raksha bandhan": [
        "raksha",
        "rakhi",
        "brother",
        "sister",
      ],

      holi: [
        "holi",
        "colors",
        "colour",
        "gulal",
      ],

      christmas: [
        "christmas",
        "xmas",
        "christmas gift",
        "santa",
      ],

      "friendship day": [
        "friendship",
        "friend",
      ],

      "thank you": [
        "thank you",
        "thanks",
        "appreciation",
      ],

      "just because": [
        "surprise",
        "personal",
        "special",
      ],

      "special gift": [
        "special",
        "gift",
      ],
    };


    // -----------------------------
    // CREATE RECOMMENDATIONS
    // -----------------------------

    const recommendations = products.map((product) => {
      let score = 0;

      const reasons = [];

      const productName = String(product.name || "")
        .toLowerCase();

      const productDescription = String(
        product.description || ""
      ).toLowerCase();

      const productCategory = String(
        product.category || ""
      ).toLowerCase();

      const categoryType = String(
        product.categoryType || ""
      ).toLowerCase();

      const productText =
        `${productName} ${productDescription} ${productCategory}`;

      const productPrice =
        Number(product.price) || 0;


      // =====================================================
      // 1. OCCASION MATCH - HIGHEST PRIORITY
      // =====================================================

      let occasionMatch = false;

      // Direct category match
      if (
        productCategory === occasionText ||
        productCategory.includes(occasionText) ||
        occasionText.includes(productCategory)
      ) {
        occasionMatch = true;
      }

      // Keyword-based occasion match
      const selectedOccasionKeywords =
        occasionKeywords[occasionText] || [];

      if (
        selectedOccasionKeywords.some((keyword) =>
          productText.includes(keyword)
        )
      ) {
        occasionMatch = true;
      }


      if (occasionMatch) {
        score += 60;

        reasons.push(
          `Perfect for ${occasion}`
        );
      } else {
        // -----------------------------------------
        // Strong penalty for unrelated occasion
        // -----------------------------------------

        const festivalNames = [
          "diwali",
          "raksha",
          "rakhi",
          "holi",
          "christmas",
        ];

        const isDifferentFestival =
          festivalNames.some(
            (festival) =>
              productCategory.includes(festival) &&
              !occasionText.includes(festival)
          );

        if (isDifferentFestival) {
          score -= 45;
        } else {
          score -= 15;
        }
      }


      // =====================================================
      // 2. BUDGET MATCH
      // =====================================================

      if (productPrice <= userBudget) {
        score += 25;

        const budgetDifference =
          userBudget - productPrice;

        if (
          budgetDifference <=
          userBudget * 0.25
        ) {
          score += 10;

          reasons.push(
            "Fits your budget well"
          );
        }
      } else {
        const extra =
          productPrice - userBudget;

        if (
          extra <= userBudget * 0.15
        ) {
          score += 5;

          reasons.push(
            "Slightly above your budget"
          );
        } else {
          score -= 30;
        }
      }


      // =====================================================
      // 3. INTEREST MATCH
      // =====================================================

      if (interestText) {
        const interestWords =
          interestText
            .split(/[,\s]+/)
            .map((word) => word.trim())
            .filter((word) => word.length >= 3);

        const uniqueInterestWords =
          [...new Set(interestWords)];

        let matchedInterest = false;
        let interestScore = 0;

        uniqueInterestWords.forEach((word) => {
          if (productText.includes(word)) {
            interestScore += 15;
            matchedInterest = true;
          }
        });

        // Maximum 30 points from interests
        score += Math.min(interestScore, 30);

        if (matchedInterest) {
          reasons.push(
            "Matches the recipient's interests"
          );
        }
      }


      // =====================================================
      // 4. RELATION MATCH
      // =====================================================

      const keywords =
        relationKeywords[relationText] || [];

      let relationMatchCount = 0;

      keywords.forEach((keyword) => {
        if (productText.includes(keyword)) {
          relationMatchCount++;
        }
      });

      // Maximum 16 points from relation
      const relationScore =
        Math.min(relationMatchCount * 5, 16);

      score += relationScore;

      if (relationMatchCount > 0) {
        reasons.push(
          `Good match for a ${relation}`
        );
      }


      // =====================================================
      // 5. EXACT FESTIVAL MATCH BONUS
      // =====================================================

      if (
        productCategory.includes("diwali") &&
        occasionText === "diwali"
      ) {
        score += 30;

        if (!reasons.includes("Perfect for Diwali")) {
          reasons.push("Great choice for Diwali");
        }
      }

      if (
        productCategory.includes("raksha") &&
        occasionText.includes("raksha")
      ) {
        score += 30;

        reasons.push(
          "Great choice for Raksha Bandhan"
        );
      }

      if (
        productCategory.includes("holi") &&
        occasionText === "holi"
      ) {
        score += 30;

        reasons.push(
          "Great choice for Holi"
        );
      }

      if (
        productCategory.includes("christmas") &&
        occasionText === "christmas"
      ) {
        score += 30;

        reasons.push(
          "Great choice for Christmas"
        );
      }


      // =====================================================
      // RETURN PRODUCT
      // =====================================================

      return {
        ...product,
        score,
        reasons:
          reasons.length > 0
            ? [...new Set(reasons)]
            : ["Good overall gift choice"],
      };
    });


    // =====================================================
    // SORT BY BEST SCORE
    // =====================================================

    recommendations.sort(
      (a, b) => b.score - a.score
    );


    // =====================================================
    // IF OCCASION MATCHES EXIST,
    // PRIORITIZE THEM OVER UNRELATED PRODUCTS
    // =====================================================

    const matchingOccasionProducts =
      recommendations.filter((product) =>
        product.reasons.some((reason) =>
          reason.toLowerCase().includes("perfect for")
        )
      );

    let topRecommendations;

    if (matchingOccasionProducts.length > 0) {
      // Show occasion-matching products first
      const remainingProducts =
        recommendations.filter(
          (product) =>
            !matchingOccasionProducts.includes(product)
        );

      topRecommendations = [
        ...matchingOccasionProducts,
        ...remainingProducts,
      ].slice(0, 6);
    } else {
      // If no exact occasion product exists,
      // show best overall products
      topRecommendations =
        recommendations.slice(0, 6);
    }


    // =====================================================
    // REMOVE INTERNAL SCORE BEFORE SENDING
    // =====================================================

    topRecommendations =
      topRecommendations.map((product) => {
        const { score, ...cleanProduct } = product;

        return cleanProduct;
      });


    // =====================================================
    // SEND RESPONSE
    // =====================================================

    res.json({
      message:
        "Gift recommendations generated successfully",

      recommendations:
        topRecommendations,
    });

  } catch (error) {
    console.error(
      "Recommendation error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to generate gift recommendations",
    });
  }
});


// =====================================================
// ORDERS
// =====================================================

// CREATE ORDER
// CUSTOMER LOGIN REQUIRED

app.post(
  "/api/orders",
  customerAuth,
  async (req, res) => {
    try {
      const {
        customer,
        items,
        totalAmount,
      } = req.body;


      if (!customer || !items || items.length === 0) {
        return res.status(400).json({
          message:
            "Customer details and order items are required.",
        });
      }


      // Validate phone

      if (
        !/^[0-9]{10}$/.test(
          customer.phone
        )
      ) {
        return res.status(400).json({
          message:
            "Phone number must contain exactly 10 digits",
        });
      }


      // Validate pincode

      if (
        !/^[0-9]{6}$/.test(
          customer.pincode
        )
      ) {
        return res.status(400).json({
          message:
            "Pincode must contain exactly 6 digits",
        });
      }


      // Validate address fields

      if (
        !customer.name ||
        !customer.address ||
        !customer.city
      ) {
        return res.status(400).json({
          message:
            "All delivery details are required",
        });
      }


      // Create order

      const order =
        await Order.create({
          customerId:
            req.customer.customerId,

          customer: {
            name:
              customer.name.trim(),

            phone:
              customer.phone,

            address:
              customer.address.trim(),

            city:
              customer.city.trim(),

            pincode:
              customer.pincode,
          },


          items: items.map((item) => ({
            product:
              item.product ||
              item.id,

            name:
              item.name,

            price:
              Number(item.price),

            quantity:
              Number(item.quantity),

            image:
              item.image || "",
          })),


          totalAmount:
            Number(totalAmount),

          status: "Placed",
        });


      res.status(201).json({
        message:
          "Order placed successfully",

        order,
      });

    } catch (error) {
      console.error(
        "Create order error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to place order",

        error:
          error.message,
      });
    }
  }
);


// =====================================================
// GET ALL ORDERS - ADMIN ONLY
// =====================================================

app.get(
  "/api/admin/orders",
  verifyAdmin,
  async (req, res) => {
    try {
      const orders =
        await Order.find()
          .populate("items.product")
          .sort({
            createdAt: -1,
          });

      res.json(orders);

    } catch (error) {
      console.error(
        "Get orders error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch orders",
      });
    }
  }
);


// =====================================================
// GET CUSTOMER ORDERS
// =====================================================

app.get(
  "/api/customer/orders",
  customerAuth,
  async (req, res) => {
    try {
      const orders =
        await Order.find({
          customerId:
            req.customer.customerId,
        })
          .populate("items.product")
          .sort({
            createdAt: -1,
          });


      res.json({
        orders,
      });

    } catch (error) {
      console.error(
        "Get customer orders error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch customer orders",
      });
    }
  }
);


// =====================================================
// UPDATE ORDER STATUS - ADMIN ONLY
// =====================================================

app.patch(
  "/api/admin/orders/:id",
  verifyAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "Placed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];


      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          message:
            "Invalid order status",
        });
      }


      const order =
        await Order.findByIdAndUpdate(
          req.params.id,
          { status },
          {
            new: true,
            runValidators: true,
          }
        );


      if (!order) {
        return res.status(404).json({
          message:
            "Order not found",
        });
      }


      res.json({
        message:
          "Order status updated successfully",

        order,
      });

    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      res.status(400).json({
        message:
          "Invalid order ID",
      });
    }
  }
);


// =====================================================
// MONGODB CONNECTION
// =====================================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });