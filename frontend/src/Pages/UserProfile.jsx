import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../Styles/UserProfile.css";
import axios from "axios";
import { FaCamera } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_BACKEND_URL;


function UserProfile() {
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("user")));
  const [image, setImage] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  // Optional: check for unauthorized access
  useEffect(() => {
    if (!user || user.id !== id) {
      alert("Unauthorized access!");
      navigate("/login");
    }
  }, [id]);

  const handleImageChange = async (e) => {
    const selectedImage = e.target.files[0];
    console.log("Uploading image:", selectedImage);
    if (!selectedImage) return;
    setImage(selectedImage);

    const formData = new FormData();
    formData.append("profileImage", selectedImage);

    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/api/users/upload-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = {
        ...user, // retain existing id
        ...res.data.user, // apply new image or any updated info
      };

      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setImage(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div className="profile-page d-flex vh-100 text-light bg-dark">
  <Sidebar />

  <div className="flex-grow-1 p-4 glass-bg">
    {/* Header */}
    <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-3 mb-4">
      <h2 className="neon-text m-0">👤 My Profile</h2>
      <span className="badge bg-info text-dark fs-6">🟢 Online</span>
    </div>

    <div className="row g-4 align-items-center">
      {/* Avatar + Upload */}
      <div className="col-md-4 text-center">
        <div className="position-relative d-inline-block">
          <img
            src={
              user?.profileImage
                ? `${API_BASE}/${user.profileImage}`
                : "https://via.placeholder.com/150"
            }
            className="rounded-circle border border-info shadow neon-border"
            style={{ width: "180px", height: "180px", objectFit: "cover" }}
            alt="User Avatar"
          />
          <label
            htmlFor="image-upload"
            className="position-absolute bottom-0 end-0 bg-dark p-2 rounded-circle border border-secondary"
            style={{ cursor: "pointer" }}
          >
            <FaCamera className="text-info" />
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </label>
        </div>
      </div>

      {/* User Info */}
      <div className="col-md-8">
        <div className="p-4 rounded glass-card border border-secondary shadow">
          <h4 className="text-info">Account Information</h4>
          <hr className="border-info opacity-50" />
          <p className="mb-2"><strong className="text-secondary">Name:</strong> {user?.name}</p>
          <p><strong className="text-secondary">Email:</strong> {user?.email}</p>
        </div>
      </div>
    </div>
  </div>
</div>

  );
}

export default UserProfile;
