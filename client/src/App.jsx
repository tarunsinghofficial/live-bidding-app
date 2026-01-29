import { ItemCard } from "./components/ItemCard";
import { useAuction } from "./hooks/useAuction";
import { useServerTimeOffset } from "./hooks/useServerTimeOffset";

export default function App() {
  const {
    offsetMs,
    loading: timeLoading,
    error: timeError,
  } = useServerTimeOffset();
  const {
    userId,
    items,
    connection,
    lastError,
    flashByItemId,
    statusByItemId,
    placeBid,
  } = useAuction();

  function onBidPlus10(item) {
    const bidAmount = Number(item.currentBid) + 10;
    placeBid(item.id, bidAmount);
  }

  return (
    <div className="from-slate-50 min-h-full bg-gradient-to-b to-white">
      <div className="px-4 py-8 mx-auto max-w-6xl">
        <div className="sm:flex-row sm:items-end sm:justify-between flex flex-col gap-4">
          <div>
            <h1 className="text-slate-900 text-2xl font-bold tracking-tight">
              Live Bidding Dashboard
            </h1>
            <p className="text-slate-600 mt-1 text-sm">
              Real-time updates via Socket.io
            </p>
          </div>

          <div className="border-slate-200 px-4 py-3 bg-white rounded-2xl border shadow-sm">
            <div className="text-slate-500 text-xs font-medium">You</div>
            <div className="text-slate-800 mt-1 font-mono text-sm">
              {userId}
            </div>
            <div className="flex gap-2 items-center mt-2 text-xs">
              <span
                className={[
                  "inline-flex h-2.5 w-2.5 rounded-full",
                  connection.connected ? "bg-emerald-500" : "bg-slate-300",
                ].join(" ")}
              />
              <span className="text-slate-600">
                {connection.connected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {(timeLoading || timeError || lastError) && (
          <div className="mt-6 space-y-2">
            {timeLoading && (
              <div className="border-slate-200 text-slate-600 px-4 py-3 text-sm bg-white rounded-xl border">
                Syncing server time…
              </div>
            )}
            {timeError && (
              <div className="px-4 py-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
                Failed to sync server time:{" "}
                {String(timeError.message || timeError)}
              </div>
            )}
            {lastError && (
              <div className="px-4 py-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
                {String(lastError.message || lastError)}
              </div>
            )}
          </div>
        )}

        <div className="sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1 gap-4 mt-8">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              offsetMs={offsetMs}
              flash={flashByItemId[item.id]}
              isWinning={statusByItemId[item.id] === "winning"}
              isOutbid={statusByItemId[item.id] === "outbid"}
              onBidPlus10={onBidPlus10}
            />
          ))}
        </div>

        <footer className="text-slate-500 mt-10 text-xs text-center">
          <p>Made with ❤️ by Tarun Singh</p>
        </footer>
      </div>
    </div>
  );
}
