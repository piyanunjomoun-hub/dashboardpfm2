
export interface ViewerSourceData {
  name: string;
  value: number;
  color: string;
}

export interface PerformanceTrendData {
  time: string;
  viewers: number;
  clicks: number;
}

export interface Product {
  id: number;
  thumbnail: string;
  name: string;
  du: string;
  avgW: string;
  re: string;
  vw: string;
  lk: string;
  bm: string;
  cm: string;
  sh: string;
  pfm: string;
  products: string;
  cpm: string;
  cpe: string;
  mainProduct?: 'JDENT' | 'Jarvit' | 'Julaherb';
  permalink?: string;
  status: 'pinned' | 'unpinned';
  date: string; // ISO format date string
}

export interface MetricDetail {
  value: string | number;
  trend: number;
  isPositive: boolean;
}

export interface KPIStats {
  totalViews: string;
  viewers: number;
  itemsSold: string;
  engagement: {
    view: MetricDetail;
    like: MetricDetail;
    bookmark: MetricDetail;
    comment: MetricDetail;
    shared: MetricDetail;
  };
  // Legacy fields for AI compatibility if needed
  gmv?: number;
}
