import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BottomNavigation } from "./BottomNavigation";

export function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)]">
      <Navbar />
      <main className="flex-1 pt-12 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
