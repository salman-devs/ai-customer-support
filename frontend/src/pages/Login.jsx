
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      login(response.data.access_token);

      const userResponse = await api.get("/users/me");

      if (userResponse.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-brand">
          <div className="brand-icon">✦</div>

          <h1>AI Customer Support</h1>

          <p>
            Intelligent support powered by your knowledge base
          </p>
        </div>


        <div className="auth-content">

          <h2>Welcome back</h2>

          <p className="auth-subtitle">
            Sign in to continue to your account
          </p>


          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>


            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>


            {error && (
              <div className="error-message">
                {error}
              </div>
            )}


            <button
              className="auth-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>


          <p className="auth-footer">
            Don't have an account?{" "}
            <Link to="/signup">
              Create one
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}


export default Login;
