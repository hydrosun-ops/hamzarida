import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Heart, Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavigationProps {
  currentPage: number;
  totalPages: number;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export const Navigation = ({ currentPage, totalPages, onNavigate }: NavigationProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 md:gap-4 animate-fade-in px-4">
      {/* RSVP Button */}
      <Button
        onClick={() => navigate('/rsvp')}
        size="lg"
        className="bg-[hsl(30,15%,45%)] hover:bg-[hsl(30,15%,40%)] text-white px-6 md:px-10 py-5 md:py-6 text-base md:text-lg rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold whitespace-nowrap"
      >
        RSVP by December 15th
      </Button>

      {/* Navigation Controls - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-3 bg-card/95 backdrop-blur-lg px-4 py-3 rounded-full border border-primary/20 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('prev')}
          disabled={currentPage === 0}
          className="rounded-full hover:bg-primary/20 hover:scale-110 transition-all h-8 w-8"
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
        
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentPage
                  ? 'w-8 bg-primary shadow-lg shadow-primary/50'
                  : 'w-2 bg-muted-foreground/40 hover:bg-muted-foreground/60'
              }`}
            />
          ))}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('next')}
          disabled={currentPage === totalPages - 1}
          className="rounded-full hover:bg-primary/20 hover:scale-110 transition-all h-8 w-8"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Travel Info Button */}
      <Button
        onClick={() => navigate('/travel')}
        size="lg"
        className="bg-white/95 hover:bg-white text-foreground border border-border/30 px-6 md:px-10 py-5 md:py-6 text-base md:text-lg rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold backdrop-blur-lg whitespace-nowrap"
      >
        <Plane className="w-4 h-4 md:w-5 md:h-5 mr-2" />
        Travel Info
      </Button>
    </div>
  );
};
