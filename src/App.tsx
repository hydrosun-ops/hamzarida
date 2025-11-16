import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Wedding from "./pages/Wedding";
import Auth from "./pages/Auth";
import RSVP from "./pages/RSVP";
import Admin from "./pages/Admin";
import AdminSlides from "./pages/AdminSlides";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/wedding" element={<Wedding />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/rsvp" element={<RSVP />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/slides" element={<AdminSlides />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
