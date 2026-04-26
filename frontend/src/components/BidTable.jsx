import React from 'react';

const BidTable = ({ bids }) => {
  if (!bids || bids.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 font-medium">No bids have been submitted yet.</p>
        <p className="text-sm text-gray-400 mt-1">Be the first to place a bid!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase text-xs tracking-wider">
          <tr>
            <th className="px-6 py-4 rounded-tl-xl rounded-bl-xl">Rank</th>
            <th className="px-6 py-4">Supplier</th>
            <th className="px-6 py-4 text-right">Total Price</th>
            <th className="px-6 py-4">Transit</th>
            <th className="px-6 py-4">Submitted At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {bids.map((bid, index) => {
            const isL1 = bid.rank === 'L1';
            
            return (
              <tr 
                key={bid._id || index}
                className={`transition-colors group ${
                  isL1 
                    ? 'bg-emerald-50/50 hover:bg-emerald-50' 
                    : 'hover:bg-gray-50/50'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {isL1 ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      L1 WINNER
                    </span>
                  ) : (
                    <span className="font-semibold text-gray-500">{bid.rank}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`font-bold ${isL1 ? 'text-emerald-900' : 'text-gray-900'}`}>
                    {bid.supplierName}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-base font-extrabold ${isL1 ? 'text-emerald-600' : 'text-gray-900'}`}>
                    ₹{bid.totalCost?.toLocaleString() || '0'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                  {bid.transitTime} days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs font-medium">
                  {new Date(bid.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BidTable;
