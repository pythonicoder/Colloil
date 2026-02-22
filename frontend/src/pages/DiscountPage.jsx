
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TicketPercent, CheckCircle2, Clock, Copy } from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import axios from 'axios';
import Header from '../components/Header';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DiscountPage = () => {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const toast = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${API}/coupons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(response.data);
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const activateCoupon = async (couponId) => {
    try {
      const response = await axios.post(
        `${API}/coupons/${couponId}/activate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t('success'));
      fetchCoupons();
    } catch (error) {
      let message = 'Failed to activate coupon';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        message = typeof detail === 'string' ? detail : (detail.msg || JSON.stringify(detail));
      }
      toast.error(message);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  const calculateDaysLeft = (expiresAt) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const activeCoupons = coupons.filter(c => c.activated);
  const availableCoupons = coupons.filter(c => !c.activated);

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-secondary-100 rounded-xl">
            <TicketPercent size={24} className="text-secondary" />
          </div>
          <h1 className="font-outfit font-bold text-2xl text-stone-800">
            {t('discount')}
          </h1>
        </div>

        {/* User's Oil Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-oil-light to-oil-base rounded-2xl p-4 mb-6"
          data-testid="oil-progress"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-oil-dark font-medium"> {t("yourOilBalance")}</span>
            <span className="font-bold text-oil-dark">{user?.total_oil_liters?.toFixed(1) || 0}L</span>
          </div>
          <Progress value={Math.min((user?.total_oil_liters || 0) / 10 * 100, 100)} className="h-2" />
        </motion.div>

        {/* Activated Coupons */}
        {activeCoupons.length > 0 && (
          <section className="mb-8">
            <h2 className="font-outfit font-semibold text-lg text-stone-700 mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-primary" />
              {t('activated')}
            </h2>
            
            <div className="space-y-3">
              {activeCoupons.map((coupon, index) => (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-primary-100"
                  data-testid={`activated-coupon-${coupon.partner_name}`}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={coupon.partner_logo}
                      alt={coupon.partner_name}
                      className="w-12 h-12 rounded-xl object-contain bg-white border border-stone-100"
                      onError={(e) => { e.target.src = 'https://placehold.co/60x60?text=Shop'; }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-stone-800">{coupon.partner_name}</h3>
                        <Badge className="bg-primary text-white">%{coupon.discount_percent}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-stone-500 mt-1">
                        <Clock size={14} />
                        <span>{calculateDaysLeft(coupon.expires_at)} {t('days')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Coupon Code */}
                  <div className="mt-3 flex items-center justify-between bg-stone-50 rounded-xl p-3">
                    <div>
                      <p className="text-xs text-stone-500 uppercase">{t('code')}</p>
                      <p className="font-mono font-bold text-lg text-primary">{coupon.code}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCode(coupon.code)}
                      className="rounded-lg"
                      data-testid={`copy-code-${coupon.partner_name}`}
                    >
                      <Copy size={18} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Available Coupons */}
        <section>
          <h2 className="font-outfit font-semibold text-lg text-stone-700 mb-4">
            {t('myCoupons')}
          </h2>
          
          {loading ? (
            <div className="text-center py-8 text-stone-400">{t('loading')}</div>
          ) : (
            <div className="space-y-3">
              {availableCoupons.map((coupon, index) => {
                const progress = Math.min((user?.total_oil_liters || 0) / coupon.required_liters * 100, 100);
                const canActivate = (user?.total_oil_liters || 0) >= coupon.required_liters;
                
                return (
                  <motion.div
                    key={coupon.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white rounded-2xl p-4 shadow-sm border ${canActivate ? 'border-primary' : 'border-stone-100'}`}
                    data-testid={`coupon-${coupon.partner_name}`}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={coupon.partner_logo}
                        alt={coupon.partner_name}
                        className="w-12 h-12 rounded-xl object-contain bg-white border border-stone-100"
                        onError={(e) => { e.target.src = 'https://placehold.co/60x60?text=Shop'; }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-stone-800">{coupon.partner_name}</h3>
                          <Badge variant="secondary" className="bg-secondary-100 text-secondary">
                            %{coupon.discount_percent}
                          </Badge>
                        </div>
                        <p className="text-sm text-stone-500">
                          {t('requiredLiters')}: {coupon.required_liters}L
                        </p>
                      </div>
                      
                      <Button
                        onClick={() => activateCoupon(coupon.id)}
                        disabled={!canActivate}
                        className={`rounded-xl ${canActivate 
                          ? 'bg-primary hover:bg-primary-600' 
                          : 'bg-stone-200 text-stone-400'
                        }`}
                        data-testid={`activate-${coupon.partner_name}`}
                      >
                        {t('activate')}
                      </Button>
                    </div>
                    
                    {/* Progress */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-stone-500 mb-1">
                        <span>{user?.total_oil_liters?.toFixed(1) || 0}L</span>
                        <span>{coupon.required_liters}L</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DiscountPage;
