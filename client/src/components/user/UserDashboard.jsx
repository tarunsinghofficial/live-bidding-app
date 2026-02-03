import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserAuctionList from './UserAuctionList';
import AuctionDetail from './AuctionDetail';

const UserDashboard = () => (
  <div className="min-h-screen">
    <Routes>
      <Route path="/" element={<UserAuctionList />} />
      <Route path="/auctions" element={<Navigate to="/" replace />} />
      <Route path="/auctions/:id" element={<AuctionDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </div>
);

export default UserDashboard;
