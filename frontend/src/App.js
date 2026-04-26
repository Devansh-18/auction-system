import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuctionList from './pages/AuctionList';
import CreateRFQ from './pages/CreateRFQ';
import AuctionDetails from './pages/AuctionDetails';

/**
 * App Component
 * Root component with routing configuration.
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<AuctionList />} />
            <Route path="/create" element={<CreateRFQ />} />
            <Route path="/auction/:id" element={<AuctionDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
