import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
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
  TrendingUp
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
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'ended': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <div className="text-gray-600">Loading admin dashboard...</div>
          <div className="mt-2 text-sm text-gray-500">User: {user?.username}</div>
          <div className="text-sm text-gray-500">Role: {user?.role}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your auctions and monitor performance</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Draft Auctions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.draftAuctions}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Play className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Auctions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeAuctions}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bids</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBids}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="p-4 mb-6 bg-white rounded-lg shadow">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList>
                {['all', 'draft', 'active', 'ended'].map((status) => (
                  <TabsTrigger key={status} value={status} className="capitalize">
                    {status}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <Button variant="default" asChild>
              <Link to="/admin/auctions/create" className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Create Auction
              </Link>
            </Button>
          </div>
        </div>

        {/* Auctions Table */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <Table className="min-w-full divide-y divide-gray-200">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Auction
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Category
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Current Bid
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    End Time
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {auctions.map((auction) => (
                  <TableRow key={auction._id} className="hover:bg-gray-50">
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{auction.title}</div>
                        <div className="text-sm text-gray-500">{auction.bidCount || 0} bids</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{auction.category}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(auction.currentBid || auction.startingPrice)}
                      </div>
                      {auction.currentBidder && (
                        <div className="text-sm text-gray-500">
                          {auction.currentBidder.username}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(auction.status)}`}>
                        {auction.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(auction.auctionEndTime)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/admin/auctions/${auction._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {auction.status === 'draft' && (
                          <>
                            <Link
                              to={`/admin/auctions/${auction._id}/edit`}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => startAuction(auction._id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {auction.status === 'active' && (
                          <button
                            onClick={() => endAuction(auction._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Square className="w-4 h-4" />
                          </button>
                        )}

                        {(auction.status === 'draft' || auction.status === 'ended') && (
                          <button
                            onClick={() => deleteAuction(auction._id)}
                            className="text-red-600 hover:text-red-900"
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
              <Package className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No auctions</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' ? 'Get started by creating a new auction.' : `No ${filter} auctions found.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
