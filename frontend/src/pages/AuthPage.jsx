import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import LanguageToggle from '../components/LanguageToggle';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const AuthPage = () => {
  const { t } = useLanguage();
  const { login, register } = useAuth();
  const toast = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    surname: '',
    phone: '',
    address: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
      toast.success('success');
    } catch (error) {
      let message = 'An error occurred';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail.map(d => d.msg || d.message || JSON.stringify(d)).join(', ');
        } else if (typeof detail === 'object') {
          message = detail.msg || detail.message || JSON.stringify(detail);
        }
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFEE87] flex flex-col">
      {/* Header */}
      <header className="flex justify-end p-4">
        <LanguageToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <img
            src="/logo.png"
            alt="Colloil Logo"
            className="w-32 mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold" style={{ fontFamily: "Comic Sans MS" }}>
            Colloil
          </h1>
          <p className="text-stone-500 mt-2">Turn waste into rewards</p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-stone-200/50 p-6"
          data-testid="auth-card"
        >
          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-stone-100 rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                isLogin 
                  ? 'bg-white shadow-sm text-stone-800' 
                  : 'text-stone-500 hover:text-stone-700'
              }`}
              data-testid="login-tab"
            >
              {t('login')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                !isLogin 
                  ? 'bg-white shadow-sm text-stone-800' 
                  : 'text-stone-500 hover:text-stone-700'
              }`}
              data-testid="register-tab"
            >
              {t('register')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="name">{t('name')}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full"
                      required={!isLogin}
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
                      required={!isLogin}
                      data-testid="input-surname"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="rounded-xl mt-1"
                    required={!isLogin}
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
                    required={!isLogin}
                    data-testid="input-address"
                  />
                </div>
              </>
            )}
            
            <div>
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-xl mt-1"
                required
                data-testid="input-email"
              />
            </div>
            
            <div>
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="rounded-xl mt-1"
                required
                data-testid="input-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary hover:bg-primary-600 h-12 font-bold"
              data-testid="submit-btn"
            >
              {loading ? t('loading') : (isLogin ? t('login') : t('register'))}
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-4">
            {isLogin ? t('noAccount') : t('hasAccount')}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium hover:underline"
              data-testid="toggle-auth-mode"
            >
              {isLogin ? t('register') : t('login')}
            </button>
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default AuthPage;
