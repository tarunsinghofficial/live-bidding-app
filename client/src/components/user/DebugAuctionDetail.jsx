import React from 'react';
import { useParams } from 'react-router-dom';

const DebugAuctionDetail = () => {
  const { id } = useParams();
  
  console.log('DebugAuctionDetail rendering with ID:', id);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full border-4 border-red-500">
        <h1 className="text-3xl font-bold text-red-600 mb-4">🐛 DEBUG: Auction Detail</h1>
        <div className="space-y-2 text-lg">
          <p><strong>Auction ID:</strong> {id || 'Not found'}</p>
          <p><strong>URL:</strong> {window.location.pathname}</p>
          <p><strong>Component:</strong> DebugAuctionDetail</p>
          <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
        </div>
        <button 
          onClick={() => alert('Debug component is working!')}
          className="mt-6 bg-red-600 text-white px-6 py-3 rounded-lg w-full text-lg font-bold hover:bg-red-700"
        >
          🚀 Test Button
        </button>
        <div className="mt-4 text-sm text-gray-600">
          If you can see this, routing is working!
        </div>
      </div>
    </div>
  );
};

export default DebugAuctionDetail;
