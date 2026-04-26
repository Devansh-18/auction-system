import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRFQById, submitBid } from '../api/api';
import StatusBadge from '../components/StatusBadge';
import BidTable from '../components/BidTable';
import ActivityLogComponent from '../components/ActivityLog';

const AuctionDetails = () => {
  const { id } = useParams();
  const [rfq, setRfq] = useState(null);
  const [bids, setBids] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [bidForm, setBidForm] = useState({
    supplierName: '',
    freightCharges: '',
    originCharges: '',
    destinationCharges: '',
    transitTime: '',
    validity: '',
  });

  const fetchData = async () => {
    try {
      const response = await getRFQById(id);
      setRfq(response.data.rfq);
      setBids(response.data.bids);
      setLogs(response.data.logs);
      setError('');
    } catch (err) {
      setError('Failed to fetch auction details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBidChange = (e) => {
    const { name, value } = e.target;
    setBidForm((prev) => ({ ...prev, [name]: value }));
    setBidError('');
    setBidSuccess('');
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();

    if (!bidForm.supplierName.trim()) return setBidError('Supplier name is required');
    if (!bidForm.freightCharges || Number(bidForm.freightCharges) < 0) return setBidError('Valid freight charges are required');
    if (!bidForm.originCharges || Number(bidForm.originCharges) < 0) return setBidError('Valid origin charges are required');
    if (!bidForm.destinationCharges || Number(bidForm.destinationCharges) < 0) return setBidError('Valid destination charges are required');
    if (!bidForm.transitTime || Number(bidForm.transitTime) < 1) return setBidError('Transit time must be at least 1 day');
    if (!bidForm.validity.trim()) return setBidError('Validity is required');

    setSubmitting(true);
    setBidError('');
    setBidSuccess('');

    try {
      const payload = {
        ...bidForm,
        freightCharges: Number(bidForm.freightCharges),
        originCharges: Number(bidForm.originCharges),
        destinationCharges: Number(bidForm.destinationCharges),
        transitTime: Number(bidForm.transitTime),
      };

      await submitBid(id, payload);
      setBidSuccess('Your bid was successfully placed! 🎉');
      setBidForm({
        supplierName: '',
        freightCharges: '',
        originCharges: '',
        destinationCharges: '',
        transitTime: '',
        validity: '',
      });
      await fetchData();
    } catch (err) {
      setBidError(
        err.response?.data?.error ||
          err.response?.data?.messages?.join(', ') ||
          'Failed to submit bid'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading auction workspace...</p>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex flex-col items-center text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Error Loading Auction</h2>
          <p>{error || 'Auction not found'}</p>
        </div>
      </div>
    );
  }

  const inputClasses =
    'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder-gray-400';
  const labelClasses = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1';

  const isActive = rfq.status === 'ACTIVE';

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header Area */}
      <div className="mb-10 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{rfq.name}</h1>
              <StatusBadge status={rfq.status} />
            </div>
            <div className="text-gray-500 font-medium flex items-center gap-2">
              <span className="bg-gray-100 px-2 py-1 rounded-md text-sm text-gray-600 font-mono">ID: {rfq.rfqId}</span>
            </div>
          </div>

        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-1">Bid Window Opens</p>
            <p className="text-lg font-bold text-gray-900">{formatDateTime(rfq.bidStartTime)}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-1">Dynamic Close Time</p>
            <p className="text-lg font-bold text-blue-600">{formatDateTime(rfq.bidCloseTime)}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-1">Hard Stop (Max)</p>
            <p className="text-lg font-bold text-red-600">{formatDateTime(rfq.forcedCloseTime)}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-1">Extension Rules</p>
            <p className="text-sm font-bold text-gray-900">
              +{rfq.extensionDuration}m if bid in last {rfq.triggerWindow}m
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Bid Form */}
          {isActive && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">Submit Quotation</h2>
              </div>

              {bidError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm font-medium text-red-600 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {bidError}
                </div>
              )}
              {bidSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm font-medium text-emerald-700 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  {bidSuccess}
                </div>
              )}

              <form onSubmit={handleBidSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="md:col-span-2">
                    <label className={labelClasses} htmlFor="supplierName">Supplier Name</label>
                    <input id="supplierName" type="text" name="supplierName" value={bidForm.supplierName} onChange={handleBidChange} placeholder="e.g., Global Freight Co." className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses} htmlFor="freightCharges">Freight (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                      <input id="freightCharges" type="number" name="freightCharges" value={bidForm.freightCharges} onChange={handleBidChange} min="0" className={`${inputClasses} pl-8`} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClasses} htmlFor="originCharges">Origin (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                      <input id="originCharges" type="number" name="originCharges" value={bidForm.originCharges} onChange={handleBidChange} min="0" className={`${inputClasses} pl-8`} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClasses} htmlFor="destinationCharges">Destination (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                      <input id="destinationCharges" type="number" name="destinationCharges" value={bidForm.destinationCharges} onChange={handleBidChange} min="0" className={`${inputClasses} pl-8`} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClasses} htmlFor="transitTime">Transit Time</label>
                    <div className="relative">
                      <input id="transitTime" type="number" name="transitTime" value={bidForm.transitTime} onChange={handleBidChange} min="1" className={inputClasses} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">days</span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClasses} htmlFor="validity">Validity</label>
                    <input id="validity" type="text" name="validity" value={bidForm.validity} onChange={handleBidChange} placeholder="e.g., 30 Days" className={inputClasses} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-bold text-base transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {submitting ? 'Processing...' : 'Place Bid Now'}
                </button>
              </form>
            </div>
          )}

          {/* Bid Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900">Leaderboard</h2>
              <span className="bg-gray-100 text-gray-600 py-1 px-3 rounded-lg text-sm font-bold">{bids.length} Bids</span>
            </div>
            <BidTable bids={bids} />
          </div>
        </div>

        {/* Right Column: Activity Log */}
        <div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sticky top-24">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-extrabold text-gray-900">Activity Log</h2>
            </div>
            <ActivityLogComponent logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;
