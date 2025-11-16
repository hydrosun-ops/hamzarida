import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationProps {
  currentPage: number;
  totalPages: number;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export const Navigation = ({ currentPage, totalPages, onNavigate }: NavigationProps) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-card/80 backdrop-blur-lg px-6 py-3 rounded-full border border-border/50 shadow-xl">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigate('prev')}
        disabled={currentPage === 0}
        className="rounded-full hover:bg-primary/10"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      
      <div className="flex gap-2">
        {Array.from({ length: totalPages }).map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentPage
                ? 'w-8 bg-primary'
                : 'w-2 bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigate('next')}
        disabled={currentPage === totalPages - 1}
        className="rounded-full hover:bg-primary/10"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
};
