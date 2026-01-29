// In-memory storage for auction items, and in production, this would be a DB
const items = [
  {
    id: "1",
    title: "Gemstone Necklace",
    startingPrice: 800,
    currentBid: 800,
    auctionEndTime: new Date(Date.now() + 1 * 60 * 1000).toISOString(), // 1 minutes from now
    highestBidder: null,
  },
  {
    id: "2",
    title: "Modern Art Painting",
    startingPrice: 1000,
    currentBid: 1000,
    auctionEndTime: new Date(Date.now() + 3 * 60 * 1000).toISOString(), // 3 minutes from now
    highestBidder: null,
  },
  {
    id: "3",
    title: "Antique Crystal Vase",
    startingPrice: 2000,
    currentBid: 2000,
    auctionEndTime: new Date(Date.now() + 4 * 60 * 1000).toISOString(), // 4 minutes from now
    highestBidder: null,
  },
];

module.exports = items;
