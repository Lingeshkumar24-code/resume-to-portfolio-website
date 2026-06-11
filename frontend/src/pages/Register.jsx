import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, token } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setErrorMsg('');
      setIsSubmitting(true);
      const res = await register(name, email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px] -z-10" />

      <div className="w-full max-w-md">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center font-bold text-2xl text-white shadow-xl shadow-blue-500/25 mb-4">
            R
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Resume2Portfolio AI</h1>
          <p className="text-slate-400 text-sm mt-1">Get started for free today</p>
        </div>

        {/* Form Card */}
        <div className="glassmorphism rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-6">Create account</h2>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-white/5 focus:border-blue-500/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-white/5 focus:border-blue-500/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (Min. 6 chars)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-white/5 focus:border-blue-500/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-white/5 focus:border-blue-500/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <div className="h-5 h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Free Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 text-center text-sm">
            <span className="text-slate-400">Already have an account? </span>
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
