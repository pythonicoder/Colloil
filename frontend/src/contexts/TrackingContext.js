import { createContext, useContext, useState } from "react";

const TrackingContext = createContext();

export const TrackingProvider = ({ children }) => {
  const [trackingActive, setTrackingActive] = useState(true);

  return (
    <TrackingContext.Provider value={{ trackingActive, setTrackingActive }}>
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => useContext(TrackingContext);