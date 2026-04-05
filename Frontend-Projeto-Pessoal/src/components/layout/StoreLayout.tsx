import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)]">
      <Navbar />
      <main className="flex-1 pt-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
