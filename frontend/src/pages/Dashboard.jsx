import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  resumeService, 
  portfolioService 
} from '../services/api';
import { 
  Upload, FileText, ArrowRight, Trash2, Edit, 
  Download, Globe, ExternalLink, RefreshCw, AlertCircle, CheckCircle2 
} from 'lucide-react';

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [isDeployingId, setIsDeployingId] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [resumesRes, portfoliosRes, deploysRes] = await Promise.all([
        resumeService.getMyResumes(),
        portfolioService.getMyPortfolios(),
        portfolioService.getMyDeployments()
      ]);

      if (resumesRes.success) setResumes(resumesRes.data);
      if (portfoliosRes.success) setPortfolios(portfoliosRes.data);
      if (deploysRes.success) setDeployments(deploysRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Drag-and-Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    const allowedExtensions = ['pdf', 'docx', 'txt'];
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      setUploadError('Only PDF, DOCX, and TXT files are supported.');
      setUploadSuccess('');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File is too large. Max limit is 5MB.');
      setUploadSuccess('');
      return;
    }

    try {
      setUploadError('');
      setUploadSuccess('');
      setIsLoading(true);

      const formData = new FormData();
      formData.append('resume', file);

      const res = await resumeService.uploadResume(formData);
      if (res.success) {
        setUploadSuccess(`"${file.name}" uploaded and parsed successfully!`);
        await loadDashboardData();
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload and parse resume.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePortfolio = async (resumeId) => {
    try {
      setIsGenerating(true);
      setGenerationStep('Reading resume text...');
      
      const steps = [
        'Consulting Llama 3 AI Engine...',
        'Structuring portfolio sections (Hero, About, Skills)...',
        'Enhancing project descriptions...',
        'Selecting color schemes & typography...',
        'Finalizing UI configurations...'
      ];

      let stepIdx = 0;
      const interval = setInterval(() => {
        if (stepIdx < steps.length) {
          setGenerationStep(steps[stepIdx]);
          stepIdx++;
        } else {
          clearInterval(interval);
        }
      }, 1800);

      const res = await portfolioService.generatePortfolio(resumeId);
      
      clearInterval(interval);
      if (res.success) {
        setGenerationStep('Portfolio Generated! Redirecting...');
        setTimeout(() => {
          navigate(`/editor/${res.data._id}`);
        }, 1000);
      }
    } catch (err) {
      console.error('Portfolio generation error:', err);
      setUploadError('Failed to generate portfolio. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleDeploy = async (id) => {
    try {
      setIsDeployingId(id);
      const res = await portfolioService.deployPortfolio(id);
      if (res.success) {
        setUploadSuccess(res.message || 'Deployed to Netlify successfully!');
        await loadDashboardData();
      }
    } catch (err) {
      console.error(err);
      setUploadError(err.response?.data?.message || 'Netlify deployment failed.');
    } finally {
      setIsDeployingId(null);
    }
  };

  const handleDeletePortfolio = async (id) => {
    if (window.confirm('Are you sure you want to delete this portfolio?')) {
      try {
        const res = await portfolioService.deletePortfolio(id);
        if (res.success) {
          await loadDashboardData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteResume = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        const res = await resumeService.deleteResume(id);
        if (res.success) {
          await loadDashboardData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto">
        
        {/* Page title */}
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Workspace Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Upload resumes and manage your portfolios</p>
          </div>
          <button 
            onClick={loadDashboardData} 
            className="p-2 rounded-lg bg-slate-900 border border-white/5 hover:border-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Notifications */}
        {uploadError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-3">
            <AlertCircle size={18} />
            <span>{uploadError}</span>
          </div>
        )}
        {uploadSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm flex items-center gap-3">
            <CheckCircle2 size={18} />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* Uploader & Resume list split */}
        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          
          {/* Uploader Card */}
          <div className="lg:col-span-1">
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center p-6 cursor-pointer transition-all ${
                dragActive 
                  ? 'border-blue-500 bg-blue-500/5 shadow-inner' 
                  : 'border-white/10 hover:border-blue-500/40 hover:bg-white/[0.01]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
              />
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 border border-blue-500/20">
                <Upload size={24} />
              </div>
              <h3 className="font-bold text-white text-sm">Upload Resume</h3>
              <p className="text-slate-400 text-xs mt-1.5 max-w-[200px] leading-relaxed">
                Drag and drop your file here, or click to browse. Supports PDF, DOCX, TXT.
              </p>
            </div>
          </div>

          {/* Resumes List */}
          <div className="lg:col-span-2 glassmorphism rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                <FileText size={18} className="text-blue-400" /> Resumes Archive
              </h2>
              {resumes.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  No resumes uploaded yet. Upload one to start building.
                </div>
              ) : (
                <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                  {resumes.map((res) => (
                    <div key={res._id} className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-8 w-8 rounded bg-slate-800 flex items-center justify-center text-[10px] uppercase font-bold text-slate-300">
                          {res.fileType}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-semibold text-white truncate">{res.fileName}</h4>
                          <span className="text-[10px] text-slate-500">{new Date(res.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleGeneratePortfolio(res._id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          Generate
                          <ArrowRight size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteResume(res._id)}
                          className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-400 border border-red-500/10 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Portfolios list */}
        <div className="glassmorphism rounded-2xl p-6">
          <h2 className="text-md font-bold text-white mb-6 flex items-center gap-2">
            <Globe size={18} className="text-blue-400" /> Your Portfolios
          </h2>

          {portfolios.length === 0 ? (
            <div className="text-center py-14 text-slate-500 text-sm">
              Your generated websites will show up here. Upload a resume and click Generate!
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {portfolios.map((port) => {
                const isDeploy = deployments.find(d => d.portfolio?._id === port._id || d.portfolio === port._id);
                return (
                  <div key={port._id} className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-slate-800 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h3 className="font-bold text-white text-md truncate">{port.title}</h3>
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-semibold text-blue-400 capitalize">
                          {port.profession}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mb-4">
                        Updated {new Date(port.updatedAt).toLocaleDateString()}
                      </p>

                      {isDeploy && (
                        <div className="mb-6 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between gap-4">
                          <div className="overflow-hidden">
                            <span className="text-[10px] text-slate-500 block">Netlify Live Link</span>
                            <a href={isDeploy.url} target="_blank" rel="noreferrer" className="text-xs text-emerald-400 font-medium truncate hover:underline flex items-center gap-1">
                              {isDeploy.url} <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/5">
                      <button
                        onClick={() => navigate(`/editor/${port._id}`)}
                        className="px-3.5 py-2 rounded-lg bg-slate-900 border border-white/5 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Edit size={12} />
                        Edit / Preview
                      </button>

                      <a
                        href={portfolioService.downloadSourceUrl(port._id)}
                        className="px-3.5 py-2 rounded-lg bg-slate-900 border border-white/5 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Download size={12} />
                        Source ZIP
                      </a>

                      <button
                        onClick={() => handleDeploy(port._id)}
                        disabled={isDeployingId === port._id}
                        className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        {isDeployingId === port._id ? (
                          <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Globe size={12} />
                        )}
                        Deploy to Netlify
                      </button>

                      <button
                        onClick={() => handleDeletePortfolio(port._id)}
                        className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-400 border border-red-500/10 ml-auto transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Generation Loading Backdrop */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-center items-center text-center p-6">
          <div className="relative mb-6">
            <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-blue-400">AI</div>
          </div>
          <h2 className="text-xl font-extrabold text-white mb-2">Generating Portfolio Website</h2>
          <p className="text-blue-400 text-sm font-semibold max-w-sm animate-pulse">{generationStep}</p>
        </div>
      )}
    </div>
  );
}
