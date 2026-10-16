import { useState } from "react";
import "./Auth.css";

const ADMIN_LOGIN_URL = "https://eventory-backend.onrender.com/api/admin/login";

function Auth({ onLogin, onCancel }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(ADMIN_LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid username or password"
        );
      }

      if (!data.token) {
        throw new Error(
          "Login successful, but admin token was not received."
        );
      }

      // Send token to App.jsx
      onLogin(data.token);

      // Clear password from frontend state
      setPassword("");
    } catch (error) {
      console.error("Admin login error:", error);

      setError(
        error.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <button
          type="button"
          className="auth-back"
          onClick={onCancel}
        >
          ← Back to store
        </button>

        <div className="auth-mark" aria-hidden="true">
          E
        </div>

        <p className="auth-eyebrow">EVENTORY ADMIN</p>

        <h1>Welcome back</h1>

        <p className="auth-subtitle">
          Sign in to manage your store and products.
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="admin-username">
            Admin username
          </label>

          <input
            id="admin-username"
            type="text"
            autoComplete="username"
            placeholder="Enter admin username"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            required
          />

          <label htmlFor="admin-password">
            Password
          </label>

          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          {error && (
            <p
              className="auth-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign in to dashboard"}
          </button>
        </form>

        <p className="auth-footnote">
          Authorized administrators only.
        </p>
      </section>
    </main>
  );
}

export default Auth;