import { useEffect, useState } from 'react';
import { api } from "../convex/_generated/api";
import { useMutation } from "convex/react";
import { useTracking } from "../contexts/TrackingContext";
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Droplet, Truck } from 'lucide-react';
import axios from 'axios';
import Header from '../components/Header';
import LiquidContainer from '../components/LiquidContainer';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CourierMap = () => {
  const myLocation = [52.2297, 21.0122];

  const generateCourier = () => {
    const range = Math.random();

    if (range < 0.3) {
      return [
        myLocation[0] + (Math.random() - 0.5) * 0.02,
        myLocation[1] + (Math.random() - 0.5) * 0.02,
      ];
    }

    if (range < 0.6) {
      return [
        myLocation[0] + (Math.random() - 0.5) * 0.06,
        myLocation[1] + (Math.random() - 0.5) * 0.06,
      ];
    }

    return [
      myLocation[0] + (Math.random() - 0.5) * 0.2,
      myLocation[1] + (Math.random() - 0.5) * 0.2,
    ];
  };

const [couriers] = useState(
  () => Array.from({ length: 12 }, generateCourier)
);

  const getColor = (lat, lng) => {
    const dist = Math.sqrt(
      Math.pow(lat - myLocation[0], 2) +
      Math.pow(lng - myLocation[1], 2)
    );

    if (dist < 0.025) return "green";
    if (dist < 0.08) return "orange";
    return "red";
  };

  return (
    <MapContainer
      center={myLocation}
      zoom={12}
      style={{ height: 200, borderRadius: 16 }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* My location */}
      <CircleMarker
        center={myLocation}
        radius={6}
        pathOptions={{ color: "black", fillColor: "black", fillOpacity: 1 }}
      />

      {/* Courier dots */}
      {couriers.map((pos, i) => (
        <CircleMarker
          key={i}
          center={pos}
          radius={4}
          pathOptions={{
            color: getColor(pos[0], pos[1]),
            fillColor: getColor(pos[0], pos[1]),
            fillOpacity: 1,
          }}
        />
      ))}
    </MapContainer>
  );
};

const HomePage = () => {
  const updateLocation = useMutation(api.couriers.updateLocation);
  const removeCourier = useMutation(api.couriers.removeCourier);
  const { setTrackingActive } = useTracking();
  const [isCourierActive, setIsCourierActive] = useState(false);
  const { t } = useLanguage();
  const { user, token, refreshUser } = useAuth();
  const toast = useToast();
  const [isRestaurantPickup, setIsRestaurantPickup] = useState(false);
  const [pickupTypeDialog, setPickupTypeDialog] = useState(false);
  const [showFillDialog, setShowFillDialog] = useState(false);
  const [oilAmount, setOilAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [courierInfo, setCourierInfo] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [donatedOilLiters, setDonatedOilLiters] = useState(0);

  const handleFillRequest = async () => {
    const liters = parseFloat(oilAmount);
    if (isNaN(liters) || liters < 4) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      try {
        const response = await axios.post(
          `${API}/courier/request`,
          { oil_liters: liters },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCourierInfo(response.data);
        refreshUser();
      } catch (error) {
        console.log("Backend down — demo mode courier spawn");
      }

    // Convex spawn HER DURUMDA:
      await updateLocation({
        courierId: "assignedCourier",
        lat: 52.2297,
        lng: 21.0122,
      });

      setTrackingActive(true);
      setIsCourierActive(true);
      toast.success(t('courierRequested'));

      setDonatedOilLiters(liters);

      const qrCodeValue = `COLLOIL-${Date.now()}`;
      setQrValue(qrCodeValue);

      localStorage.setItem(
        "lastDeliveryQR",
        JSON.stringify({
          qr: qrCodeValue,
          liters: liters,
          date: new Date().toISOString(),
        })
      );

      setShowThankYou(true);
      setShowFillDialog(false);

      const audio = new Audio("/glug.mp3");
      audio.play();

      setOilAmount('');

    } catch (error) {
      let message = 'An error occurred';

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        message =
          typeof detail === 'string'
            ? detail
            : detail.msg || JSON.stringify(detail);
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-stone-500">{t('welcomeBack')},</p>
          <h2 className="font-outfit font-bold text-2xl text-stone-800">
            {user?.nickname || user?.name || 'User'}
          </h2>
        </motion.div>

        {/* Containers Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 p-6 mb-6"
          data-testid="containers-section"
        >
          <div className="flex justify-center items-center">
            {/* Oil Container */}
            <div className="flex flex-col items-center">
              <LiquidContainer 
                fillPercent={user?.total_oil_liters || 0} 
                type="oil" 
                size="large" 
              />
              <p className="mt-2 text-sm text-stone-500">{t('oilCollected')}</p>
            </div>
          </div>
        </motion.div>

        {/* Fill Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <Button
            onClick={() => setPickupTypeDialog(true)}
            className="rounded-full bg-primary hover:bg-primary-600 text-white font-bold
                       px-8 py-6 text-lg shadow-lg shadow-primary/30
                       transition-all active:scale-95
                       flex items-center justify-center gap-2
                       min-w-[200px] tracking-wide"
            data-testid="fill-button"
          >
            <Droplet size={22} />
            {t('fillButton')}
          </Button>
        </motion.div>

        {/* Courier Info Card */}
        {courierInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-primary-50 rounded-2xl p-4 border border-primary-100"
            data-testid="courier-info"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary rounded-full">
                <Truck size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-stone-800">{t('courierOnWay')}</h3>
                <p className="text-sm text-stone-600">{courierInfo.courier_name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-stone-500">{t('oilCollected')}</p>
                <p className="font-bold text-oil-dark">{courierInfo.oil_liters}L</p>
              </div>
              <div>
                <p className="text-stone-500">{t('estimatedArrival')}</p>
                <p className="font-bold text-stone-800">
                  {new Date(courierInfo.estimated_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <Dialog open={pickupTypeDialog} onOpenChange={setPickupTypeDialog}>
        <DialogContent className="max-w-sm mx-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle>{t("selectPickupType")}</DialogTitle>
          </DialogHeader>

          <Button
            className="w-full mb-3"
            onClick={() => {
              setPickupTypeDialog(false);
              setShowFillDialog(true);
            }}
          >
            {t("courierPickup")}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setPickupTypeDialog(false);
              setIsRestaurantPickup(true);

              const qrCodeValue = `COLLOIL-REST-${Date.now()}`;
              setQrValue(qrCodeValue);
              setDonatedOilLiters(0);
              setShowThankYou(true);

              localStorage.setItem(
                "lastDeliveryQR",
                JSON.stringify({
                  qr: qrCodeValue,
                  type: "restaurant",
                  date: new Date().toISOString()
                })
              );
            }}
          >
            {t("restaurantPickup")}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Fill Dialog */}
      <Dialog open={showFillDialog} onOpenChange={setShowFillDialog}>
        <DialogContent className="max-w-sm mx-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-outfit text-xl">{t('requestPickup')}</DialogTitle>
            <DialogDescription>
              {t('enterLiters')}
            </DialogDescription>
          </DialogHeader>
          
          <CourierMap />
          <p className="text-sm text-center text-stone-500">
            {t("todayAvailable")}
          </p>
          <div className="space-y-4 pt-4">
            <div className="relative">
              <Input
                type="number"
                value={oilAmount}
                onChange={(e) => setOilAmount(e.target.value)}
                placeholder="0.0"
                className="text-center text-2xl font-bold h-16 rounded-xl"
                data-testid="oil-amount-input"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">
                {t('liters')}
              </span>
            </div>
            
            <div className="flex gap-2">
              {[4, 6, 8, 10].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setOilAmount(amount.toString())}
                  className="flex-1 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 font-medium text-stone-700 transition-colors"
                  data-testid={`quick-amount-${amount}`}
                >
                  {amount}L
                </button>
              ))}
            </div>

            <Button
              onClick={handleFillRequest}
              disabled={loading || !oilAmount}
              className="w-full rounded-xl bg-primary hover:bg-primary-600 h-12"
              data-testid="confirm-fill-btn"
            >
              {loading ? t('loading') : t('requestPickup')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {showThankYou && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-xl">
      
            <h2 className="text-xl font-bold mb-2 text-primary">
              {t("thankYou")}
            </h2>

            {isRestaurantPickup ? (
              <p className="text-stone-600 mb-2">
                {t("showQrRestaurant")}
              </p>
            ) : (
              <p className="text-stone-600 mb-2">
                {t("youDonatedOil").replace("{{liters}}", donatedOilLiters)}
              </p>
            )}

            {!isRestaurantPickup && (
              <>
                <p className="text-sm text-stone-500">
                  ≈ {(donatedOilLiters * 2.5).toFixed(1)} {t("co2Saved")}
                </p>

                <p className="text-sm text-stone-500 mb-4">
                  ≈ {(donatedOilLiters * 0.8).toFixed(1)} {t("biodieselProduced")}
                </p>
              </>
            )}

            <div className="flex justify-center mb-4">
              <QRCodeCanvas value={qrValue} size={140} />
            </div>

            <p className="text-xs text-stone-400 mb-4">
              {isRestaurantPickup
                ? t("showQrRestaurant")
                : t("showQrCourier")}
            </p>

            <Button
              onClick={() => {
                setShowThankYou(false);
                setIsRestaurantPickup(false);
                setIsCourierActive(false);
                removeCourier({ courierId: "assignedCourier" });
              }}
              className="w-full rounded-xl bg-primary hover:bg-primary-600"
            >
              {t("close")}
            </Button>

          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
