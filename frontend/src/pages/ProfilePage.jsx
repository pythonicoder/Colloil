import { QRCodeCanvas } from 'qrcode.react';
import { useMutation } from "convex/react";
import { useEffect, useState } from 'react';
import { useTracking } from '../contexts/TrackingContext';
import { motion } from 'framer-motion';
import { User, Edit2, Award, Calendar, MapPin, Phone, Mail, Save, X } from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import Header from '../components/Header';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const ProfilePage = () => {
  const removeCourier = useMutation("couriers:removeCourier");
  const [savedQR, setSavedQR] = useState(null);

  useEffect(() => {
    const storedQR = localStorage.getItem("lastDeliveryQR");
    if (storedQR) {
      setSavedQR(JSON.parse(storedQR));
    }
  }, []);
  const { t } = useLanguage();
  const { setTrackingActive } = useTracking();
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    phone: user?.phone || '',
    address: user?.address || '',
    nickname: user?.nickname || '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success(t('success'));
      setEditing(false);
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const achievements = [
  {
    id: 1,
    name: t('firstDrop'),
    description: t('firstDropDesc'),
    earned: (user?.total_oil_liters || 0) >= 1
  },
  {
    id: 2,
    name: t('ecoStarter'),
    description: t('ecoStarterDesc'),
    earned: (user?.total_oil_liters || 0) >= 5
  },
  {
    id: 3,
    name: t('greenChampion'),
    description: t('greenChampionDesc'),
    earned: (user?.total_oil_liters || 0) >= 10
  },
  {
    id: 4,
    name: t('planetSaver'),
    description: t('planetSaverDesc'),
    earned: (user?.total_oil_liters || 0) >= 50
  },
];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 p-6 mb-6"
          data-testid="profile-header"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-white">
                <img
                  src="/avatar1.jpeg"
                  alt="avatar"
                  className="w-full h-full object-cover scale-125"
                />
              </div>
              <div>
                <h2 className="font-outfit font-bold text-xl text-stone-800">
                  {user?.nickname || user?.name}
                </h2>
                <p className="text-sm text-stone-500">{user?.email}</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(!editing)}
              className="rounded-xl"
              data-testid="edit-profile-btn"
            >
              {editing ? <X size={18} /> : <Edit2 size={18} />}
            </Button>
          </div>
        </motion.div>

        {/* Edit Form or Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6 mb-6"
          data-testid="profile-details"
        >
          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t('name')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full"
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="surname">{t('surname')}</Label>
                  <Input
                    id="surname"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    className="w-full"
                    data-testid="input-surname"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="nickname">{t('nickname')}</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="rounded-xl mt-1"
                  data-testid="input-nickname"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-xl mt-1"
                  data-testid="input-phone"
                />
              </div>
              
              <div>
                <Label htmlFor="address">{t('address')}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="rounded-xl mt-1"
                  data-testid="input-address"
                />
              </div>
              
              <Button
                onClick={handleSave}
                disabled={loading}
                className="w-full rounded-xl bg-primary hover:bg-primary-600"
                data-testid="save-profile-btn"
              >
                <Save size={18} className="mr-2" />
                {loading ? t('loading') : t('save')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-stone-600">
                <User size={18} className="text-stone-400" />
                <span>{user?.name} {user?.surname}</span>
              </div>
              <div className="flex items-center gap-3 text-stone-600">
                <Mail size={18} className="text-stone-400" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-stone-600">
                <Phone size={18} className="text-stone-400" />
                <span>{user?.phone || '-'}</span>
              </div>
              <div className="flex items-center gap-3 text-stone-600">
                <MapPin size={18} className="text-stone-400" />
                <span>{user?.address || '-'}</span>
              </div>
              <div className="flex items-center gap-3 text-stone-600">
                <Calendar size={18} className="text-stone-400" />
                <span>{t('memberSince')}: {formatDate(user?.created_at)}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6"
          data-testid="achievements-section"
        >
          <h3 className="font-outfit font-bold text-lg text-stone-800 mb-4 flex items-center gap-2">
            <Award className="text-secondary" />
            {t('achievements')}
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-3 rounded-xl border-2 transition-all ${
                  achievement.earned
                    ? 'border-secondary bg-secondary-50'
                    : 'border-stone-200 bg-stone-50 opacity-50'
                }`}
                data-testid={`achievement-${achievement.id}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Award 
                    size={16} 
                    className={achievement.earned ? 'text-secondary' : 'text-stone-400'} 
                  />
                  <span className={`text-sm font-medium ${
                    achievement.earned ? 'text-secondary-900' : 'text-stone-500'
                  }`}>
                    {achievement.name}
                  </span>
                </div>
                <p className="text-xs text-stone-500">{achievement.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
        {/* Delivery QR */}
        {savedQR && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6 mt-6 text-center"
          >
            <h3 className="font-outfit font-bold text-lg text-stone-800 mb-4">
              {t("deliveryQr")}
            </h3>

            <div className="flex justify-center mb-4">
              <QRCodeCanvas value={savedQR.qr} size={140} />
            </div>

            <p className="text-sm text-stone-600">
              {savedQR.liters}L {t("oilDelivery")}
            </p>

            <p className="text-xs text-stone-400 mt-1">
              {new Date(savedQR.date).toLocaleString()}
            </p>

            <Button
              variant="ghost"
              className="mt-4 text-red-500"
              onClick={() => {
                localStorage.removeItem("lastDeliveryQR");
                setSavedQR(null);
                removeCourier({ courierId: "assignedCourier" });
                setTrackingActive(false);
            }}
          >
            {t("clearQr")}
          </Button>
        </motion.div>
      )}
      </main>
    </div>
  );
};

export default ProfilePage;
