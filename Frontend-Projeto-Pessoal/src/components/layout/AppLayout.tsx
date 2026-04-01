import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../auth/AuthContext";
import { useIsMobile } from "../../hooks/useIsMobile";
import { motion } from "framer-motion";

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
          <div
            className="w-10 h-10 rounded-full border-2 mx-auto mb-4"
            style={{
              borderColor: "rgba(232,160,32,0.2)",
              borderTopColor: "#E8A020",
              animation: "spin 0.7s linear infinite",
            }}
          />
          <p className="text-sm" style={{ color: "#3C3C44" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout relative">
      <Sidebar
        expanded={expanded}
        onToggle={() => setExpanded((e) => !e)}
        isMobile={isMobile}
      />

      <motion.main
        className="relative min-h-screen"
        animate={{
          paddingLeft: isMobile ? 0 : (expanded ? 220 : 60),
          paddingBottom: isMobile ? 60 : 0,
        }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
