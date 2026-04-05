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
              borderColor: "var(--color-accent-gold-subtle)",
              borderTopColor: "var(--color-accent-gold)",
              animation: "spin 0.7s linear infinite",
            }}
          />
          <p className="text-sm text-secondary">Loading...</p>
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
          paddingLeft: isMobile ? 0 : (expanded ? 240 : 72),
          paddingBottom: isMobile ? 68 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
