import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BuyCredit from './pages/BuyCredit';
import Home from './pages/Home';
import Result from './pages/Result';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';  // ✅ Removed unused `toast`
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ✅ Toast container for global notifications */}
      <ToastContainer position="top-right" autoClose={3000} />

      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<Result />} />
        <Route path="/buy" element={<BuyCredit />} />
      </Routes>

      <Footer />
    </div>
  );
};

export default App;
