import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from '../lib/api';
import toast from 'react-hot-toast';

export const useSocket = (auctionId) => {
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(API_BASE, {
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket server');
      
      // Join auction room if auctionId is provided
      if (auctionId) {
        socketRef.current.emit('joinAuction', auctionId);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    socketRef.current.on('bidPlaced', (data) => {
      // Show notification for new bid
      if (data.bid && data.bid.bidder) {
        toast.success(`New bid: ${data.bid.bidder.username} placed $${data.bid.amount}`);
      }
      
      // Call any registered listeners
      const listeners = listenersRef.current.get('bidPlaced') || [];
      listeners.forEach(listener => listener(data));
    });

    return () => {
      // Leave auction room and disconnect
      if (auctionId && socketRef.current) {
        socketRef.current.emit('leaveAuction', auctionId);
      }
      
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [auctionId]);

  // Method to add event listeners
  const addEventListener = (event, callback) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, []);
    }
    listenersRef.current.get(event).push(callback);
  };

  // Method to remove event listeners
  const removeEventListener = (event, callback) => {
    const listeners = listenersRef.current.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  };

  return {
    socket: socketRef.current,
    addEventListener,
    removeEventListener
  };
};
