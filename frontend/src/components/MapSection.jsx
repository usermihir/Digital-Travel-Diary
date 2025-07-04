import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  Autocomplete,
  Polyline,
} from "@react-google-maps/api";
import axios from "axios";
import "../Styles/MapSection.css";
import { jwtDecode } from "jwt-decode"; 


const libraries = ["places"];
const mapContainerStyle = { width: "100%", height: "100vh" };
const center = { lat: 20.5937, lng: 78.9629 };

function MapSection() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapRef = useRef();
  const [autocomplete, setAutocomplete] = useState(null);
  const [marker, setMarker] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [memoryMarkers, setMemoryMarkers] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [savedTrips, setSavedTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    special: "",
    images: [],
  });
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [userId, setUserId] = useState(null);
  const mediaRecorderRef = useRef(null);
  const [currentTripId, setCurrentTripId] = useState(null);


  useEffect(() => {
  const token = sessionStorage.getItem("token");
  if (token) {
    const decoded = jwtDecode(token); 
    setUserId(decoded.id);
  }
  }, []);

  useEffect(() => {
  setMemoryMarkers([]);
  setSavedTrips([]);
  setCurrentTrip([]);
  setMarker(null);
  setSelectedMemory(null);
}, [userId]);

  

  const onMapClick = useCallback((event) => {
    setSelectedMemory(null);
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setMarker(location);
    setFormData({ title: "", description: "", special: "", images: [] });
    setShowForm(true);
  }, []);

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) {
        console.error("No geometry found for this place");
        return;
      }
      const location = place.geometry.location;
      mapRef.current.panTo({
        lat: location.lat(),
        lng: location.lng(),
      });
      mapRef.current.setZoom(14);
    }
  };

const handleChange = (e) => {
  const { name, value, files } = e.target;

  if (name === "images") {
    setFormData((prev) => ({
      ...prev,
      images: [...files].slice(0, 10), // Max 10 files
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};


const handleSubmit = async (endTrip = false) => {
  if (!marker || typeof marker.lat !== "number" || typeof marker.lng !== "number") {
    alert("Please select a location on the map before submitting.");
    return;
  }

  try {
    const token = sessionStorage.getItem("token");
    const newPoint = { lat: marker.lat, lng: marker.lng };

    let tripIdToUse = currentTripId;

    // ✅ If starting a new trip, create trip first and get the ObjectId
    if (!currentTripId) {
      const tripRes = await axios.post(
        "http://localhost:5000/api/trips",
        {
          title: formData.title || "Untitled Trip",
          description: formData.description || "",
          locations: [newPoint],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      tripIdToUse = tripRes.data._id;
      setCurrentTripId(tripIdToUse);
    }

    // ✅ Now prepare memory form data and attach tripId
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("special", formData.special);
    data.append("lat", newPoint.lat);
    data.append("lng", newPoint.lng);
    data.append("tripId", tripIdToUse); // ✅ Always a valid ObjectId

    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((file) => data.append("images", file));
    }

    if (audioBlob) {
      const audioFile = new File([audioBlob], "voice-note.webm", {
        type: "audio/webm",
      });
      data.append("audio", audioFile);
    }

    // ✅ Save the memory with valid tripId
    const res = await axios.post("http://localhost:5000/api/memories", data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setMemoryMarkers((prev) => [...prev, res.data]);
    const updatedTrip = [...currentTrip, newPoint];

    if (endTrip) {
      // ✅ Update the existing trip with new points (optional)
      await axios.put(
        `http://localhost:5000/api/trips/${tripIdToUse}`,
        { locations: updatedTrip },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Refresh and cleanup
      const tripsRes = await axios.get("http://localhost:5000/api/trips", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSavedTrips(tripsRes.data);
      setCurrentTrip([]);
      setCurrentTripId(null);
    } else {
      setCurrentTrip(updatedTrip);
    }

    // ✅ Reset form state
    setShowForm(false);
    setAudioBlob(null);
    setFormData({ title: "", description: "", special: "", images: [] });
  } catch (err) {
    console.error("Failed to save memory or trip", err);
  }
};



 useEffect(() => {
  const fetchMemoriesAndTrips = async () => {
    const token = sessionStorage.getItem("token");
    if (!token || !userId) return;

    try {
      const [memoriesRes, tripsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/memories/my", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/trips", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const userMemories = memoriesRes.data.filter(mem => mem.user === userId);
      const userTrips = tripsRes.data.filter(trip => trip.user === userId);

      setMemoryMarkers(userMemories);
      setSavedTrips(userTrips);
      setCurrentTrip([]); // reset trip for new session
    } catch (err) {
      console.error("Error fetching memories or trips", err);
    }
  };

  fetchMemoriesAndTrips();
}, [userId]);


  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setAudioBlob(blob);
    };

    recorder.start();
    setRecording(true);
    mediaRecorderRef.current = recorder;
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps...";

  return (
    <div className="map-container position-relative vh-100 vw-80 bg-dark text-light d-flex flex-column">


  {/* Main Content: map + overlays */}
  <div className="flex-grow-1 position-relative">

    {/* Search Box */}
    <div className="search-container position-absolute top-3 start-50 translate-middle-x w-100 w-md-50 px-3">
      <div className="input-group shadow-lg rounded-pill bg-glass border border-secondary">
        <input
          type="search"
          placeholder="Search location..."
          className="form-control bg-transparent text-light border-0 ps-3"
          aria-label="Search location"
        />
        <button className="btn btn-neon px-3" type="button">🔍</button>
      </div>
    </div>

    {/* Google Map - fill the container */}
    <GoogleMap
      mapContainerStyle={{ height: '100%', width: '100%' }}
      zoom={5}
      center={center}
      onClick={onMapClick}
      onLoad={map => (mapRef.current = map)}
    >
      {memoryMarkers.map((mem, idx) =>
  mem.location?.lat != null && mem.location?.lng != null ? (
    <Marker
      key={idx}
      position={{ lat: mem.location.lat, lng: mem.location.lng }}
      icon={{
        url:
          idx === 0
            ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
            : idx === memoryMarkers.length - 1
            ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      }}
      onClick={() => {
        setSelectedMemory(mem);
        setShowForm(false);
      }}
    />
  ) : null
)}

{currentTrip.length > 1 && (
  <Polyline
    path={currentTrip.map((loc) => ({ lat: loc.lat, lng: loc.lng }))}
    options={{
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 3,
    }}
  />
)}

{savedTrips.map((trip, i) => (
  <Polyline
    key={i}
    path={
      Array.isArray(trip.locations)
        ? trip.locations.map((loc) => ({
            lat: Number(loc.lat),
            lng: Number(loc.lng),
          }))
        : []
    }
    options={{
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 3,
    }}
  />
))}

{savedTrips.map((trip, i) =>
  trip.locations.map((loc, j) => (
    <Marker
      key={`trip-${i}-point-${j}`}
      position={{ lat: Number(loc.lat), lng: Number(loc.lng) }}
      icon={{
        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      }}
    />
  ))
)}

{marker && showForm && <Marker position={marker} />}

    </GoogleMap>


  </div>

  {/* Modals */}
  {selectedMemory && (
    <div className="modal fade show d-block bg-black bg-opacity-75" tabIndex="-1" onClick={() => setSelectedMemory(null)}>
      <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
        <div className="modal-content bg-glass border border-secondary text-light shadow-lg">
          <div className="modal-header border-0">
            <h5 className="modal-title neon-text">{selectedMemory.title}</h5>
            <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={() => setSelectedMemory(null)}></button>
          </div>
          <div className="modal-body">
            <p><strong>Description:</strong> {selectedMemory.description}</p>
            <p><strong>Special:</strong> {selectedMemory.special}</p>
            {selectedMemory.audioUrl && <audio controls src={selectedMemory.audioUrl} className="w-100 my-3 rounded" />}
            {selectedMemory.imageUrl && <img src={selectedMemory.imageUrl} alt="Uploaded" className="img-fluid rounded shadow-sm" />}
          </div>
        </div>
      </div>
    </div>
  )}

  {showForm && (
    <div className="modal fade show d-block bg-black bg-opacity-75" tabIndex="-1" onClick={() => setShowForm(false)}>
      <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
        <div className="modal-content bg-glass border border-secondary text-light shadow-lg p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="neon-text m-0">Add Memory</h3>
          <button
            type="button"
            className="btn-close btn-close-white"
            aria-label="Close"
            onClick={() => setShowForm(false)}
          ></button>
        </div>
          <form className="text-light">
            {/* Use Bootstrap form controls */}
            <div className="mb-3">
              <label htmlFor="title" className="form-label neon-text">Title</label>
              <input type="text" id="title" name="title" className="form-control bg-transparent text-light border border-secondary" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label neon-text">Description</label>
              <textarea id="description" name="description" rows="3" className="form-control bg-transparent text-light border border-secondary" value={formData.description} onChange={handleChange} required></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="special" className="form-label neon-text">Special Thing</label>
              <input type="text" id="special" name="special" className="form-control bg-transparent text-light border border-secondary" value={formData.special} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="images" className="form-label neon-text">Images</label>
              <input type="file" id="images" name="images" multiple accept="image/*" className="form-control bg-transparent text-light border border-secondary" onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label neon-text">Voice Note</label>
              <div>
                {!recording && <button type="button" className="btn btn-neon me-2" onClick={startRecording}>🎙️ Start</button>}
                {recording && <button type="button" className="btn btn-danger" onClick={stopRecording}>⏹️ Stop</button>}
                {audioBlob && <audio controls src={URL.createObjectURL(audioBlob)} className="w-100 mt-3 rounded" />}
              </div>
            </div>
            <div className="d-flex justify-content-between gap-2">
              <button type="button" className="btn btn-primary flex-grow-1" onClick={() => handleSubmit(false)}>Continue Trip</button>
              <button type="button" className="btn btn-danger flex-grow-1" onClick={() => handleSubmit(true)}>End Trip</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )}
</div>

  );
}

export default MapSection;