import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardContent from "../components/DashboardContent";
import "../styles/UserDashboard.css";

function UserDashboard() {
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState("home");
  const [user, setUser] = useState(null);

  

  return (
    <div className="dashboard-container">
      <Sidebar onSelect={setActiveSection} />
      <DashboardContent user={user}  />
    </div>
  );
}

export default UserDashboard;
