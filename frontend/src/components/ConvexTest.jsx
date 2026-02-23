import { useQuery } from "convex/react";

export default function ConvexTest() {
  const locations = useQuery("couriers:getLocations");

  return (
    <div style={{ padding: 20 }}>
      <h2>Convex Test</h2>
      <pre>{JSON.stringify(locations, null, 2)}</pre>
    </div>
  );
}