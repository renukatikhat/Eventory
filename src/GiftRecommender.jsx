import { useState } from "react";

const API_BASE_URL = "http://127.0.0.1:5000/api";

const relations = [
  {
    value: "partner",
    title: "Partner",
    icon: "♡",
  },
  {
    value: "friend",
    title: "Friend",
    icon: "♧",
  },
  {
    value: "mother",
    title: "Mother",
    icon: "✿",
  },
  {
    value: "father",
    title: "Father",
    icon: "⌂",
  },
  {
    value: "sister",
    title: "Sister",
    icon: "✦",
  },
  {
    value: "brother",
    title: "Brother",
    icon: "◇",
  },
  {
    value: "colleague",
    title: "Colleague",
    icon: "▣",
  },
];

const occasions = [
  "Birthday",
  "Anniversary",
  "Wedding",
  "Graduation",
  "Thank You",
  "Just Because",
  "Special Gift",
  "Diwali",
  "Raksha Bandhan",
  "Holi",
  "Christmas",
  "Ganesh Chaturthi",
  "Makar Sankranti",
  "Eid",
];

const budgets = [
  {
    value: "500",
    label: "Under ₹500",
  },
  {
    value: "1000",
    label: "₹500 – ₹1,000",
  },
  {
    value: "1500",
    label: "₹1,000 – ₹1,500",
  },
  {
    value: "2500",
    label: "₹1,500 – ₹2,500",
  },
  {
    value: "5000",
    label: "₹2,500+",
  },
];

function GiftRecommender({
  products = [],
  onAddToCart,
}) {
  const [relation, setRelation] = useState("");
  const [occasion, setOccasion] = useState("");
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState("");

  const [recommendations, setRecommendations] =
    useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [hasSearched, setHasSearched] =
    useState(false);

  const handleFindGift = async (event) => {
    event.preventDefault();

    setError("");

    if (!relation || !occasion || !budget) {
      setError(
        "Please select who you are buying for, the occasion and your budget."
      );

      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/recommendations`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            relation,
            occasion,
            budget,
            interests,
            products,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to find gift recommendations."
        );
      }

      setRecommendations(
        Array.isArray(data.recommendations)
          ? data.recommendations
          : []
      );
    } catch (err) {
      console.error(
        "Gift recommendation error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong. Please try again."
      );

      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFinder = () => {
    setRelation("");
    setOccasion("");
    setBudget("");
    setInterests("");

    setRecommendations([]);
    setError("");
    setHasSearched(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <section className="ai-concierge">

      {/* =========================================
          AI INTRO
          ========================================= */}

      <div className="ai-concierge-intro">

        <div className="ai-eyebrow">
          ✨ AI-POWERED GIFT CONCIERGE
        </div>

        <h2>
          Your perfect gift,
          <br />
          <span>thoughtfully chosen.</span>
        </h2>

        <p>
          Tell us a little about who you're
          gifting and we'll help you discover
          something they'll truly love.
        </p>

      </div>


      {/* =========================================
          MAIN FINDER
          ========================================= */}

      {!hasSearched && (
        <form
          className="ai-finder-card"
          onSubmit={handleFindGift}
        >

          {/* LEFT BRAND PANEL */}

          <div className="ai-finder-visual">

            <div className="ai-visual-circle">
              <span>🎁</span>
            </div>

            <div className="ai-visual-content">

              <span className="ai-small-label">
                EVENTORY AI
              </span>

              <h3>
                Find something
                <br />
                they'll remember.
              </h3>

              <p>
                Our smart recommendation
                system considers the occasion,
                budget and recipient to help
                you choose better.
              </p>

            </div>

            <div className="ai-visual-bottom">
              <span>Smart matching</span>
              <span>•</span>
              <span>Personalised picks</span>
            </div>

          </div>


          {/* RIGHT FORM */}

          <div className="ai-finder-form">

            <div className="finder-section">

              <div className="finder-label">

                <span className="finder-number">
                  01
                </span>

                <div>
                  <strong>
                    Who are you gifting?
                  </strong>

                  <small>
                    Choose the person
                  </small>
                </div>

              </div>


              <div className="relation-grid">

                {relations.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={
                      relation === item.value
                        ? "relation-option selected"
                        : "relation-option"
                    }
                    onClick={() =>
                      setRelation(item.value)
                    }
                  >
                    <span className="relation-icon">
                      {item.icon}
                    </span>

                    <span>
                      {item.title}
                    </span>
                  </button>
                ))}

              </div>

            </div>


            <div className="finder-divider" />


            <div className="finder-section">

              <div className="finder-label">

                <span className="finder-number">
                  02
                </span>

                <div>
                  <strong>
                    What's the occasion?
                  </strong>

                  <small>
                    Pick the moment
                  </small>
                </div>

              </div>


              <div className="occasion-grid">

                {occasions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      occasion === item
                        ? "occasion-option selected"
                        : "occasion-option"
                    }
                    onClick={() =>
                      setOccasion(item)
                    }
                  >
                    {item}
                  </button>
                ))}

              </div>

            </div>


            <div className="finder-divider" />


            <div className="finder-section">

              <div className="finder-label">

                <span className="finder-number">
                  03
                </span>

                <div>
                  <strong>
                    What's your budget?
                  </strong>

                  <small>
                    We'll stay within your range
                  </small>
                </div>

              </div>


              <div className="budget-grid">

                {budgets.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={
                      budget === item.value
                        ? "budget-option selected"
                        : "budget-option"
                    }
                    onClick={() =>
                      setBudget(item.value)
                    }
                  >
                    {item.label}
                  </button>
                ))}

              </div>

            </div>


            <div className="finder-divider" />


            <div className="finder-section">

              <div className="finder-label">

                <span className="finder-number">
                  04
                </span>

                <div>
                  <strong>
                    What do they love?
                  </strong>

                  <small>
                    Optional — tell us their interests
                  </small>
                </div>

              </div>


              <textarea
                value={interests}
                onChange={(event) =>
                  setInterests(event.target.value)
                }
                placeholder="e.g. chocolates, flowers, books, fashion, self-care..."
                className="interests-input"
              />

            </div>


            {error && (
              <div className="ai-error">
                {error}
              </div>
            )}


            <button
              type="submit"
              className="find-perfect-gift-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="ai-spinner" />
                  Finding your perfect gift...
                </>
              ) : (
                <>
                  ✨ Find My Perfect Gift
                  <span>→</span>
                </>
              )}
            </button>

          </div>

        </form>
      )}


      {/* =========================================
          RESULTS
          ========================================= */}

      {hasSearched && (
        <div className="ai-results">

          <div className="ai-results-header">

            <div>

              <span className="ai-results-eyebrow">
                ✨ YOUR PERSONAL PICKS
              </span>

              <h2>
                Gifts chosen for you.
              </h2>

              <p>
                Based on your recipient,
                occasion and budget.
              </p>

            </div>


            <button
              type="button"
              className="change-preferences-btn"
              onClick={resetFinder}
            >
              ← Change preferences
            </button>

          </div>


          {loading && (
            <div className="ai-loading">

              <div className="loading-orb">
                ✨
              </div>

              <h3>
                Finding the right gifts...
              </h3>

              <p>
                Eventory is matching your
                preferences with our collection.
              </p>

            </div>
          )}


          {!loading &&
            recommendations.length === 0 && (
              <div className="ai-no-results">

                <div>🎁</div>

                <h3>
                  We couldn't find a perfect match.
                </h3>

                <p>
                  Try increasing your budget or
                  choosing another occasion.
                </p>

                <button
                  type="button"
                  onClick={resetFinder}
                >
                  Try Again
                </button>

              </div>
            )}


          {!loading &&
            recommendations.length > 0 && (
              <div className="ai-results-grid">

                {recommendations.map(
                  (product, index) => (
                    <article
                      className={
                        index === 0
                          ? "ai-result-card best-match"
                          : "ai-result-card"
                      }
                      key={
                        product._id ||
                        product.id ||
                        index
                      }
                    >

                      {index === 0 && (
                        <div className="best-match-badge">
                          ★ BEST MATCH
                        </div>
                      )}


                      <div className="ai-result-image-wrap">

                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="ai-result-image"
                          />
                        ) : (
                          <div className="ai-no-image">
                            🎁
                          </div>
                        )}

                      </div>


                      <div className="ai-result-content">

                        <span className="ai-result-category">
                          {product.category}
                        </span>

                        <h3>
                          {product.name}
                        </h3>

                        <p className="ai-result-description">
                          {product.description}
                        </p>


                        {Array.isArray(
                          product.reasons
                        ) &&
                          product.reasons.length >
                            0 && (
                            <div className="why-match">

                              <strong>
                                Why this gift?
                              </strong>

                              <ul>
                                {product.reasons
                                  .slice(0, 2)
                                  .map(
                                    (
                                      reason,
                                      reasonIndex
                                    ) => (
                                      <li
                                        key={
                                          reasonIndex
                                        }
                                      >
                                        {reason}
                                      </li>
                                    )
                                  )}
                              </ul>

                            </div>
                          )}


                        <div className="ai-result-bottom">

                          <strong className="ai-result-price">
                            ₹
                            {Number(
                              product.price
                            ).toLocaleString("en-IN")}
                          </strong>

                          <button
                            type="button"
                            className="ai-add-cart-btn"
                            onClick={() =>
                              onAddToCart(product)
                            }
                          >
                            Add to Cart
                          </button>

                        </div>

                      </div>

                    </article>
                  )
                )}

              </div>
            )}

        </div>
      )}


      {/* =========================================
          HOW IT WORKS
          ========================================= */}

      {!hasSearched && (
        <div className="ai-how-it-works">

          <div className="how-heading">
            <span>
              THE EVENTORY WAY
            </span>

            <h3>
              Gift shopping, made simple.
            </h3>
          </div>


          <div className="how-steps">

            <div className="how-step">

              <span className="how-number">
                01
              </span>

              <h4>
                Tell us about them
              </h4>

              <p>
                Choose the recipient,
                occasion and budget.
              </p>

            </div>


            <div className="how-line" />


            <div className="how-step">

              <span className="how-number">
                02
              </span>

              <h4>
                Let Eventory think
              </h4>

              <p>
                Our smart matching system
                compares your preferences.
              </p>

            </div>


            <div className="how-line" />


            <div className="how-step">

              <span className="how-number">
                03
              </span>

              <h4>
                Choose your favourite
              </h4>

              <p>
                Pick a gift and add it
                straight to your cart.
              </p>

            </div>

          </div>

        </div>
      )}

    </section>
  );
}

export default GiftRecommender;