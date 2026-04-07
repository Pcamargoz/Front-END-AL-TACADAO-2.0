import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function StoreLayout() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "var(--navbar-height)", minHeight: "100vh" }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
