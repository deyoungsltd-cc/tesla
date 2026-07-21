'use client';

import { useState } from 'react';
import ChatWidget from '@/components/ChatWidget';

const tabs = ['Drivers License', 'ID Card', 'SSN'];

const mockHistory = [
  { id: 1, type: 'Drivers License', date: '2025-01-12', status: 'Approved' },
  { id: 2, type: 'ID Card', date: '2025-01-10', status: 'Pending' },
];

export default function KycPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleUpload = async () => {
    if (!frontFile) return;
    setLoading(true);
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('type', tabs[activeTab]);
      formData.append('front', frontFile);
      if (backFile) formData.append('back', backFile);
      const res = await fetch('/api/wallet', { method: 'POST', body: formData });
      if (res.ok) { setSuccess('Documents submitted successfully!'); setFrontFile(null); setBackFile(null); }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-bold text-lg">KYC Verification</h2>
        <p className="text-gray-500 text-sm mt-0.5">Upload your identity documents for verification</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-tesla-card border border-tesla-border rounded-xl p-1.5">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(i); setFrontFile(null); setBackFile(null); setSuccess(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              activeTab === i ? 'bg-[#CC0000] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Upload Section */}
      <div className="bg-tesla-card border border-tesla-border rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Front Side</label>
          <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-tesla-border rounded-xl hover:border-[#CC0000]/50 transition-colors cursor-pointer bg-[#1a1a1a]">
            {frontFile ? (
              <span className="text-green-400 text-sm font-medium">{frontFile.name}</span>
            ) : (
              <>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-gray-500 text-sm mt-2">Click to upload front</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFrontFile(e.target.files?.[0] || null)} />
          </label>
        </div>

        {activeTab !== 2 && (
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Back Side</label>
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-tesla-border rounded-xl hover:border-[#CC0000]/50 transition-colors cursor-pointer bg-[#1a1a1a]">
              {backFile ? (
                <span className="text-green-400 text-sm font-medium">{backFile.name}</span>
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span className="text-gray-500 text-sm mt-2">Click to upload back</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setBackFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        )}

        {success && <div className="bg-green-900/30 border border-green-800/50 text-green-400 text-sm rounded-lg px-4 py-3">{success}</div>}

        <button
          onClick={handleUpload}
          disabled={loading || !frontFile}
          className="w-full bg-[#CC0000] hover:bg-[#a30000] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
        >
          {loading ? 'Uploading...' : 'Submit Documents'}
        </button>
      </div>

      {/* Submission History */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3">Submission History</h3>
        <div className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tesla-border">
                <th className="text-left text-gray-500 font-medium px-4 py-3">Type</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Date</th>
                <th className="text-right text-gray-500 font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockHistory.map((item) => (
                <tr key={item.id} className="border-b border-tesla-border/50 last:border-0">
                  <td className="text-white px-4 py-3">{item.type}</td>
                  <td className="text-gray-400 px-4 py-3">{item.date}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.status === 'Approved' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}