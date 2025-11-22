import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WeddingPageProps {
  children: ReactNode;
  className?: string;
  background?: string;
  backgroundMedia?: string;
}

export const WeddingPage = ({ children, className, background, backgroundMedia }: WeddingPageProps) => {
  return (
    <div
      className={cn(
        "w-full min-h-screen h-auto md:h-screen snap-center flex items-center justify-center p-4 md:p-8 relative overflow-hidden",
        background || "bg-background",
        className
      )}
    >
      {/* Background media (video or image) */}
      {backgroundMedia && (
        <div className="absolute inset-0 z-0">
          {backgroundMedia.match(/\.(mp4|webm|ogg)$/i) ? (
            <video 
              src={backgroundMedia}
              className="w-full h-full object-cover opacity-30"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              // @ts-ignore - fetchpriority is a valid HTML attribute
              fetchpriority="high"
            />
          ) : (
            <img 
              src={backgroundMedia}
              alt="Background"
              className="w-full h-full object-cover opacity-30"
              loading="eager"
              // @ts-ignore - fetchpriority is a valid HTML attribute
              fetchpriority="high"
            />
          )}
        </div>
      )}
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-wedding-emerald rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-wedding-ruby rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 w-full max-w-4xl mx-auto text-center animate-fade-in px-4">
        {children}
      </div>
    </div>
  );
};
