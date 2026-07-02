import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, MapPin, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!fullName || !email || !phone || !password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    const payload = {
      full_name: fullName,
      email,
      phone,
      password,
      location: location || null,
    };

    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      setSuccess('Registration successful! Redirecting to login in 2 seconds...');
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <div className="glass-card p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
          <p className="text-slate-400 text-sm">
            Sign up to start listing, estimation, and buying.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-emerald-200 text-sm">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name *</label>
            <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-primary-500 transition-colors">
              <User className="w-5 h-5 text-slate-500 mr-2.5 shrink-0" />
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent text-white border-none outline-none focus:ring-0 placeholder:text-slate-650 text-sm"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address *</label>
            <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-primary-500 transition-colors">
              <Mail className="w-5 h-5 text-slate-500 mr-2.5 shrink-0" />
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-white border-none outline-none focus:ring-0 placeholder:text-slate-650 text-sm"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone Number *</label>
            <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-primary-500 transition-colors">
              <Phone className="w-5 h-5 text-slate-500 mr-2.5 shrink-0" />
              <input
                type="tel"
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent text-white border-none outline-none focus:ring-0 placeholder:text-slate-655 text-sm"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Location (City, State)</label>
            <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-primary-500 transition-colors">
              <MapPin className="w-5 h-5 text-slate-500 mr-2.5 shrink-0" />
              <input
                type="text"
                placeholder="Mumbai, Maharashtra"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-white border-none outline-none focus:ring-0 placeholder:text-slate-655 text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password *</label>
            <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-primary-500 transition-colors relative">
              <Lock className="w-5 h-5 text-slate-500 mr-2.5 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-white border-none outline-none focus:ring-0 placeholder:text-slate-655 text-sm pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-500 hover:text-slate-400 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="gradient-btn w-full py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-semibold shadow-xl"
          >
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus className="w-5 h-5" /> Register
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary-400 hover:text-primary-300 font-semibold underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
