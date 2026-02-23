import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect } from 'react';
import { useTracking } from "../contexts/TrackingContext";
import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import Header from '../components/Header';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path fill="#10B981" d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 24 16 24s16-15.163 16-24C32 7.163 24.837 0 16 0z"/>
      <circle fill="white" cx="16" cy="14" r="6"/>
    </svg>
  `),
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
});

const MapPage = () => {
  const courierLocations = useQuery(api.couriers.getLocations);
  const updateLocation = useMutation(api.couriers.updateLocation);
  console.log("Convex couriers:", courierLocations);
  const { t } = useLanguage();
  const { token } = useAuth();
  const { trackingActive } = useTracking();
  const [points, setPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setTrackingActive] = useState(true);

  useEffect(() => {
    if (!trackingActive) return;

    const interval = setInterval(() => {
      updateLocation({
        courierId: "assignedCourier",
        lat: 52.2297 + (Math.random() - 0.5) * 0.01,
        lng: 21.0122 + (Math.random() - 0.5) * 0.01,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [trackingActive]);
  // Warsaw center
  const center = [52.2297, 21.0122];
  const calculateETA = (lat, lng, center) => {
    const dx = lat - center[0];
    const dy = lng - center[1];
    const distance = Math.sqrt(dx * dx + dy * dy);

    return Math.max(2, Math.round(distance * 100));
  };

  useEffect(() => {
    fetchCollectionPoints();
  }, []);

  const fetchCollectionPoints = async () => {
    try {
      const response = await axios.get(`${API}/collection-points`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPoints(response.data);
    } catch (error) {
      console.error('Failed to fetch points:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDirections = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 rounded-xl">
            <MapPin size={24} className="text-primary" />
          </div>
          <h1 className="font-outfit font-bold text-2xl text-stone-800">
            {t('collectionPoints')}
          </h1>
        </div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl overflow-hidden shadow-xl shadow-stone-200/50 border border-stone-100 h-[300px] mb-6"
          data-testid="map-container"
        >
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            preferCanvas={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {points.map((point) => (
              <Marker
                key={point.id}
                position={[point.lat, point.lng]}
                icon={customIcon}
                eventHandlers={{
                  click: () => setSelectedPoint(point),
                }}
              >
                <Popup>
                  <div className="font-dm-sans">
                    <p className="font-bold">{point.name}</p>
                    <p className="text-sm text-stone-500">{point.address}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {courierLocations?.map((c, i) => (
              <Marker
                key={`courier-${i}`}
                position={[c.lat, c.lng]}
                riseOnHover={true}
              >
                <Popup>
                  <div>
                    🚚 Courier: {c.courierId} <br />
                    ETA: {calculateETA(c.lat, c.lng, center)} min
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </motion.div>

        {/* Collection Points List */}
        <section>
          <h2 className="font-outfit font-semibold text-lg text-stone-700 mb-4">
            {t("nearbyPoints")}
          </h2>
          
          {loading ? (
            <div className="text-center py-8 text-stone-400">{t('loading')}</div>
          ) : (
            <div className="space-y-3">
              {points.map((point, index) => (
                <motion.div
                  key={point.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-2xl p-4 shadow-sm border transition-all cursor-pointer ${
                    selectedPoint?.id === point.id 
                      ? 'border-primary shadow-md' 
                      : 'border-stone-100 hover:border-primary-200'
                  }`}
                  onClick={() => setSelectedPoint(point)}
                  data-testid={`point-${point.id}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary-50 rounded-xl">
                      <MapPin size={20} className="text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-stone-800">{point.name}</h3>
                      <p className="text-sm text-stone-500 mt-1">{point.address}</p>
                      
                      <div className="flex items-center gap-1 mt-2 text-sm text-stone-400">
                        <Clock size={14} />
                        <span>{point.opening_hours}</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDirections(point.lat, point.lng);
                      }}
                      className="rounded-xl border-primary text-primary hover:bg-primary-50"
                      data-testid={`directions-${point.id}`}
                    >
                      <Navigation size={16} className="mr-1" />
                      {t('getDirections')}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MapPage;
