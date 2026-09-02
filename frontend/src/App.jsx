
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/login";
import Signup from "./pages/signup";
import { useAuth } from "./context/AuthContext";
import CustomerDashboard from "./pages/CustomerDashboard";


function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


function Dashboard() {
  const { logout } = useAuth();

  return (
    <div>
      <h1>Customer Dashboard</h1>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
