import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  Clock, 
  Users, 
  TrendingUp, 
  Eye, 
  Filter,
  Search,
  Heart,
  Gavel,
  DollarSign
} from 'lucide-react';

const UserAuctionList = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('endingSoon');
  const [currentTime, setCurrentTime] = useState(new Date());

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'vehicles', label: 'Vehicles' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'art', label: 'Art' },
    { value: 'collectibles', label: 'Collectibles' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports' },
    { value: 'other', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'endingSoon', label: 'Ending Soon' },
    { value: 'newest', label: 'Newest' },
    { value: 'priceLow', label: 'Price: Low to High' },
    { value: 'priceHigh', label: 'Price: High to Low' },
    { value: 'mostBids', label: 'Most Bids' }
  ];

  useEffect(() => {
    fetchAuctions();
  }, [categoryFilter, sortBy]);

  // Update current time every second for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const params = {
        status: 'active',
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await auctionAPI.getPublicAuctions(params);
      let auctionsData = response.data.auctions;

      // Apply client-side sorting
      auctionsData = sortAuctions(auctionsData, sortBy);
      
      setAuctions(auctionsData);
    } catch (error) {
      toast.error('Failed to fetch auctions');
    } finally {
      setLoading(false);
    }
  };

  const sortAuctions = (auctions, sortType) => {
    const sorted = [...auctions];
    
    switch (sortType) {
      case 'endingSoon':
        return sorted.sort((a, b) => new Date(a.auctionEndTime) - new Date(b.auctionEndTime));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'priceLow':
        return sorted.sort((a, b) => (a.currentBid || a.startingPrice) - (b.currentBid || b.startingPrice));
      case 'priceHigh':
        return sorted.sort((a, b) => (b.currentBid || b.startingPrice) - (a.currentBid || a.startingPrice));
      case 'mostBids':
        return sorted.sort((a, b) => (b.bidCount || 0) - (a.bidCount || 0));
      default:
        return sorted;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatTimeLeft = (endTime) => {
    const now = currentTime;
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
  };

  const getTimeColor = (endTime) => {
    const now = currentTime;
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'text-muted-foreground';
    if (diff < 60 * 60 * 1000) return 'text-destructive'; // Less than 1 hour
    if (diff < 24 * 60 * 60 * 1000) return 'text-orange-600'; // Less than 24 hours
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
       <div>
         <h1 className="mb-2 text-3xl font-bold text-foreground">Live Auctions</h1>
        <p className="text-muted-foreground">Discover and bid on amazing items</p>
       </div>

        <div>
          <Button asChild className="rounded-full px-6 py-6 shadow-sm bg-[#E2E687] text-primary hover:bg-[#E2E687]/90">
            {user?.role === 'admin' ? (
              <Link to="/admin/dashboard">Manage Admin</Link>
            ) : (
              <Link to="/my-auctions">Manage My Auctions</Link>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search auctions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center text-sm text-muted-foreground">
            <Filter className="w-4 h-4 mr-2" />
            {auctions.length} auctions found
          </div>
        </div>
        </CardContent>
      </Card>

      {/* Auction Grid */}
      {auctions.length === 0 ? (
        <div className="py-12 text-center">
          <Gavel className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">No active auctions</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Check back later for new auctions'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {auctions.map((auction) => (
            <AuctionCard 
              key={auction._id} 
              auction={auction} 
              formatPrice={formatPrice}
              formatTimeLeft={formatTimeLeft}
              getTimeColor={getTimeColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AuctionCard = ({ auction, formatPrice, formatTimeLeft, getTimeColor }) => {
  const [isWatched, setIsWatched] = useState(false);

  const toggleWatch = () => {
    setIsWatched(!isWatched);
    // TODO: Implement watchlist functionality
  };

  return (
    <Card className="relative overflow-hidden transition-all duration-200 border-0 shadow-lg bg-white/20 backdrop-blur-lg hover:shadow-xl hover:bg-white/25">
      {/* Gradient overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#E2E687]/10 to-transparent opacity-50"></div>
      
      <div className="relative z-10">
        <div className="relative">
          {auction.images && auction.images.length > 0 && (
            <img
              src={auction.images[0]}
              alt={auction.title}
              className="object-cover w-full h-48"
            />
          )}
          <Button
            onClick={toggleWatch}
            variant="ghost"
            size="icon"
            className="absolute transition-all border-0 rounded-full top-2 right-2 bg-white/30 backdrop-blur-lg hover:bg-white/40"
          >
            <Heart 
              className={`w-4 h-4 ${isWatched ? 'fill-red-500 text-red-500' : 'text-foreground'}`} 
            />
          </Button>
          <Badge className="absolute border-0 top-2 left-2 bg-white/30 backdrop-blur-lg text-foreground">
            {auction.category}
          </Badge>
        </div>

        <CardContent className="p-4">
          <Link to={`/auctions/${auction._id}`}>
            <h3 className="mb-2 text-lg font-semibold transition-colors text-foreground hover:text-primary line-clamp-2">
              {auction.title}
            </h3>
          </Link>

          <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
            {auction.description}
          </p>

          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-muted-foreground">Current Bid</div>
              <div className="text-xl font-bold text-foreground">
                {formatPrice(auction.currentBid || auction.startingPrice)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Time Left</div>
              <div className={`font-semibold ${getTimeColor(auction.auctionEndTime)}`}>
                {formatTimeLeft(auction.auctionEndTime)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {auction.bidCount || 0} bids
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {auction.metadata?.views || 0} views
            </div>
          </div>

          {auction.currentBidder && (
            <div className="pt-3 mt-3 border-t border-white/20">
              <div className="text-sm text-muted-foreground">Highest Bidder</div>
              <div className="text-sm font-medium text-foreground">
                {auction.currentBidder.username}
              </div>
            </div>
          )}

          <Button asChild className="w-full mt-4 shadow-none bg-[#E2E687] text-primary rounded-full hover:bg-[#E2E687]/90 transition-all">
            <Link to={`/auctions/${auction._id}`}>
              Place Bid
            </Link>
          </Button>
        </CardContent>
      </div>
    </Card>
  );
};

export default UserAuctionList;
