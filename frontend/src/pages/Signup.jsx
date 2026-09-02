import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";


function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/signup", {
        name,
        email,
        password,
      });

      navigate("/login");

    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-brand">

          <div className="brand-icon">
            ✦
          </div>

          <h1>AI Customer Support</h1>

          <p>
            Intelligent support powered by your knowledge base
          </p>

        </div>


        <div className="auth-content">

          <h2>Create your account</h2>

          <p className="auth-subtitle">
            Sign up to start using AI Customer Support
          </p>


          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label htmlFor="name">
                Full name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />

            </div>


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
                placeholder="Create a password"
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
              {loading ? "Creating account..." : "Create account"}
            </button>

          </form>


          <p className="auth-footer">

            Already have an account?{" "}

            <Link to="/login">
              Sign in
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}


export default Signup;