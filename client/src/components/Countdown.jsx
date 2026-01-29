import { useEffect, useMemo, useState } from "react";

function formatMs(ms) {
  const clamped = Math.max(0, ms);
  const totalSec = Math.floor(clamped / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function Countdown({ auctionEndTime, offsetMs }) {
  const endMs = useMemo(
    () => new Date(auctionEndTime).getTime(),
    [auctionEndTime],
  );
  const [nowServerMs, setNowServerMs] = useState(() => Date.now() + offsetMs);

  useEffect(() => {
    const id = setInterval(() => setNowServerMs(Date.now() + offsetMs), 250);
    return () => clearInterval(id);
  }, [offsetMs]);

  const remainingMs = endMs - nowServerMs;
  const ended = remainingMs <= 0;

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">Ends in</span>
      <span
        className={[
          "font-mono tabular-nums",
          ended
            ? "text-slate-400"
            : remainingMs <= 10_000
              ? "text-red-600"
              : "text-slate-700",
        ].join(" ")}
      >
        {ended ? "00:00" : formatMs(remainingMs)}
      </span>
    </div>
  );
}
