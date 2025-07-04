import Login from './components/Login';
import Register from './components/Register';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserDashboard from "./Pages/UserDashboard";
import UserMemories from "./Pages/UserMemories";
import UserProfile from "./Pages/UserProfile";
import UserDashboardWrapper from "./Pages/UserDashboardWrapper";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';




// ✅ A wrapper inside the route to access `useParams`
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
       <Route
  path="/user/:id/dashboard"
  element={
    <ProtectedRoute>
      <UserDashboardWrapper />
    </ProtectedRoute>
  }
/>

        <Route
          path="/user/:id/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/:id/memories"
          element={
            <ProtectedRoute>
              <UserMemories />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
