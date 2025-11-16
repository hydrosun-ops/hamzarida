import { cn } from "@/lib/utils";

interface TruckArtBorderProps {
  className?: string;
  children?: React.ReactNode;
}

export const TruckArtBorder = ({ className, children }: TruckArtBorderProps) => {
  return (
    <div className={cn("relative", className)}>
      {/* Top border with flower pattern */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-truck-pink via-truck-yellow to-truck-blue">
        <div className="absolute inset-0 flex justify-around items-center">
          {[...Array(20)].map((_, i) => (
            <div
              key={`top-${i}`}
              className="w-2 h-2 rounded-full bg-truck-purple animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
      
      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-truck-blue via-truck-green to-truck-pink">
        <div className="absolute inset-0 flex justify-around items-center">
          {[...Array(20)].map((_, i) => (
            <div
              key={`bottom-${i}`}
              className="w-2 h-2 rounded-full bg-truck-yellow animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
      
      {/* Left border */}
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-b from-truck-green via-truck-purple to-truck-orange">
        <div className="absolute inset-0 flex flex-col justify-around items-center">
          {[...Array(15)].map((_, i) => (
            <div
              key={`left-${i}`}
              className="w-2 h-2 rounded-full bg-truck-pink animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
      
      {/* Right border */}
      <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-b from-truck-orange via-truck-yellow to-truck-blue">
        <div className="absolute inset-0 flex flex-col justify-around items-center">
          {[...Array(15)].map((_, i) => (
            <div
              key={`right-${i}`}
              className="w-2 h-2 rounded-full bg-truck-green animate-pulse"
              style={{ animationDelay: `${i * 0.25}s` }}
            />
          ))}
        </div>
      </div>
      
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
