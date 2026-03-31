import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="app-shell">
      <div className="bg-effects" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />
      </div>
      <Outlet />
    </div>
  );
}
