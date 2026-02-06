
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  Search, 
  TrendingUp, 
  ExternalLink, 
  Heart, 
  Bookmark, 
  Share2, 
  Eye, 
  MessageCircle, 
  Camera, 
  User, 
  ChevronDown, 
  CloudUpload, 
  CheckCircle2, 
  Loader2, 
  Trash2, 
  Plus, 
  ClipboardPaste, 
  X, 
  Image as ImageIcon, 
  Video,
  Layers,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  PRODUCTS as INITIAL_PRODUCTS, 
  INITIAL_KPI_STATS 
} from './constants';
import { extractProductFromImage } from './geminiService';
import { Product } from './types';

// --- Components ---

const Sidebar = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => (
  <div className="w-16 bg-[#1a1c20] border-r border-gray-800 flex flex-col items-center py-6 gap-8 fixed h-full z-20">
    <div className="w-8 h-8 bg-cyan-500 rounded-lg mb-4 flex items-center justify-center shadow-lg shadow-cyan-500/20">
      <div className="w-4 h-4 bg-white rounded-full"></div>
    </div>
    <div className="flex flex-col gap-6">
      <div onClick={() => onTabChange('dashboard')} className={`p-2.5 rounded-xl cursor-pointer transition-all ${activeTab === 'dashboard' ? 'bg-cyan-900/40 text-cyan-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}><LayoutDashboard size={20} /></div>
      <div onClick={() => onTabChange('upload')} className={`p-2.5 rounded-xl cursor-pointer transition-all ${activeTab === 'upload' ? 'bg-cyan-900/40 text-cyan-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}><CloudUpload size={20} /></div>
      <div className="p-2.5 text-gray-500 hover:text-white cursor-pointer"><BookOpen size={20} /></div>
    </div>
    <div className="mt-auto mb-4"><div className="p-2.5 text-gray-500 hover:text-white cursor-pointer"><Settings size={20} /></div></div>
  </div>
);

const TopBar = ({ title }: { title: string }) => (
  <div className="h-14 bg-[#0d0f12] border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10 ml-16 backdrop-blur-md">
    <div className="flex items-center gap-4">
      <span className="text-gray-400 text-sm font-medium tracking-wide">{title}</span>
      <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-full text-[10px] font-bold text-green-400 border border-green-500/10">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
        <span>LIVE SYSTEM</span>
      </div>
    </div>
  </div>
);

const MainKPICard = () => {
  const metrics = [
    { label: 'View', icon: Eye, data: INITIAL_KPI_STATS.engagement.view },
    { label: 'Like', icon: Heart, data: INITIAL_KPI_STATS.engagement.like },
    { label: 'Bookmark', icon: Bookmark, data: INITIAL_KPI_STATS.engagement.bookmark },
    { label: 'Comment', icon: MessageCircle, data: INITIAL_KPI_STATS.engagement.comment },
    { label: 'Shared', icon: Share2, data: INITIAL_KPI_STATS.engagement.shared },
  ];
  return (
    <div className="rounded-2xl p-8 relative overflow-hidden flex flex-col gap-8 h-full" style={{ background: 'linear-gradient(-40deg, #f4259f, #0f7ce2)', boxShadow: '0 0 30px 2px rgba(0, 252, 255, 0.15)' }}>
      <div className="flex flex-col items-center gap-2 mt-4 relative z-10">
        <span className="text-white/70 text-[10px] font-black uppercase tracking-[0.3em]">Total Dashboard View</span>
        <h1 className="text-8xl font-black tracking-tighter text-white drop-shadow-2xl tabular-nums">{INITIAL_KPI_STATS.totalViews}</h1>
      </div>
      <div className="w-full h-px bg-white/10 mt-4 relative z-10"></div>
      <div className="grid grid-cols-5 gap-4 relative z-10">
        {metrics.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white/10 transition-all group text-center border border-transparent hover:border-white/5">
            <div className="flex items-center gap-2 text-white/60 group-hover:text-white transition-colors"><item.icon size={12} /><span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span></div>
            <span className="text-2xl font-black text-white">{item.data.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PFMChart = ({ products, onDeleteProduct }: { products: Product[], onDeleteProduct: (id: number) => void }) => {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [mainProductFilter, setMainProductFilter] = useState<string | null>(null);
  const [isMainFilterOpen, setIsMainFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    let list = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMain = !mainProductFilter || p.mainProduct === mainProductFilter;
      return matchesSearch && matchesMain;
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [products, searchQuery, mainProductFilter]);

  const toggleRow = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-[#1a1c20]/40 rounded-2xl flex flex-col border border-gray-800/30 shadow-2xl overflow-hidden backdrop-blur-sm">
      <div className="p-6 flex flex-wrap justify-between items-center gap-4 border-b border-gray-800 bg-[#16181b]/50">
        <div className="flex items-center gap-3">
          <BarChart3 size={18} className="text-cyan-400" />
          <h3 className="text-base font-black text-gray-100 uppercase tracking-widest">PFM Chart</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setIsMainFilterOpen(!isMainFilterOpen)} className={`flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-xl text-xs font-bold border ${mainProductFilter ? 'border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'border-gray-700 text-gray-400'}`}>
              <Layers size={14} /> {mainProductFilter || 'Main Brand'} <ChevronDown size={14} />
            </button>
            {isMainFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a1c20] border border-gray-800 rounded-xl z-50 py-2 shadow-2xl overflow-hidden">
                {['JDENT', 'Jarvit', 'Julaherb'].map(c => <div key={c} onClick={() => { setMainProductFilter(c as any); setIsMainFilterOpen(false); }} className="px-4 py-2 text-xs font-bold hover:bg-white/5 cursor-pointer text-gray-300 hover:text-white transition-colors">{c}</div>)}
                <div onClick={() => { setMainProductFilter(null); setIsMainFilterOpen(false); }} className="px-4 py-2 text-xs font-bold hover:bg-white/5 cursor-pointer border-t border-gray-800 text-gray-500 mt-1">Clear Selection</div>
              </div>
            )}
          </div>
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search content..." className="bg-gray-800 text-xs py-2 pl-9 pr-4 rounded-xl border border-gray-700 w-48 focus:border-cyan-500 outline-none transition-all" /></div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-400 border-collapse">
          <thead className="bg-[#16181b] text-[10px] text-gray-500 uppercase font-black tracking-widest">
            <tr>
              <th className="px-4 py-4 text-center">No.</th>
              <th className="px-6 py-4">Content Information</th>
              <th className="px-4 py-4 text-center">DU.</th>
              <th className="px-4 py-4 text-center">AVG.W</th>
              <th className="px-4 py-4 text-center">RE. %</th>
              <th className="px-4 py-4 text-center">VIEWS</th>
              <th className="px-4 py-4 text-center">LIKE</th>
              <th className="px-4 py-4 text-center">BM.</th>
              <th className="px-4 py-4 text-center">CM.</th>
              <th className="px-4 py-4 text-center">SH.</th>
              <th className="px-4 py-4 text-center">PFM.</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((p, i) => (
              <React.Fragment key={p.id}>
                <tr className={`border-t border-gray-800/50 hover:bg-white/[0.03] cursor-pointer group transition-colors ${expandedRows[p.id] ? 'bg-cyan-500/[0.02]' : ''}`} onClick={() => toggleRow(p.id)}>
                  <td className="px-4 py-4 text-center font-bold text-gray-600 group-hover:text-gray-400">{i + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0 w-10 h-14 rounded overflow-hidden border border-white/5 shadow-lg transition-transform group-hover:scale-105">
                        <img src={p.thumbnail} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-gray-200 group-hover:text-cyan-400 transition-colors truncate max-w-[150px]">{p.name}</div>
                        <div className="text-[9px] text-gray-600 flex items-center gap-1 mt-0.5"><Clock size={10} /> {new Date(p.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center tabular-nums">{p.du}</td>
                  <td className="px-4 py-4 text-center tabular-nums">{p.avgW}</td>
                  <td className="px-4 py-4 text-center tabular-nums font-bold text-gray-300">{p.re}</td>
                  <td className="px-4 py-4 text-center tabular-nums font-black text-white">{p.vw}</td>
                  <td className="px-4 py-4 text-center tabular-nums">{p.lk}</td>
                  <td className="px-4 py-4 text-center tabular-nums">{p.bm}</td>
                  <td className="px-4 py-4 text-center tabular-nums">{p.cm}</td>
                  <td className="px-4 py-4 text-center tabular-nums">{p.sh}</td>
                  <td className="px-4 py-4 text-center"><span className="bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded font-black text-[10px] border border-cyan-500/20">{p.pfm}</span></td>
                </tr>
                {expandedRows[p.id] && (
                  <tr className="bg-cyan-500/[0.04] border-t border-cyan-500/10 animate-in fade-in slide-in-from-top-1">
                    <td colSpan={11} className="px-6 py-5">
                      <div className="flex items-center gap-10 pl-10">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] uppercase text-gray-500 font-black">Cost Per Mille (CPM)</span>
                          <div className="text-cyan-400 font-bold bg-cyan-900/20 px-4 py-1.5 rounded-lg border border-cyan-500/10">฿{p.cpm}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] uppercase text-gray-500 font-black">Cost Per Engagement (CPE)</span>
                          <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-900/20 px-4 py-1.5 rounded-lg border border-emerald-500/10">
                            <TrendingUp size={14} /> ฿{p.cpe}
                          </div>
                        </div>
                        {p.permalink && (
                          <div className="ml-auto">
                            <a href={p.permalink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#fe2c55]/10 text-white px-5 py-2.5 rounded-xl border border-[#fe2c55]/20 hover:bg-[#fe2c55]/20 transition-all font-black text-[10px] uppercase tracking-widest" onClick={(e) => e.stopPropagation()}>
                              <Video size={14} className="text-[#fe2c55]" /> Watch Video <ExternalLink size={12} className="opacity-60" />
                            </a>
                          </div>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); if(confirm('Delete this record?')) onDeleteProduct(p.id); }} 
                          className="ml-4 p-2 text-gray-600 hover:text-red-500 transition-colors bg-red-500/5 rounded-lg border border-red-500/10"
                          title="Delete content"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UploadView = ({ onAddProduct }: { onAddProduct: (p: Product) => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<Product> & { tiktokId?: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [customThumb, setCustomThumb] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customThumbInputRef = useRef<HTMLInputElement>(null);

  const handlePaste = (e: any) => {
    const item = e.clipboardData?.items[0];
    if (item?.type.includes('image')) {
      const blob = item.getAsFile();
      const reader = new FileReader();
      reader.onload = (ev) => {
        const res = ev.target?.result as string;
        if (extractedData) setCustomThumb(res); else setImagePreview(res);
      };
      reader.readAsDataURL(blob);
    }
  };

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [extractedData]);

  const processImage = async () => {
    if (!imagePreview) return;
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const data = await extractProductFromImage(imagePreview);
      if (data.tiktokId) data.permalink = `https://www.tiktok.com/@julaherbthailand/video/${data.tiktokId}`;
      data.mainProduct = 'Julaherb';
      setExtractedData(data);
    } catch (e: any) { 
      const errorStr = JSON.stringify(e).toLowerCase();
      setErrorMessage(errorStr.includes('429') ? "Server busy (Quota limit). Please wait 60s and try again." : "Extraction failed. Please ensure the screenshot is clear.");
    } finally { 
      setIsUploading(false); 
    }
  };

  const confirmAdd = () => {
    if (extractedData) {
      const p: Product = {
        ...extractedData as Product,
        id: Date.now(),
        thumbnail: customThumb || imagePreview || '',
        status: 'unpinned',
        date: new Date().toISOString()
      };
      onAddProduct(p);
      setExtractedData(null); setImagePreview(null); setCustomThumb(null); setErrorMessage(null);
      alert("Added successfully.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-8 animate-in fade-in duration-700">
      <div className="bg-[#1a1c20]/40 rounded-3xl border border-gray-800 p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-6 border border-cyan-500/20 shadow-inner"><CloudUpload size={40} /></div>
          <h2 className="text-3xl font-black text-white uppercase tracking-[0.2em]">Performance Data OCR</h2>
          <p className="text-gray-500 text-sm mt-3 font-medium">Upload or <span className="text-cyan-400 font-bold underline">Paste (Ctrl+V)</span> screenshot to begin</p>
        </div>

        {errorMessage && (
          <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-4 text-red-400 animate-pulse">
            <AlertCircle size={24} />
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-widest">Processing Error</span>
              <span className="text-xs opacity-80">{errorMessage}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`aspect-[4/5] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden relative group ${imagePreview ? 'border-cyan-500/50' : 'border-gray-800 hover:border-gray-700 bg-black/20'}`}>
              {imagePreview ? (
                <>
                  <img src={imagePreview} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                    <div className="bg-white/10 p-4 rounded-full border border-white/20">
                      <Camera className="text-white" size={40} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-5 opacity-40 group-hover:opacity-100 transition-opacity p-8 text-center">
                  <div className="p-6 bg-gray-900/50 rounded-full border border-gray-800">
                    <ClipboardPaste className="text-gray-400" size={48} />
                  </div>
                  <span className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em]">Click or Paste Screenshot</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload=ev=>setImagePreview(ev.target?.result as string); r.readAsDataURL(f); }}} />
            </div>
            {imagePreview && !isUploading && (
              <button 
                onClick={() => {setImagePreview(null); setExtractedData(null); setCustomThumb(null); setErrorMessage(null);}} 
                className="w-full py-4 text-red-400 text-xs font-black uppercase tracking-[0.2em] hover:bg-red-500/10 rounded-2xl border border-red-500/20 transition-all"
              >
                Discard Media
              </button>
            )}
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3 space-y-6">
            {!extractedData && !isUploading && (
              <div className="h-full flex flex-col justify-center gap-6 min-h-[400px]">
                <button 
                  disabled={!imagePreview} 
                  onClick={processImage} 
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-8 rounded-3xl font-black uppercase tracking-[0.3em] text-sm transition-all shadow-2xl shadow-cyan-500/20 flex items-center justify-center gap-4 disabled:opacity-20 disabled:grayscale"
                >
                  <Plus size={24} /> START AI ANALYSIS
                </button>
                <div className="bg-white/5 border border-white/5 p-8 rounded-3xl text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                    AI will automatically detect metrics like Views, Retention, Engagement and calculate PFM scores based on your screenshot data.
                  </p>
                </div>
              </div>
            )}
            
            {isUploading && (
              <div className="h-full flex flex-col items-center justify-center py-20 bg-black/20 rounded-3xl border border-white/5">
                <div className="relative">
                  <Loader2 size={64} className="text-cyan-400 animate-spin mb-8" />
                  <div className="absolute inset-0 blur-2xl bg-cyan-500/20 rounded-full"></div>
                </div>
                <p className="text-cyan-400 font-black uppercase text-xs tracking-[0.4em] animate-pulse">Syncing performance cloud...</p>
              </div>
            )}
            
            {extractedData && (
              <div className="bg-[#16181b] rounded-3xl p-8 border border-white/5 space-y-8 animate-in slide-in-from-right-8 duration-500 shadow-2xl">
                <div className="flex items-center justify-between text-cyan-400 border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 size={24} />
                    <span className="text-sm font-black uppercase tracking-[0.2em]">Data Verification Layer</span>
                  </div>
                  <button onClick={() => setExtractedData(null)} className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                    <X size={24}/>
                  </button>
                </div>
                
                <div className="flex gap-8 items-start">
                  <div className="relative group shrink-0">
                    <div className="w-28 h-40 bg-gray-900 rounded-2xl overflow-hidden border border-cyan-500/30 relative shadow-2xl transition-all group-hover:border-cyan-400">
                      <img src={customThumb || imagePreview || ''} className="w-full h-full object-cover" alt="" />
                      <div onClick={() => customThumbInputRef.current?.click()} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity backdrop-blur-sm">
                        <Camera size={24} className="text-white"/>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <span className="text-[10px] font-black uppercase text-gray-500 block mb-1 tracking-widest">Content Headline</span>
                    <input 
                      className="bg-black/30 border border-gray-800 rounded-xl w-full text-white text-sm font-black p-4 focus:border-cyan-500 outline-none transition-all shadow-inner focus:ring-4 focus:ring-cyan-500/5" 
                      value={extractedData.name || ''} 
                      onChange={e => setExtractedData({...extractedData, name: e.target.value})} 
                    />
                    <div className="flex gap-3">
                      <button onClick={() => customThumbInputRef.current?.click()} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-gray-700 transition-all flex items-center justify-center gap-3">
                        <ImageIcon size={18} /> Update Media
                      </button>
                      {customThumb && (
                        <button onClick={() => setCustomThumb(null)} className="px-5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all">
                          <X size={24}/>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 bg-black/20 p-6 rounded-[2rem] border border-white/5">
                  {[
                    { l: 'DU', k: 'du' }, { l: 'AVG.W', k: 'avgW' }, { l: 'RE', k: 're' }, { l: 'VW', k: 'vw' },
                    { l: 'LK', k: 'lk' }, { l: 'BM', k: 'bm' }, { l: 'CM', k: 'cm' }, { l: 'SH', k: 'sh' },
                    { l: 'CPM', k: 'cpm' }, { l: 'CPE', k: 'cpe' }
                  ].map(f => (
                    <div key={f.k}>
                      <span className="text-[9px] font-black text-gray-600 block uppercase mb-2 tracking-tighter">{f.l}</span>
                      <input 
                        className="bg-gray-900 border border-gray-800 w-full rounded-xl p-3 text-[11px] text-white font-black text-center focus:border-cyan-500 outline-none transition-all shadow-inner" 
                        value={(extractedData as any)[f.k] || ''} 
                        onChange={e => setExtractedData({...extractedData, [f.k]: e.target.value})} 
                      />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <span className="text-[9px] font-black text-cyan-600 block uppercase mb-2 tracking-widest">Efficiency Rank</span>
                    <input className="bg-cyan-500/10 border border-cyan-500/20 w-full rounded-xl p-3 text-xs text-cyan-400 font-black text-center focus:border-cyan-400 outline-none shadow-inner" value={extractedData.pfm || ''} onChange={e => setExtractedData({...extractedData, pfm: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] font-black text-emerald-600 block uppercase mb-2 tracking-widest">Brand Ecosystem</span>
                    <select className="bg-emerald-500/10 border border-emerald-500/20 w-full rounded-xl p-3 text-xs text-emerald-400 font-black outline-none focus:border-emerald-400 transition-all" value={extractedData.mainProduct} onChange={e => setExtractedData({...extractedData, mainProduct: e.target.value as any})}>
                      {['Julaherb', 'JDENT', 'Jarvit'].map(c => <option key={c} value={c} className="bg-[#1a1c20]">{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button onClick={() => {setExtractedData(null); setCustomThumb(null);}} className="flex-1 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-500 border border-gray-800 rounded-[2rem] hover:text-white hover:bg-white/5 transition-all">Cancel</button>
                  <button onClick={confirmAdd} className="flex-[2] py-6 bg-cyan-500 text-black rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-cyan-500/20 hover:bg-cyan-400 transition-all">Publish to Dashboard</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <input type="file" ref={customThumbInputRef} className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload=ev=>setCustomThumb(ev.target?.result as string); r.readAsDataURL(f); }}} />
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const deleteProduct = (id: number) => setProducts(products.filter(p => p.id !== id));
  const addProduct = (p: Product) => { setProducts([p, ...products]); setActiveTab('dashboard'); };

  return (
    <div className="flex min-h-screen bg-[#0d0f12] text-slate-200">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <TopBar title={activeTab === 'dashboard' ? 'Real-time Analytics' : 'Content Media Hub'} />
        <main className="ml-16 p-0 flex-1 overflow-y-auto">
  <div className="space-y-8">
    {activeTab === "dashboard" ? (
      <>
        {/* KPI: full width */}
        <div className="w-full">
          <MainKPICard />
        </div>

        {/* Admin Panel: move below (optional) */}
        <div className="px-8">
          <div className="bg-[#1a1c20] rounded-2xl border border-gray-800 p-8 flex flex-col items-center justify-center text-center gap-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-24 h-24 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-inner group-hover:scale-105 transition-transform duration-500">
              <User size={48} className="text-cyan-400" />
            </div>
            <div className="relative z-10">
              <div className="font-black uppercase text-white tracking-[0.2em] text-lg">
                Administrator Panel
              </div>
              <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-2 opacity-60">
                Professional E-Commerce V2.0
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="px-8 pb-10">
          <PFMChart products={products} onDeleteProduct={deleteProduct} />
        </div>
      </>
    ) : (
      <div className="px-8 pb-10">
        <UploadView onAddProduct={addProduct} />
      </div>
    )}
  </div>
</main>

      </div>
    </div>
  );
};

export default App;
