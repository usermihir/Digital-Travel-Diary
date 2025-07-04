import React from "react";
import "../Styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="logo">🌍 Travel Buddy</span>
      </div>
      <div className="navbar-right">
        <button className="profile-btn">👤</button>
      </div>
    </nav>
  );
}

export default Navbar;
