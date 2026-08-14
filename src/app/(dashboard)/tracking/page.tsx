'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

const STATUS_STEPS = [
  { value: 'pending', label: 'Order Placed', color: 'text-yellow-400', bg: 'bg-yellow-400', border: 'border-yellow-400' },
  { value: 'confirmed', label: 'Confirmed', color: 'text-blue-400', bg: 'bg-blue-400', border: 'border-blue-400' },
  { value: 'in_production', label: 'In Production', color: 'text-orange-400', bg: 'bg-orange-400', border: 'border-orange-400' },
  { value: 'shipped', label: 'Shipped', color: 'text-purple-400', bg: 'bg-purple-400', border: 'border-purple-400' },
  { value: 'delivered', label: 'Delivered', color: 'text-green-400', bg: 'bg-green-400', border: 'border-green-400' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  in_production: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  shipped: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  delivered: 'bg-green-500/15 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const COLOR_HEX: Record<string, string> = {
  pearl_white: '#F5F5F5', solid_black: '#1A1A1A', midnight_silver: '#6E7681',
  deep_blue: '#1E3A5F', red_multi_coat: '#CC0000', ultra_red: '#B71C1C',
  quick_silver: '#9CA3AF', blue_multi_coat: '#3B82F6',
};

const COLOR_LABELS: Record<string, string> = {
  pearl_white: 'Pearl White', solid_black: 'Solid Black', midnight_silver: 'Midnight Silver',
  deep_blue: 'Deep Blue', red_multi_coat: 'Red Multi-Coat', ultra_red: 'Ultra Red',
  quick_silver: 'Quick Silver', blue_multi_coat: 'Blue Multi-Coat',
};

export default function TrackingPage() {
  const { token } = useAuthStore();
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchTracking = useCallback(async (code?: string) => {
    const num = (code || orderNumber).trim();
    if (!num) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/vehicles/track-by-code?orderNumber=' + encodeURIComponent(num), {
        headers: token ? { Authorization: 'Bearer ' + token } : {},
      });
      const json = await res.json();
      if (json.success) { setTrackingData(json.data); }
      else { setError(json.error?.message || 'Tracking failed'); setTrackingData(null); }
    } catch { setError('Network error. Please try again.'); setTrackingData(null); }
    setLoading(false);
  }, [orderNumber, token]);

  const handleTrack = () => fetchTracking();
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleTrack(); };

  useEffect(() => {
    if (!autoRefresh || !orderNumber.trim()) return;
    const interval = setInterval(() => fetchTracking(), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTracking, orderNumber]);

  const order = trackingData?.order;
  const tracking = trackingData?.tracking;

  const stepColorClass = (step: typeof STATUS_STEPS[0], isCurrent: boolean, isComplete: boolean, isCancelled: boolean) => {
    if (isComplete) return step.bg + ' ' + step.border + ' shadow-lg';
    if (isCurrent && isCancelled) return 'bg-red-500/20 border-red-500/50';
    return 'bg-[#1a1a1a] border-tesla-border';
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Search */}
      <div className="bg-tesla-card border border-tesla-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#CC0000]/10 border border-[#CC0000]/20 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-semibold">Track Your Vehicle</h2>
            <p className="text-gray-500 text-xs">Enter your order number to see real-time delivery status</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text" value={orderNumber} onChange={e => setOrderNumber(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. TP-2025-XXXXXXX"
            className="flex-1 bg-[#1a1a1a] border border-tesla-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors font-mono"
          />
          <button onClick={handleTrack} disabled={loading || !orderNumber.trim()}
            className="bg-[#CC0000] hover:bg-[#ff1a1a] disabled:opacity-50 text-white text-sm font-medium px-6 py-3 rounded-xl transition-colors shrink-0">
            {loading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" /></svg>
            ) : 'Track'}
          </button>
        </div>
        {error && (
          <div className="mt-3 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Results */}
      {trackingData && order && tracking && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-xs">Live tracking for <span className="text-white font-mono font-medium">#{order.orderNumber}</span></p>
            <button onClick={() => setAutoRefresh(r => !r)}
              className={"flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors " + (autoRefresh ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-white/5 border-tesla-border text-gray-400 hover:text-white')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
              {autoRefresh ? 'Live ON' : 'Live OFF'}
            </button>
          </div>

          {/* Vehicle summary */}
          <div className="bg-tesla-card border border-tesla-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-4 p-5">
              <div className="w-28 h-20 rounded-xl overflow-hidden border border-tesla-border bg-[#1a1a1a] shrink-0">
                {order.vehicle?.imageUrl ? (
                  <img src={order.vehicle.imageUrl} alt={order.vehicle.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No image</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold">{order.vehicle?.name || 'Vehicle'}</h3>
                  <span className={"text-xs font-medium px-2 py-0.5 rounded-full border " + (STATUS_COLORS[order.status] || 'bg-gray-700 text-gray-300')}>
                    {order.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 text-[11px]">Color:</span>
                    <span className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: COLOR_HEX[order.selectedColor] || '#888' }} />
                    <span className="text-gray-300 text-[11px]">{COLOR_LABELS[order.selectedColor] || order.selectedColor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 text-[11px]">Interior:</span>
                    <span className="text-gray-300 text-[11px]">{order.selectedInterior}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 text-[11px]">Total:</span>
                    <span className="text-white text-[11px] font-medium">${Number(order.totalPrice).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 text-[11px]">Deposit:</span>
                    <span className={"text-[11px] font-medium " + (order.depositPaid ? 'text-green-400' : 'text-yellow-400')}>
                      ${Number(order.depositAmount).toLocaleString()} {order.depositPaid ? '(Paid)' : '(Unpaid)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping direction banner */}
          {tracking.shippingDirection && !tracking.isCancelled && tracking.currentStep >= 3 && (
            <div className="bg-gradient-to-r from-[#CC0000]/10 via-[#CC0000]/5 to-transparent border border-[#CC0000]/20 rounded-xl px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#CC0000]/20 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Shipping Route</p>
                <p className="text-gray-400 text-xs mt-0.5">{tracking.shippingDirection}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-[10px]">Current Location</p>
                <p className="text-white text-xs font-medium">{tracking.currentLocation || 'Updating...'}</p>
              </div>
            </div>
          )}

          {/* Cancelled banner */}
          {tracking.isCancelled && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
              <div>
                <p className="text-red-400 text-sm font-medium">Order Cancelled</p>
                <p className="text-gray-500 text-xs">This order has been cancelled. Contact support for assistance.</p>
              </div>
            </div>
          )}

          {/* Visual Route Progress */}
          <div className="bg-tesla-card border border-tesla-border rounded-2xl p-6">
            <h3 className="text-white font-semibold text-sm mb-6">Delivery Route</h3>
            <div className="relative">
              <div className="absolute top-5 left-6 right-6 h-1 bg-white/10 rounded-full z-0" />
              <div
                className={"absolute top-5 left-6 h-1 rounded-full z-0 transition-all duration-1000 " + (tracking.isCancelled ? 'bg-red-500/40' : 'bg-gradient-to-r from-[#CC0000] to-[#ff3333]')}
                style={{ width: (tracking.isCancelled ? 0 : Math.max(0, (tracking.currentStep / (tracking.totalSteps - 1)) * 100)) + '%' }}
              />
              <div className="relative flex justify-between z-10">
                {STATUS_STEPS.map((step, idx) => {
                  const isComplete = idx <= tracking.currentStep && !tracking.isCancelled;
                  const isCurrent = step.value === order.status;
                  const stage = tracking.routeStages?.[idx];
                  const dotClass = stepColorClass(step, isCurrent, isComplete, tracking.isCancelled);
                  const numClass = isCurrent ? step.color : 'text-gray-600';
                  const labelClass = isCurrent ? 'text-white' : isComplete ? 'text-gray-400' : 'text-gray-600';
                  return (
                    <div key={step.value} className="flex flex-col items-center" style={{ flex: 1 }}>
                      <div className={"relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 " + dotClass}>
                        {isComplete ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : (
                          <span className={"text-xs font-bold " + numClass}>{idx + 1}</span>
                        )}
                        {isCurrent && !tracking.isCancelled && (
                          <span className={"absolute inset-0 rounded-full " + step.bg + " opacity-40 animate-ping"} />
                        )}
                      </div>
                      <span className={"text-[10px] mt-2 text-center font-medium " + labelClass}>{step.label}</span>
                      {stage && (isComplete || isCurrent) && (
                        <span className="text-[9px] text-gray-500 text-center mt-0.5 max-w-[80px] truncate">{stage.location}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-tesla-card border border-tesla-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 8h20" /></svg>
                <span className="text-gray-500 text-[10px] font-medium">VIN Number</span>
              </div>
              <p className="text-white text-sm font-mono font-medium">
                {tracking.vin || <span className="text-gray-600 text-xs">Assigned during production</span>}
              </p>
            </div>
            <div className="bg-tesla-card border border-tesla-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span className="text-gray-500 text-[10px] font-medium">Current Location</span>
              </div>
              <p className="text-white text-sm font-medium">
                {tracking.currentLocation || <span className="text-gray-600 text-xs">Pending</span>}
              </p>
            </div>
            <div className="bg-tesla-card border border-tesla-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                <span className="text-gray-500 text-[10px] font-medium">Est. Delivery</span>
              </div>
              <p className="text-white text-sm font-medium">
                {tracking.estimatedDelivery ? new Date(tracking.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Calculating...'}
              </p>
            </div>
            <div className="bg-tesla-card border border-tesla-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>
                <span className="text-gray-500 text-[10px] font-medium">Progress</span>
              </div>
              <p className="text-white text-sm font-medium">{Math.round(tracking.progress)}%</p>
              <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={"h-full rounded-full transition-all duration-1000 " + (tracking.isCancelled ? 'bg-red-500/50' : 'bg-[#CC0000]')} style={{ width: tracking.progress + '%' }} />
              </div>
            </div>
          </div>

          {/* Factory info */}
          {tracking.factoryLocation && tracking.currentStep >= 2 && (
            <div className="bg-tesla-card border border-tesla-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><path d="M2 20h20" /><path d="M5 20V8l7-5 7 5v12" /><rect x="9" y="12" width="6" height="8" /></svg>
                <span className="text-gray-500 text-[10px] font-medium">Factory / Origin</span>
              </div>
              <p className="text-white text-sm font-medium">{tracking.factoryLocation}</p>
            </div>
          )}

          {/* Activity Timeline */}
          {tracking.timeline && tracking.timeline.length > 0 && (
            <div className="bg-tesla-card border border-tesla-border rounded-2xl p-6">
              <h3 className="text-white font-semibold text-sm mb-4">Activity Timeline</h3>
              <div className="space-y-0">
                {tracking.timeline.map((entry: any, idx: number) => {
                  const isLatest = idx === 0;
                  const stepInfo = STATUS_STEPS.find(s => s.value === entry.status);
                  const dotBg = isLatest ? (stepInfo?.bg || 'bg-[#CC0000]') : '';
                  const dotBorder = isLatest ? (stepInfo?.border || 'border-[#CC0000]') : '';
                  const dotShadow = isLatest ? 'shadow-lg' : '';
                  const textColor = stepInfo?.color || 'text-white';
                  const isLast = idx === tracking.timeline.length - 1;
                  return (
                    <div key={idx} className="flex items-start gap-4 relative">
                      {!isLast && (
                        <div className="absolute left-[7px] top-6 bottom-0 w-px bg-white/10" />
                      )}
                      <div className={"relative w-3.5 h-3.5 rounded-full border-2 shrink-0 mt-0.5 z-10 " + (isLatest ? dotBg + ' ' + dotBorder + ' ' + dotShadow : 'bg-[#1a1a1a] border-tesla-border')}>
                        {isLatest && <span className={"absolute inset-0 rounded-full " + (stepInfo?.bg || 'bg-[#CC0000]') + " opacity-40 animate-ping"} />}
                      </div>
                      <div className={"flex-1 " + (isLast ? '' : 'pb-5')}>
                        <div className="flex items-center gap-2">
                          <span className={"text-xs font-medium " + textColor}>
                            {STATUS_STEPS.find(s => s.value === entry.status)?.label || entry.status}
                          </span>
                          <span className="text-gray-600 text-[10px]">{new Date(entry.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-0.5">{entry.note || 'Status updated'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-center text-gray-600 text-[10px] pt-2">
            Last updated: {new Date().toLocaleTimeString()} {autoRefresh && '(auto-refreshes every 30s)'}
          </p>
        </div>
      )}
    </div>
  );
}
