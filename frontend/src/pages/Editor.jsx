import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PortfolioPreview from '../components/PortfolioPreview';
import { portfolioService } from '../services/api';
import { 
  Send, Sparkles, Monitor, Smartphone, Tablet, Save, Download, 
  Globe, Check, RefreshCw, AlertCircle, ArrowLeft, Paintbrush, FileJson, Type 
} from 'lucide-react';

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: "Hello! I am your AI Design Assistant. You can tell me to modify the portfolio theme, rewrite copy, add skills, or customize layouts. Try saying: 'Change theme to dark modern' or 'Enhance project cards'." }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop, tablet, mobile
  const [activeTab, setActiveTab] = useState('chat'); // chat, styles, raw
  
  // Save/Deploy state loaders
  const [isSaving, setIsSaving] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const fetchPortfolio = async () => {
    try {
      const res = await portfolioService.getPortfolioById(id);
      if (res.success) {
        setPortfolio(res.data);
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to retrieve portfolio configuration.');
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [id]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: '', message: '' });
    }, 4000);
  };

  // AI Customization Chat handler
  const handleSendChatMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsChatLoading(true);

    try {
      const res = await portfolioService.customizePortfolioWithAI(id, userMessage);
      if (res.success) {
        setPortfolio(res.data);
        setChatHistory(prev => [...prev, { 
          sender: 'ai', 
          text: "I've applied those changes to your portfolio! You can see them updated in the preview." 
        }]);
      }
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { 
        sender: 'ai', 
        text: "I ran into a small issue processing those changes. Could you rephrase your instruction?" 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Manual style changes
  const handleThemeChange = (key, value) => {
    setPortfolio(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [key]: value
      }
    }));
  };

  // Save changes to database
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const res = await portfolioService.updatePortfolio(id, portfolio);
      if (res.success) {
        setPortfolio(res.data);
        showNotification('success', 'Portfolio changes saved successfully!');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to save portfolio modifications.');
    } finally {
      setIsSaving(false);
    }
  };

  // Deploy to Netlify
  const handleDeploy = async () => {
    try {
      setIsDeploying(true);
      const res = await portfolioService.deployPortfolio(id);
      if (res.success) {
        showNotification('success', 'Deployed! Live URL: ' + res.data.url);
        // Reload in background to fetch updated deploys list
        fetchPortfolio();
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to publish to Netlify.');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleSuggestionClick = (prompt) => {
    setChatInput(prompt);
  };

  if (!portfolio) {
    return (
      <div className="flex bg-slate-950 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Determine width of preview pane based on mode selection
  const getPreviewWidth = () => {
    if (previewMode === 'mobile') return 'max-w-[375px]';
    if (previewMode === 'tablet') return 'max-w-[768px]';
    return 'w-full';
  };

  const fonts = ['Inter', 'Outfit', 'Roboto', 'Fira Code', 'Playfair Display', 'Poppins', 'Montserrat'];
  const layouts = [
    { value: 'modern-dark', label: 'Dark Modern' },
    { value: 'creative-gradient', label: 'Creative Gradient' },
    { value: 'professional-blue', label: 'Professional Blue' },
    { value: 'futuristic-dark', label: 'Futuristic Neon' }
  ];

  return (
    <div className="flex bg-slate-950 h-screen overflow-hidden">
      <Sidebar />

      {/* Editor Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Editor Actions Header */}
        <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between shrink-0 bg-slate-900/40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="font-extrabold text-white text-md truncate">{portfolio.title}</h1>
          </div>

          {/* Quick Info Toast in Header */}
          {notification.message && (
            <div className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 animate-bounce ${
              notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'
            }`}>
              {notification.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
              <span>{notification.message}</span>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/5 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
              Save Changes
            </button>

            <a
              href={portfolioService.downloadSourceUrl(portfolio._id)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/5 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              <Download size={12} />
              Download ZIP
            </a>

            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/15"
            >
              {isDeploying ? <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Globe size={12} />}
              Deploy Live
            </button>
          </div>
        </header>

        {/* 3-Panel Workspace Grid */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Panel: Tabs for AI Chat and Manual adjustments */}
          <div className="w-80 border-r border-white/5 flex flex-col bg-slate-900/25 shrink-0">
            {/* Tab switchers */}
            <div className="flex border-b border-white/5 text-xs font-semibold shrink-0">
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'chat' ? 'border-blue-500 text-blue-400 bg-white/[0.01]' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Sparkles size={14} /> AI Customizer
              </button>
              <button 
                onClick={() => setActiveTab('styles')}
                className={`flex-1 py-3 border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'styles' ? 'border-blue-500 text-blue-400 bg-white/[0.01]' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Paintbrush size={14} /> Manual Styles
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Tab 1: AI Chat Assistant */}
              {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  
                  {/* Messages Window */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                    {chatHistory.map((chat, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                          chat.sender === 'ai' 
                            ? 'bg-slate-900 border border-white/5 text-slate-200 self-start mr-auto'
                            : 'bg-blue-600 text-white self-end ml-auto'
                        }`}
                      >
                        {chat.text}
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="bg-slate-900 border border-white/5 p-3 rounded-2xl max-w-[80%] text-slate-400 flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                        <span>AI is designing...</span>
                      </div>
                    )}
                  </div>

                  {/* Suggestion prompt quick-clicks */}
                  <div className="px-4 py-2 border-t border-white/5 flex flex-col gap-1.5 shrink-0 bg-slate-950/20">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Quick Prompts</span>
                    <button 
                      onClick={() => handleSuggestionClick("Change theme color palette to deep purple")}
                      className="text-[10px] text-slate-400 hover:text-white p-1.5 rounded bg-white/[0.02] border border-white/5 hover:border-slate-800 text-left truncate transition-colors"
                    >
                      🎨 Change theme color palette to deep purple
                    </button>
                    <button 
                      onClick={() => handleSuggestionClick("Use a sleek futuristic monospace font")}
                      className="text-[10px] text-slate-400 hover:text-white p-1.5 rounded bg-white/[0.02] border border-white/5 hover:border-slate-800 text-left truncate transition-colors"
                    >
                      🔤 Use a sleek futuristic monospace font
                    </button>
                    <button 
                      onClick={() => handleSuggestionClick("Improve my project cards layout and descriptions")}
                      className="text-[10px] text-slate-400 hover:text-white p-1.5 rounded bg-white/[0.02] border border-white/5 hover:border-slate-800 text-left truncate transition-colors"
                    >
                      💻 Improve project cards layout and descriptions
                    </button>
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendChatMessage} className="p-4 border-t border-white/5 flex gap-2 shrink-0 bg-slate-900/60">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type design instructions..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/5 focus:border-blue-500/50 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                    />
                    <button 
                      type="submit" 
                      className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 2: Manual Styling Controls */}
              {activeTab === 'styles' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
                  {/* Theme Colors */}
                  <div>
                    <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5"><Paintbrush size={14} /> Color Palette</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span>Primary Accent</span>
                          <span className="font-mono text-slate-400 uppercase">{portfolio.theme.primaryColor}</span>
                        </div>
                        <input 
                          type="color" 
                          value={portfolio.theme.primaryColor}
                          onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                          className="w-full h-8 border border-white/5 rounded cursor-pointer bg-transparent"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span>Secondary Accent</span>
                          <span className="font-mono text-slate-400 uppercase">{portfolio.theme.secondaryColor}</span>
                        </div>
                        <input 
                          type="color" 
                          value={portfolio.theme.secondaryColor}
                          onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                          className="w-full h-8 border border-white/5 rounded cursor-pointer bg-transparent"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span>Background Color</span>
                          <span className="font-mono text-slate-400 uppercase">{portfolio.theme.backgroundColor}</span>
                        </div>
                        <input 
                          type="color" 
                          value={portfolio.theme.backgroundColor}
                          onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                          className="w-full h-8 border border-white/5 rounded cursor-pointer bg-transparent"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span>Text Color</span>
                          <span className="font-mono text-slate-400 uppercase">{portfolio.theme.textColor}</span>
                        </div>
                        <input 
                          type="color" 
                          value={portfolio.theme.textColor}
                          onChange={(e) => handleThemeChange('textColor', e.target.value)}
                          className="w-full h-8 border border-white/5 rounded cursor-pointer bg-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Typography & Fonts */}
                  <div>
                    <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5"><Type size={14} /> Typography</h3>
                    <select
                      value={portfolio.theme.fontFamily}
                      onChange={(e) => handleThemeChange('fontFamily', e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/5 text-white focus:border-blue-500/50 focus:outline-none"
                    >
                      {fonts.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>

                  {/* Theme Presets */}
                  <div>
                    <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5"><FileJson size={14} /> Layout style</h3>
                    <select
                      value={portfolio.theme.layoutStyle}
                      onChange={(e) => handleThemeChange('layoutStyle', e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/5 text-white focus:border-blue-500/50 focus:outline-none"
                    >
                      {layouts.map(layout => (
                        <option key={layout.value} value={layout.value}>{layout.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Center Panel: Simulated responsive browser frame preview */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 p-6">
            
            {/* Device switch controls */}
            <div className="flex items-center justify-between mb-4 border border-white/5 bg-slate-900/30 p-2.5 rounded-xl shrink-0">
              <span className="text-xs text-slate-400 font-semibold tracking-wide">Live Sandbox Environment</span>
              
              <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-white/5">
                <button 
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-1.5 rounded transition-all text-xs font-semibold flex items-center gap-1 ${
                    previewMode === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Monitor size={14} /> Desktop
                </button>
                <button 
                  onClick={() => setPreviewMode('tablet')}
                  className={`p-1.5 rounded transition-all text-xs font-semibold flex items-center gap-1 ${
                    previewMode === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Tablet size={14} /> Tablet
                </button>
                <button 
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-1.5 rounded transition-all text-xs font-semibold flex items-center gap-1 ${
                    previewMode === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone size={14} /> Mobile
                </button>
              </div>
            </div>

            {/* Simulated frame container */}
            <div className="flex-1 flex items-center justify-center overflow-hidden border border-white/5 bg-slate-950 rounded-2xl relative">
              <div className={`h-full w-full shadow-2xl transition-all duration-300 border-x border-white/5 bg-slate-900 overflow-hidden ${getPreviewWidth()}`}>
                {/* Embedded Renderer component */}
                <PortfolioPreview data={portfolio} />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
