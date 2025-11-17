import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface NavigationProps {
  currentPage: number;
  totalPages: number;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export const Navigation = ({ currentPage, totalPages, onNavigate }: NavigationProps) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-card/95 backdrop-blur-lg px-6 py-4 rounded-full border-2 border-primary/30 shadow-2xl animate-fade-in">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigate('prev')}
        disabled={currentPage === 0}
        className="rounded-full hover:bg-primary/20 hover:scale-110 transition-all"
      >
        <ChevronUp className="w-6 h-6" />
      </Button>
      
      <div className="flex gap-2.5">
        {Array.from({ length: totalPages }).map((_, index) => (
          <div
            key={index}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentPage
                ? 'w-10 bg-primary shadow-lg shadow-primary/50'
                : 'w-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/60'
            }`}
          />
        ))}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigate('next')}
        disabled={currentPage === totalPages - 1}
        className="rounded-full hover:bg-primary/20 hover:scale-110 transition-all"
      >
        <ChevronDown className="w-6 h-6" />
      </Button>
    </div>
  );
};
