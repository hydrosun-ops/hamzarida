import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WeddingPageProps {
  children: ReactNode;
  className?: string;
  background?: string;
}

export const WeddingPage = ({ children, className, background }: WeddingPageProps) => {
  return (
    <div
      className={cn(
        "min-w-full h-screen snap-center flex items-center justify-center p-8 relative overflow-hidden",
        background || "bg-background",
        className
      )}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-wedding-emerald rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-wedding-ruby rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto text-center animate-fade-in">
        {children}
      </div>
    </div>
  );
};
