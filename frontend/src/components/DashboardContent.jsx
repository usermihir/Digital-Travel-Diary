import React from "react";
import MapSection from "./MapSection";
import "../Styles/DashboardContent.css";

function DashboardContent({ section}) {
  return (
    <div className="content-area">
      {section === "home" && (
        <>
          <h2>Welcome, {user?.name}!</h2>
          <MapSection userId={user._id} />
        </>
      )}

      {section === "memories" && (
        <>
          <h2>{user?.name}'s Travel Memories</h2>
          <div className="memory-grid">
            {memories.length === 0 ? (
              <p>No memories found.</p>
            ) : (
              memories.map((memory) => (
                <div className="memory-card" key={memory._id}>
                  <h3>{memory.title}</h3>
                  <p>{memory.description}</p>
                  {memory.image && (
                    <img
                      src={memory.image}
                      alt={memory.title}
                      className="memory-image"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {section === "profile" && (
        <>
          <h2>{user?.name}'s Profile</h2>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>About:</strong> {user?.bio || "No bio available."}</p>
          {user?.avatar && (
            <img
              src={user.avatar}
              alt="User avatar"
              className="profile-avatar"
            />
          )}
        </>
      )}

      {section === "settings" && (
        <h2>Settings are only editable by the owner (optional feature)</h2>
      )}
      <MapSection/>
    </div>
  );
}

export default DashboardContent;
