import React, { useState, useEffect } from "react";
import { Form, Badge, Modal } from "react-bootstrap";
import "../Styles/UserMemories.css";

const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;

const Memories = ({ memories, trips }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSentiment, setFilterSentiment] = useState("All");
  const [locationNamesMap, setLocationNamesMap] = useState({});
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getSentimentBadge = (sentiment) => {
    if (sentiment === "positive") return <Badge bg="success">😊 Positive</Badge>;
    if (sentiment === "negative") return <Badge bg="danger">😞 Negative</Badge>;
    if (sentiment === "neutral") return <Badge bg="secondary">😐 Neutral</Badge>;
    return <Badge bg="dark">🤖 Unknown</Badge>;
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${OPENCAGE_API_KEY}`
      );
      const data = await response.json();
      return data.results?.[0]?.formatted || "Unknown";
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return "Unknown";
    }
  };

  useEffect(() => {
    const fetchAllNames = async () => {
      const newMap = {};
      for (const trip of trips) {
        for (let i = 0; i < trip.locations.length; i++) {
          const loc = trip.locations[i];
          const key = `${trip._id}-${i}`;
          const name = await reverseGeocode(loc.lat, loc.lng);
          newMap[key] = name;
        }
      }
      setLocationNamesMap(newMap);
    };
    fetchAllNames();
  }, [trips]);

  const filteredMemories = memories.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSentiment =
      filterSentiment === "All" || m.sentiment === filterSentiment.toLowerCase();
    return matchesSearch && matchesSentiment;
  });

  const handleCardClick = (memory) => {
    setSelectedMemory(memory);
    setShowModal(true);
  };

  return (
    <div className="flex-grow-1 overflow-auto">
            {/* Trip & Memory Section */}
      <div className="container py-4">
        <h3 className="text-light mb-4">🧭 Saved Trips</h3>

        {trips.length === 0 ? (
          <p className="text-muted">No trips found.</p>
        ) : (
          trips.map((trip, idx) => {
            const route = (trip.locationNames || []).join(" → ");
            const tripMemories = memories.filter(
              (m) => (m.tripId?._id || m.tripId)?.toString() === trip._id.toString()
            );

            return (
              <div
                className="card bg-dark border border-secondary text-light mb-4 shadow-sm"
                key={trip._id}
              >
                <div className="card-body">
                  <h5 className="card-title mb-1">
                    🚀 Trip {idx + 1}: {route}
                  </h5>
                  <p className="text-muted small mb-3">
                    {new Date(trip.createdAt).toLocaleDateString()}
                  </p>

                  {tripMemories.length === 0 ? (
                    <p className="text-muted">No memories for this trip.</p>
                  ) : (
                    <div className="row g-4 text-light">
  {tripMemories.slice(0, 2).map((memory, memIdx) => (
    <div className="col-12 col-md-6" key={memIdx}>
      <div
        className="card h-100 w-100 bg-secondary bg-opacity-10 border border-secondary rounded shadow-sm text-light memory-card"
        onClick={() => handleCardClick(memory)}
        style={{ cursor: "pointer" }}
      >
        {/* Images */}
        {memory.imageUrls?.length > 0 && (
          <div className="mb-2 d-flex flex-wrap gap-2">
            {memory.imageUrls.map((imgUrl, i) => (
              <img
                key={i}
                src={imgUrl}
                alt={`Memory ${i}`}
                className="rounded"
                style={{
                  height: "120px",
                  width: "auto",
                  objectFit: "cover",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  maxWidth: "48%",
                }}
              />
            ))}
          </div>
        )}

        {/* Body */}
        <div className="card-body">
          <h6 className="card-title text-light">{memory.title}</h6>
          <p className="card-text small text-light-emphasis">{memory.description}</p>
          <p className="text-light small mb-1">
            <i className="bi bi-calendar-event"></i>{" "}
            {new Date(memory.createdAt).toLocaleDateString()}
          </p>
          {memory.audioUrl && (
            <audio controls src={memory.audioUrl} className="w-100 mt-2" />
          )}
        </div>
      </div>
    </div>
  ))}
</div>

                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Image Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
        className="image-modal"
      >
        <Modal.Body className="bg-dark text-center rounded animate-modal">
          {selectedMemory?.imageUrls?.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Popup ${i}`}
              className="img-fluid m-2 animate-image"
              style={{ borderRadius: "10px" }}
            />
          ))}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Memories;
