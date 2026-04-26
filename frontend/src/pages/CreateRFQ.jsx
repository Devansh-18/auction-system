import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createRFQ } from '../api/api';

const CreateRFQ = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    bidStartTime: '',
    bidCloseTime: '',
    forcedCloseTime: '',
    triggerWindow: '',
    extensionDuration: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validate = () => {
    if (!formData.name.trim()) return 'RFQ name is required';
    if (!formData.bidStartTime) return 'Bid start time is required';
    if (!formData.bidCloseTime) return 'Bid close time is required';
    if (!formData.forcedCloseTime) return 'Forced close time is required';
    if (!formData.triggerWindow || Number(formData.triggerWindow) < 1)
      return 'Trigger window must be at least 1 minute';
    if (!formData.extensionDuration || Number(formData.extensionDuration) < 1)
      return 'Extension duration must be at least 1 minute';

    const startTime = new Date(formData.bidStartTime);
    const closeTime = new Date(formData.bidCloseTime);
    const forcedClose = new Date(formData.forcedCloseTime);
    
    if (closeTime <= startTime) return 'Bid close time must be greater than bid start time';
    if (forcedClose <= closeTime) return 'Forced close time must be greater than bid close time';

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        bidStartTime: new Date(formData.bidStartTime).toISOString(),
        bidCloseTime: new Date(formData.bidCloseTime).toISOString(),
        forcedCloseTime: new Date(formData.forcedCloseTime).toISOString(),
        triggerWindow: Number(formData.triggerWindow),
        extensionDuration: Number(formData.extensionDuration),
      };
      await createRFQ(payload);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.messages?.join(', ') ||
          'Failed to create RFQ. Please check your inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder-gray-400';
  const labelClasses = 'block text-sm font-bold text-gray-700 mb-2 ml-1';

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 mb-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Auctions
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Create RFQ Event</h1>
          <p className="text-gray-500 mt-2 text-lg">Configure the parameters for your new British Auction.</p>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-start gap-3 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="font-medium">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 p-8 md:p-10">
        
        {/* Section 1: Basic Info */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs">1</span>
            Basic Details
          </h3>
          <div className="max-w-2xl">
            <label className={labelClasses} htmlFor="name">Event Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Q3 Enterprise Logistics Procurement"
              className={inputClasses}
            />
          </div>
        </div>

        <hr className="border-gray-100 my-10" />

        {/* Section 2: Timeline */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs">2</span>
            Auction Timeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClasses} htmlFor="bidStartTime">Start Time</label>
              <input
                id="bidStartTime"
                type="datetime-local"
                name="bidStartTime"
                value={formData.bidStartTime}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses} htmlFor="bidCloseTime">Soft Close Time</label>
              <input
                id="bidCloseTime"
                type="datetime-local"
                name="bidCloseTime"
                value={formData.bidCloseTime}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses} htmlFor="forcedCloseTime">Hard Stop (Max Limit)</label>
              <input
                id="forcedCloseTime"
                type="datetime-local"
                name="forcedCloseTime"
                value={formData.forcedCloseTime}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100 my-10" />

        {/* Section 3: Extensions */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs">3</span>
            Dynamic Extensions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses} htmlFor="triggerWindow">Trigger Window (min)</label>
              <input
                id="triggerWindow"
                type="number"
                name="triggerWindow"
                value={formData.triggerWindow}
                onChange={handleChange}
                min="1"
                placeholder="e.g., 5"
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses} htmlFor="extensionDuration">Extension Duration (min)</label>
              <input
                id="extensionDuration"
                type="number"
                name="extensionDuration"
                value={formData.extensionDuration}
                onChange={handleChange}
                min="1"
                placeholder="e.g., 3"
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors mr-4"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publishing...
              </>
            ) : (
              'Launch RFQ Event'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRFQ;
