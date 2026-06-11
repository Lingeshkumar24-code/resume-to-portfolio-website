import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Shield, LogOut, FileText, Globe, Layers } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 shrink-0 bg-slate-900 border-r border-white/5 flex flex-col justify-between h-screen sticky top-0 p-6">
      <div className="space-y-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-500/20">
            R
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white leading-none">Resume2Portfolio</h1>
            <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">AI Engine</span>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center font-semibold text-lg text-blue-400 border border-slate-700 uppercase">
              {user.name[0]}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-semibold text-white truncate">{user.name}</h2>
              <span className="text-[10px] text-slate-400 capitalize">{user.role} Account</span>
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="space-y-1">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive('/dashboard')
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/15'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          {user && user.role === 'admin' && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive('/admin')
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/15'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <Shield size={18} />
              Admin Panel
            </Link>
          )}
        </nav>
      </div>

      {/* Logout button */}
      <div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all border border-transparent hover:border-red-500/10"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
