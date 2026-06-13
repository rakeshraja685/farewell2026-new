import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/layout/Layout";
import LandingPage from "./pages/LandingPage";
import ClassYearbook from "./pages/ClassYearbook";
import FarewellMessages from "./pages/FarewellMessages";
import Gallery from "./pages/Gallery";
import Classroom from "./pages/Classroom";
import Videos from "./pages/Videos";
import Login from "./pages/Login";

// Scroll-to-top on route change + scroll progress bar
function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  useEffect(() => {
    let bar = document.getElementById("scroll-progress");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "scroll-progress";
      document.body.prepend(bar);
    }

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${pct}%`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}

// Guard: redirect to /login if not authenticated via sessionStorage
function PrivateRoute({ children }) {
  const isAuth = sessionStorage.getItem("farewell_auth") === "true";
  return isAuth ? children : <Navigate to="/login" replace />;
}

function App() {
  // Track auth state reactively so navigation triggers re-render
  const [isAuth, setIsAuth] = useState(
    () => sessionStorage.getItem("farewell_auth") === "true"
  );

  // Listen for sessionStorage changes (e.g. after login navigates back)
  useEffect(() => {
    const check = () =>
      setIsAuth(sessionStorage.getItem("farewell_auth") === "true");
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);

  return (
    <BrowserRouter>
      <ScrollManager />
      <Routes>
        {/* Public: login */}
        <Route
          path="/login"
          element={isAuth ? <Navigate to="/" replace /> : <Login />}
        />

        {/* Private: Classroom is full-screen immersive, no layout wrapper */}
        <Route
          path="/classroom"
          element={
            <PrivateRoute>
              <Classroom />
            </PrivateRoute>
          }
        />

        {/* Private: everything else inside Layout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<LandingPage />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="yearbook" element={<ClassYearbook />} />
          <Route path="messages" element={<FarewellMessages />} />
          <Route path="videos" element={<Videos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
