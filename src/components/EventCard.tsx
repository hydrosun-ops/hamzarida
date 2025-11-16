import { Card, CardContent } from "@/components/ui/card";
import { DancingFigure } from "./DancingFigure";

interface EventCardProps {
  icon?: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
}

export const EventCard = ({ icon, title, date, time, venue, description }: EventCardProps) => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-4 border-truck-pink shadow-2xl group hover:scale-105 transition-transform duration-500">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, hsl(340, 90%, 65%) 35px, hsl(340, 90%, 65%) 36px),
                           repeating-linear-gradient(-45deg, transparent, transparent 35px, hsl(190, 90%, 45%) 35px, hsl(190, 90%, 45%) 36px)`,
          animation: 'shimmer 8s linear infinite'
        }} />
      </div>
      
      {/* Glowing border effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-truck-pink via-truck-purple to-truck-blue animate-shimmer" style={{
          backgroundSize: '200% 100%',
          filter: 'blur(8px)'
        }} />
      </div>
      
      {/* Corner decorations */}
      <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-truck-yellow opacity-60" />
      <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-truck-pink opacity-60" />
      <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-truck-blue opacity-60" />
      <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-truck-green opacity-60" />
      
      {/* Dancing figures */}
      <DancingFigure delay={0} color="hsl(340, 90%, 65%)" side="left" />
      <DancingFigure delay={0.5} color="hsl(190, 90%, 45%)" side="right" />
      
      <CardContent className="relative p-8 space-y-4 z-10">
        {/* Icon with glow */}
        {icon && (
          <div className="text-7xl mb-4 drop-shadow-[0_0_15px_rgba(255,20,147,0.8)] animate-float">
            {icon}
          </div>
        )}
        
        {/* Title with gradient text */}
        <h3 className="text-3xl font-serif font-bold mb-2 bg-gradient-to-r from-truck-pink via-truck-yellow to-truck-blue bg-clip-text text-transparent drop-shadow-2xl">
          {title}
        </h3>
        
        {/* Decorative line */}
        <div className="h-1 w-24 bg-gradient-to-r from-truck-yellow via-truck-pink to-truck-blue mx-auto mb-4 rounded-full shadow-lg shadow-truck-pink/50" />
        
        <div className="space-y-2 text-lg">
          <p className="text-cyan-300 font-semibold drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
            📅 {date}
          </p>
          <p className="text-yellow-300 font-semibold drop-shadow-[0_0_10px_rgba(255,255,0,0.5)]">
            🕐 {time}
          </p>
          <p className="text-pink-300 font-semibold drop-shadow-[0_0_10px_rgba(255,192,203,0.5)]">
            📍 {venue}
          </p>
        </div>
        
        <p className="text-gray-300 leading-relaxed pt-4 text-base border-t-2 border-truck-purple/30">
          {description}
        </p>
        
        {/* Bottom decorative pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-truck-pink via-truck-yellow via-truck-blue to-truck-green opacity-80" />
      </CardContent>
    </Card>
  );
};
