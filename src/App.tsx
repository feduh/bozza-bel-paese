import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/Layout";
import RouteFallback from "./components/RouteFallback";
import { RequireAuth, RequireRole } from "./components/RouteGuards";

// Eager: Home and 404 — needed for fast first paint and error states
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy: every other route is code-split into its own chunk
const RealityDetail = lazy(() => import("./pages/RealityDetail"));
const ChiSiamo = lazy(() => import("./pages/ChiSiamo"));
const CosaFacciamo = lazy(() => import("./pages/CosaFacciamo"));
const Mappatura = lazy(() => import("./pages/Mappatura"));
const Blog = lazy(() => import("./pages/Blog"));
const MagazinePost = lazy(() => import("./pages/MagazinePost"));
const Login = lazy(() => import("./pages/Login"));
const Admin = lazy(() => import("./pages/Admin"));
const AreaPersonale = lazy(() => import("./pages/AreaPersonale"));
const ArticoloEditor = lazy(() => import("./pages/ArticoloEditor"));
const RealityGalleryAdmin = lazy(() => import("./pages/RealityGalleryAdmin"));

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
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="ibp-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/chi-siamo" element={<ChiSiamo />} />
                  <Route path="/cosa-facciamo" element={<CosaFacciamo />} />
                  <Route path="/mappatura" element={<Mappatura />} />
                  <Route path="/realta/:id" element={<RealityDetail />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/magazine" element={<Blog />} />
                  <Route path="/magazine/:slug" element={<MagazinePost />} />
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/admin"
                    element={
                      <RequireRole role="admin">
                        <Admin />
                      </RequireRole>
                    }
                  />
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
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
