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
    "Type 'help' for available commands or press [ENTER] to skip boot sequence."
  ];

  useEffect(() => {
    let isSkipped = false;
    let timeouts = [];

    const startBoot = async () => {
      setHistory([ASCII_ART]);
      
      for (let i = 0; i < bootLines.length; i++) {
        if (isSkipped) break;
        await new Promise(resolve => {
          const delay = Math.random() * 250 + 150;
          const t = setTimeout(() => {
            if (!isSkipped) setHistory(prev => [...prev, bootLines[i]]);
            resolve();
          }, delay);
          timeouts.push(t);
        });
      }
      
      if (!isSkipped) {
        const t = setTimeout(() => setBootSequence(false), 300);
        timeouts.push(t);
      }
    };

    startBoot();

    const handleKeyDown = (e) => {
      if ((e.key === 'Enter' || e.key === 'Escape')) {
        isSkipped = true;
        timeouts.forEach(clearTimeout);
        setHistory([ASCII_ART, ...bootLines]);
        setBootSequence(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    
    // Enforce focus on the input whenever user clicks anywhere
    const handleClick = () => {
      if (inputRef.current) inputRef.current.focus();
    };
    window.addEventListener("click", handleClick);
    
    return () => {
      isSkipped = true;
      timeouts.forEach(clearTimeout);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleClick);
    };
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

    const cmd = input.trim();
    const cmdLower = cmd.toLowerCase();
    
    // Check if the user is typing the password, if so, mask it in history
    const historyInput = cmd === CORRECT_PASSWORD ? "*".repeat(cmd.length) : cmd;
    const newHistory = [...history, `guest@farewell:~$ ${historyInput}`];
    
    if (cmdLower === 'help') {
      newHistory.push("AVAILABLE COMMANDS:");
      newHistory.push("  help   - Show this help message");
      newHistory.push("  clear  - Clear terminal history");
      newHistory.push("  hint   - Get a hint for the password");
      setHistory([...newHistory, " "]);
      setInput("");
      return;
    }
    
    if (cmdLower === 'clear') {
      setHistory([ASCII_ART]);
      setInput("");
      return;
    }
    
    if (cmdLower === 'hint') {
      newHistory.push("HINT: The supreme overlord's username, capitalized, followed by '@' and '123'.");
      setHistory([...newHistory, " "]);
      setInput("");
      return;
    }

    if (cmd === CORRECT_PASSWORD) {
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
      newHistory.push("The credentials entered are incorrect. Try 'hint' if you are stuck.");
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
      
      <div className={`max-w-4xl w-full mx-auto relative z-10 flex flex-col justify-end ${accessDenied ? 'animate-glitch' : ''}`}>
        
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
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-full bg-transparent border-none outline-none text-transparent caret-transparent focus:ring-0 p-0 z-20 absolute inset-0"
                autoFocus
                spellCheck="false"
                autoComplete="off"
              />
              
              {/* Custom Block Cursor matching actual input length */}
              <div className="flex items-center absolute inset-0 z-10 pointer-events-none">
                {/* Changed to preserve spaces and show input text if any */}
                <span className="tracking-[0.1em] whitespace-pre">{input.replace(/./g, (char) => input === CORRECT_PASSWORD ? "*" : char)}</span>
                <span className="inline-block w-[1ch] h-[1.2em] bg-[#00FF41] animate-pulse ml-[1px]" />
              </div>
            </div>
          </form>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes glitch {
          0% { transform: translate(0); text-shadow: none; }
          20% { transform: translate(-2px, 2px); text-shadow: -2px 0 #00e6fe, 2px 0 #ff003c; }
          40% { transform: translate(-2px, -2px); text-shadow: 2px 0 #00e6fe, -2px 0 #ff003c; }
          60% { transform: translate(2px, 2px); text-shadow: -2px 0 #00e6fe, 2px 0 #ff003c; }
          80% { transform: translate(2px, -2px); text-shadow: 2px 0 #00e6fe, -2px 0 #ff003c; }
          100% { transform: translate(0); text-shadow: none; }
        }
        .animate-glitch {
          animation: glitch 0.25s cubic-bezier(.25, .46, .45, .94) both;
          color: #ff003c;
        }
      `}} />
    </div>
  );
}
