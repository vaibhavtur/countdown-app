import React, { useState, useEffect, useRef } from "react";
const pad = (n) => String(n).padStart(2, "0");

function App() {
  const [set, setSet] = useState({ h: 0, m: 0, s: 0 }); // user input, starts at 00:00:00
  const [left, setLeft] = useState(null);                // remaining seconds (null = no session)
  const [running, setRunning] = useState(false);
  const total = useRef(0);

  const secs = set.h * 3600 + set.m * 60 + set.s;
  const paused = !running && left !== null && left > 0;

  useEffect(() => {
    if (!running) return;
    if (left <= 0) { setRunning(false); return; }   // zero -> Start enabled, Stop disabled
    const id = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [running, left]);

  const cur = left !== null ? left : secs;
  const shown = left !== null
    ? { h: Math.floor(left / 3600), m: Math.floor((left % 3600) / 60), s: left % 60 }
    : set;

  const change = (key, max) => (e) => {
    const v = Math.min(max, Math.max(0, parseInt(e.target.value.replace(/\D/g, "") || "0", 10)));
    setSet({ ...set, [key]: v });
  };

  const start = () => {                    // resume from paused number, else begin from input
    if (paused) { setRunning(true); return; }
    total.current = secs; setLeft(secs); setRunning(true);
  };
  const stop = () => setRunning(false);    // pause: keeps the current number
  const reset = () => {                    // restart countdown from the user's input
    total.current = secs; setLeft(secs); setRunning(true);
  };
  const clearAll = () => {                 // refresh icon: everything back to 00
    setRunning(false); setLeft(null); setSet({ h: 0, m: 0, s: 0 }); total.current = 0;
  };

  const locked = running || paused;
  const pct = locked && total.current ? (left / total.current) * 100 : 100;
  const fields = [["h", "Hours", 99], ["m", "Minutes", 59], ["s", "Seconds", 59]];
  const status = running ? "Counting down…"
    : paused ? "Stopped at " + pad(shown.h) + ":" + pad(shown.m) + ":" + pad(shown.s) + " — Start resumes from here"
    : left === 0 ? "Time is up! Press Reset to run it again"
    : secs === 0 ? "Enter a time greater than zero" : "Ready";

  return (
    <div className="card">
      <button className="refresh" onClick={clearAll} title="Set all to 00" aria-label="Set all to 00">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" />
        </svg>
      </button>

      <h1>Start &amp; Stop Countdown</h1>
      
      <div className="sub">Set your time, then press Start</div>
      <div className="row">
        {fields.map(([k, label, max], i) => (
          <React.Fragment key={k}>
            {i > 0 && <div className="sep">:</div>}
            <div className="unit">
              <input inputMode="numeric" value={pad(shown[k])} disabled={locked}
                     onChange={change(k, max)} onFocus={(e) => e.target.select()} aria-label={label} />
              <label>{label}</label>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className="bar"><i style={{ width: pct + "%" }} /></div>
      <div className="btns">
        <button className="start" onClick={start} disabled={running || (!paused && secs === 0)}>START</button>
        <button className="reset" onClick={reset} disabled={secs === 0}>RESET</button>
        <button className="stop" onClick={stop} disabled={!running}>STOP</button>
      </div>
      <div className="status">{status}</div>
    </div>
  );
}

export default App;
