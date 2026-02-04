
import { ViewerSourceData, PerformanceTrendData, Product, KPIStats } from './types';

export const VIEWER_SOURCE_DATA: ViewerSourceData[] = [
  { name: 'For You feed', value: 37.72, color: '#22d3ee' },
  { name: 'Search', value: 20.41, color: '#38bdf8' },
  { name: 'Promoted Traffic', value: 17.48, color: '#6366f1' },
  { name: 'Live Merge', value: 8.86, color: '#a855f7' },
];

export const PERFORMANCE_DATA: PerformanceTrendData[] = [
  { time: '06:22', viewers: 120, clicks: 45 },
  { time: '07:30', viewers: 180, clicks: 60 },
  { time: '08:45', viewers: 150, clicks: 55 },
  { time: '09:48', viewers: 240, clicks: 80 },
  { time: '11:00', viewers: 210, clicks: 75 },
  { time: '12:15', viewers: 300, clicks: 110 },
  { time: '13:14', viewers: 420, clicks: 150 },
  { time: '14:45', viewers: 380, clicks: 140 },
  { time: '16:40', viewers: 510, clicks: 190 },
  { time: '18:20', viewers: 480, clicks: 175 },
  { time: '20:07', viewers: 620, clicks: 230 },
];

export const PRODUCTS: Product[] = [
  { id: 1, thumbnail: 'https://picsum.photos/40/60?random=1', name: 'Premium Headphones', du: '04:12', avgW: '01:45', re: '62%', vw: '12.4K', lk: '4.2K', bm: '1.2K', cm: '342', sh: '89', pfm: '92%', products: '12', cpm: '2.4', cpe: '0.1', status: 'unpinned', mainProduct: 'Julaherb', date: '2024-01-15' },
  { id: 2, thumbnail: 'https://picsum.photos/40/60?random=2', name: 'Fitness Watch V2', du: '03:45', avgW: '01:12', re: '55%', vw: '8.2K', lk: '2.1K', bm: '540', cm: '128', sh: '42', pfm: '88%', products: '8', cpm: '3.1', cpe: '0.2', status: 'pinned', mainProduct: 'JDENT', date: '2024-02-20' },
  { id: 3, thumbnail: 'https://picsum.photos/40/60?random=3', name: 'Cotton T-Shirt', du: '02:30', avgW: '00:58', re: '42%', vw: '5.1K', lk: '1.2K', bm: '320', cm: '86', sh: '21', pfm: '75%', products: '24', cpm: '1.8', cpe: '0.1', status: 'pinned', mainProduct: 'Jarvit', date: '2024-03-05' },
  { id: 4, thumbnail: 'https://picsum.photos/40/60?random=4', name: 'Leather Wallet', du: '03:15', avgW: '01:22', re: '48%', vw: '4.2K', lk: '980', bm: '210', cm: '45', sh: '12', pfm: '68%', products: '5', cpm: '2.2', cpe: '0.3', status: 'pinned', mainProduct: 'Julaherb', date: '2024-04-10' },
  { id: 5, thumbnail: 'https://picsum.photos/40/60?random=5', name: 'Power Bank 20k', du: '05:00', avgW: '02:30', re: '70%', vw: '3.8K', lk: '850', bm: '190', cm: '32', sh: '8', pfm: '82%', products: '3', cpm: '2.5', cpe: '0.2', status: 'pinned', mainProduct: 'JDENT', date: '2024-05-12' },
  { id: 6, thumbnail: 'https://picsum.photos/40/60?random=6', name: 'BT Speaker', du: '02:15', avgW: '00:45', re: '35%', vw: '2.9K', lk: '640', bm: '150', cm: '28', sh: '5', pfm: '79%', products: '10', cpm: '2.0', cpe: '0.2', status: 'pinned', mainProduct: 'Jarvit', date: '2024-06-18' },
];

export const INITIAL_KPI_STATS: KPIStats = {
  totalViews: '124,532',
  viewers: 232,
  itemsSold: '1.64K',
  engagement: {
    view: { value: '124.5K', trend: 12, isPositive: true },
    like: { value: '45.2K', trend: 8, isPositive: true },
    bookmark: { value: '12.8K', trend: 5, isPositive: true },
    comment: { value: '3,421', trend: 15, isPositive: true },
    shared: { value: '892', trend: 2, isPositive: false }
  },
  gmv: 67287 // kept for AI context
};
