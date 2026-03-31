import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../auth/AuthContext";
import { motion } from "framer-motion";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const isMobile = useIsMobile();

  if (!loading && !user) {
    navigate("/login", { replace: true });
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 mx-auto mb-4 animate-spin"
            style={{ borderColor: "rgba(0,240,255,0.2)", borderTopColor: "#00f0ff" }} />
          <p className="text-sm text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout relative">
      {/* Background */}
      <div className="nucleus-bg">
        <div className="nucleus-grid" />
        <div className="nucleus-orb nucleus-orb-1" />
        <div className="nucleus-orb nucleus-orb-2" />
        <div className="nucleus-orb nucleus-orb-3" />
      </div>

      <Sidebar
        expanded={expanded}
        onToggle={() => setExpanded((e) => !e)}
        isMobile={isMobile}
      />

      <motion.main
        className="relative z-10 min-h-screen"
        animate={{
          paddingLeft: isMobile ? 0 : (expanded ? 220 : 60),
          paddingBottom: isMobile ? 60 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
