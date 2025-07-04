import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Memories from "../components/Memories";
import "../Styles/UserMemories.css";

const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;

function UserMemories() {
  const [memories, setMemories] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();
  

  const getAddressFromLatLng = async ({ lat, lng }) => {
    try {
      const res = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
        params: {
          key: OPENCAGE_API_KEY,
          q: `${lat},${lng}`,
          no_annotations: 1,
          language: "en",
        },
      });
      return (
        res.data?.results?.[0]?.components?.city ||
        res.data?.results?.[0]?.components?.town ||
        res.data?.results?.[0]?.components?.village ||
        res.data?.results?.[0]?.formatted ||
        "Unknown"
      );
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      return "Unknown";
    }
  };

  useEffect(() => {
    const fetchMemoriesAndTrips = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        alert("Unauthorized");
        navigate("/login");
        return;
      }

      try {
        setLoading(true);

        const memRes = await axios.get("http://localhost:5000/api/memories/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const tripRes = await axios.get("http://localhost:5000/api/trips", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const enrichedTrips = await Promise.all(
          tripRes.data.map(async (trip) => {
            const placeNames = await Promise.all(
              trip.locations.map((loc) => getAddressFromLatLng(loc))
            );
            return { ...trip, locationNames: placeNames };
          })
        );

        setMemories(memRes.data);
        setTrips(enrichedTrips);
      } catch (err) {
        console.error("Error loading data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemoriesAndTrips();
  }, [navigate]);

  const handleView = (memory) => {
    console.log("View memory:", memory);
    // Optionally open a modal
  };

  const handleEdit = (memory) => {
    console.log("Edit memory:", memory);
    // Navigate to edit page or open a modal
  };

  const handleDelete = async (memoryId) => {
    const confirm = window.confirm("Are you sure you want to delete this memory?");
    if (!confirm) return;

    const token = sessionStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/memories/${memoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMemories((prev) => prev.filter((m) => m._id !== memoryId));
    } catch (err) {
      console.error("Error deleting memory", err);
    }
  };

  return (
   <div className="d-flex bg-dark text-light" style={{ height: "100vh", overflow: "hidden" }}>
    <Sidebar onSelect={setActiveSection} />

  {loading ? (
    <div className="flex-grow-1 d-flex justify-content-center align-items-center">
      <div className="spinner-border text-info" role="status" />
    </div>
  ) : (
    <div className="flex-grow-1 overflow-y-auto" style={{ height: "100vh" }}>
      <Memories
        memories={memories}
        trips={trips}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )}
</div>
  );
}

export default UserMemories;
