import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/Login.css'; 

const {API_BASE} = import.meta.env.VITE_BACKEND_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    axios
      .post(`${API_BASE}/api/auth/login`, { email, password })
      .then((res) => {
        console.log("Login Response:", res.data);
        const { token, user } = res.data;

        if (token && user) {
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("user", JSON.stringify(user));

          alert("Login successful!");
          navigate(`/user/${user.id}/dashboard`);
        } else {
          alert("Login failed. Please try again.");
        }
      })
      .catch((err) => {
        console.error(err);
        const message = err?.response?.data?.msg || "Something went wrong";
        alert(message);
      });
  };

  return (
<div className="login-container d-flex justify-content-center align-items-center vh-100 text-center">
      <div className="glass-card p-4 rounded-4 shadow-lg">
        <h2 className="mb-4 neon-text">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label htmlFor="email" className="form-label neon-label">
              Email
            </label>
            <input
              type="email"
              className="form-control custom-input"
              id="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4 text-start">
            <label htmlFor="password" className="form-label neon-label">
              Password
            </label>
            <input
              type="password"
              className="form-control custom-input"
              id="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn neon-btn w-100 mb-3">
            Login
          </button>
        </form>
        <p className="text-light">Don’t have an account?</p>
        <Link to="/register" className="btn btn-outline-light glow-outline-btn">
          Register
        </Link>
      </div>
    </div>
  );
};

export default Login;
