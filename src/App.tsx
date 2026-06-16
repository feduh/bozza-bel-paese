import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/Layout";
import RouteFallback from "./components/RouteFallback";
import ScrollToTop from "./components/ScrollToTop";
import { RequireAuth } from "./components/RouteGuards";

// Eager: Home and 404 — needed for fast first paint and error states
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy: every other route is code-split into its own chunk
const RealityDetail = lazy(() => import("./pages/RealityDetail"));

const CosaFacciamo = lazy(() => import("./pages/CosaFacciamo"));
const Mappatura = lazy(() => import("./pages/Mappatura"));
const Blog = lazy(() => import("./pages/Blog"));
const MagazinePost = lazy(() => import("./pages/MagazinePost"));
const Login = lazy(() => import("./pages/Login"));

const AreaPersonale = lazy(() => import("./pages/AreaPersonale"));
const ArticoloEditor = lazy(() => import("./pages/ArticoloEditor"));
const RealityGalleryAdmin = lazy(() => import("./pages/RealityGalleryAdmin"));
const LaRete = lazy(() => import("./pages/LaRete"));
const AutoreProfilo = lazy(() => import("./pages/AutoreProfilo"));
const SegnalaRealta = lazy(() => import("./pages/SegnalaRealta"));
const Contatti = lazy(() => import("./pages/Contatti"));
const Privacy = lazy(() => import("./pages/Privacy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Termini = lazy(() => import("./pages/Termini"));
const PasswordDimenticata = lazy(() => import("./pages/PasswordDimenticata"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/chi-siamo" element={<Navigate to="/la-rete" replace />} />
                  <Route path="/cosa-facciamo" element={<CosaFacciamo />} />
                  <Route path="/mappatura" element={<Mappatura />} />
                  <Route path="/realta/:id" element={<RealityDetail />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/magazine" element={<Blog />} />
                  <Route path="/magazine/:slug" element={<MagazinePost />} />
                  <Route path="/la-rete" element={<LaRete />} />
                  <Route path="/autori/:userId" element={<AutoreProfilo />} />
                  <Route path="/segnala-realta" element={<SegnalaRealta />} />
                  <Route path="/contatti" element={<Contatti />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/cookie-policy" element={<CookiePolicy />} />
                  <Route path="/termini" element={<Termini />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/password-dimenticata" element={<PasswordDimenticata />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/admin" element={<Navigate to="/area-personale?tab=admin" replace />} />
                  <Route
                    path="/area-personale"
                    element={
                      <RequireAuth>
                        <AreaPersonale />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/area-personale/articolo/nuovo"
                    element={
                      <RequireAuth>
                        <ArticoloEditor />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/area-personale/articolo/:id/modifica"
                    element={
                      <RequireAuth>
                        <ArticoloEditor />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/admin/realta/:id/galleria"
                    element={
                      <RequireAuth>
                        <RealityGalleryAdmin />
                      </RequireAuth>
                    }
                  />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
  </QueryClientProvider>
);

export default App;
