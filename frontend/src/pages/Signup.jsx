
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";


function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

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
    }
  };

  return (
    <div className="auth-page">
      <h1>Create Account</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error && <p>{error}</p>}

        <button type="submit">
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default Signup;

