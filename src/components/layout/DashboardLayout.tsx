import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Button } from '../ui/Button';

export const DashboardLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [runTour, setRunTour] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && !localStorage.getItem('joyride_seen_v2')) {
      setRunTour(true);
    }
  }, [isAuthenticated]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {runTour && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-slide-in">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to Business Nexus! 🚀</h3>
              <p className="text-gray-600 mb-6">
                We're excited to have you on board. Here is a quick tour of what you can do:
              </p>
              <ul className="space-y-4 mb-8 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">1</span>
                  <span><strong>Profile & Settings:</strong> Access them at any time from the top right navigation bar.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">2</span>
                  <span><strong>Document Chamber:</strong> Upload and e-sign contracts seamlessly.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">3</span>
                  <span><strong>Payments & Wallet:</strong> Simulate mock transactions and view your balances!</span>
                </li>
              </ul>
              <Button fullWidth onClick={() => { setRunTour(false); localStorage.setItem('joyride_seen_v2', 'true'); }}>
                Got it, let's go!
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};