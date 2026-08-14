'use client';

import { useState, useEffect, useRef } from 'react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  { value: 'in_production', label: 'In Production', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-500/15 text-green-400 border-green-500/30' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
];

const STATUS_FLOW = ['pending', 'confirmed', 'in_production', 'shipped', 'delivered'];

const COLOR_OPTIONS = [
  { value: 'pearl_white', label: 'Pearl White', hex: '#F5F5F5' },
  { value: 'solid_black', label: 'Solid Black', hex: '#1A1A1A' },
  { value: 'midnight_silver', label: 'Midnight Silver', hex: '#6E7681' },
  { value: 'deep_blue', label: 'Deep Blue', hex: '#1E3A5F' },
  { value: 'red_multi_coat', label: 'Red Multi-Coat', hex: '#CC0000' },
  { value: 'ultra_red', label: 'Ultra Red', hex: '#B71C1C' },
  { value: 'quick_silver', label: 'Quick Silver', hex: '#9CA3AF' },
  { value: 'blue_multi_coat', label: 'Blue Multi-Coat', hex: '#3B82F6' },
];

const CATEGORY_OPTIONS = ['Sedan', 'SUV', 'Pickup', 'Truck', 'Van', 'Other'];

const emptyVehicleForm = {
  name: '', slug: '', category: 'Sedan', basePrice: '', imageUrl: '',
  description: '', range: '', acceleration: '', topSpeed: '', horsepower: '',
  cargo: '', drivetrain: '', interior: 'Premium Black', estimatedDelivery: '',
  featured: false, sortOrder: '0', active: true,
  colors: ['pearl_white', 'solid_black', 'midnight_silver', 'deep_blue', 'red_multi_coat'],
};

function apiCall(url: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers as Record<string, string> || {}),
    },
  });
}

export default function VehicleManagement({ showToast }: { showToast: (msg: string) => void }) {
  const [subTab, setSubTab] = useState<'showroom' | 'orders'>('showroom');

  // ── Showroom state ──
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
  const [vehicleForm, setVehicleForm] = useState({ ...emptyVehicleForm });
  const [vehicleSaving, setVehicleSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Image upload handler ──
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { showToast('File too large. Max 3MB.'); return; }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) { showToast('Invalid file type. Use JPG, PNG, WebP, or GIF.'); return; }
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      const res = await fetch('/api/admin/upload-vehicle-image', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.data?.imageUrl) {
        setVehicleForm(prev => ({ ...prev, imageUrl: data.data.imageUrl }));
        showToast('Image uploaded!');
      } else {
        showToast(data.error?.message || 'Upload failed');
      }
    } catch { showToast('Upload failed'); }
    setImageUploading(false);
    // Reset file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Orders state ──
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [trackingForm, setTrackingForm] = useState({
    status: '', vin: '', currentLocation: '', shippingDirection: '',
    factoryLocation: '', estimatedDelivery: '', adminNotes: '',
  });
  const [orderUpdating, setOrderUpdating] = useState(false);

  // ── Fetch vehicles ──
  const fetchVehicles = async () => {
    setVehiclesLoading(true);
    try {
      const res = await apiCall('/api/admin/vehicles?type=vehicles');
      const data = await res.json();
      if (data.success) setVehicles(data.data || []);
      else showToast(data.error?.message || 'Failed to load vehicles');
    } catch { showToast('Network error loading vehicles'); }
    setVehiclesLoading(false);
  };

  // ── Fetch orders ──
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const params = orderFilter ? `?status=${orderFilter}` : '';
      const res = await apiCall(`/api/admin/vehicles${params}`);
      const data = await res.json();
      if (data.success) setOrders(data.data || []);
      else showToast(data.error?.message || 'Failed to load orders');
    } catch { showToast('Network error loading orders'); }
    setOrdersLoading(false);
  };

  useEffect(() => {
    if (subTab === 'showroom') fetchVehicles();
    else fetchOrders();
  }, [subTab, orderFilter]);

  // ── Vehicle CRUD ──
  const openAddVehicle = () => {
    setEditingVehicle(null);
    setVehicleForm({ ...emptyVehicleForm });
    setShowVehicleForm(true);
  };

  const openEditVehicle = (v: any) => {
    setEditingVehicle(v);
    const specs = v.specs || {};
    setVehicleForm({
      name: v.name, slug: v.slug, category: v.category,
      basePrice: String(v.basePrice), imageUrl: v.imageUrl || '',
      description: v.description || '',
      range: String(specs.range || ''), acceleration: specs.acceleration || '',
      topSpeed: specs.topSpeed || '', horsepower: String(specs.horsepower || ''),
      cargo: specs.cargo || '', drivetrain: specs.drivetrain || '',
      interior: v.interior || 'Premium Black',
      estimatedDelivery: v.estimatedDelivery || '',
      featured: v.featured || false, sortOrder: String(v.sortOrder || 0),
      active: v.active !== false,
      colors: v.colors || ['pearl_white', 'solid_black'],
    });
    setShowVehicleForm(true);
  };

  const saveVehicle = async () => {
    if (!vehicleForm.name.trim() || !vehicleForm.slug.trim()) {
      showToast('Name and slug are required'); return;
    }
    if (!vehicleForm.imageUrl.trim()) {
      showToast('Please upload an image or provide an image URL'); return;
    }
    setVehicleSaving(true);
    try {
      const specs = {
        range: parseInt(vehicleForm.range) || 0,
        acceleration: vehicleForm.acceleration,
        topSpeed: vehicleForm.topSpeed,
        horsepower: parseInt(vehicleForm.horsepower) || 0,
        cargo: vehicleForm.cargo,
        drivetrain: vehicleForm.drivetrain,
      };
      const body = {
        name: vehicleForm.name, slug: vehicleForm.slug, category: vehicleForm.category,
        basePrice: parseFloat(vehicleForm.basePrice) || 0, imageUrl: vehicleForm.imageUrl,
        description: vehicleForm.description, specs, colors: vehicleForm.colors,
        interior: vehicleForm.interior, estimatedDelivery: vehicleForm.estimatedDelivery,
        featured: vehicleForm.featured, sortOrder: parseInt(vehicleForm.sortOrder) || 0,
        active: vehicleForm.active,
      };

      let res: Response;
      if (editingVehicle) {
        res = await apiCall(`/api/admin/vehicles/${editingVehicle.id}`, { method: 'PATCH', body: JSON.stringify({ _target: 'vehicle', ...body }) });
      } else {
        res = await apiCall('/api/admin/vehicles', { method: 'POST', body: JSON.stringify(body) });
      }
      const data = await res.json();
      if (data.success) {
        showToast(editingVehicle ? 'Vehicle updated!' : 'Vehicle created!');
        setShowVehicleForm(false);
        fetchVehicles();
      } else {
        showToast(data.error?.message || 'Save failed');
      }
    } catch { showToast('Save failed'); }
    setVehicleSaving(false);
  };

  const deleteVehicle = async (v: any) => {
    if (!confirm(`Delete "${v.name}" from the showroom? This cannot be undone.`)) return;
    try {
      const res = await apiCall(`/api/admin/vehicles/${v.id}?target=vehicle`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { showToast('Vehicle deleted'); fetchVehicles(); }
      else showToast(data.error?.message || 'Delete failed');
    } catch { showToast('Delete failed'); }
  };

  const toggleVehicleActive = async (v: any) => {
    try {
      const res = await apiCall(`/api/admin/vehicles/${v.id}`, {
        method: 'PATCH', body: JSON.stringify({ _target: 'vehicle', active: !v.active }),
      });
      const data = await res.json();
      if (data.success) { showToast(v.active ? 'Vehicle hidden' : 'Vehicle visible'); fetchVehicles(); }
      else showToast(data.error?.message || 'Toggle failed');
    } catch { showToast('Toggle failed'); }
  };

  const toggleFeatured = async (v: any) => {
    try {
      const res = await apiCall(`/api/admin/vehicles/${v.id}`, {
        method: 'PATCH', body: JSON.stringify({ _target: 'vehicle', featured: !v.featured }),
      });
      const data = await res.json();
      if (data.success) { showToast(v.featured ? 'Removed from featured' : 'Marked as featured'); fetchVehicles(); }
      else showToast(data.error?.message || 'Toggle failed');
    } catch { showToast('Toggle failed'); }
  };

  const toggleColor = (color: string) => {
    setVehicleForm(prev => ({
      ...prev,
      colors: prev.colors.includes(color) ? prev.colors.filter(c => c !== color) : [...prev.colors, color],
    }));
  };

  // ── Order tracking update ──
  const updateOrderTracking = async (order: any) => {
    if (!trackingForm.status) { showToast('Please select a status'); return; }
    setOrderUpdating(true);
    try {
      const existingInfo = (order.trackingInfo as any) || {};
      const newInfo = {
        ...existingInfo,
        vin: trackingForm.vin || existingInfo.vin,
        currentLocation: trackingForm.currentLocation || existingInfo.currentLocation,
        shippingDirection: trackingForm.shippingDirection || existingInfo.shippingDirection,
        factoryLocation: trackingForm.factoryLocation || existingInfo.factoryLocation,
        estimatedDelivery: trackingForm.estimatedDelivery || existingInfo.estimatedDelivery,
      };
      const res = await apiCall(`/api/admin/vehicles/${order.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: trackingForm.status,
          trackingInfo: newInfo,
          adminNotes: trackingForm.adminNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Order updated!');
        setExpandedOrder(null);
        fetchOrders();
      } else {
        showToast(data.error?.message || 'Update failed');
      }
    } catch { showToast('Update failed'); }
    setOrderUpdating(false);
  };

  const openOrderTracking = (order: any) => {
    const info = (order.trackingInfo as any) || {};
    setTrackingForm({
      status: order.status,
      vin: info.vin || '',
      currentLocation: info.currentLocation || '',
      shippingDirection: info.shippingDirection || '',
      factoryLocation: info.factoryLocation || '',
      estimatedDelivery: info.estimatedDelivery || '',
      adminNotes: order.adminNotes || '',
    });
    setExpandedOrder(order.id);
  };

  const getStatusBadge = (status: string) => {
    const s = STATUS_OPTIONS.find(o => o.value === status);
    return s ? <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${s.color}`}>{s.label}</span>
      : <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400 border border-gray-600/30">{status}</span>;
  };

  const getProgressPct = (status: string) => {
    const idx = STATUS_FLOW.indexOf(status);
    return status === 'cancelled' ? 0 : Math.max(0, ((idx + 1) / STATUS_FLOW.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">Vehicle Management</h3>
        <div className="flex items-center gap-1 bg-[#111] rounded-lg p-0.5 border border-tesla-border">
          <button onClick={() => setSubTab('showroom')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${subTab === 'showroom' ? 'bg-[#CC0000] text-white' : 'text-gray-400 hover:text-white'}`}>Showroom</button>
          <button onClick={() => setSubTab('orders')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${subTab === 'orders' ? 'bg-[#CC0000] text-white' : 'text-gray-400 hover:text-white'}`}>Orders & Tracking</button>
        </div>
      </div>

      {/* ═══════════ SHOWROOM TAB ═══════════ */}
      {subTab === 'showroom' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-xs">Manage vehicles shown in the showroom. Edit names, photos, specs, and add new models.</p>
            <button onClick={openAddVehicle} className="inline-flex items-center gap-1.5 bg-[#CC0000] hover:bg-[#ff1a1a] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Vehicle
            </button>
          </div>

          {vehiclesLoading && vehicles.length === 0 ? (
            <div className="text-center text-gray-500 py-10 text-sm">Loading vehicles...</div>
          ) : vehicles.length === 0 ? (
            <div className="text-center text-gray-500 py-10 text-sm">No vehicles in the showroom. Click &quot;Add Vehicle&quot; to add your first model.</div>
          ) : (
            <div className="space-y-3">
              {vehicles.map((v: any) => (
                <div key={v.id} className={`border rounded-xl overflow-hidden transition-all ${v.active ? 'bg-tesla-card border-tesla-border' : 'bg-[#0d0d0d] border-tesla-border/40 opacity-60'}`}>
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-24 h-16 rounded-lg overflow-hidden border border-tesla-border bg-[#1a1a1a] shrink-0">
                      {v.imageUrl ? (
                        <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px]">No image</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white text-sm font-medium">{v.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-tesla-border/50">{v.category}</span>
                        {v.featured && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#CC0000]/15 text-[#CC0000] border border-[#CC0000]/30">Featured</span>}
                        {!v.active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">Hidden</span>}
                      </div>
                      <p className="text-gray-500 text-xs">
                        ${Number(v.basePrice).toLocaleString()} &middot; {(v.specs as any)?.range || '?'} mi range &middot; {(v.specs as any)?.acceleration || '?'} 0-60
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => toggleFeatured(v)} className={`p-1.5 rounded-lg transition-colors ${v.featured ? 'bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/40' : 'hover:bg-white/10 text-gray-500 hover:text-white'}`} title={v.featured ? 'Remove from featured' : 'Mark as featured'}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={v.featured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      </button>
                      <button onClick={() => toggleVehicleActive(v)} className={`p-1.5 rounded-lg transition-colors ${v.active ? 'hover:bg-yellow-900/30 text-green-400 hover:text-yellow-400' : 'hover:bg-green-900/30 text-gray-400 hover:text-green-400'}`} title={v.active ? 'Hide from showroom' : 'Show in showroom'}>
                        {v.active ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        )}
                      </button>
                      <button onClick={() => openEditVehicle(v)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button onClick={() => deleteVehicle(v)} className="p-1.5 rounded-lg hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ Add/Edit Vehicle Modal ═══ */}
          {showVehicleForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowVehicleForm(false)}>
              <div className="bg-[#111] border border-tesla-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-tesla-border sticky top-0 bg-[#111] z-10">
                  <h4 className="text-white font-semibold">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h4>
                  <button onClick={() => setShowVehicleForm(false)} className="text-gray-400 hover:text-white transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  {/* Image upload + preview */}
                  <div>
                    <label className="text-gray-400 text-xs font-medium mb-1.5 block">Vehicle Image *</label>
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-tesla-border bg-[#1a1a1a] group">
                      {vehicleForm.imageUrl ? (
                        <>
                          <img src={vehicleForm.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-medium">Click upload below to replace</span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                          <span className="text-xs">Upload or paste URL below</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <label className={`cursor-pointer inline-flex items-center gap-1.5 ${imageUploading ? 'bg-gray-700 text-gray-400' : 'bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white'} text-xs font-medium px-3 py-1.5 rounded-lg transition-colors`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        {imageUploading ? 'Uploading...' : 'Upload from Device'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          disabled={imageUploading}
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                        />
                      </label>
                      <span className="text-gray-600 text-[10px]">or paste URL below</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-xs font-medium mb-1.5 block">Vehicle Name *</label>
                      <input type="text" value={vehicleForm.name} onChange={e => setVehicleForm({ ...vehicleForm, name: e.target.value })} placeholder="e.g. Model S" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs font-medium mb-1.5 block">Slug *</label>
                      <input type="text" value={vehicleForm.slug} onChange={e => setVehicleForm({ ...vehicleForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} placeholder="e.g. model-s" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors font-mono" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs font-medium mb-1.5 block">Category</label>
                      <select value={vehicleForm.category} onChange={e => setVehicleForm({ ...vehicleForm, category: e.target.value })} className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CC0000] transition-colors">
                        {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs font-medium mb-1.5 block">Base Price (USD) *</label>
                      <input type="number" value={vehicleForm.basePrice} onChange={e => setVehicleForm({ ...vehicleForm, basePrice: e.target.value })} placeholder="89990" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs font-medium mb-1.5 block">Image URL (or upload above)</label>
                    <input type="text" value={vehicleForm.imageUrl.startsWith('data:') ? '' : vehicleForm.imageUrl} onChange={e => setVehicleForm({ ...vehicleForm, imageUrl: e.target.value })} placeholder="https://images.unsplash.com/photo-..." className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors font-mono" />
                    {vehicleForm.imageUrl.startsWith('data:') && (
                      <p className="text-green-400/70 text-[10px] mt-1">Image uploaded from device ({(vehicleForm.imageUrl.length * 0.75 / 1024 / 1024).toFixed(1)} MB base64)</p>
                    )}
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs font-medium mb-1.5 block">Description</label>
                    <textarea value={vehicleForm.description} onChange={e => setVehicleForm({ ...vehicleForm, description: e.target.value })} placeholder="Describe this vehicle..." rows={3} className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors resize-none" />
                  </div>

                  {/* Specs */}
                  <div>
                    <label className="text-gray-400 text-xs font-medium mb-2 block">Specifications</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-gray-500 text-[10px] mb-1 block">Range (mi)</label>
                        <input type="number" value={vehicleForm.range} onChange={e => setVehicleForm({ ...vehicleForm, range: e.target.value })} placeholder="405" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
                      </div>
                      <div>
                        <label className="text-gray-500 text-[10px] mb-1 block">0-60 mph</label>
                        <input type="text" value={vehicleForm.acceleration} onChange={e => setVehicleForm({ ...vehicleForm, acceleration: e.target.value })} placeholder="1.99s" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
                      </div>
                      <div>
                        <label className="text-gray-500 text-[10px] mb-1 block">Top Speed</label>
                        <input type="text" value={vehicleForm.topSpeed} onChange={e => setVehicleForm({ ...vehicleForm, topSpeed: e.target.value })} placeholder="200 mph" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
                      </div>
                      <div>
                        <label className="text-gray-500 text-[10px] mb-1 block">Horsepower</label>
                        <input type="number" value={vehicleForm.horsepower} onChange={e => setVehicleForm({ ...vehicleForm, horsepower: e.target.value })} placeholder="670" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
                      </div>
                      <div>
                        <label className="text-gray-500 text-[10px] mb-1 block">Cargo</label>
                        <input type="text" value={vehicleForm.cargo} onChange={e => setVehicleForm({ ...vehicleForm, cargo: e.target.value })} placeholder="28 cu ft" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
                      </div>
                      <div>
                        <label className="text-gray-500 text-[10px] mb-1 block">Drivetrain</label>
                        <input type="text" value={vehicleForm.drivetrain} onChange={e => setVehicleForm({ ...vehicleForm, drivetrain: e.target.value })} placeholder="Dual Motor AWD" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <label className="text-gray-400 text-xs font-medium mb-2 block">Available Colors</label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map(c => (
                        <button key={c.value} onClick={() => toggleColor(c.value)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs ${vehicleForm.colors.includes(c.value) ? 'border-white/30 bg-white/5 text-white' : 'border-tesla-border/50 opacity-50 hover:opacity-80 text-gray-400'}`}>
                          <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: c.hex }} />
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-gray-400 text-xs font-medium mb-1.5 block">Interior</label>
                      <input type="text" value={vehicleForm.interior} onChange={e => setVehicleForm({ ...vehicleForm, interior: e.target.value })} className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CC0000] transition-colors" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs font-medium mb-1.5 block">Est. Delivery</label>
                      <input type="text" value={vehicleForm.estimatedDelivery} onChange={e => setVehicleForm({ ...vehicleForm, estimatedDelivery: e.target.value })} placeholder="Q3 2025" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs font-medium mb-1.5 block">Sort Order</label>
                      <input type="number" value={vehicleForm.sortOrder} onChange={e => setVehicleForm({ ...vehicleForm, sortOrder: e.target.value })} className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CC0000] transition-colors" />
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={vehicleForm.featured} onChange={e => setVehicleForm({ ...vehicleForm, featured: e.target.checked })} className="accent-[#CC0000]" />
                      <span className="text-gray-300 text-sm">Featured</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={vehicleForm.active} onChange={e => setVehicleForm({ ...vehicleForm, active: e.target.checked })} className="accent-[#CC0000]" />
                      <span className="text-gray-300 text-sm">Active (visible in showroom)</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-5 border-t border-tesla-border sticky bottom-0 bg-[#111]">
                  <button onClick={saveVehicle} disabled={vehicleSaving} className="bg-[#CC0000] hover:bg-[#ff1a1a] disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                    {vehicleSaving ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
                  </button>
                  <button onClick={() => setShowVehicleForm(false)} className="bg-white/5 hover:bg-white/10 text-gray-300 text-sm px-4 py-2 rounded-lg border border-tesla-border transition-colors">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════ ORDERS & TRACKING TAB ═══════════ */}
      {subTab === 'orders' && (
        <>
          <div className="flex items-center gap-3">
            <p className="text-gray-500 text-xs">Manage vehicle orders, update tracking status, and provide delivery directions.</p>
            <div className="flex items-center gap-1 bg-[#111] rounded-lg p-0.5 border border-tesla-border shrink-0">
              {['', 'pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled'].map(f => (
                <button key={f || 'all'} onClick={() => setOrderFilter(f)} className={`px-2 py-1 text-[10px] rounded-md transition-colors ${orderFilter === f ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                  {f ? STATUS_OPTIONS.find(s => s.value === f)?.label || f : 'All'}
                </button>
              ))}
            </div>
          </div>

          {ordersLoading && orders.length === 0 ? (
            <div className="text-center text-gray-500 py-10 text-sm">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-500 py-10 text-sm">No vehicle orders found.</div>
          ) : (
            <div className="space-y-3">
              {orders.map((order: any) => (
                <div key={order.id} className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden">
                  {/* Order header */}
                  <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => expandedOrder === order.id ? setExpandedOrder(null) : openOrderTracking(order)}>
                    <div className="w-16 h-11 rounded-lg overflow-hidden border border-tesla-border bg-[#1a1a1a] shrink-0">
                      {order.vehicle?.imageUrl ? (
                        <img src={order.vehicle.imageUrl} alt={order.vehicle.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-[9px]">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white text-sm font-medium">{order.vehicle?.name || 'Unknown'}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-gray-500 text-[11px]">
                        #{order.orderNumber} &middot; {order.user?.profile ? `${order.user.profile.firstName || ''} ${order.user.profile.lastName || ''}` : order.user?.email || 'Unknown'} &middot; ${Number(order.totalPrice).toLocaleString()}
                      </p>
                      {/* Mini progress bar */}
                      <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${order.status === 'cancelled' ? 'bg-red-500/50' : 'bg-[#CC0000]'}`} style={{ width: `${getProgressPct(order.status)}%` }} />
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-gray-500 transition-transform shrink-0 ${expandedOrder === order.id ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
                  </div>

                  {/* Expanded tracking panel */}
                  {expandedOrder === order.id && (
                    <div className="border-t border-tesla-border bg-black/30 p-5 space-y-5">
                      {/* Visual route tracker */}
                      <div>
                        <h5 className="text-white text-xs font-medium mb-4">Delivery Route & Status</h5>
                        <div className="relative">
                          {/* Progress line */}
                          <div className="absolute top-4 left-4 right-4 h-0.5 bg-white/10 z-0" />
                          <div className="absolute top-4 left-4 h-0.5 bg-[#CC0000] z-0 transition-all duration-700" style={{ width: order.status === 'cancelled' ? '0%' : `${getProgressPct(order.status)}%` }} />

                          {/* Status dots */}
                          <div className="relative flex justify-between z-10">
                            {STATUS_FLOW.map((step, idx) => {
                              const currentIdx = STATUS_FLOW.indexOf(order.status);
                              const isComplete = idx <= currentIdx && order.status !== 'cancelled';
                              const isCurrent = step === order.status;
                              return (
                                <div key={step} className="flex flex-col items-center" style={{ flex: 1 }}>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${isComplete ? 'bg-[#CC0000] border-[#CC0000] text-white' : isCurrent ? 'bg-[#CC0000]/20 border-[#CC0000] text-[#CC0000]' : 'bg-[#1a1a1a] border-tesla-border text-gray-600'}`}>
                                    {isComplete ? (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                    ) : (
                                      idx + 1
                                    )}
                                  </div>
                                  <span className={`text-[10px] mt-1.5 text-center ${isCurrent ? 'text-white font-medium' : isComplete ? 'text-gray-400' : 'text-gray-600'}`}> 
                                    {STATUS_OPTIONS.find(s => s.value === step)?.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Order details grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-[#1a1a1a] rounded-lg p-3">
                          <p className="text-gray-500 text-[10px]">Customer</p>
                          <p className="text-white text-xs font-medium mt-0.5 truncate">{order.fullName}</p>
                          <p className="text-gray-500 text-[10px] truncate">{order.email}</p>
                        </div>
                        <div className="bg-[#1a1a1a] rounded-lg p-3">
                          <p className="text-gray-500 text-[10px]">Delivery Address</p>
                          <p className="text-white text-xs font-medium mt-0.5">{order.city}, {order.state}</p>
                          <p className="text-gray-500 text-[10px] truncate">{order.address}</p>
                        </div>
                        <div className="bg-[#1a1a1a] rounded-lg p-3">
                          <p className="text-gray-500 text-[10px]">Deposit</p>
                          <p className="text-white text-xs font-medium mt-0.5">${Number(order.depositAmount).toLocaleString()}</p>
                          <p className={`text-[10px] ${order.depositPaid ? 'text-green-400' : 'text-yellow-400'}`}>{order.depositPaid ? 'Paid' : 'Unpaid'}</p>
                        </div>
                        <div className="bg-[#1a1a1a] rounded-lg p-3">
                          <p className="text-gray-500 text-[10px]">Ordered</p>
                          <p className="text-white text-xs font-medium mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                          <p className="text-gray-500 text-[10px]">{new Date(order.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>

                      {/* Timeline from tracking info */}
                      {(order.trackingInfo as any)?.timeline && (order.trackingInfo as any).timeline.length > 0 && (
                        <div>
                          <h5 className="text-white text-xs font-medium mb-3">Tracking Timeline</h5>
                          <div className="space-y-2">
                            {(order.trackingInfo as any).timeline.map((entry: any, idx: number) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#CC0000] mt-1.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {getStatusBadge(entry.status)}
                                    <span className="text-gray-500 text-[10px]">{new Date(entry.timestamp).toLocaleString()}</span>
                                  </div>
                                  <p className="text-gray-400 text-xs mt-0.5">{entry.note}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Admin tracking form */}
                      <div className="bg-[#111] border border-tesla-border rounded-xl p-4 space-y-4">
                        <h5 className="text-white text-xs font-medium">Update Tracking</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-gray-400 text-[10px] mb-1 block">Order Status *</label>
                            <select value={trackingForm.status} onChange={e => setTrackingForm({ ...trackingForm, status: e.target.value })} className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CC0000] transition-colors">
                              <option value="">Select status...</option>
                              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-gray-400 text-[10px] mb-1 block">VIN Number</label>
                            <input type="text" value={trackingForm.vin} onChange={e => setTrackingForm({ ...trackingForm, vin: e.target.value })} placeholder="e.g. 5YJ3E1EA5PF123456" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors font-mono" />
                          </div>
                          <div>
                            <label className="text-gray-400 text-[10px] mb-1 block">Current Location</label>
                            <input type="text" value={trackingForm.currentLocation} onChange={e => setTrackingForm({ ...trackingForm, currentLocation: e.target.value })} placeholder="e.g. Chicago Distribution Center" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
                          </div>
                          <div>
                            <label className="text-gray-400 text-[10px] mb-1 block">Shipping Direction</label>
                            <input type="text" value={trackingForm.shippingDirection} onChange={e => setTrackingForm({ ...trackingForm, shippingDirection: e.target.value })} placeholder="e.g. Fremont CA → Chicago IL" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
                          </div>
                          <div>
                            <label className="text-gray-400 text-[10px] mb-1 block">Factory Location</label>
                            <input type="text" value={trackingForm.factoryLocation} onChange={e => setTrackingForm({ ...trackingForm, factoryLocation: e.target.value })} placeholder="e.g. Tesla Factory, Fremont CA" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
                          </div>
                          <div>
                            <label className="text-gray-400 text-[10px] mb-1 block">Estimated Delivery Date</label>
                            <input type="date" value={trackingForm.estimatedDelivery} onChange={e => setTrackingForm({ ...trackingForm, estimatedDelivery: e.target.value })} className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CC0000] transition-colors" />
                          </div>
                        </div>
                        <div>
                          <label className="text-gray-400 text-[10px] mb-1 block">Admin Notes (also saved to timeline)</label>
                          <textarea value={trackingForm.adminNotes} onChange={e => setTrackingForm({ ...trackingForm, adminNotes: e.target.value })} placeholder="Internal notes about this order..." rows={2} className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors resize-none" />
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateOrderTracking(order)} disabled={orderUpdating} className="bg-[#CC0000] hover:bg-[#ff1a1a] disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
                            {orderUpdating ? 'Updating...' : 'Update Tracking'}
                          </button>
                          <button onClick={() => setExpandedOrder(null)} className="bg-white/5 hover:bg-white/10 text-gray-400 text-xs px-3 py-2 rounded-lg border border-tesla-border transition-colors">Close</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
