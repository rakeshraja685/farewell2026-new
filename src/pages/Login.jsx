import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bootSequence, setBootSequence] = useState(true);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const CORRECT_PASSWORD = "Admin@123";

  // Boot sequence lines
  const bootLines = [
    "FAREWELL OS v20.26 (tty1)",
    " ",
    "Initializing core systems... OK",
    "Mounting memory volumes... OK",
    "Checking nostalgic dependencies... OK",
    "Establishing secure connection to Batch 2026...",
    "Connected.",
    " ",
    "Type your access password to unlock the archive.",
  ];

  useEffect(() => {
    let delay = 0;
    bootLines.forEach((line, index) => {
      delay += Math.random() * 200 + 100; // Random delay between 100ms - 300ms
      setTimeout(() => {
        setHistory((prev) => [...prev, line]);
        if (index === bootLines.length - 1) {
          setTimeout(() => setBootSequence(false), 200);
        }
      }, delay);
    });

    // Enforce focus on the input whenever user clicks anywhere
    const handleClick = () => {
      if (inputRef.current) inputRef.current.focus();
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Always keep input focused
  useEffect(() => {
    if (!bootSequence && inputRef.current) {
      inputRef.current.focus();
    }
  }, [bootSequence]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Mask the password in the history log with asterisks
    const maskedInput = "*".repeat(input.length);
    const newHistory = [...history, `guest@farewell:~$ ${maskedInput}`];
    
    if (input === CORRECT_PASSWORD) {
      newHistory.push("Access granted.");
      newHistory.push("Decrypting archive...");
      setHistory(newHistory);
      setLoading(true);
      
      setTimeout(() => {
        sessionStorage.setItem("farewell_auth", "true");
        navigate("/");
      }, 1500);
    } else {
      newHistory.push("Access denied. Invalid password.");
      newHistory.push(" ");
      setHistory(newHistory);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#00FF41] font-mono p-4 sm:p-8 text-sm sm:text-base selection:bg-[#00FF41] selection:text-black overflow-hidden flex flex-col">
      {/* CRT Scanline overlay effect */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      
      <div className="max-w-4xl w-full mx-auto relative z-10 flex flex-col justify-end">
        <div className="flex flex-col gap-1.5 pb-2">
          {history.map((line, i) => (
            <div key={i} className="leading-relaxed whitespace-pre-wrap break-words drop-shadow-[0_0_5px_rgba(0,255,65,0.4)]">
              {line}
            </div>
          ))}
        </div>
        
        {!bootSequence && !loading && (
          <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1 w-full">
            <span className="text-[#00FF41] font-bold drop-shadow-[0_0_5px_rgba(0,255,65,0.4)] whitespace-nowrap">
              guest@farewell:~$
            </span>
            <div className="relative flex-1 flex items-center">
              <input
                ref={inputRef}
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[#00FF41] caret-[#00FF41] drop-shadow-[0_0_5px_rgba(0,255,65,0.4)] focus:ring-0 p-0"
                autoFocus
                spellCheck="false"
                autoComplete="off"
              />
              {/* Fake Blinking Block Cursor (Optional, native caret is usually fine but this adds flair if we hide caret) */}
              {/* <span className="absolute left-[calc(1ch*var(--len))] w-2.5 h-5 bg-[#00FF41] animate-pulse pointer-events-none" style={{"--len": input.length}}></span> */}
            </div>
          </form>
        )}

        {loading && (
          <div className="mt-2 text-[#00FF41] animate-pulse drop-shadow-[0_0_5px_rgba(0,255,65,0.4)]">
            Loading system interface...
          </div>
        )}
      </div>
    </div>
  );
}
