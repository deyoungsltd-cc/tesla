'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

// ── Types ──
interface VehicleSpecs {
  range: number;
  acceleration: string;
  topSpeed: string;
  horsepower: number;
  cargo: string;
  drivetrain?: string;
}

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  category: string;
  basePrice: number;
  imageUrl: string;
  description: string;
  specs: VehicleSpecs;
  colors: string[];
  interior: string;
  estimatedDelivery: string;
  featured: boolean;
}

interface TrackingInfo {
  productionStart?: string;
  productionEnd?: string;
  shipDate?: string;
  deliveryDate?: string;
  vin?: string;
  location?: string;
}

interface VehicleOrder {
  id: string;
  orderNumber: string;
  status: string;
  selectedColor: string;
  selectedInterior: string;
  totalPrice: number;
  depositAmount: number;
  depositPaid: boolean;
  fullName: string;
  email: string;
  trackingInfo: TrackingInfo | null;
  adminNotes?: string;
  createdAt: string;
  vehicle: Vehicle;
}

// ── Constants ──
const COLOR_MAP: Record<string, string> = {
  pearl_white: '#F5F5F5',
  solid_black: '#1A1A1A',
  midnight_silver: '#6E7681',
  deep_blue: '#1E3A5F',
  red_multi_coat: '#CC0000',
  ultra_red: '#B71C1C',
  quick_silver: '#9CA3AF',
  blue_multi_coat: '#3B82F6',
};

const COLOR_LABELS: Record<string, string> = {
  pearl_white: 'Pearl White',
  solid_black: 'Solid Black',
  midnight_silver: 'Midnight Silver',
  deep_blue: 'Deep Blue',
  red_multi_coat: 'Red Multi-Coat',
  ultra_red: 'Ultra Red',
  quick_silver: 'Quick Silver',
  blue_multi_coat: 'Blue Multi-Coat',
};

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'in_production', label: 'In Production' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  in_production: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  shipped: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  delivered: 'bg-green-500/15 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_production: 'In Production',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const CATEGORY_ICONS: Record<string, string> = {
  sedan: '🚗',
  suv: '🚙',
  pickup: '🛻',
};

// ── Component ──
export default function VehiclesPage() {
  const [tab, setTab] = useState<'browse' | 'orders'>('browse');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<VehicleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderModal, setOrderModal] = useState<Vehicle | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuthStore();

  // Order form state
  const [selectedColor, setSelectedColor] = useState('pearl_white');
  const [selectedInterior, setSelectedInterior] = useState('Premium Black');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');

  const fetchVehicles = useCallback(async () => {
    try {
      const data = await api.vehicles.list();
      setVehicles(data as Vehicle[]);
    } catch (err: any) {
      console.error('Fetch vehicles error:', err);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.vehicles.myOrders();
      setOrders(data as VehicleOrder[]);
    } catch (err: any) {
      console.error('Fetch orders error:', err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchVehicles(), fetchOrders()]);
      setLoading(false);
    };
    load();
  }, [fetchVehicles, fetchOrders]);

  const openOrderModal = (vehicle: Vehicle) => {
    setOrderModal(vehicle);
    setError('');
    setSuccess('');
    setSelectedColor('pearl_white');
    setSelectedInterior('Premium Black');
    // Pre-fill from profile
    setFullName(user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim() : '');
    setEmail(user?.email || '');
    setPhone(user?.profile?.phone || '');
    setAddress('');
    setCity('');
    setStateVal('');
    setPostalCode('');
    setNotes('');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderModal) return;
    setError('');
    setSubmitting(true);

    try {
      const result = await api.vehicles.createOrder({
        vehicleId: orderModal.id,
        selectedColor,
        selectedInterior,
        fullName,
        email,
        phone: phone || undefined,
        address,
        city,
        state: stateVal,
        postalCode,
        notes: notes || undefined,
      });

      setSuccess(`Order placed! Order #${(result as any).orderNumber}`);
      setOrderModal(null);
      await fetchOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const getStepIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return STATUS_STEPS.findIndex(s => s.key === status);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="h-7 w-40 bg-tesla-card rounded-lg animate-pulse" />
          <div className="h-8 w-48 bg-tesla-card rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-tesla-card border border-tesla-border rounded-xl p-4 animate-pulse">
              <div className="h-36 bg-white/5 rounded-lg mb-4" />
              <div className="h-5 w-32 bg-white/5 rounded mb-2" />
              <div className="h-4 w-24 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Tesla Vehicles</h1>
        {/* Tab switcher */}
        <div className="flex bg-tesla-card border border-tesla-border rounded-lg p-0.5">
          <button
            onClick={() => setTab('browse')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              tab === 'browse' ? 'bg-[#CC0000] text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Browse
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              tab === 'orders' ? 'bg-[#CC0000] text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            My Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* Browse Tab */}
      {tab === 'browse' && (
        <div className="space-y-4">
          {vehicles.length === 0 ? (
            <div className="bg-tesla-card border border-tesla-border rounded-xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" />
                  <path d="M9 17h6" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">No vehicles available at this time.</p>
              <p className="text-gray-600 text-xs mt-1">Check back later for new inventory.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicles.map(vehicle => (
                <div key={vehicle.id} className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden hover:border-[#CC0000]/30 transition-colors">
                  {/* Vehicle image */}
                  <div className="relative h-48 bg-gradient-to-b from-white/5 to-transparent overflow-hidden">
                    {vehicle.imageUrl ? (
                      <img
                        src={vehicle.imageUrl}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          if (target.nextElementSibling) (target.nextElementSibling as HTMLElement).style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 items-center justify-center" style={{ display: vehicle.imageUrl ? 'none' : 'flex' }}>
                      <div className="text-center">
                        <div className="text-6xl mb-1">{CATEGORY_ICONS[vehicle.category.toLowerCase()] || '🚗'}</div>
                        <span className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">{vehicle.category}</span>
                      </div>
                    </div>
                    {vehicle.featured && (
                      <div className="absolute top-3 left-3 bg-[#CC0000] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                        Featured
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-md">
                      {vehicle.estimatedDelivery}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-bold text-base">{vehicle.name}</h3>
                        <p className="text-gray-500 text-xs mt-0.5">{vehicle.interior} Interior</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">${vehicle.basePrice.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Specs row */}
                    <div className="grid grid-cols-2 gap-2 mt-3 mb-4">
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-gray-500 text-[10px]">Range</p>
                        <p className="text-white text-sm font-semibold">{vehicle.specs.range} mi</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-gray-500 text-[10px]">0-60 mph</p>
                        <p className="text-white text-sm font-semibold">{vehicle.specs.acceleration}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-gray-500 text-[10px]">Top Speed</p>
                        <p className="text-white text-sm font-semibold">{vehicle.specs.topSpeed}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-gray-500 text-[10px]">Horsepower</p>
                        <p className="text-white text-sm font-semibold">{vehicle.specs.horsepower} hp</p>
                      </div>
                    </div>

                    {/* Color swatches */}
                    <div className="flex items-center gap-1.5 mb-4">
                      <span className="text-gray-500 text-[10px] mr-1">Colors:</span>
                      {(vehicle.colors as string[]).map((color: string) => (
                        <div
                          key={color}
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: COLOR_MAP[color] || '#666' }}
                          title={COLOR_LABELS[color] || color}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => openOrderModal(vehicle)}
                      className="w-full bg-[#CC0000] hover:bg-[#a30000] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                    >
                      Order Now — ${(vehicle.basePrice * 0.1).toLocaleString()} deposit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Orders Tab */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-tesla-card border border-tesla-border rounded-xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <path d="M9 12h6" /><path d="M9 16h6" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">No vehicle orders yet.</p>
              <p className="text-gray-600 text-xs mt-1">Browse our inventory and place your first order.</p>
              <button
                onClick={() => setTab('browse')}
                className="mt-4 bg-[#CC0000] hover:bg-[#a30000] text-white font-semibold px-6 py-2 rounded-lg transition-colors text-sm"
              >
                Browse Vehicles
              </button>
            </div>
          ) : (
            orders.map(order => {
              const currentStep = getStepIndex(order.status);
              const isCancelled = order.status === 'cancelled';
              const trackingInfo = order.trackingInfo as any || {};
              const timeline = trackingInfo.timeline || [];
              const currentLocation = trackingInfo.currentLocation || null;
              const shippingDirection = trackingInfo.shippingDirection || null;
              const vin = trackingInfo.vin || null;
              const estimatedDelivery = trackingInfo.estimatedDelivery || null;

              return (
                <div key={order.id} className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden">
                  {/* Order header */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-bold text-base">{order.vehicle.name}</h3>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${STATUS_COLORS[order.status] || ''}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5">Order #{order.orderNumber}</p>
                        <p className="text-gray-600 text-[10px] mt-0.5">
                          Placed {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-white font-bold">${order.totalPrice.toLocaleString()}</p>
                        <p className="text-gray-500 text-xs">Deposit: ${order.depositAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Order details row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider">Color</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: COLOR_MAP[order.selectedColor] || '#666' }} />
                          <p className="text-white text-xs">{COLOR_LABELS[order.selectedColor] || order.selectedColor}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider">Interior</p>
                        <p className="text-white text-xs mt-1">{order.selectedInterior}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider">Est. Delivery</p>
                        <p className="text-white text-xs mt-1">{estimatedDelivery ? new Date(estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : order.vehicle.estimatedDelivery}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider">Deposit</p>
                        <p className={`text-xs mt-1 ${order.depositPaid ? 'text-green-400' : 'text-yellow-400'}`}>
                          {order.depositPaid ? 'Paid' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Route tracker with progress */}
                  {!isCancelled && (
                    <div className="border-t border-tesla-border px-4 py-4 bg-black/20">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white text-xs font-semibold">Order Tracking</p>
                        {currentLocation && (
                          <p className="text-gray-400 text-[10px]">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1 animate-pulse" />
                            {currentLocation}
                          </p>
                        )}
                      </div>

                      {/* Visual route progress */}
                      <div className="relative mb-4">
                        <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-white/10 z-0" />
                        <div className="absolute top-4 left-[10%] h-0.5 bg-[#CC0000] z-0 transition-all duration-700" style={{ width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 80)}%` }} />

                        <div className="relative flex justify-between z-10">
                          {STATUS_STEPS.map((step, idx) => {
                            const isActive = idx <= currentStep;
                            const isCurrent = step.key === order.status;
                            return (
                              <div key={step.key} className="flex flex-col items-center" style={{ flex: 1 }}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                                  isCurrent ? 'bg-[#CC0000] text-white ring-2 ring-[#CC0000]/30 ring-offset-2 ring-offset-[#111] shadow-lg shadow-[#CC0000]/20' :
                                  isActive ? 'bg-[#CC0000] text-white' :
                                  'bg-white/5 text-gray-600 border border-tesla-border'
                                }`}>
                                  {isActive ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                  ) : (
                                    <span className="text-[10px]">{idx + 1}</span>
                                  )}
                                </div>
                                <span className={`text-[9px] mt-1.5 text-center leading-tight max-w-[60px] ${
                                  isCurrent ? 'text-white font-medium' : isActive ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Direction indicator */}
                      {shippingDirection && (
                        <div className="flex items-center gap-2 bg-[#CC0000]/5 border border-[#CC0000]/15 rounded-lg px-3 py-2 mb-3">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="16 12 12 8 8 12" /><line x1="12" y1="16" x2="12" y2="8" /></svg>
                          <p className="text-gray-300 text-[11px]"><span className="text-[#CC0000] font-medium">Direction:</span> {shippingDirection}</p>
                        </div>
                      )}

                      {/* VIN */}
                      {vin && (
                        <div className="bg-white/5 rounded-lg px-3 py-2 mb-3">
                          <p className="text-gray-500 text-[10px]">VIN Number</p>
                          <p className="text-white text-xs font-mono mt-0.5">{vin}</p>
                        </div>
                      )}

                      {/* Timeline */}
                      {timeline.length > 0 && (
                        <div>
                          <p className="text-gray-400 text-[10px] font-semibold mb-2 uppercase tracking-wider">Activity</p>
                          <div className="space-y-2">
                            {timeline.slice().reverse().map((entry: any, idx: number) => {
                              const statusColor = STATUS_COLORS[entry.status];
                              return (
                                <div key={idx} className="flex items-start gap-2.5">
                                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#CC0000] shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${statusColor || 'bg-gray-700/50 text-gray-400 border-gray-600/30'}`}>{STATUS_LABELS[entry.status] || entry.status}</span>
                                      <span className="text-gray-600 text-[10px]">{new Date(entry.timestamp).toLocaleString()}</span>
                                    </div>
                                    {entry.note && <p className="text-gray-400 text-[11px] mt-0.5">{entry.note}</p>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cancelled banner */}
                  {isCancelled && (
                    <div className="border-t border-tesla-border px-4 py-3 bg-red-500/5">
                      <p className="text-red-400 text-xs font-medium">This order has been cancelled.</p>
                      {order.adminNotes && <p className="text-gray-500 text-[11px] mt-1">Note: {order.adminNotes}</p>}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Order Modal */}
      {orderModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !submitting && setOrderModal(null)} />
          <div className="relative bg-[#111] border border-tesla-border rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Modal header */}
            <div className="sticky top-0 bg-[#111] border-b border-tesla-border p-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-white font-bold text-lg">Order {orderModal.name}</h2>
                <p className="text-gray-500 text-xs">Starting at ${orderModal.basePrice.toLocaleString()}</p>
              </div>
              <button
                onClick={() => !submitting && setOrderModal(null)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                disabled={submitting}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-4 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg p-3">{error}</div>
              )}
              {success && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-lg p-3">{success}</div>
              )}

              {/* Color Selection */}
              <div>
                <label className="text-gray-400 text-xs font-semibold block mb-2">Exterior Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {(orderModal.colors as string[]).map((color: string) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${
                        selectedColor === color
                          ? 'border-[#CC0000] bg-[#CC0000]/10'
                          : 'border-tesla-border hover:border-gray-500'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: COLOR_MAP[color] || '#666' }} />
                      <span className="text-[9px] text-gray-400 leading-tight text-center">{COLOR_LABELS[color] || color}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interior */}
              <div>
                <label className="text-gray-400 text-xs font-semibold block mb-2">Interior</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Premium Black', 'Cream White'].map(int => (
                    <button
                      key={int}
                      type="button"
                      onClick={() => setSelectedInterior(int)}
                      className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${
                        selectedInterior === int
                          ? 'border-[#CC0000] bg-[#CC0000]/10 text-white'
                          : 'border-tesla-border text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {int}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-tesla-border" />

              {/* Delivery Info */}
              <div>
                <label className="text-gray-400 text-xs font-semibold block mb-2">Delivery Information</label>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-500 text-[10px] block mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 text-[10px] block mb-1">Email *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-500 text-[10px] block mb-1">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <label className="text-gray-500 text-[10px] block mb-1">Address *</label>
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors"
                      placeholder="123 Tesla Drive"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-gray-500 text-[10px] block mb-1">City *</label>
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors"
                        placeholder="Austin"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 text-[10px] block mb-1">State *</label>
                      <input
                        type="text"
                        value={stateVal}
                        onChange={e => setStateVal(e.target.value)}
                        className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors"
                        placeholder="TX"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 text-[10px] block mb-1">ZIP *</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={e => setPostalCode(e.target.value)}
                        className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors"
                        placeholder="73301"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-500 text-[10px] block mb-1">Notes (optional)</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors resize-none"
                      rows={2}
                      placeholder="Special delivery instructions..."
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white/5 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{orderModal.name} Base Price</span>
                  <span className="text-white">${orderModal.basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Deposit (10%)</span>
                  <span className="text-[#CC0000] font-bold">${(orderModal.basePrice * 0.1).toLocaleString()}</span>
                </div>
                <div className="border-t border-tesla-border pt-2 flex justify-between text-sm">
                  <span className="text-gray-400">Estimated Delivery</span>
                  <span className="text-white">{orderModal.estimatedDelivery}</span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#CC0000] hover:bg-[#a30000] disabled:bg-[#CC0000]/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  `Place Order — $${(orderModal.basePrice * 0.1).toLocaleString()} Deposit`
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
