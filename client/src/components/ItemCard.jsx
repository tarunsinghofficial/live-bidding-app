import { Countdown } from "./Countdown";

function dollars(n) {
  return `$${Number(n).toLocaleString()}`;
}

export function ItemCard({
  item,
  offsetMs,
  isWinning,
  isOutbid,
  flash, // 'green' | 'red' | undefined
  onBidPlus10,
}) {
  const ended =
    Date.now() + offsetMs >= new Date(item.auctionEndTime).getTime();

  const flashStyle =
    flash === "green"
      ? { animation: "flash-green 650ms ease-out" }
      : flash === "red"
        ? { animation: "flash-red 650ms ease-out" }
        : undefined;

  return (
    <div
      className={[
        "rounded-2xl border bg-white p-4 shadow-sm transition",
        isWinning
          ? "border-emerald-300"
          : isOutbid
            ? "border-red-300"
            : "border-slate-200",
      ].join(" ")}
      style={flashStyle}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {item.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Starting: {dollars(item.startingPrice)}
          </p>
        </div>

        {isWinning ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Winning
          </span>
        ) : isOutbid ? (
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
            Outbid
          </span>
        ) : (
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Live
          </span>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">
              Current bid
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {dollars(item.currentBid)}
            </div>
          </div>
          <div className="w-28">
            <Countdown
              auctionEndTime={item.auctionEndTime}
              offsetMs={offsetMs}
            />
          </div>
        </div>
      </div>

      <button
        className={[
          "mt-4 w-full rounded-xl px-4 py-2 text-sm font-semibold transition",
          ended
            ? "cursor-not-allowed bg-slate-100 text-slate-400"
            : "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950",
        ].join(" ")}
        disabled={ended}
        onClick={() => onBidPlus10(item)}
      >
        Bid +$10
      </button>

      {ended && (
        <p className="mt-2 text-center text-xs text-slate-500">Auction ended</p>
      )}
    </div>
  );
}
