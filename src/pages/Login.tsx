import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Invalid credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <div className="glass-card p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-slate-400 text-sm">
            Sign in to search listings, chat with sellers, or sell your items.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-primary-500 transition-colors">
              <Mail className="w-5 h-5 text-slate-500 mr-2.5 shrink-0" />
              <input
                type="email"
                placeholder="yourname@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-white border-none outline-none focus:ring-0 placeholder:text-slate-600 text-sm"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
              {/* Reset Password linkage can be simulated or linked */}
            </div>
            <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-primary-500 transition-colors relative">
              <Lock className="w-5 h-5 text-slate-500 mr-2.5 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-white border-none outline-none focus:ring-0 placeholder:text-slate-600 text-sm pr-10"
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
            {loading ? 'Signing in...' : (
              <>
                <LogIn className="w-5 h-5" /> Login
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-primary-400 hover:text-primary-300 font-semibold underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
