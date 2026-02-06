
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
  AlertCircle,
  RefreshCw,
  Globe,
  Copy,
  Link,
  Database,
  ShieldCheck
} from 'lucide-react';
import { 
  PRODUCTS as INITIAL_PRODUCTS, 
  INITIAL_KPI_STATS 
} from './constants';
import { extractProductFromImage } from './geminiService';
import { Product } from './types';

// --- Google Sheets Integration ---
const GOOGLE_SHEET_APP_URL = 'https://script.google.com/macros/s/AKfycbyhOTmeDg40xgOSo_V3ndtzx0FcLfjl_uZrsAu4dPEzZuVE1LRNlr1FkDLK30bvZZdTlQ/exec'; 

const saveToGoogleSheet = async (data: Product[]) => {
  if (!GOOGLE_SHEET_APP_URL || GOOGLE_SHEET_APP_URL.includes('YOUR_')) return false;
  try {
    // We use a POST request to update the sheet. 
    // Note: Apps Script Web Apps often require 'no-cors' or specific handling for redirects.
    // However, fetch with POST to Google Script usually works best as a simple request if no response is needed immediately.
    await fetch(GOOGLE_SHEET_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return true; 
  } catch (e) {
    console.error("Sheet Save Error:", e);
    return false;
  }
};

const loadFromGoogleSheet = async () => {
  if (!GOOGLE_SHEET_APP_URL || GOOGLE_SHEET_APP_URL.includes('YOUR_')) return null;
  try {
    const res = await fetch(GOOGLE_SHEET_APP_URL);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : null;
    }
    return null;
  } catch (e) {
    console.error("Sheet Load Error:", e);
    return null;
  }
};

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

const TopBar = ({ title, syncStatus }: { title: string, syncStatus: 'idle' | 'syncing' | 'synced' | 'error' | 'no-config' }) => (
  <div className="h-14 bg-[#0d0f12] border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10 ml-16 backdrop-blur-md">
    <div className="flex items-center gap-4">
      <span className="text-gray-400 text-sm font-medium tracking-wide uppercase">{title}</span>
      <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-full text-[10px] font-bold text-green-400 border border-green-500/10">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
        <span>CONNECTED TO GLOBAL CLOUD</span>
      </div>
    </div>
    <div className="flex items-center gap-3">
      {syncStatus === 'syncing' && <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 animate-pulse"><RefreshCw size={12} className="animate-spin" /> WRITING TO GOOGLE SHEET...</div>}
      {syncStatus === 'synced' && <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400"><ShieldCheck size={12} /> GLOBAL DATABASE SECURED</div>}
      {syncStatus === 'error' && <div className="flex items-center gap-2 text-[10px] font-black text-red-400"><AlertCircle size={12} /> SHEET SYNC ERROR</div>}
      {syncStatus === 'no-config' && <div className="flex items-center gap-2 text-[10px] font-black text-orange-400"><Settings size={12} /> GOOGLE SHEET NOT CONFIGURED</div>}
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
        <span className="text-white/70 text-[10px] font-black uppercase tracking-[0.3em]">Global Performance View</span>
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

const DatabaseStatusCard = ({ isConfigured }: { isConfigured: boolean }) => (
  <div className="bg-[#1a1c20] rounded-[2rem] border border-gray-800 p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden group h-full">
    <div className="flex items-center gap-4 text-cyan-400 border-b border-gray-800 pb-4">
      <Database size={24} />
      <span className="font-black uppercase tracking-[0.2em] text-sm">Master Database Status</span>
    </div>
    
    <div className="flex flex-col gap-5 py-4 flex-1 justify-center">
      {isConfigured ? (
        <>
          <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl animate-in zoom-in-95">
             <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-black shrink-0"><ShieldCheck size={28} /></div>
             <div className="flex flex-col">
               <span className="text-emerald-400 font-black text-xs uppercase tracking-widest">Global Sync Active</span>
               <span className="text-gray-500 text-[10px] font-medium uppercase mt-0.5">Connected to Google Sheet</span>
             </div>
          </div>
          <p className="text-[10px] text-gray-600 font-bold uppercase leading-relaxed text-center px-4">
            ข้อมูลชุดนี้ถูกแชร์ให้กับทุกคนที่เข้าใช้งานผ่าน Google Sheets ส่วนกลางของคุณ
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center py-6">
           <AlertCircle size={48} className="text-orange-500/40" />
           <p className="text-xs text-gray-500 font-bold leading-relaxed uppercase tracking-tighter">กรุณาตั้งค่า Google Sheets Web App URL ในโค้ดเพื่อให้ทุกคนใช้งานฐานข้อมูลร่วมกันได้</p>
           <a href="https://docs.google.com/spreadsheets/u/0/" target="_blank" className="text-[10px] text-cyan-500 font-black uppercase tracking-widest hover:underline">Open Google Sheets</a>
        </div>
      )}
    </div>
  </div>
);

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
          <h3 className="text-base font-black text-gray-100 uppercase tracking-widest">PFM Master Chart</h3>
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
            {filteredData.length > 0 ? filteredData.map((p, i) => (
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
                          onClick={(e) => { e.stopPropagation(); if(confirm('ต้องการลบข้อมูลชุดนี้จาก Global Database ใช่หรือไม่?')) onDeleteProduct(p.id); }} 
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
            )) : (
              <tr>
                <td colSpan={11} className="py-20 text-center">
                   <div className="flex flex-col items-center gap-4 opacity-20">
                      <BarChart3 size={48} />
                      <span className="text-sm font-black uppercase tracking-widest">Global Data Stream Empty</span>
                   </div>
                </td>
              </tr>
            )}
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
      console.error("OCR API Error:", e);
      let displayError = e.message || "Error processing image";
      setErrorMessage(displayError);
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
      alert("บันทึกลง Global Sheet เรียบร้อยแล้ว");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 space-y-8 animate-in fade-in duration-700">
      <div className="bg-[#1a1c20]/40 rounded-3xl border border-gray-800 p-12 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center mb-12">
          <div className="w-24 h-24 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-6 border border-cyan-500/20 shadow-inner"><CloudUpload size={48} /></div>
          <h2 className="text-4xl font-black text-white uppercase tracking-[0.2em]">Data Feed Analytics</h2>
          <p className="text-gray-500 text-base mt-4 font-medium">Extract data and sync to <span className="text-emerald-400 font-bold uppercase underline">Google Sheets Master</span></p>
        </div>

        {errorMessage && (
          <div className="mb-10 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-5 text-red-400">
            <AlertCircle size={32} className="shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-widest">OCR Extraction Failure</span>
              <span className="text-xs opacity-90 font-medium break-all">{errorMessage}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 space-y-8">
            <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`aspect-[4/5] rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden relative group ${imagePreview ? 'border-cyan-500/50 shadow-2xl shadow-cyan-500/10' : 'border-gray-800 hover:border-gray-700 bg-black/20'}`}>
              {imagePreview ? (
                <>
                  <img src={imagePreview} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                    <div className="bg-white/10 p-6 rounded-full border border-white/20">
                      <Camera className="text-white" size={48} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-6 opacity-40 group-hover:opacity-100 transition-opacity p-12 text-center">
                  <div className="p-8 bg-gray-900/50 rounded-full border border-gray-800">
                    <ClipboardPaste className="text-gray-400" size={64} />
                  </div>
                  <span className="text-gray-500 font-bold text-sm uppercase tracking-[0.4em]">Screenshot Dropzone</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload=ev=>setImagePreview(ev.target?.result as string); r.readAsDataURL(f); }}} />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
            {!extractedData && !isUploading && (
              <div className="h-full flex flex-col justify-center gap-8 min-h-[500px]">
                <button 
                  disabled={!imagePreview} 
                  onClick={processImage} 
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-10 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-base transition-all shadow-[0_20px_50px_rgba(34,211,238,0.3)] flex items-center justify-center gap-5 disabled:opacity-20 disabled:grayscale"
                >
                  <Plus size={32} /> START AI PIPELINE
                </button>
              </div>
            )}
            
            {isUploading && (
              <div className="h-full flex flex-col items-center justify-center py-24 bg-black/20 rounded-[2.5rem] border border-white/5 shadow-inner">
                <Loader2 size={80} className="text-cyan-400 animate-spin mb-10" />
                <p className="text-cyan-400 font-black uppercase text-sm tracking-[0.5em] animate-pulse">Scanning Data Structures...</p>
              </div>
            )}
            
            {extractedData && (
              <div className="bg-[#16181b] rounded-[2.5rem] p-10 border border-white/5 space-y-10 animate-in slide-in-from-right-12 duration-700 shadow-2xl">
                <div className="flex items-center justify-between text-cyan-400 border-b border-white/5 pb-8">
                  <div className="flex items-center gap-5">
                    <CheckCircle2 size={28} />
                    <span className="text-lg font-black uppercase tracking-[0.3em]">Validation Required</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-6 bg-black/20 p-8 rounded-[2.5rem] border border-white/5">
                  <div className="col-span-4">
                    <span className="text-[10px] font-black uppercase text-gray-500 block mb-2 tracking-widest">Headline Label</span>
                    <input 
                      className="bg-black/30 border border-gray-800 rounded-2xl w-full text-white text-base font-black p-5 focus:border-cyan-500 outline-none transition-all shadow-inner" 
                      value={extractedData.name || ''} 
                      onChange={e => setExtractedData({...extractedData, name: e.target.value})} 
                    />
                  </div>
                  {[
                    { l: 'DU', k: 'du' }, { l: 'AVG.W', k: 'avgW' }, { l: 'RE', k: 're' }, { l: 'VW', k: 'vw' },
                    { l: 'LK', k: 'lk' }, { l: 'BM', k: 'bm' }, { l: 'CM', k: 'cm' }, { l: 'SH', k: 'sh' }
                  ].map(f => (
                    <div key={f.k}>
                      <span className="text-[10px] font-black text-gray-600 block uppercase mb-3 tracking-tighter">{f.l}</span>
                      <input 
                        className="bg-gray-900 border border-gray-800 w-full rounded-2xl p-4 text-xs text-white font-black text-center focus:border-cyan-500 outline-none transition-all" 
                        value={(extractedData as any)[f.k] || ''} 
                        onChange={e => setExtractedData({...extractedData, [f.k]: e.target.value})} 
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-6 flex gap-6">
                  <button onClick={() => {setExtractedData(null); setCustomThumb(null);}} className="flex-1 py-7 text-xs font-black uppercase tracking-[0.3em] text-gray-500 border border-gray-800 rounded-[2.5rem] hover:text-white hover:bg-white/5 transition-all">Cancel</button>
                  <button onClick={confirmAdd} className="flex-[2] py-7 bg-cyan-500 text-black rounded-[2.5rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl shadow-cyan-500/30 hover:bg-cyan-400 transition-all">Commit to Master Sheet</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error' | 'no-config'>('idle');
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pfm_dashboard_products');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_PRODUCTS; }
    }
    return INITIAL_PRODUCTS;
  });

  const isConfigured = GOOGLE_SHEET_APP_URL.startsWith('http');

  // Initial Sync from Google Sheet on Mount
  useEffect(() => {
    if (!isConfigured) {
      setSyncStatus('no-config');
      return;
    }
    setSyncStatus('syncing');
    loadFromGoogleSheet().then(data => {
      if (data && Array.isArray(data)) {
        setProducts(data);
        setSyncStatus('synced');
      } else {
        setSyncStatus('idle');
      }
    });
  }, [isConfigured]);

  // Sync to Google Sheet on local changes (Debounced)
  useEffect(() => {
    if (!isConfigured) return;
    localStorage.setItem('pfm_dashboard_products', JSON.stringify(products));
    
    setSyncStatus('syncing');
    const timer = setTimeout(() => {
      saveToGoogleSheet(products).then(success => {
        setSyncStatus(success ? 'synced' : 'error');
      });
    }, 3000); // 3s debounce to prevent rate limit on Google Sheets
    return () => clearTimeout(timer);
  }, [products, isConfigured]);

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addProduct = (p: Product) => { 
    setProducts(prev => [p, ...prev]); 
    setActiveTab('dashboard'); 
  };

  return (
    <div className="flex min-h-screen bg-[#0d0f12] text-slate-200">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <TopBar 
          title={activeTab === 'dashboard' ? 'Global Command Center' : 'Shared Data Ingestion'} 
          syncStatus={syncStatus}
        />
        <main className="ml-16 p-8 flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto space-y-10">
            {activeTab === 'dashboard' ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 shadow-2xl"><MainKPICard /></div>
                  <DatabaseStatusCard isConfigured={isConfigured} />
                </div>
                <PFMChart products={products} onDeleteProduct={deleteProduct} />
              </>
            ) : <UploadView onAddProduct={addProduct} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
