import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../Styles/Sidebar.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Use sessionStorage
  const user = JSON.parse(sessionStorage.getItem("user")); // Make sure your login stores it in sessionStorage

const menuItems = [
  { id: "home", label: "Home", icon: "bi-house-door" },
  { id: "memories", label: "Memories", icon: "bi-camera" },
  { id: "profile", label: "Profile", icon: "bi-person" },
];


  const handleClick = (id) => {
    if (!user?.id) return;
    const routes = {
      home: `/user/${user.id}/dashboard`,
      memories: `/user/${user.id}/memories`,
      profile: `/user/${user.id}/profile`,
    };
    navigate(routes[id]);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={`sidebar-container ${isOpen ? "expanded" : "collapsed"}`}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center sidebar-header px-3 py-3">
       <h4 className="text-white fw-bold mb-0">
         {isOpen ? <img src="/treko.png" alt="Treko" style={{
        height: '2.7rem',
        width:'9rem',
        background: 'transparent'
      }} /> : ""}
       </h4>
       <button
          className="btn btn-outline-light btn-sm toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      <div className="custom-line"></div>

      {/* Menu Items */}
      <ul className="nav flex-column mt-3">
        {menuItems.map((item) => {
          const isActive = location.pathname.includes(item.id);
          return (
            <li key={item.id} className={`nav-item ${isActive ? "active" : ""}`}>
              <OverlayTrigger
                placement="right"
                overlay={!isOpen ? <Tooltip>{item.label}</Tooltip> : <></>}
              >
                <button
                  className="btn nav-link text-white d-flex align-items-center w-100"
                  onClick={() => handleClick(item.id)}
                >
                  <i className={`bi ${item.icon} me-2`}></i>
                  {isOpen && <span>{item.label}</span>}
                </button>
              </OverlayTrigger>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      {user && (
        <div className="sidebar-footer text-white px-3 py-3 mt-auto">
          <div className="d-flex align-items-center mb-2">
            <div className="avatar bg-light text-dark rounded-circle me-2">
              {user.name?.charAt(0)}
            </div>
            {isOpen && (
              <div className="user-info">
                <strong>{user.name}</strong>
                <div className="small">{user.email}</div>
              </div>
            )}
          </div>
          {/* Logout Button */}
          <button
            className="btn btn-sm btn-outline-danger w-100 mt-2"
            onClick={handleLogout}
          >
            {isOpen ? "🚪 Logout" : "🚪"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
