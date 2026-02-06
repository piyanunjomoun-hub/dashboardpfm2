
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
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  PRODUCTS as INITIAL_PRODUCTS, 
  INITIAL_KPI_STATS 
} from './constants';
import { extractProductFromImage } from './geminiService';
import { Product } from './types';

// --- Google Sheets Configuration ---
// Make sure this URL is your published Google Apps Script Web App URL
const GOOGLE_SHEET_APP_URL = 'https://script.google.com/macros/s/AKfycbyhOTmeDg40xgOSo_V3ndtzx0FcLfjl_uZrsAu4dPEzZuVE1LRNlr1FkDLK30bvZZdTlQ/exec'; 

// --- Cloud API Wrappers ---
const saveToGoogleSheet = async (data: Product[]) => {
  if (!GOOGLE_SHEET_APP_URL || GOOGLE_SHEET_APP_URL.includes('YOUR_')) return false;
  try {
    await fetch(GOOGLE_SHEET_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return true; 
  } catch (e) {
    console.error("Cloud Save Error:", e);
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
    console.error("Cloud Load Error:", e);
    return null;
  }
};

// --- Sub-Components ---

const Sidebar = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => (
  <div className="w-16 bg-[#1a1c20] border-r border-gray-800 flex flex-col items-center py-6 gap-8 fixed h-full z-20">
    <div className="w-8 h-8 bg-cyan-500 rounded-lg mb-4 flex items-center justify-center shadow-lg shadow-cyan-500/20">
      <div className="w-4 h-4 bg-white rounded-full"></div>
    </div>
    <div className="flex flex-col gap-6">
      <div onClick={() => onTabChange('dashboard')} className={`p-2.5 rounded-xl cursor-pointer transition-all ${activeTab === 'dashboard' ? 'bg-cyan-900/40 text-cyan-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}><LayoutDashboard size={20} /></div>
      <div onClick={() => onTabChange('upload')} className={`p-2.5 rounded-xl cursor-pointer transition-all ${activeTab === 'upload' ? 'bg-cyan-900/40 text-cyan-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}><CloudUpload size={20} /></div>
    </div>
    <div className="mt-auto mb-4"><div className="p-2.5 text-gray-500 hover:text-white cursor-pointer"><Settings size={20} /></div></div>
  </div>
);

const TopBar = ({ title, syncStatus, lastSync }: { title: string, syncStatus: string, lastSync: string | null }) => (
  <div className="h-14 bg-[#0d0f12] border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10 ml-16 backdrop-blur-md">
    <div className="flex items-center gap-4">
      <span className="text-gray-400 text-sm font-medium tracking-wide uppercase">{title}</span>
      <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-full text-[10px] font-bold text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
        <Globe size={12} className="animate-pulse" />
        <span>GLOBAL DATABASE ACCESS</span>
      </div>
    </div>
    <div className="flex items-center gap-5">
      {lastSync && <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest hidden md:block">Synchronized: {lastSync}</div>}
      <div className="flex items-center gap-3">
        {syncStatus === 'syncing' && <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 animate-pulse"><RefreshCw size={12} className="animate-spin" /> FETCHING MASTER DATA...</div>}
        {syncStatus === 'saving' && <div className="flex items-center gap-2 text-[10px] font-black text-orange-400 animate-pulse"><CloudUpload size={12} /> BROADCASTING CHANGES...</div>}
        {syncStatus === 'synced' && <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400"><ShieldCheck size={12} /> GLOBAL CACHE SYNCED</div>}
        {syncStatus === 'error' && <div className="flex items-center gap-2 text-[10px] font-black text-red-400"><AlertCircle size={12} /> CONNECTION ERROR</div>}
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
      <span className="font-black uppercase tracking-[0.2em] text-sm">Real-time Data Pool</span>
    </div>
    
    <div className="flex flex-col gap-5 py-4 flex-1 justify-center">
      {isConfigured ? (
        <>
          <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl animate-in zoom-in-95 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
             <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-black shrink-0 shadow-lg shadow-emerald-500/30"><Zap size={28} /></div>
             <div className="flex flex-col">
               <span className="text-emerald-400 font-black text-xs uppercase tracking-widest">Global Sync: Active</span>
               <span className="text-gray-500 text-[10px] font-medium uppercase mt-0.5">Shared across all sessions</span>
             </div>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed text-center px-4">
            ข้อมูลชุดนี้จะอัปเดตไปที่ Cloud อัตโนมัติ <br/>
            <span className="text-cyan-500 font-black">ทุกคนที่เข้าเว็บจะเห็นข้อมูลชุดเดียวกัน</span>
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center py-6">
           <AlertCircle size={48} className="text-orange-500/40" />
           <p className="text-xs text-gray-500 font-bold leading-relaxed uppercase tracking-tighter">Please check your Google Script URL.</p>
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
      const name = p.name || '';
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMain = !mainProductFilter || p.mainProduct === mainProductFilter;
      return matchesSearch && matchesMain;
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [products, searchQuery, mainProductFilter]);

  const toggleRow = (id: number) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="bg-[#1a1c20]/40 rounded-2xl flex flex-col border border-gray-800/30 shadow-2xl overflow-hidden backdrop-blur-sm">
      <div className="p-6 flex flex-wrap justify-between items-center gap-4 border-b border-gray-800 bg-[#16181b]/50">
        <div className="flex items-center gap-3">
          <BarChart3 size={18} className="text-cyan-400" />
          <h3 className="text-base font-black text-gray-100 uppercase tracking-widest">Global Performance Matrix</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setIsMainFilterOpen(!isMainFilterOpen)} className={`flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-xl text-xs font-bold border ${mainProductFilter ? 'border-cyan-500 text-cyan-400' : 'border-gray-700 text-gray-400'}`}>
              <Layers size={14} /> {mainProductFilter || 'Brand'} <ChevronDown size={14} />
            </button>
            {isMainFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a1c20] border border-gray-800 rounded-xl z-50 py-2 shadow-2xl overflow-hidden">
                {['JDENT', 'Jarvit', 'Julaherb'].map(c => <div key={c} onClick={() => { setMainProductFilter(c as any); setIsMainFilterOpen(false); }} className="px-4 py-2 text-xs font-bold hover:bg-white/5 cursor-pointer text-gray-300 hover:text-white">{c}</div>)}
                <div onClick={() => { setMainProductFilter(null); setIsMainFilterOpen(false); }} className="px-4 py-2 text-xs font-bold hover:bg-white/5 cursor-pointer border-t border-gray-800 text-gray-500 mt-1">All Brands</div>
              </div>
            )}
          </div>
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter..." className="bg-gray-800 text-xs py-2 pl-9 pr-4 rounded-xl border border-gray-700 w-48 outline-none" /></div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-400">
          <thead className="bg-[#16181b] text-[10px] text-gray-500 uppercase font-black tracking-widest">
            <tr>
              <th className="px-4 py-4 text-center">#</th>
              <th className="px-6 py-4">Content</th>
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
                <tr className="border-t border-gray-800/50 hover:bg-white/[0.03] cursor-pointer group" onClick={() => toggleRow(p.id)}>
                  <td className="px-4 py-4 text-center font-bold">{i + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 rounded overflow-hidden border border-white/5 bg-gray-900 flex items-center justify-center">
                        {p.thumbnail ? <img src={p.thumbnail} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-gray-700" />}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-gray-200 group-hover:text-cyan-400 truncate max-w-[150px]">{p.name}</div>
                        <div className="text-[9px] text-gray-600">{new Date(p.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">{p.du}</td>
                  <td className="px-4 py-4 text-center">{p.avgW}</td>
                  <td className="px-4 py-4 text-center">{p.re}</td>
                  <td className="px-4 py-4 text-center font-black text-white">{p.vw}</td>
                  <td className="px-4 py-4 text-center">{p.lk}</td>
                  <td className="px-4 py-4 text-center">{p.bm}</td>
                  <td className="px-4 py-4 text-center">{p.cm}</td>
                  <td className="px-4 py-4 text-center">{p.sh}</td>
                  <td className="px-4 py-4 text-center"><span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-black text-[10px]">{p.pfm}</span></td>
                </tr>
                {expandedRows[p.id] && (
                  <tr className="bg-cyan-500/[0.04]">
                    <td colSpan={11} className="px-6 py-4">
                      <div className="flex items-center gap-10">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] uppercase text-gray-500">CPM</span>
                          <span className="text-cyan-400 font-bold">฿{p.cpm}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] uppercase text-gray-500">CPE</span>
                          <span className="text-emerald-400 font-bold">฿{p.cpe}</span>
                        </div>
                        <div className="ml-auto">
                           <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete from global pool?')) onDeleteProduct(p.id); }} className="text-red-500 text-[10px] font-black uppercase hover:text-red-400 flex items-center gap-2"><Trash2 size={14}/> REMOVE</button>
                        </div>
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async () => {
    if (!imagePreview) return;
    setIsUploading(true);
    setErrorMessage(null);
    try {
      console.log("Starting extraction...");
      const data = await extractProductFromImage(imagePreview);
      console.log("Extraction success:", data);
      data.mainProduct = 'Julaherb';
      setExtractedData(data);
    } catch (e: any) { 
      console.error("Extraction error UI:", e);
      setErrorMessage(e.message || "ระบบวิเคราะห์ข้อมูลล้มเหลว กรุณาลองใช้รูปที่ชัดเจนกว่านี้");
    } finally { 
      setIsUploading(false); 
    }
  };

  const confirmAdd = () => {
    if (extractedData) {
      const p: Product = {
        ...extractedData as Product,
        id: Date.now(),
        thumbnail: imagePreview || '',
        status: 'unpinned',
        date: new Date().toISOString()
      };
      onAddProduct(p);
      setExtractedData(null); 
      setImagePreview(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onload = ev => setImagePreview(ev.target?.result as string);
      r.readAsDataURL(f);
      setExtractedData(null);
      setErrorMessage(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 animate-in fade-in">
       <div className="bg-[#1a1c20]/60 rounded-3xl border border-gray-800 p-12 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center mb-10">
            <div className="p-4 bg-cyan-500/10 rounded-2xl mb-4 border border-cyan-500/20 text-cyan-400"><CloudUpload size={32} /></div>
            <h2 className="text-3xl font-black text-white uppercase tracking-widest">Global Data Injection</h2>
            <p className="text-gray-500 mt-1">AI-Powered TikTok Analytics Extraction</p>
          </div>

          {errorMessage && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400 text-sm animate-in zoom-in-95">
              <AlertCircle size={20} className="shrink-0" />
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="ml-auto text-red-300 hover:text-white"><X size={16}/></button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Upload Area */}
            <div 
              onClick={() => !isUploading && fileInputRef.current?.click()} 
              className={`aspect-[4/5] rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative group ${imagePreview ? 'border-cyan-500/40 bg-black/40' : 'border-gray-800 hover:border-gray-600 bg-black/20'}`}
            >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} className="w-full h-full object-cover rounded-[1.8rem]" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[1.8rem]">
                       <Camera size={40} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-gray-600">
                    <ImageIcon size={60} strokeWidth={1} />
                    <span className="text-xs font-bold uppercase tracking-widest">Click to select screenshot</span>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            {/* Action/Preview Area */}
            <div className="flex flex-col h-full">
               {!extractedData ? (
                 <div className="flex flex-col justify-center h-full gap-6">
                    <div className="p-6 bg-gray-900/40 rounded-2xl border border-white/5 space-y-4">
                       <h4 className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Instructions</h4>
                       <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
                          <li>ใช้รูปภาพ Screenshot จากหน้า TikTok Shop Analytics</li>
                          <li>ควรเห็นชื่อคลิปและตัวเลขสถิติที่ชัดเจน</li>
                          <li>AI จะสกัดข้อมูล DU, Views, Likes และ Metrics อื่นๆ อัตโนมัติ</li>
                       </ul>
                    </div>
                    <button 
                      disabled={!imagePreview || isUploading} 
                      onClick={processImage} 
                      className="w-full bg-cyan-500 hover:bg-cyan-400 py-10 rounded-[2rem] font-black uppercase text-black disabled:opacity-20 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-cyan-500/20"
                    >
                       {isUploading ? (
                         <>
                           <Loader2 className="animate-spin" size={24} />
                           <span>AI Analyzing Screenshot...</span>
                         </>
                       ) : (
                         <>
                           <Plus size={24} />
                           <span>Process & Upload Data</span>
                         </>
                       )}
                    </button>
                 </div>
               ) : (
                 <div className="space-y-6 animate-in slide-in-from-right-10">
                    <div className="bg-black/60 p-8 rounded-[2rem] border border-cyan-500/10 shadow-inner space-y-6">
                       <div className="flex items-center gap-3 text-cyan-400 mb-4 border-b border-white/5 pb-4">
                          <CheckCircle2 size={20} />
                          <span className="font-black uppercase tracking-widest text-sm">Review Extraction</span>
                       </div>
                       
                       <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-black text-gray-500 block uppercase mb-1">Content Name</span>
                            <input value={extractedData.name || ''} onChange={e => setExtractedData({...extractedData, name: e.target.value})} className="bg-gray-900 border border-gray-800 text-white font-black w-full py-3 px-4 rounded-xl focus:border-cyan-500 outline-none" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                             <div><span className="text-[10px] font-black text-gray-500 block uppercase mb-1">Views (VW)</span><input value={extractedData.vw || ''} onChange={e => setExtractedData({...extractedData, vw: e.target.value})} className="bg-gray-900 border border-gray-800 text-white font-black w-full py-3 px-4 rounded-xl outline-none" /></div>
                             <div><span className="text-[10px] font-black text-gray-500 block uppercase mb-1">Score (PFM)</span><input value={extractedData.pfm || ''} onChange={e => setExtractedData({...extractedData, pfm: e.target.value})} className="bg-gray-900 border border-gray-800 text-white font-black w-full py-3 px-4 rounded-xl outline-none" /></div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-4">
                       <button onClick={() => setExtractedData(null)} className="flex-1 py-4 text-gray-500 font-bold uppercase text-[10px] hover:text-white border border-gray-800 rounded-2xl">Reset</button>
                       <button onClick={confirmAdd} className="flex-[2] bg-emerald-500 hover:bg-emerald-400 py-4 rounded-2xl font-black text-black uppercase tracking-widest shadow-lg shadow-emerald-500/10">Broadcast to Global Pool</button>
                    </div>
                 </div>
               )}
            </div>
          </div>
       </div>
    </div>
  );
};

// --- Main Application ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const isConfigured = GOOGLE_SHEET_APP_URL.startsWith('http');

  // Load from Cloud
  const performFetch = async (silent = false) => {
    if (!silent) setSyncStatus('syncing');
    const cloudData = await loadFromGoogleSheet();
    if (cloudData) {
      setProducts(cloudData);
      setLastSyncTime(new Date().toLocaleTimeString());
      setSyncStatus('synced');
      localStorage.setItem('pfm_cache', JSON.stringify(cloudData));
    } else {
      if (!silent) setSyncStatus('error');
    }
  };

  // 1. Initial Load: Fetch from Cloud ONLY on mount
  useEffect(() => {
    const initFetch = async () => {
      // First try to show what we have in local cache for speed
      const local = localStorage.getItem('pfm_cache');
      if (local) setProducts(JSON.parse(local));
      else setProducts(INITIAL_PRODUCTS);

      await performFetch();
      setIsInitialLoading(false);
    };
    initFetch();
  }, [isConfigured]);

  // 2. Periodic Polling for Global Consistency across IPs
  useEffect(() => {
    if (!isConfigured) return;
    const interval = setInterval(() => {
      // Only poll if we are not actively saving/uploading
      if (syncStatus !== 'saving' && activeTab === 'dashboard') {
        performFetch(true);
      }
    }, 20000); // Polling every 20 seconds
    return () => clearInterval(interval);
  }, [isConfigured, syncStatus, activeTab]);

  // 3. Helper to Broadcast Changes to Cloud
  const broadcastChanges = async (newProducts: Product[]) => {
    setSyncStatus('saving');
    localStorage.setItem('pfm_cache', JSON.stringify(newProducts));
    const success = await saveToGoogleSheet(newProducts);
    if (success) {
      setSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString());
    } else {
      setSyncStatus('error');
      alert("ไม่สามารถบันทึกข้อมูลไปที่ Cloud ได้ กรุณาตรวจสอบการเชื่อมต่อ");
    }
  };

  // 4. Action Handlers
  const addProduct = (p: Product) => {
    const updated = [p, ...products];
    setProducts(updated);
    broadcastChanges(updated);
    setActiveTab('dashboard');
  };

  const deleteProduct = (id: number) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    broadcastChanges(updated);
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d0f12] flex-col gap-8">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-cyan-500/20 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
        </div>
        <div className="flex flex-col items-center gap-2">
           <div className="text-cyan-400 font-black tracking-[0.5em] text-xs uppercase">Shared Repository</div>
           <div className="text-gray-600 text-[10px] font-bold uppercase animate-pulse">Establishing Secure Uplink...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0d0f12] text-slate-200">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <TopBar 
          title={activeTab === 'dashboard' ? 'Shared Live Matrix' : 'Cloud Entry Hub'} 
          syncStatus={syncStatus}
          lastSync={lastSyncTime}
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
