import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HomePage = () => {
  const { t } = useLanguage();
  const { user, token, refreshUser } = useAuth();
  const toast = useToast();
  const [showFillDialog, setShowFillDialog] = useState(false);
  const [oilAmount, setOilAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [courierInfo, setCourierInfo] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [donatedOilLiters, setDonatedOilLiters] = useState(0);

  const handleFillRequest = async () => {
    const liters = parseFloat(oilAmount);
    if (isNaN(liters) || liters <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/courier/request`,
        { oil_liters: liters },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
    setCourierInfo(response.data);
    toast.success(t('courierRequested'));
    refreshUser();

    setDonatedOilLiters(liters);
    const qrCodeValue = `COLLOIL-${Date.now()}`;
    setQrValue(qrCodeValue);
    localStorage.setItem(
      "lastDeliveryQR",
      JSON.stringify({
        qr: qrCodeValue,
        liters: liters,
        date: new Date().toISOString()
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
        message = typeof detail === 'string' ? detail : (detail.msg || JSON.stringify(detail));
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const oilPercent = user ? Math.min((user.total_oil_liters / 50) * 100, 100) : 0;
  const glycerinPercent = user ? Math.min((user.total_glycerin_liters / 5) * 100, 100) : 0;

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
          <div className="flex justify-center items-end gap-8">
            {/* Oil Container */}
            <div className="flex flex-col items-center">
              <LiquidContainer 
                fillPercent={user?.total_oil_liters || 0} 
                type="oil" 
                size="large" 
              />
              <p className="mt-2 text-sm text-stone-500">{t('oilCollected')}</p>
            </div>

            {/* Glycerin Container */}
            <div className="flex flex-col items-center">
              <LiquidContainer 
                fillPercent={user?.total_glycerin_liters || 0} 
                type="glycerin" 
                size="small" 
              />
              <p className="mt-2 text-sm text-stone-500">{t('glycerinEarned')}</p>
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
            onClick={() => setShowFillDialog(true)}
            className="rounded-full bg-primary hover:bg-primary-600 text-white font-bold px-12 py-6 text-lg shadow-lg shadow-primary/30 transition-all active:scale-95"
            data-testid="fill-button"
          >
            <Droplet className="mr-2" size={24} />
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-4"
            data-testid="stats-oil"
          >
            <p className="text-xs text-primary-600 uppercase tracking-wide">Total Oil</p>
            <p className="font-outfit font-bold text-2xl text-primary-900">
              {user?.total_oil_liters?.toFixed(1) || '0.0'}L
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl p-4"
            data-testid="stats-glycerin"
          >
            <p className="text-xs text-secondary-600 uppercase tracking-wide">Total Glycerin</p>
            <p className="font-outfit font-bold text-2xl text-secondary-900">
              {user?.total_glycerin_liters?.toFixed(1) || '0.0'}L
            </p>
          </motion.div>
        </div>
      </main>

      {/* Fill Dialog */}
      <Dialog open={showFillDialog} onOpenChange={setShowFillDialog}>
        <DialogContent className="max-w-sm mx-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-outfit text-xl">{t('requestPickup')}</DialogTitle>
            <DialogDescription>
              {t('enterLiters')}
            </DialogDescription>
          </DialogHeader>
          
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
              {[1, 3, 5, 10].map((amount) => (
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
              Thank you! 🌱
            </h2>

            <p className="text-stone-600 mb-2">
              You donated <b>{donatedOilLiters}L</b> of oil.
            </p>

            <p className="text-sm text-stone-500">
              ≈ {(donatedOilLiters * 2.5).toFixed(1)} kg CO₂ saved
            </p>

            <p className="text-sm text-stone-500 mb-4">
              ≈ {(donatedOilLiters * 0.8).toFixed(1)}L biodiesel produced
            </p>

            <div className="flex justify-center mb-4">
              <QRCodeCanvas value={qrValue} size={140} />
            </div>

            <p className="text-xs text-stone-400 mb-4">
              Show this QR to courier for confirmation.
            </p>

            <Button
              onClick={() => setShowThankYou(false)}
              className="w-full rounded-xl bg-primary hover:bg-primary-600"
            >
              Close
            </Button>

          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
