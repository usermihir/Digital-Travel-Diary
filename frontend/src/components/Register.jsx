import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Styles/Register.css';
const {API_BASE} = import.meta.env.VITE_BACKEND_URL;

const Register = () => {
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        
        axios.post( `${API_BASE}/api/auth/register`, {name, email, password})
        .then(result => {
            console.log(result);
            if(result.data === "Already registered"){
                alert("E-mail already registered! Please Login to proceed.");
                navigate('/login');
            }
            else{
                alert("Registered successfully! Please Login to proceed.")
                navigate('/login');
            }
            
        })
        .catch(err => console.log(err));
    }


    return (
   <div className="aurora-register-page d-flex justify-content-center align-items-center vh-100">
      <div className="glass-box p-4 rounded text-white" style={{ width: "400px" }}>
        <h2 className="text-gradient text-center mb-4"> Create Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              className="form-control input-soft"
              id="name"
              placeholder="Enter Name"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3 text-start">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control input-soft"
              id="email"
              placeholder="Enter Email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4 text-start">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control input-soft"
              id="password"
              placeholder="Enter Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn neon-button w-100">Register</button>
        </form>

        <div className="text-center mt-3">
          <p className="text-light">Already have an account?</p>
          <Link to="/login" className="btn btn-outline-light">Login</Link>
        </div>
      </div>
    </div>
    )
}

export default Register