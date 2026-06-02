import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CORRECT_PASSWORD = "Admin@123";

export default function Login() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [mascotState, setMascotState] = useState("idle");
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  let pupilX = 0;
  let pupilY = 0;
  if (typeof window !== "undefined") {
    pupilX = (mousePos.x / window.innerWidth - 0.5) * 12;
    pupilY = (mousePos.y / window.innerHeight - 0.5) * 12;

    const maxR = 6;
    const dist = Math.sqrt(pupilX * pupilX + pupilY * pupilY);
    if (dist > maxR) {
      pupilX = (pupilX / dist) * maxR;
      pupilY = (pupilY / dist) * maxR;
    }
  }

  const visualState = 
    mascotState !== "idle" 
      ? mascotState 
      : (isPasswordFocused && !showPassword) ? "hiding" : "idle";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (password === CORRECT_PASSWORD) {
        setMascotState("happy");
        setTimeout(() => {
          sessionStorage.setItem("farewell_auth", "true");
          navigate("/");
        }, 1200);
      } else {
        setMascotState("error");
        // Professional error message
        setError("The password entered is incorrect. Please verify your credentials and try again.");
        setTimeout(() => setMascotState("idle"), 3000);
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent-rose/20 blur-[120px] pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: '5s' }} />
      <div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] rounded-full bg-accent-cyan/10 blur-[100px] pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />

      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl backdrop-saturate-150 p-10 rounded-[2.5rem] shadow-2xl border border-white/10 flex flex-col items-center animate-slideUp">
        {/* Interactive Mascot */}
        <div className="relative w-24 h-24 mb-6 transition-transform duration-300 hover:scale-105" aria-hidden="true">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible drop-shadow-[0_0_15px_rgba(139,92,246,0.3)] animate-float">
            <defs>
              <linearGradient id="brandGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6" />
                <stop offset="0.5" stopColor="#F43F5E" />
                <stop offset="1" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
            
            <path d="M28 45 L 20 20 L 45 35 Z" fill="url(#brandGrad)" />
            <path d="M72 45 L 80 20 L 55 35 Z" fill="url(#brandGrad)" />
            
            <path d="M25 60 C 25 30, 75 30, 75 60 C 75 90, 25 90, 25 60 Z" fill="#0A0A0A" stroke="url(#brandGrad)" strokeWidth="2" />
            
            <g transform="translate(34, -5) scale(0.5)">
              <path d="M32 8L8 20v4l24 12 24-12v-4L32 8z" fill="url(#brandGrad)" />
              <path d="M20 27v12c0 5 5.4 9 12 9s12-4 12-9V27L32 33 20 27z" fill="url(#brandGrad)" opacity="0.85" />
              <rect x="52" y="22" width="3" height="14" rx="1.5" fill="url(#brandGrad)" />
              <circle cx="53.5" cy="37" r="2.5" fill="#FFF" />
            </g>

            {visualState === "happy" && (
              <>
                <path d="M 33 55 Q 38 48 43 55" stroke="url(#brandGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M 57 55 Q 62 48 67 55" stroke="url(#brandGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M 18 65 Q 5 45 15 30" stroke="url(#brandGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
                <path d="M 82 65 Q 95 45 85 30" stroke="url(#brandGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
              </>
            )}

            {visualState === "error" && (
              <>
                <path d="M 32 50 L 44 55" stroke="url(#brandGrad)" strokeWidth="3" strokeLinecap="round" />
                <path d="M 68 50 L 56 55" stroke="url(#brandGrad)" strokeWidth="3" strokeLinecap="round" />
                <circle cx="38" cy="56" r="3" fill="#F43F5E" />
                <circle cx="62" cy="56" r="3" fill="#F43F5E" />
                <path d="M 41 60 Q 43 65 41 65 Q 39 65 41 60" fill="#06B6D4" />
                <path d="M 18 65 Q 25 75 22 85" stroke="url(#brandGrad)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8" />
                <path d="M 82 65 Q 75 75 78 85" stroke="url(#brandGrad)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8" />
              </>
            )}

            {visualState === "hiding" && (
              <>
                <path d="M 33 55 Q 38 60 43 55" stroke="url(#brandGrad)" strokeWidth="3" strokeLinecap="round" />
                <path d="M 57 55 Q 62 60 67 55" stroke="url(#brandGrad)" strokeWidth="3" strokeLinecap="round" />
                <path d="M 10 80 Q 30 45 45 55" stroke="url(#brandGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
                <path d="M 90 80 Q 70 45 55 55" stroke="url(#brandGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
              </>
            )}

            {visualState === "idle" && (
              <>
                <circle cx="38" cy="53" r="11" fill="#000" stroke="url(#brandGrad)" strokeWidth="2" />
                <circle cx="62" cy="53" r="11" fill="#000" stroke="url(#brandGrad)" strokeWidth="2" />
                <circle cx={38 + pupilX} cy={53 + pupilY} r="5" fill="url(#brandGrad)" />
                <circle cx={62 + pupilX} cy={53 + pupilY} r="5" fill="url(#brandGrad)" />
                <circle cx={38 + pupilX - 1.5} cy={53 + pupilY - 1.5} r="1.5" fill="#FFF" opacity="0.9" />
                <circle cx={62 + pupilX - 1.5} cy={53 + pupilY - 1.5} r="1.5" fill="#FFF" opacity="0.9" />
                <path d="M 18 65 Q 10 80 20 90" stroke="url(#brandGrad)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5" />
                <path d="M 82 65 Q 90 80 80 90" stroke="url(#brandGrad)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5" />
              </>
            )}

            {visualState === "happy" ? (
              <path d="M 45 64 Q 50 74 55 64 Z" fill="url(#brandGrad)" />
            ) : visualState === "error" ? (
              <path d="M 46 68 L 54 68 L 50 64 Z" fill="url(#brandGrad)" />
            ) : (
              <path d="M 46 64 L 54 64 L 50 72 Z" fill="url(#brandGrad)" />
            )}
          </svg>
        </div>

        <h1 className="font-display text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-rose to-accent-cyan animate-gradient-pan text-center">
          Welcome Back
        </h1>
        <p className="font-body text-sm text-on-surface-variant mb-8 text-center font-medium">
          Class Farewell Tribute • Batch 2026
        </p>

        <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="login-password" className="font-sans text-[11px] font-bold tracking-[0.15em] text-on-surface-variant uppercase ml-1">
              Access Password
            </label>
            <div className="relative group">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className={`w-full bg-surface-container/30 border ${error ? 'border-accent-rose focus:border-accent-rose' : 'border-white/10 focus:border-primary/50'} rounded-2xl px-5 py-4 text-white font-body text-[15px] outline-none focus:bg-white/5 transition-all duration-300 placeholder:text-white/20`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                required
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                )}
              </button>
            </div>
          </div>

          <div className="h-6 -mt-3 flex items-center justify-center overflow-hidden">
            {error && (
              <p className="font-body text-sm text-accent-rose text-center animate-slideUp leading-tight">
                {error}
              </p>
            )}
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className={`w-full py-4 rounded-2xl font-sans font-bold text-xs tracking-[0.15em] uppercase text-white bg-gradient-to-r from-primary via-accent-rose to-accent-cyan animate-gradient-pan bouncy-hover hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all duration-300 flex items-center justify-center ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Enter Experience"
            )}
          </button>
        </form>

        <p className="font-serif italic text-xs text-on-surface-variant/60 text-center mt-8">
          "A tribute to the class of 2026 — memories that last forever."
        </p>
      </div>
    </div>
  );
}
