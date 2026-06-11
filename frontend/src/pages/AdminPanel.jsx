import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { adminService } from '../services/api';
import { Users, FileText, Globe, Layers, BarChart3, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const res = await adminService.getStats();
      if (res.success) {
        setStats(res.data);
      } else {
        setErrorMsg('Failed to load system metrics.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Access denied or network error. Admin authorization required.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex bg-slate-950 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white">System Admin Console</h1>
            <p className="text-slate-400 text-sm mt-1">Monitor system signups, database records, and deploys</p>
          </div>
          <button 
            onClick={fetchStats}
            className="p-2 rounded-lg bg-slate-900 border border-white/5 hover:border-slate-700 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-3">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {stats && (
          <div className="space-y-8">
            {/* Cards Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glassmorphism p-5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400"><Users size={20} /></div>
                </div>
                <h3 className="text-3xl font-extrabold text-white">{stats.summary.totalUsers}</h3>
              </div>

              <div className="glassmorphism p-5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resumes Parsed</span>
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400"><FileText size={20} /></div>
                </div>
                <h3 className="text-3xl font-extrabold text-white">{stats.summary.totalResumes}</h3>
              </div>

              <div className="glassmorphism p-5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Portfolios Generated</span>
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400"><Layers size={20} /></div>
                </div>
                <h3 className="text-3xl font-extrabold text-white">{stats.summary.totalPortfolios}</h3>
              </div>

              <div className="glassmorphism p-5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Netlify Deploys</span>
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400"><Globe size={20} /></div>
                </div>
                <h3 className="text-3xl font-extrabold text-white">{stats.summary.totalDeployments}</h3>
              </div>
            </div>

            {/* Breakdowns section */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* File types */}
              <div className="glassmorphism rounded-2xl p-6">
                <h2 className="text-md font-bold text-white mb-6 flex items-center gap-2">
                  <BarChart3 size={18} className="text-blue-400" /> Resume Format Breakdown
                </h2>
                <div className="space-y-4">
                  {stats.breakdowns.formats.map((fmt) => (
                    <div key={fmt._id} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-400 uppercase">{fmt._id || 'Unknown'}</span>
                        <span className="text-white">{fmt.count} uploads</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-full rounded-full" 
                          style={{ width: `${(fmt.count / (stats.summary.totalResumes || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professions */}
              <div className="glassmorphism rounded-2xl p-6">
                <h2 className="text-md font-bold text-white mb-6 flex items-center gap-2">
                  <BarChart3 size={18} className="text-blue-400" /> Portfolio Professions
                </h2>
                <div className="space-y-4">
                  {stats.breakdowns.professions.map((prof) => (
                    <div key={prof._id} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-400 capitalize">{prof._id || 'Developer'}</span>
                        <span className="text-white">{prof.count} portfolios</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-full rounded-full" 
                          style={{ width: `${(prof.count / (stats.summary.totalPortfolios || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent users & deploys lists */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Users list */}
              <div className="glassmorphism rounded-2xl p-6">
                <h2 className="text-md font-bold text-white mb-4">Recent Registrations</h2>
                <div className="divide-y divide-white/5">
                  {stats.recentUsers.map((u) => (
                    <div key={u._id} className="py-3.5 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-white">{u.name}</h4>
                        <span className="text-[10px] text-slate-500">{u.email}</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deployments list */}
              <div className="glassmorphism rounded-2xl p-6">
                <h2 className="text-md font-bold text-white mb-4">Recent Deployments</h2>
                <div className="divide-y divide-white/5">
                  {stats.recentDeployments.map((d) => (
                    <div key={d._id} className="py-3.5 flex justify-between items-center gap-4">
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-white truncate">{d.portfolio?.title || 'Portfolio'}</h4>
                        <span className="text-[10px] text-slate-500 block truncate">User: {d.user?.name} ({d.user?.email})</span>
                      </div>
                      <a 
                        href={d.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] font-bold text-emerald-400 hover:underline shrink-0"
                      >
                        Visit Link
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
