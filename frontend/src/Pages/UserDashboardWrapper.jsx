// UserDashboardWrapper.jsx
import React from "react";
import { useParams } from "react-router-dom";
import UserDashboard from "./UserDashboard";

const UserDashboardWrapper = () => {
  const { id } = useParams();
  return <UserDashboard key={id} />;
};

export default UserDashboardWrapper;
