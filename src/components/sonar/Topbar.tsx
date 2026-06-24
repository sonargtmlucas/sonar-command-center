import { useEffect, useState } from "react";

export function Topbar() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mm = String(now.getUTCMinutes()).padStart(2, "0");

  return (
    <header className="fixed top-0 inset-x-0 lg:left-[220px] h-14 z-20 border-b border-border bg-[color:var(--color-background)]/85 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.2em] text-text-muted mono">
            GTM Operating System
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="num text-xs mono text-text-muted">
            {hh}:{mm} <span className="opacity-60">UTC</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-[color:var(--color-panel)] px-3 py-1 text-[10px] uppercase tracking-wider mono text-success">
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-success" />
            System Active
          </span>
          <div className="grid h-8 w-8 place-items-center rounded-full border border-border bg-[color:var(--color-panel-elevated)] text-[11px] font-semibold mono text-signal">
            TC
          </div>
        </div>
      </div>
    </header>
  );
}
