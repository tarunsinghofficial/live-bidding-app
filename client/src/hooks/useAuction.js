import { useEffect, useMemo, useRef, useState } from "react";
import { fetchItems } from "../lib/api";
import { createSocket } from "../lib/socket";

function getOrCreateUserId() {
  const key = "liveBidding:userId";
  const existing = localStorage.getItem(key);

  if (existing) return existing;

  const next = `user_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  localStorage.setItem(key, next);

  return next;
}

export function useAuction() {
  const userId = useMemo(() => getOrCreateUserId(), []);
  const [items, setItems] = useState([]);
  const [connection, setConnection] = useState({ connected: false });
  const [lastError, setLastError] = useState(null);
  const [flashByItemId, setFlashByItemId] = useState({});
  const [statusByItemId, setStatusByItemId] = useState({}); // 'winning' | 'outbid' | undefined

  const socketRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const initial = await fetchItems();
      if (!cancelled) setItems(initial);
    }

    load().catch((e) => {
      if (!cancelled) setLastError(e);
    });

    const socket = createSocket();
    socketRef.current = socket;

    socket.on("connect", () =>
      setConnection({ connected: true, id: socket.id }),
    );
    socket.on("disconnect", () => setConnection({ connected: false }));

    socket.on("items_update", (serverItems) => {
      setItems(serverItems);
      setStatusByItemId((prev) => {
        const next = { ...prev };
        for (const it of serverItems) {
          if (!it?.id) continue;
          if (it.highestBidder === userId) next[it.id] = "winning";
        }
        return next;
      });
    });

    socket.on("UPDATE_BID", (payload) => {
      const { itemId, currentBid, highestBidder, previousBidder } =
        payload || {};
      if (!itemId) return;

      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId ? { ...it, currentBid, highestBidder } : it,
        ),
      );

      setFlashByItemId((prev) => ({
        ...prev,
        [itemId]:
          highestBidder === userId
            ? "green"
            : previousBidder === userId
              ? "red"
              : "green",
      }));

      setStatusByItemId((prev) => {
        const next = { ...prev };
        if (highestBidder === userId) next[itemId] = "winning";
        else if (previousBidder === userId) next[itemId] = "outbid";
        else if (next[itemId] === "winning" || next[itemId] === "outbid")
          delete next[itemId];
        return next;
      });

      // auto-clear flash after 650ms
      window.setTimeout(() => {
        setFlashByItemId((prev) => {
          if (prev[itemId] == null) return prev;
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
      }, 650);
    });

    socket.on("BID_SUCCESS", () => {
      setLastError(null);
    });

    socket.on("BID_ERROR", (e) => {
      setLastError(new Error(e?.error || "Bid rejected"));
    });

    return () => {
      cancelled = true;
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [userId]);

  function placeBid(itemId, bidAmount) {
    const socket = socketRef.current;
    if (!socket?.connected) {
      setLastError(new Error("Not connected to server"));
      return;
    }
    socket.emit("BID_PLACED", { itemId, bidAmount, userId });
  }

  return {
    userId,
    items,
    connection,
    lastError,
    flashByItemId,
    statusByItemId,
    placeBid,
  };
}
