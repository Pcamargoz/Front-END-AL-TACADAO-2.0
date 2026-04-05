import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      {/* pt-14 = 56px navbar height */}
      <main className="flex-1 pt-14">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
