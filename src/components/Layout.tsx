import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SkipLink from "./SkipLink";
import FloatingBackToTop from "./FloatingBackToTop";
import CookieBanner from "./CookieBanner";

const Layout = () => (
  <div className="min-h-screen flex flex-col">
    <SkipLink />
    <Navbar />
    <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
      <Outlet />
    </main>
    <Footer />
    <FloatingBackToTop />
    <CookieBanner />
  </div>
);

export default Layout;

