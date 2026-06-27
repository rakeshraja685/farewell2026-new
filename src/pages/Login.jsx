import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ASCII_ART = `
 _____ _    ____  _______        _______ _     _       ____   ___ ____   __  
|  ___/ \\  |  _ \\| ____\\ \\      / / ____| |   | |     |___ \\ / _ \\___ \\ / /_ 
| |_ / _ \\ | |_) |  _|  \\ \\ /\\ / /|  _| | |   | |       __) | | | |__) | '_ \\
|  _/ ___ \\|  _ <| |___  \\ V  V / | |___| |___| |___   / __/| |_| / __/| (_) |
|_|/_/   \\_\\_| \\_\\_____|  \\_/\\_/  |_____|_____|_____| |_____|\\___/_____|\\___/ 
`;

export default function Login() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bootSequence, setBootSequence] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const CORRECT_PASSWORD = "Admin@123";

  // Boot sequence lines
  const bootLines = [
    "FAREWELL OS kernel v4.1.2026",
    "Loading memory drivers... [OK]",
    "Mounting nostalgic volumes... [OK]",
    "Verifying emotional integrity... [OK]",
    "Bypassing firewall... [OK]",
    "Establishing secure connection to Batch 2026...",
    "Connection established on port 5173.",
    " ",
    "SYSTEM LOCKED. Authentication required.",
  ];

  useEffect(() => {
    let delay = 0;
    
    // First, push the ASCII art immediately
    setHistory([ASCII_ART]);

    bootLines.forEach((line, index) => {
      delay += Math.random() * 250 + 150; // Random delay
      setTimeout(() => {
        setHistory((prev) => [...prev, line]);
        if (index === bootLines.length - 1) {
          setTimeout(() => setBootSequence(false), 300);
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
    if (!bootSequence && !loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [bootSequence, loading, history]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const maskedInput = "*".repeat(input.length);
    const newHistory = [...history, `guest@farewell:~$ ${maskedInput}`];
    
    if (input === CORRECT_PASSWORD) {
      setAccessDenied(false);
      newHistory.push(" ");
      newHistory.push("AUTHENTICATION SUCCESSFUL");
      newHistory.push("Decrypting memories [||||||||||||||||||||] 100%");
      setHistory(newHistory);
      setLoading(true);
      
      let dots = 0;
      const interval = setInterval(() => {
        dots = (dots + 1) % 4;
        setHistory([...newHistory, `Redirecting${".".repeat(dots)}`]);
      }, 300);

      setTimeout(() => {
        clearInterval(interval);
        sessionStorage.setItem("farewell_auth", "true");
        navigate("/");
      }, 1800);
    } else {
      setAccessDenied(true);
      newHistory.push(" ");
      newHistory.push("ERROR: ACCESS DENIED");
      newHistory.push("The password entered is incorrect. Please verify your credentials and try again.");
      newHistory.push(" ");
      setHistory(newHistory);
      setInput("");
      setTimeout(() => setAccessDenied(false), 800);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#00FF41] font-mono p-4 sm:p-8 text-xs sm:text-sm md:text-base selection:bg-[#00FF41] selection:text-black overflow-hidden flex flex-col">
      {/* CRT Scanline overlay effect */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-15 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      
      {/* Vintage screen glow */}
      <div className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,20,0,0.8)_100%)] mix-blend-multiply" />
      
      <div className={`max-w-4xl w-full mx-auto relative z-10 flex flex-col justify-end ${accessDenied ? 'animate-shake' : ''}`}>
        
        {/* Terminal Text */}
        <div className="flex flex-col gap-1 pb-2 drop-shadow-[0_0_8px_rgba(0,255,65,0.6)]">
          {history.map((line, i) => (
            <pre key={i} className={`whitespace-pre-wrap break-words ${line.includes("ERROR") ? "text-red-500 drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]" : ""}`}>
              {line}
            </pre>
          ))}
        </div>
        
        {/* Input Prompt */}
        {!bootSequence && !loading && (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 w-full drop-shadow-[0_0_8px_rgba(0,255,65,0.6)]">
            <span className="font-bold whitespace-nowrap">
              guest@farewell:~$
            </span>
            <div className="relative flex-1 flex items-center h-6">
              <input
                ref={inputRef}
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-full bg-transparent border-none outline-none text-transparent caret-transparent focus:ring-0 p-0 z-20 absolute inset-0"
                autoFocus
                spellCheck="false"
                autoComplete="off"
              />
              
              {/* Custom Block Cursor matching actual input length */}
              <div className="flex items-center absolute inset-0 z-10 pointer-events-none">
                <span className="tracking-[0.1em]">{"*".repeat(input.length)}</span>
                <span className="inline-block w-[1ch] h-[1.2em] bg-[#00FF41] animate-pulse ml-[1px]" />
              </div>
            </div>
          </form>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}} />
    </div>
  );
}
