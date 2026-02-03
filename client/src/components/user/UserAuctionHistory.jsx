import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Gavel, Clock, Trophy } from 'lucide-react';

const UserAuctionHistory = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await auctionAPI.getUserAuctions();
        setAuctions(response.data.auctions || []);
      } catch (error) {
        toast.error('Failed to load your auctions');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price || 0);

  const formatDate = (value) => new Date(value).toLocaleString();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-600">
        Loading your auctions...
      </div>
    );
  }

  return (
    <div className="px-4 py-10 mx-auto max-w-6xl sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Auctions</h1>
          <p className="text-sm text-gray-600">Auctions you created</p>
        </div>
        <Button asChild variant="aqua">
          <Link to="/dashboard">Back to Auctions</Link>
        </Button>
      </div>

      {auctions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-600">
            No auctions created yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {auctions.map((auction) => (
            <Card key={auction._id} className="border-gray-200">
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg text-gray-900">{auction.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <Gavel className="w-4 h-4" /> {auction.status}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {formatDate(auction.auctionEndTime)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Current bid</span>
                  <span className="font-semibold text-gray-900">{formatPrice(auction.currentBid || auction.startingPrice)}</span>
                </div>
                {auction.winner && (
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <Trophy className="w-4 h-4" /> Winner: {auction.winner.username}
                  </div>
                )}
                <Button asChild variant="midnight" size="sm">
                  <Link to={`/auctions/${auction._id}`}>View Auction</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserAuctionHistory;
