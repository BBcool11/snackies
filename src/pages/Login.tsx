import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Login() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 模拟登录/注册
    setTimeout(() => {
      if (!formData.email.includes('@')) {
        setError(language === 'zh' ? '请输入有效的邮箱地址' : 'Please enter a valid email');
        setIsLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setError(language === 'zh' ? '密码至少需要6位' : 'Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }

      // 存储用户信息
      const userData = {
        id: 'user_' + Date.now(),
        email: formData.email,
        name: isRegister ? formData.name : formData.email.split('@')[0],
        avatar: '🍿',
        loginTime: Date.now(),
      };
      localStorage.setItem('snackies_user_logged_in', JSON.stringify(userData));
      
      // 跳转到首页
      navigate('/');
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-rice-paper flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute -top-16 left-0 flex items-center gap-2 text-secondary-text hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-serif-cn text-[14px]">
            {language === 'zh' ? '返回首页' : 'Back to Home'}
          </span>
        </button>

        {/* Login Card */}
        <div className="bg-card-bg rounded-2xl p-8 shadow-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-ink rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🍿</span>
            </div>
            <h1 className="font-serif-cn text-[24px] text-ink mb-1">
              {language === 'zh' ? 'Snackies' : 'Snackies'}
            </h1>
            <p className="font-serif-cn text-[12px] text-secondary-text">
              Chinese Snack Museum
            </p>
          </div>

          {/* Title */}
          <h2 className="font-serif-cn text-[20px] text-ink text-center mb-6">
            {isRegister 
              ? (language === 'zh' ? '创建账户' : 'Create Account')
              : (language === 'zh' ? '欢迎回来' : 'Welcome Back')
            }
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-vermilion/10 rounded-lg">
              <p className="font-serif-cn text-[12px] text-vermilion text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Register Only) */}
            {isRegister && (
              <div>
                <label className="block font-serif-cn text-[12px] text-secondary-text mb-1.5">
                  {language === 'zh' ? '昵称' : 'Nickname'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary-text" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={language === 'zh' ? '请输入昵称' : 'Enter your nickname'}
                    className="w-full pl-10 pr-4 py-3 bg-rice-paper rounded-xl font-serif-cn text-[14px] text-ink placeholder:text-tertiary-text focus:outline-none focus:ring-2 focus:ring-ink/20"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block font-serif-cn text-[12px] text-secondary-text mb-1.5">
                {language === 'zh' ? '邮箱' : 'Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary-text" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={language === 'zh' ? '请输入邮箱' : 'Enter your email'}
                  className="w-full pl-10 pr-4 py-3 bg-rice-paper rounded-xl font-serif-cn text-[14px] text-ink placeholder:text-tertiary-text focus:outline-none focus:ring-2 focus:ring-ink/20"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block font-serif-cn text-[12px] text-secondary-text mb-1.5">
                {language === 'zh' ? '密码' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary-text" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={language === 'zh' ? '请输入密码' : 'Enter your password'}
                  className="w-full pl-10 pr-12 py-3 bg-rice-paper rounded-xl font-serif-cn text-[14px] text-ink placeholder:text-tertiary-text focus:outline-none focus:ring-2 focus:ring-ink/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary-text hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-ink text-rice-paper rounded-xl font-serif-cn text-[14px] hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                isRegister 
                  ? (language === 'zh' ? '注册' : 'Sign Up')
                  : (language === 'zh' ? '登录' : 'Sign In')
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-divider" />
            <span className="font-serif-cn text-[11px] text-tertiary-text">
              {language === 'zh' ? '或' : 'OR'}
            </span>
            <div className="flex-1 h-px bg-divider" />
          </div>

          {/* Toggle */}
          <p className="text-center font-serif-cn text-[12px] text-secondary-text">
            {isRegister 
              ? (language === 'zh' ? '已有账户？' : 'Already have an account?')
              : (language === 'zh' ? '还没有账户？' : "Don't have an account?")
            }
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="ml-1 text-vermilion hover:underline"
            >
              {isRegister 
                ? (language === 'zh' ? '立即登录' : 'Sign In')
                : (language === 'zh' ? '立即注册' : 'Sign Up')
              }
            </button>
          </p>

          {/* Demo Note */}
          <div className="mt-6 p-3 bg-golden/10 rounded-lg">
            <p className="font-serif-cn text-[10px] text-golden text-center">
              {language === 'zh' 
                ? '💡 演示模式：输入任意邮箱和密码即可登录'
                : '💡 Demo mode: Enter any email and password to login'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
