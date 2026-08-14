    'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

// ── Tesla Processing Overlay ──
function TeslaProcessingOverlay({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center" style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full border-2 border-[#CC0000]/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-12 h-12" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5.362l2.475-3.026s4.245.09 8.471 2.054c-1.082 1.636-3.231 2.438-3.231 2.438-.146-1.439-1.154-1.79-4.354-1.79L12 24 8.619 5.034c-3.18 0-4.188.354-4.335 1.792 0 0-2.146-.795-3.229-2.43C5.28 2.431 9.525 2.34 9.525 2.34L12 5.362h-.004.004zm0-3.899c3.415-.03 7.326.528 11.328 2.28.535-.968.672-1.395.672-1.395C19.625.612 15.528.015 12 0 8.472.015 4.375.61 0 2.349c0 0 .195.525.672 1.396C4.674 1.989 8.585 1.435 12 1.46V1.463z" fill="#CC0000" />
          </svg>
        </div>
        <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-transparent border-t-[#CC0000] animate-spin" style={{ animationDuration: '1.2s' }} />
      </div>
      <h3 className="text-white font-bold text-lg mb-2 tracking-widest">TESLAPRIME</h3>
      <p className="text-gray-400 text-sm animate-pulse">{message}</p>
      <div className="mt-6 flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-[#CC0000] animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-[#CC0000] animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-[#CC0000] animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

// ── Types ──
interface VehicleSpecs {
  range: number; acceleration: string; topSpeed: string; horsepower: number; cargo: string; drivetrain?: string;
}
interface Vehicle {
  id: string; name: string; slug: string; category: string; basePrice: number; imageUrl: string;
  description: string; specs: VehicleSpecs; colors: string[]; interior: string; estimatedDelivery: string; featured: boolean;
}
interface VehicleOrder {
  id: string; orderNumber: string; status: string; selectedColor: string; selectedInterior: string;
  totalPrice: number; depositAmount: number; depositPaid: boolean; fullName: string; email: string;
  trackingInfo: any; adminNotes?: string; createdAt: string; vehicle: Vehicle;
}

// ── Configurator Options ──
const ADDON_OPTIONS = [
  { id: 'fsd', name: 'Full Self-Driving', price: 12000, icon: '自动驾驶' },
  { id: 'tow_hitch', name: 'Tow Hitch', price: 1000, icon: '拖车钩' },
  { id: 'performance_wheels', name: 'Performance Wheels', price: 2500, icon: '轮毂' },
  { id: 'premium_audio', name: 'Premium Audio', price: 2500, icon: '音响' },
  { id: 'wall_connector', name: 'Wall Connector', price: 475, icon: '充电桩' },
  { id: 'all_weather_mats', name: 'All-Weather Mats', price: 250, icon: '脚垫' },
];

const CRYPTO_OPTIONS = [
  { value: 'BTC', label: 'Bitcoin (BTC)', networks: ['Bitcoin'] },
  { value: 'ETH', label: 'Ethereum (ETH)', networks: ['ERC-20'] },
  { value: 'USDT', label: 'Tether (USDT)', networks: ['ERC-20', 'TRC-20'] },
];

const GIFT_CARD_TYPES = ['Amazon', 'Apple', 'Google Play', 'Visa', 'Mastercard', 'Steam', 'Other'];

// ── Constants ──
const COLOR_MAP: Record<string, string> = {
  pearl_white: '#F5F5F5', solid_black: '#1A1A1A', midnight_silver: '#6E7681',
  deep_blue: '#1E3A5F', red_multi_coat: '#CC0000', ultra_red: '#B71C1C',
  quick_silver: '#9CA3AF', blue_multi_coat: '#3B82F6',
};
const COLOR_LABELS: Record<string, string> = {
  pearl_white: 'Pearl White', solid_black: 'Solid Black', midnight_silver: 'Midnight Silver',
  deep_blue: 'Deep Blue', red_multi_coat: 'Red Multi-Coat', ultra_red: 'Ultra Red',
  quick_silver: 'Quick Silver', blue_multi_coat: 'Blue Multi-Coat',
};
const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed' }, { key: 'confirmed', label: 'Confirmed' },
  { key: 'in_production', label: 'In Production' }, { key: 'shipped', label: 'Shipped' }, { key: 'delivered', label: 'Delivered' },
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
  pending: 'Pending', confirmed: 'Confirmed', in_production: 'In Production',
  shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
};

// ── Component ──
export default function VehiclesPage() {
  const [tab, setTab] = useState<'browse' | 'orders'>('browse');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<VehicleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderModal, setOrderModal] = useState<Vehicle | null>(null);
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuthStore();

  // Order form
  const [selectedColor, setSelectedColor] = useState('pearl_white');
  const [selectedInterior, setSelectedInterior] = useState('Premium Black');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');

  // Crypto deposit modal
  const [depositModal, setDepositModal] = useState<VehicleOrder | null>(null);
  const [depositTab, setDepositTab] = useState<'crypto' | 'gift_card'>('crypto');
  const [cryptoCurrency, setCryptoCurrency] = useState('USDT');
  const [cryptoNetwork, setCryptoNetwork] = useState('TRC-20');
  const [txHash, setTxHash] = useState('');
  const [senderAddr, setSenderAddr] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [paymentAddresses, setPaymentAddresses] = useState<any[]>([]);

  // Gift card deposit state
  const [giftCardType, setGiftCardType] = useState('Amazon');
  const [giftCardValue, setGiftCardValue] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftReceiptImage, setGiftReceiptImage] = useState('');

  // Processing overlay
  const [processingMessage, setProcessingMessage] = useState('');

  // Cancel confirm
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchVehicles = useCallback(async () => {
    try { setVehicles((await api.vehicles.list()) as Vehicle[]); } catch (err) { console.error(err); }
  }, []);

  const fetchOrders = useCallback(async () => {
    try { setOrders((await api.vehicles.myOrders()) as VehicleOrder[]); } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    const load = async () => { setLoading(true); await Promise.all([fetchVehicles(), fetchOrders()]); setLoading(false); };
    load();
  }, [fetchVehicles, fetchOrders]);

  // Fetch payment addresses for crypto deposit
  const openDepositModal = async (order: VehicleOrder) => {
    setDepositModal(order);
    setDepositTab('crypto');
    setTxHash(''); setSenderAddr('');
    setCryptoCurrency('USDT'); setCryptoNetwork('TRC-20');
    setGiftCardType('Amazon'); setGiftCardValue(''); setGiftCardCode(''); setGiftReceiptImage('');
    try {
      const res = await fetch('/api/payment-addresses');
      const json = await res.json();
      if (json.success) setPaymentAddresses(json.data.addresses || []);
    } catch { /* ignore */ }
  };

  const openOrderModal = (vehicle: Vehicle) => {
    setOrderModal(vehicle); setError(''); setSuccess('');
    setSelectedColor('pearl_white'); setSelectedInterior('Premium Black'); setSelectedAddons([]);
    setFullName(user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim() : '');
    setEmail(user?.email || ''); setPhone(user?.profile?.phone || '');
    setAddress(''); setCity(''); setStateVal(''); setPostalCode(''); setNotes('');
  };

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const getAddonsTotal = () => selectedAddons.reduce((sum, id) => { const a = ADDON_OPTIONS.find(o => o.id === id); return sum + (a?.price || 0); }, 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault(); if (!orderModal) return;
    setError(''); setSubmitting(true);
    setProcessingMessage('Placing your order...');
    try {
      const addonsTotal = getAddonsTotal();
      const result = await api.vehicles.createOrder({
        vehicleId: orderModal.id, selectedColor, selectedInterior, fullName, email,
        phone: phone || undefined, address, city, state: stateVal, postalCode,
        notes: notes || undefined, addons: selectedAddons, addonsTotal,
      });
      setProcessingMessage('Order confirmed!');
      await new Promise(r => setTimeout(r, 1200));
      setSuccess(`Order placed! Order #${(result as any).orderNumber}`);
      setOrderModal(null); await fetchOrders();
    } catch (err: any) { setError(err.message || 'Failed to place order'); }
    finally { setSubmitting(false); setProcessingMessage(''); }
  };

  const handleSubmitDeposit = async () => {
    if (!depositModal) return;
    setError(''); setDepositing(true);
    setProcessingMessage('Submitting crypto deposit...');
    try {
      await api.vehicles.submitDeposit({
        depositType: 'crypto',
        orderId: depositModal.id, cryptoCurrency, network: cryptoNetwork, txHash, senderAddress: senderAddr || undefined,
      });
      setProcessingMessage('Deposit submitted successfully!');
      await new Promise(r => setTimeout(r, 1000));
      setSuccess('Deposit submitted! Awaiting admin confirmation.');
      setDepositModal(null); await fetchOrders();
    } catch (err: any) { setError(err.message || 'Deposit failed'); }
    finally { setDepositing(false); setProcessingMessage(''); }
  };

  const handleSubmitGiftDeposit = async () => {
    if (!depositModal) return;
    const value = parseFloat(giftCardValue);
    if (!giftCardCode.trim()) { setError('Please enter the gift card code'); return; }
    if (isNaN(value) || value <= 0) { setError('Please enter a valid card value'); return; }
    setError(''); setDepositing(true);
    setProcessingMessage('Verifying gift card deposit...');
    try {
      await api.vehicles.submitGiftDeposit({
        depositType: 'gift_card',
        orderId: depositModal.id,
        cardType: giftCardType,
        cardValue: value,
        cardCode: giftCardCode.trim(),
        receiptImage: giftReceiptImage || undefined,
      });
      setProcessingMessage('Gift card submitted successfully!');
      await new Promise(r => setTimeout(r, 1000));
      setSuccess('Gift card deposit submitted! Awaiting admin verification.');
      setDepositModal(null); await fetchOrders();
    } catch (err: any) { setError(err.message || 'Gift card deposit failed'); }
    finally { setDepositing(false); setProcessingMessage(''); }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Receipt image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onload = () => { setGiftReceiptImage(reader.result as string); };
    reader.readAsDataURL(file);
  };

  const handleCancelOrder = async (orderId: string) => {
    setCancelling(true); setError('');
    try {
      await api.vehicles.cancelOrder(orderId);
      setSuccess('Order cancelled.');
      setCancelConfirm(null); await fetchOrders();
    } catch (err: any) { setError(err.message || 'Cancel failed'); }
    finally { setCancelling(false); }
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      const html = await api.vehicles.invoice(orderId);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'invoice.html'; a.click();
      URL.revokeObjectURL(url);
    } catch { setError('Failed to download invoice'); }
  };

  const getStepIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return STATUS_STEPS.findIndex(s => s.key === status);
  };

  const getAddressForCurrency = (currency: string, network: string) => {
    return paymentAddresses.find((a: any) => a.currency === currency && (!a.network || a.network === network));
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
      {/* Toast */}
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg px-4 py-3 flex items-center justify-between"><span>{error}</span><button onClick={() => setError('')} className="text-red-300 hover:text-white">✕</button></div>}
      {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-lg px-4 py-3 flex items-center justify-between"><span>{success}</span><button onClick={() => setSuccess('')} className="text-green-300 hover:text-white">✕</button></div>}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Tesla Vehicles</h1>
        <div className="flex bg-tesla-card border border-tesla-border rounded-lg p-0.5">
          {(['browse', 'orders'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${tab === t ? 'bg-[#CC0000] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
              {t === 'browse' ? 'Browse' : `My Orders (${orders.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Browse Tab */}
      {tab === 'browse' && (
        <div className="space-y-4">
          {vehicles.length === 0 ? (
            <div className="bg-tesla-card border border-tesla-border rounded-xl p-8 text-center">
              <p className="text-gray-400 text-sm">No vehicles available at this time.</p>
              <p className="text-gray-600 text-xs mt-1">Check back later for new inventory.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicles.map(vehicle => {
                const addonsTotal = 0; // base card doesn't show addons
                return (
                  <div key={vehicle.id} className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden hover:border-[#CC0000]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#CC0000]/5">
                    <div className="relative h-48 bg-gradient-to-b from-white/5 to-transparent overflow-hidden cursor-pointer" onClick={() => setDetailVehicle(vehicle)}>
                      {vehicle.imageUrl ? (
                        <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <span className="text-gray-300 text-[10px] font-medium uppercase tracking-wider">{vehicle.category}</span>
                        <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-md">{vehicle.estimatedDelivery}</span>
                      </div>
                      {vehicle.featured && <div className="absolute top-3 left-3 bg-[#CC0000] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">Featured</div>}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-bold text-base cursor-pointer hover:text-[#CC0000] transition-colors" onClick={() => setDetailVehicle(vehicle)}>{vehicle.name}</h3>
                          <p className="text-gray-500 text-xs mt-0.5">{vehicle.interior} Interior</p>
                        </div>
                        <p className="text-white font-bold text-lg">${vehicle.basePrice.toLocaleString()}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3 mb-4">
                        <div className="bg-white/5 rounded-lg p-2"><p className="text-gray-500 text-[10px]">Range</p><p className="text-white text-sm font-semibold">{vehicle.specs.range} mi</p></div>
                        <div className="bg-white/5 rounded-lg p-2"><p className="text-gray-500 text-[10px]">0-60 mph</p><p className="text-white text-sm font-semibold">{vehicle.specs.acceleration}</p></div>
                        <div className="bg-white/5 rounded-lg p-2"><p className="text-gray-500 text-[10px]">Top Speed</p><p className="text-white text-sm font-semibold">{vehicle.specs.topSpeed}</p></div>
                        <div className="bg-white/5 rounded-lg p-2"><p className="text-gray-500 text-[10px]">Horsepower</p><p className="text-white text-sm font-semibold">{vehicle.specs.horsepower} hp</p></div>
                      </div>
                      <div className="flex items-center gap-1.5 mb-4">
                        <span className="text-gray-500 text-[10px] mr-1">Colors:</span>
                        {(vehicle.colors as string[]).map((color: string) => (
                          <div key={color} className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: COLOR_MAP[color] || '#666' }} title={COLOR_LABELS[color] || color} />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openOrderModal(vehicle)} className="flex-1 bg-[#CC0000] hover:bg-[#a30000] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
                          Order Now
                        </button>
                        <button onClick={() => setDetailVehicle(vehicle)} className="px-3 py-2.5 bg-white/5 border border-tesla-border rounded-lg text-gray-400 hover:text-white hover:border-white/20 transition-all text-sm">
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* My Orders Tab */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-tesla-card border border-tesla-border rounded-xl p-8 text-center">
              <p className="text-gray-400 text-sm">No vehicle orders yet.</p>
              <button onClick={() => setTab('browse')} className="mt-4 bg-[#CC0000] hover:bg-[#a30000] text-white font-semibold px-6 py-2 rounded-lg transition-colors text-sm">Browse Vehicles</button>
            </div>
          ) : orders.map(order => {
            const currentStep = getStepIndex(order.status);
            const isCancelled = order.status === 'cancelled';
            const trackingInfo = order.trackingInfo as any || {};
            return (
              <div key={order.id} className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden">
                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-bold text-base">{order.vehicle.name}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${STATUS_COLORS[order.status] || ''}`}>{STATUS_LABELS[order.status]}</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">Order #{order.orderNumber}</p>
                      <p className="text-gray-600 text-[10px] mt-0.5">Placed {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-white font-bold">${order.totalPrice.toLocaleString()}</p>
                      <p className={`text-xs mt-0.5 ${order.depositPaid ? 'text-green-400' : 'text-yellow-400'}`}>Deposit: {order.depositPaid ? 'Paid' : 'Unpaid'}</p>
                    </div>
                  </div>

                  {/* Order details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <div><p className="text-gray-500 text-[10px] uppercase tracking-wider">Color</p><div className="flex items-center gap-1.5 mt-1"><div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: COLOR_MAP[order.selectedColor] || '#666' }} /><p className="text-white text-xs">{COLOR_LABELS[order.selectedColor] || order.selectedColor}</p></div></div>
                    <div><p className="text-gray-500 text-[10px] uppercase tracking-wider">Interior</p><p className="text-white text-xs mt-1">{order.selectedInterior}</p></div>
                    <div><p className="text-gray-500 text-[10px] uppercase tracking-wider">Est. Delivery</p><p className="text-white text-xs mt-1">{order.vehicle.estimatedDelivery}</p></div>
                    <div><p className="text-gray-500 text-[10px] uppercase tracking-wider">Deposit</p><p className={`text-xs mt-1 ${order.depositPaid ? 'text-green-400' : 'text-yellow-400'}`}>{order.depositPaid ? 'Paid' : 'Pending'}</p></div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {!order.depositPaid && order.status !== 'cancelled' && (
                      <button onClick={() => openDepositModal(order)} className="text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-[#CC0000]/10 border border-[#CC0000]/30 text-[#CC0000] hover:bg-[#CC0000]/20 transition-all">Pay Deposit</button>
                    )}
                    <button onClick={() => handleDownloadInvoice(order.id)} className="text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-white/5 border border-tesla-border text-gray-400 hover:text-white hover:border-white/20 transition-all">Download Invoice</button>
                    {order.status === 'pending' && !order.depositPaid && (
                      cancelConfirm === order.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleCancelOrder(order.id)} disabled={cancelling} className="text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all">Confirm Cancel</button>
                          <button onClick={() => setCancelConfirm(null)} className="text-[10px] px-2 py-1.5 text-gray-500 hover:text-white transition-all">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setCancelConfirm(order.id)} className="text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-white/5 border border-tesla-border text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-all">Cancel Order</button>
                      )
                    )}
                  </div>
                </div>

                {/* Progress tracker */}
                {!isCancelled && (
                  <div className="border-t border-tesla-border px-4 py-4 bg-black/20">
                    <div className="relative mb-4">
                      <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-white/10 z-0" />
                      <div className="absolute top-4 left-[10%] h-0.5 bg-[#CC0000] z-0 transition-all duration-700" style={{ width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 80)}%` }} />
                      <div className="relative flex justify-between z-10">
                        {STATUS_STEPS.map((step, idx) => {
                          const isActive = idx <= currentStep; const isCurrent = step.key === order.status;
                          return (
                            <div key={step.key} className="flex flex-col items-center" style={{ flex: 1 }}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${isCurrent ? 'bg-[#CC0000] text-white ring-2 ring-[#CC0000]/30 ring-offset-2 ring-offset-[#111] shadow-lg shadow-[#CC0000]/20' : isActive ? 'bg-[#CC0000] text-white' : 'bg-white/5 text-gray-600 border border-tesla-border'}`}>
                                {isActive ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> : <span className="text-[10px]">{idx + 1}</span>}
                              </div>
                              <span className={`text-[9px] mt-1.5 text-center leading-tight max-w-[60px] ${isCurrent ? 'text-white font-medium' : isActive ? 'text-gray-400' : 'text-gray-600'}`}>{step.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {isCancelled && <div className="border-t border-tesla-border px-4 py-3 bg-red-500/5"><p className="text-red-400 text-xs font-medium">This order has been cancelled.</p></div>}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Vehicle Detail Modal ── */}
      {detailVehicle && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDetailVehicle(null)} />
          <div className="relative bg-[#111] border border-tesla-border rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-[#111] border-b border-tesla-border p-4 flex items-center justify-between z-10">
              <h2 className="text-white font-bold text-lg">{detailVehicle.name}</h2>
              <button onClick={() => setDetailVehicle(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-4 space-y-4">
              {detailVehicle.imageUrl && <img src={detailVehicle.imageUrl} alt={detailVehicle.name} className="w-full h-56 object-cover rounded-xl" />}
              <p className="text-gray-400 text-sm leading-relaxed">{detailVehicle.description}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center"><p className="text-gray-500 text-[10px]">Range</p><p className="text-white font-bold text-lg">{detailVehicle.specs.range}</p><p className="text-gray-500 text-[10px]">miles</p></div>
                <div className="bg-white/5 rounded-lg p-3 text-center"><p className="text-gray-500 text-[10px]">0-60 mph</p><p className="text-white font-bold text-lg">{detailVehicle.specs.acceleration}</p></div>
                <div className="bg-white/5 rounded-lg p-3 text-center"><p className="text-gray-500 text-[10px]">Horsepower</p><p className="text-white font-bold text-lg">{detailVehicle.specs.horsepower}</p><p className="text-gray-500 text-[10px]">hp</p></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center"><p className="text-gray-500 text-[10px]">Top Speed</p><p className="text-white font-bold">{detailVehicle.specs.topSpeed}</p></div>
                <div className="bg-white/5 rounded-lg p-3 text-center"><p className="text-gray-500 text-[10px]">Cargo</p><p className="text-white font-bold">{detailVehicle.specs.cargo}</p></div>
                <div className="bg-white/5 rounded-lg p-3 text-center"><p className="text-gray-500 text-[10px]">Drivetrain</p><p className="text-white font-bold text-sm">{detailVehicle.specs.drivetrain}</p></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setDetailVehicle(null); openOrderModal(detailVehicle); }} className="flex-1 bg-[#CC0000] hover:bg-[#a30000] text-white font-semibold py-3 rounded-lg transition-colors text-sm">Order Now - ${detailVehicle.basePrice.toLocaleString()}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Order Modal with Configurator ── */}
      {orderModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !submitting && setOrderModal(null)} />
          <div className="relative bg-[#111] border border-tesla-border rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-[#111] border-b border-tesla-border p-4 flex items-center justify-between z-10">
              <div><h2 className="text-white font-bold text-lg">Order {orderModal.name}</h2><p className="text-gray-500 text-xs">Starting at ${orderModal.basePrice.toLocaleString()}</p></div>
              <button onClick={() => !submitting && setOrderModal(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors" disabled={submitting}>✕</button>
            </div>
            <form onSubmit={handleSubmitOrder} className="p-4 space-y-4">
              {/* Color Selection */}
              <div>
                <label className="text-gray-400 text-xs font-semibold block mb-2">Exterior Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {(orderModal.colors as string[]).map((color: string) => (
                    <button key={color} type="button" onClick={() => setSelectedColor(color)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${selectedColor === color ? 'border-[#CC0000] bg-[#CC0000]/10' : 'border-tesla-border hover:border-gray-500'}`}>
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
                    <button key={int} type="button" onClick={() => setSelectedInterior(int)}
                      className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${selectedInterior === int ? 'border-[#CC0000] bg-[#CC0000]/10 text-white' : 'border-tesla-border text-gray-400 hover:border-gray-500'}`}>
                      {int}
                    </button>
                  ))}
                </div>
              </div>

              {/* Configurator - Addons */}
              <div>
                <label className="text-gray-400 text-xs font-semibold block mb-2">Options & Upgrades</label>
                <div className="space-y-2">
                  {ADDON_OPTIONS.map(addon => (
                    <button key={addon.id} type="button" onClick={() => toggleAddon(addon.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${selectedAddons.includes(addon.id) ? 'border-[#CC0000] bg-[#CC0000]/5' : 'border-tesla-border hover:border-gray-500'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedAddons.includes(addon.id) ? 'border-[#CC0000] bg-[#CC0000]' : 'border-tesla-border'}`}>
                          {selectedAddons.includes(addon.id) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                        </div>
                        <span className="text-white text-sm">{addon.name}</span>
                      </div>
                      <span className="text-gray-400 text-sm">+${addon.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-tesla-border" />

              {/* Delivery Info */}
              <div>
                <label className="text-gray-400 text-xs font-semibold block mb-2">Delivery Information</label>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-gray-500 text-[10px] block mb-1">Full Name *</label><input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors" placeholder="John Doe" required /></div>
                    <div><label className="text-gray-500 text-[10px] block mb-1">Email *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors" placeholder="john@example.com" required /></div>
                  </div>
                  <div><label className="text-gray-500 text-[10px] block mb-1">Phone</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors" placeholder="+1 (555) 000-0000" /></div>
                  <div><label className="text-gray-500 text-[10px] block mb-1">Address *</label><input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors" placeholder="123 Tesla Drive" required /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-gray-500 text-[10px] block mb-1">City *</label><input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors" placeholder="Austin" required /></div>
                    <div><label className="text-gray-500 text-[10px] block mb-1">State *</label><input type="text" value={stateVal} onChange={e => setStateVal(e.target.value)} className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors" placeholder="TX" required /></div>
                    <div><label className="text-gray-500 text-[10px] block mb-1">ZIP *</label><input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors" placeholder="73301" required /></div>
                  </div>
                  <div><label className="text-gray-500 text-[10px] block mb-1">Notes (optional)</label><textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors resize-none" rows={2} placeholder="Special delivery instructions..." /></div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white/5 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-400">{orderModal.name} Base Price</span><span className="text-white">${orderModal.basePrice.toLocaleString()}</span></div>
                {selectedAddons.length > 0 && selectedAddons.map(id => { const a = ADDON_OPTIONS.find(o => o.id === id); return a ? <div key={id} className="flex justify-between text-sm"><span className="text-gray-400">{a.name}</span><span className="text-white">${a.price.toLocaleString()}</span></div> : null; })}
                <div className="flex justify-between text-sm"><span className="text-gray-400">Deposit (10%)</span><span className="text-[#CC0000] font-bold">${(Math.round((orderModal.basePrice + getAddonsTotal()) * 0.1)).toLocaleString()}</span></div>
                <div className="border-t border-tesla-border pt-2 flex justify-between text-sm"><span className="text-gray-400">Estimated Delivery</span><span className="text-white">{orderModal.estimatedDelivery}</span></div>
              </div>

              <button type="submit" disabled={submitting} className="w-full bg-[#CC0000] hover:bg-[#a30000] disabled:bg-[#CC0000]/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Placing Order...</> : `Place Order — $${(Math.round((orderModal.basePrice + getAddonsTotal()) * 0.1)).toLocaleString()} Deposit`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Deposit Modal (Crypto / Gift Card) ── */}
      {depositModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !depositing && setDepositModal(null)} />
          <div className="relative bg-[#111] border border-tesla-border rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-[#111] border-b border-tesla-border p-4 flex items-center justify-between z-10">
              <div><h2 className="text-white font-bold text-lg">Pay Deposit</h2><p className="text-gray-500 text-xs">{depositModal.vehicle.name} — ${depositModal.depositAmount.toLocaleString()}</p></div>
              <button onClick={() => !depositing && setDepositModal(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors" disabled={depositing}>✕</button>
            </div>
            <div className="p-4 space-y-4">
              {/* Tab Toggle */}
              <div className="flex bg-white/5 rounded-lg p-1">
                <button type="button" onClick={() => setDepositTab('crypto')} className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${depositTab === 'crypto' ? 'bg-[#CC0000] text-white' : 'text-gray-400 hover:text-white'}`}>Crypto</button>
                <button type="button" onClick={() => setDepositTab('gift_card')} className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${depositTab === 'gift_card' ? 'bg-[#CC0000] text-white' : 'text-gray-400 hover:text-white'}`}>Gift Card</button>
              </div>

              {depositTab === 'crypto' ? (
                <>
                  {/* Payment address display */}
                  {(() => {
                    const addr = getAddressForCurrency(cryptoCurrency, cryptoNetwork);
                    if (addr) return (
                      <div className="bg-white/5 rounded-xl p-4 border border-tesla-border">
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">Send {cryptoCurrency} ({cryptoNetwork}) to:</p>
                        <p className="text-white text-sm font-mono break-all bg-black/40 rounded-lg p-3 select-all">{addr.address}</p>
                        {addr.qrCodeUrl && <img src={addr.qrCodeUrl} alt="QR Code" className="w-32 h-32 mx-auto mt-3 rounded-lg" />}
                        <p className="text-yellow-400 text-[10px] mt-2">Only send {cryptoCurrency} on {cryptoNetwork}. Sending the wrong currency may result in permanent loss.</p>
                      </div>
                    );
                    return <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-yellow-400 text-xs">No payment address configured for {cryptoCurrency} ({cryptoNetwork}). Contact support.</div>;
                  })()}

                  {/* Currency selection */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">Payment Currency</label>
                    <div className="grid grid-cols-3 gap-2">
                      {CRYPTO_OPTIONS.map(opt => (
                        <button key={opt.value} type="button" onClick={() => { setCryptoCurrency(opt.value); setCryptoNetwork(opt.networks[0]); }}
                          className={`p-2.5 rounded-lg border text-xs font-medium transition-all text-center ${cryptoCurrency === opt.value ? 'border-[#CC0000] bg-[#CC0000]/10 text-white' : 'border-tesla-border text-gray-400 hover:border-gray-500'}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Network selection */}
                  {(() => {
                    const opt = CRYPTO_OPTIONS.find(o => o.value === cryptoCurrency);
                    if (!opt || opt.networks.length <= 1) return null;
                    return (
                      <div>
                        <label className="text-gray-400 text-xs font-semibold block mb-2">Network</label>
                        <div className="grid grid-cols-2 gap-2">
                          {opt.networks.map(net => (
                            <button key={net} type="button" onClick={() => setCryptoNetwork(net)}
                              className={`p-2.5 rounded-lg border text-xs font-medium transition-all text-center ${cryptoNetwork === net ? 'border-[#CC0000] bg-[#CC0000]/10 text-white' : 'border-tesla-border text-gray-400 hover:border-gray-500'}`}>
                              {net}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* TX Hash input */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">Transaction Hash *</label>
                    <input type="text" value={txHash} onChange={e => setTxHash(e.target.value)} className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors font-mono" placeholder="0x... or bc1..." required />
                  </div>

                  {/* Sender address */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">Your Wallet Address (optional)</label>
                    <input type="text" value={senderAddr} onChange={e => setSenderAddr(e.target.value)} className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors font-mono" placeholder="Your sending address..." />
                  </div>

                  <button onClick={handleSubmitDeposit} disabled={depositing || !txHash} className="w-full bg-[#CC0000] hover:bg-[#a30000] disabled:bg-[#CC0000]/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm">
                    {depositing ? 'Submitting...' : 'Submit Deposit Proof'}
                  </button>

                  <p className="text-gray-600 text-[10px] text-center">After submission, an admin will verify your payment and confirm the deposit.</p>
                </>
              ) : (
                <>
                  {/* Gift Card Brand */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">Card Brand *</label>
                    <select value={giftCardType} onChange={e => setGiftCardType(e.target.value)} className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#CC0000] focus:outline-none transition-colors appearance-none cursor-pointer">
                      {GIFT_CARD_TYPES.map(t => <option key={t} value={t} className="bg-[#1a1a1a] text-white">{t}</option>)}
                    </select>
                  </div>

                  {/* Card Value */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">Card Value (USD) *</label>
                    <input type="number" min="1" step="0.01" value={giftCardValue} onChange={e => setGiftCardValue(e.target.value)} className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors" placeholder="e.g. 100" required />
                  </div>

                  {/* Card Code */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">Card Code / PIN *</label>
                    <textarea value={giftCardCode} onChange={e => setGiftCardCode(e.target.value)} className="w-full bg-white/5 border border-tesla-border rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:border-[#CC0000] focus:outline-none transition-colors resize-none font-mono" rows={3} placeholder="Enter the gift card code, PIN, or number..." required />
                  </div>

                  {/* Receipt Image Upload */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">Receipt Photo (optional)</label>
                    {giftReceiptImage ? (
                      <div className="relative rounded-lg overflow-hidden border border-tesla-border">
                        <img src={giftReceiptImage} alt="Receipt" className="w-full max-h-40 object-contain bg-black/40" />
                        <button type="button" onClick={() => setGiftReceiptImage('')} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-gray-300 hover:text-white text-xs flex items-center justify-center">✕</button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-tesla-border rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                        <span className="text-gray-500 text-xs">📷 Click to upload receipt</span>
                        <span className="text-gray-600 text-[10px] mt-1">PNG, JPG up to 5MB</span>
                        <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
                      </label>
                    )}
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-yellow-400 text-[10px] leading-relaxed">
                    Ensure the gift card code is valid and has not been redeemed. Admin will verify before confirming your deposit.
                  </div>

                  <button onClick={handleSubmitGiftDeposit} disabled={depositing || !giftCardCode.trim() || !giftCardValue} className="w-full bg-[#CC0000] hover:bg-[#a30000] disabled:bg-[#CC0000]/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm">
                    {depositing ? 'Submitting...' : 'Submit Gift Card Deposit'}
                  </button>

                  <p className="text-gray-600 text-[10px] text-center">After submission, an admin will verify your gift card and confirm the deposit.</p>
                </>
              )}
            </div>
          </div>
        </div>
      {/* ── Tesla Processing Overlay ── */}
      {processingMessage && <TeslaProcessingOverlay message={processingMessage} />}
    </div>
  );
}
