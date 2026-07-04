import React, { useEffect, useState } from "react";
import "./OfflineIndicator.css";

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log("✓ Back online");
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("✗ Went offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="offline-indicator">
      <div className="offline-content">
        <span className="offline-icon">📡</span>
        <span className="offline-text">Вы в офлайн режиме</span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
