import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavigationProps {
  currentPage: number;
  totalPages: number;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export const Navigation = ({ currentPage, totalPages, onNavigate }: NavigationProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 animate-fade-in">
      {/* Navigation Controls */}
      <div className="flex items-center gap-3 md:gap-4 bg-card/95 backdrop-blur-lg px-4 md:px-6 py-3 md:py-4 rounded-full border-2 border-primary/30 shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('prev')}
          disabled={currentPage === 0}
          className="rounded-full hover:bg-primary/20 hover:scale-110 transition-all h-8 w-8 md:h-10 md:w-10"
        >
          <ChevronUp className="w-4 h-4 md:w-6 md:h-6" />
        </Button>
        
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <div
              key={index}
              className={`h-2 md:h-2.5 rounded-full transition-all duration-300 ${
                index === currentPage
                  ? 'w-8 md:w-10 bg-primary shadow-lg shadow-primary/50'
                  : 'w-2 md:w-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/60'
              }`}
            />
          ))}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('next')}
          disabled={currentPage === totalPages - 1}
          className="rounded-full hover:bg-primary/20 hover:scale-110 transition-all h-8 w-8 md:h-10 md:w-10"
        >
          <ChevronDown className="w-4 h-4 md:w-6 md:h-6" />
        </Button>
      </div>

      {/* RSVP Button */}
      <Button
        onClick={() => navigate('/rsvp')}
        size="lg"
        className="bg-gradient-to-r from-watercolor-magenta to-watercolor-purple hover:from-watercolor-purple hover:to-watercolor-magenta text-white px-6 md:px-8 py-4 md:py-5 text-base md:text-lg rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-500 font-semibold"
      >
        <Heart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
        RSVP Now
      </Button>
    </div>
  );
};
