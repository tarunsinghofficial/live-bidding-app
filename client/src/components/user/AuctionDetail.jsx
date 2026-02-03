import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auctionAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Clock, 
  Users, 
  TrendingUp, 
  ArrowLeft,
  DollarSign,
  Gavel,
  Heart,
  Share2,
  Eye
} from 'lucide-react';

const AuctionDetail = () => {
  const { id } = useParams();
  const { user, isInitialized } = useAuth();
  const { socket, addEventListener, removeEventListener } = useSocket(id);
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const hasFetchedRef = useRef(false);

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Auction Not Found</h1>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetchAuction();
    fetchBids();

    const interval = setInterval(() => {
      updateTimeLeft();
    }, 1000);

    // Add 1-second polling for live updates
    const pollingInterval = setInterval(async () => {
      await fetchAuction();
      await fetchBids();
    }, 1000);

    // Listen for real-time bid updates
    const handleBidPlaced = (data) => {
      if (data.auction) {
        setAuction(data.auction);
      }
      if (data.bid) {
        setBids(prevBids => [data.bid, ...prevBids]);
      }

      // Update bid amount to next minimum
      if (data.auction) {
        const nextMinBid = data.auction.currentBid + (data.auction.settings?.minBidIncrement || 10);
        setBidAmount(nextMinBid.toString());
      }
    };

    addEventListener('bidPlaced', handleBidPlaced);

    return () => {
      clearInterval(interval);
      clearInterval(pollingInterval);
      removeEventListener('bidPlaced', handleBidPlaced);
    };
  }, [id, addEventListener, removeEventListener]);

  const fetchAuction = async () => {
    try {
      const response = await auctionAPI.getPublicAuction(id);
      const newAuction = response.data.auction;
      setAuction(newAuction);
      
      // Auto-update minimum bid amount
      const minBid = (newAuction.currentBid || newAuction.startingPrice) + 
                     (newAuction.settings?.minBidIncrement || 10);
      setBidAmount(minBid.toString());
    } catch (error) {
      console.error('Failed to fetch auction:', error);
      toast.error('Failed to fetch auction details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await auctionAPI.getPublicAuctionBids(id);
      setBids(response.data.bids);
    } catch (error) {
      console.error('Failed to fetch bids:', error);
    }
  };

  const updateTimeLeft = () => {
    if (!auction) return;
    
    const now = new Date();
    const end = new Date(auction.auctionEndTime);
    const diff = end - now;

    if (diff <= 0) {
      setTimeLeft('Ended');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    } else if (hours > 0) {
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    } else {
      setTimeLeft(`${minutes}m ${seconds}s`);
    }
  };

  const handleBid = async (e) => {
    e.preventDefault();
    
    if (!isInitialized) {
      toast.error('Authentication is still loading...');
      return;
    }
    
    if (!user) {
      toast.error('Please sign in to place a bid');
      return;
    }
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    const minBid = (auction.currentBid || auction.startingPrice) + (auction.settings?.minBidIncrement || 10);
    if (parseFloat(bidAmount) < minBid) {
      toast.error(`Minimum bid is $${minBid.toFixed(2)}`);
      return;
    }

    setIsPlacingBid(true);
    try {
      const response = await auctionAPI.placeBid(id, parseFloat(bidAmount));
      toast.success('Bid placed successfully!');
      setAuction(response.data.auction);
      setBids([response.data.bid, ...bids]);
      
      // Update bid amount to next minimum
      const nextMinBid = response.data.auction.currentBid + (response.data.auction.settings?.minBidIncrement || 10);
      setBidAmount(nextMinBid.toString());
    } catch (error) {
      console.error('Bid placement error:', error);
      toast.error(error.response?.data?.message || 'Failed to place bid');
    } finally {
      setIsPlacingBid(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeColor = () => {
    if (!auction) return 'text-muted-foreground';
    
    const now = new Date();
    const end = new Date(auction.auctionEndTime);
    const diff = end - now;
    
    if (diff <= 0) return 'text-muted-foreground';
    if (diff < 60 * 60 * 1000) return 'text-destructive';
    if (diff < 24 * 60 * 60 * 1000) return 'text-orange-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-primary rounded-full animate-spin"></div>
          <div className="text-muted-foreground">Loading auction details...</div>
          <div className="mt-2 text-sm text-muted-foreground">Auction ID: {id}</div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Auction Not Found</h2>
            <p className="mb-4 text-muted-foreground">Auction ID: {id}</p>
            <Button asChild variant="outline">
              <Link to="/dashboard">
                Back to Auctions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const minBid = (auction.currentBid || auction.startingPrice) + (auction.settings?.minBidIncrement || 10);
  const isAuctionEnded = new Date() >= new Date(auction.auctionEndTime);
  const isWinner = isAuctionEnded && user && auction.winner && auction.winner._id === user._id;
  const didLose = isAuctionEnded && user && auction.winner && auction.winner._id !== user._id;

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      {isAuctionEnded && auction.winner && (
        <Alert className={`mb-6 ${
          isWinner
            ? 'border-green-200 bg-green-50 text-green-800'
            : 'border-red-200 bg-red-50 text-red-800'
        }`}>
          {isWinner ? (
            <span>🎉 You won this auction. Congratulations!</span>
          ) : (
            <span>🏁 Auction ended. Better luck next time.</span>
          )}
        </Alert>
      )}

      {/* Header */}
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link to="/dashboard" className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Auctions
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Images */}
          <Card className="mb-6">
            <CardContent className="p-0">
              {auction.images && auction.images.length > 0 ? (
                <img
                  src={auction.images[0]}
                  alt={auction.title}
                  className="object-cover w-full rounded-t-lg h-96"
                />
              ) : (
                <div className="flex items-center justify-center w-full bg-muted rounded-t-lg h-96">
                  <span className="text-muted-foreground">No image available</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auction Details */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{auction.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center mb-4 space-x-4">
                <Badge variant="secondary">{auction.category}</Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Eye className="w-4 h-4 mr-1" />
                  {auction.metadata?.views || 0} views
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-1" />
                  {auction.bidCount || 0} bids
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3 className="mb-2 text-lg font-semibold text-foreground">Description</h3>
                <p className="text-muted-foreground">{auction.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Bidding History */}
          <Card>
            <CardHeader>
              <CardTitle>Bidding History</CardTitle>
            </CardHeader>
            <CardContent>
              {bids.length === 0 ? (
                <p className="text-muted-foreground">No bids yet. Be the first to bid!</p>
              ) : (
                <div className="space-y-3">
                  {bids.map((bid, index) => (
                    <div key={bid._id || index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                          <span className="text-sm font-semibold text-primary">
                            {bid.bidder?.username?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      <div>
                        <div className="font-medium text-foreground">{bid.bidder?.username || 'Anonymous'}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDateTime(bid.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {formatPrice(bid.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Bidding Panel */}
          <Card className="sticky top-6 mb-6">
            <CardContent className="p-6">
              <div className="mb-6 text-center">
                <div className="mb-1 text-sm text-muted-foreground">Current Bid</div>
                <div className="text-3xl font-bold text-foreground">
                  {formatPrice(auction.currentBid || auction.startingPrice)}
                </div>
                {auction.currentBidder && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    by {auction.currentBidder.username}
                  </div>
                )}
              </div>

              <div className="mb-6 text-center">
                <div className="mb-1 text-sm text-muted-foreground">Auction Ends</div>
                <div className={`text-xl font-semibold ${getTimeColor()}`}>
                  {timeLeft}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDateTime(auction.auctionEndTime)}
                </div>
              </div>

              {!isAuctionEnded ? (
                <form onSubmit={handleBid} className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-foreground">
                      Your Bid Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute w-5 h-5 text-muted-foreground transform -translate-y-1/2 left-3 top-1/2" />
                      <Input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min={minBid}
                        step="1"
                        className="pl-10"
                        placeholder="Enter bid amount"
                      />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Minimum bid: {formatPrice(minBid)}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isPlacingBid || !user || !isInitialized}
                    className="w-full"
                  >
                    {isPlacingBid ? 'Placing Bid...' : (!isInitialized ? 'Loading...' : 'Place Bid')}
                  </Button>

                  {!user && (
                    <p className="text-sm text-center text-muted-foreground">
                      <Link to="/login" className="text-primary hover:underline">
                        Sign in
                      </Link>
                      {' '}to place a bid
                    </p>
                )}
              </form>
            ) : (
              <div className="py-4 text-center">
                <div className="mb-2 text-lg font-semibold text-foreground">
                  Auction Ended
                </div>
                {auction.winner && (
                  <div>
                    <div className="text-sm text-muted-foreground">Winner</div>
                    <div className="font-medium text-foreground">{auction.winner.username}</div>
                    <div className="mt-1 text-lg font-semibold text-green-600">
                      {formatPrice(auction.finalPrice)}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-6 mt-6 border-t border-border">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Starting Price</span>
                  <span className="font-medium">{formatPrice(auction.startingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min Bid Increment</span>
                  <span className="font-medium">
                    {formatPrice(auction.settings?.minBidIncrement || 10)}
                  </span>
                </div>
                {auction.settings?.autoExtend && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auto-extend</span>
                    <span className="font-medium">Yes ({auction.settings.extendMinutes} min)</span>
                  </div>
                )}
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Auction Info */}
          <Card>
            <CardHeader>
              <CardTitle>Auction Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Seller:</span>
                  <span className="ml-2 font-medium">{auction.createdBy?.username}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Started:</span>
                  <span className="ml-2 font-medium">{formatDateTime(auction.createdAt)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Reserve Price:</span>
                  <span className="ml-2 font-medium">
                    {auction.reservePrice ? formatPrice(auction.reservePrice) : 'Not set'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
