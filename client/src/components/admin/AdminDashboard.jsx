import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Play,
  Square,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
  Gavel
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const AdminDashboard = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Debug: Check if user is admin
  console.log('User role:', user?.role);
  console.log('User data:', user);
  console.log('Is authenticated:', !!user);
  console.log('Token exists:', !!localStorage.getItem('token'));

  useEffect(() => {
    fetchAuctions();
    fetchStats();
  }, [filter]);

  const fetchAuctions = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await auctionAPI.getAuctions(params);
      setAuctions(response.data.auctions);
    } catch (error) {
      toast.error('Failed to fetch auctions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await auctionAPI.getAuctionStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const startAuction = async (auctionId) => {
    try {
      await auctionAPI.startAuction(auctionId);
      toast.success('Auction started successfully!');
      fetchAuctions();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start auction');
    }
  };

  const endAuction = async (auctionId) => {
    try {
      await auctionAPI.endAuction(auctionId);
      toast.success('Auction ended successfully!');
      fetchAuctions();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to end auction');
    }
  };

  const deleteAuction = async (auctionId) => {
    if (!confirm('Are you sure you want to delete this auction?')) return;

    try {
      await auctionAPI.deleteAuction(auctionId);
      toast.success('Auction deleted successfully!');
      fetchAuctions();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete auction');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-white/20 text-muted-foreground';
      case 'active': return 'bg-[#E2E687]/20 text-primary';
      case 'ended': return 'bg-white/30 text-muted-foreground';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-white/20 text-muted-foreground';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full border-primary animate-spin"></div>
          <div className="text-muted-foreground">Loading admin dashboard...</div>
          <div className="mt-2 text-sm text-muted-foreground">User: {user?.username}</div>
          <div className="text-sm text-muted-foreground">Role: {user?.role}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your auctions and monitor performance</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 border-0 shadow-lg bg-white/20 backdrop-blur-lg">
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className="p-3 bg-white/30 backdrop-blur rounded-xl">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Draft Auctions</p>
                    <p className="text-2xl font-bold text-foreground">{stats.draftAuctions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border-0 shadow-lg bg-white/20 backdrop-blur-lg">
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className="p-3 bg-white/30 backdrop-blur rounded-xl">
                    <Play className="w-6 h-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Active Auctions</p>
                    <p className="text-2xl font-bold text-foreground">{stats.activeAuctions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border-0 shadow-lg bg-white/20 backdrop-blur-lg">
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className="p-3 bg-white/30 backdrop-blur rounded-xl">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-foreground">{formatPrice(stats.totalRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border-0 shadow-lg bg-white/20 backdrop-blur-lg">
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className="p-3 bg-white/30 backdrop-blur rounded-xl">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Bids</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalBids}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions Bar */}
        <Card className="p-6 mb-6 border-0 shadow-lg bg-white/20 backdrop-blur-lg">
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="rounded-full bg-white/10 backdrop-blur">
                  {['all', 'draft', 'active', 'ended'].map((status) => (
                    <TabsTrigger key={status} value={status} className="px-4 capitalize rounded-full">
                      {status}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <Button className="px-6 py-6 shadow-sm bg-[#E2E687] text-primary rounded-full hover:bg-[#E2E687]/90" asChild>
                <Link to="/admin/auctions/create" className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Auction
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Auctions Table */}
        <Card className="overflow-hidden border-0 shadow-lg bg-white/20 backdrop-blur-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white/10">
                  <TableRow>
                    <TableHead className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                      Auction
                    </TableHead>
                    <TableHead className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                      Category
                    </TableHead>
                    <TableHead className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                      Current Bid
                    </TableHead>
                    <TableHead className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                      End Time
                    </TableHead>
                    <TableHead className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-white/10">
                  {auctions.map((auction) => (
                    <TableRow key={auction._id} className="hover:bg-white/5">
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-foreground">{auction.title}</div>
                          <div className="text-sm text-muted-foreground">{auction.bidCount || 0} bids</div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm capitalize text-foreground">{auction.category}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {formatPrice(auction.currentBid || auction.startingPrice)}
                        </div>
                        {auction.currentBidder && (
                          <div className="text-sm text-muted-foreground">
                            {auction.currentBidder.username}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(auction.status)}`}>
                          {auction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(auction.auctionEndTime)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/admin/auctions/${auction._id}`}
                            className="text-primary hover:text-primary/80"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {auction.status === 'draft' && (
                            <>
                              <Link
                                to={`/admin/auctions/${auction._id}/edit`}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => startAuction(auction._id)}
                                className="text-primary hover:text-primary/80"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {auction.status === 'active' && (
                            <button
                              onClick={() => endAuction(auction._id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Square className="w-4 h-4" />
                            </button>
                          )}

                          {(auction.status === 'draft' || auction.status === 'ended') && (
                            <button
                              onClick={() => deleteAuction(auction._id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {auctions.length === 0 && (
              <div className="py-12 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No auctions</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filter === 'all' ? 'Get started by creating a new auction.' : `No ${filter} auctions found.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
