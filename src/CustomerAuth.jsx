import { useState } from "react";
import "./CustomerAuth.css";

const API_URL = "http://localhost:5000/api/customer";

function CustomerAuth({ onLogin, onBack }) {
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (isRegister && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister
        ? `${API_URL}/register`
        : `${API_URL}/login`;

      const body = isRegister
        ? {
            name: name.trim(),
            email: email.trim(),
            password,
          }
        : {
            email: email.trim(),
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong."
        );
      }

      if (isRegister) {
        setSuccess(
          "Account created successfully! You can now login."
        );

        setIsRegister(false);
        setPassword("");
      } else {
        localStorage.setItem(
          "eventory-customer-token",
          data.token
        );

        localStorage.setItem(
          "eventory-customer",
          JSON.stringify(data.customer)
        );

        onLogin(data.customer);
      }
    } catch (err) {
      console.error("Customer auth error:", err);

      setError(
        err.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="customer-auth-page">
      <div className="customer-auth-card">

        <button
          type="button"
          className="auth-back-button"
          onClick={onBack}
        >
          ← Back to Eventory
        </button>

        <div className="customer-auth-header">
          <div className="customer-auth-icon">🎁</div>

          <div className="auth-eyebrow">
            EVENTORY
          </div>

          <h1>
            {isRegister
              ? "Create Your Account"
              : "Welcome Back"}
          </h1>

          <p>
            {isRegister
              ? "Create an account and start discovering thoughtful gifts."
              : "Login to continue shopping for the perfect gift."}
          </p>
        </div>

        <form
          className="customer-auth-form"
          onSubmit={handleSubmit}
        >

          {isRegister && (
            <label>
              Full Name

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </label>
          )}

          <label>
            Email Address

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />
          </label>

          <label>
            Password

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
          </label>

          {error && (
            <div className="customer-auth-error">
              {error}
            </div>
          )}

          {success && (
            <div className="customer-auth-success">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="customer-auth-submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isRegister
              ? "Create Account"
              : "Login"}
          </button>
        </form>

        <div className="customer-auth-switch">
          {isRegister
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setSuccess("");
            }}
          >
            {isRegister
              ? "Login"
              : "Create Account"}
          </button>
        </div>

      </div>
    </section>
  );
}

export default CustomerAuth;