import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="relative overflow-hidden bg-transparent border-none group transition-all duration-700 hover:scale-[1.02]">
      {/* Watercolor texture overlay */}
      <div className="absolute inset-0 opacity-5 mix-blend-multiply pointer-events-none transition-opacity duration-500 group-hover:opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-watercolor-purple via-watercolor-magenta to-watercolor-orange" 
          style={{ 
            filter: 'blur(80px)',
            transform: 'scale(1.5)'
          }} 
        />
      </div>
      
      {/* Animated gradient border effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-700"
        style={{
          background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.15), rgba(156, 39, 176, 0.15), rgba(255, 152, 0, 0.15))',
          boxShadow: '0 8px 32px rgba(233, 30, 99, 0.1)',
        }}
      />
      
      <CardContent className="relative p-6 md:p-10 space-y-4 md:space-y-6 backdrop-blur-md bg-white/5 rounded-xl">
        {icon && (
          <div className="text-5xl md:text-7xl mb-3 md:mb-4 opacity-90 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
            {icon}
          </div>
        )}
        
        <h3 className="text-2xl md:text-4xl font-serif font-bold text-watercolor-magenta mb-3 md:mb-4 tracking-tight">
          {title}
        </h3>
        
        {/* Elegant divider with animation */}
        <div className="h-0.5 w-12 md:w-20 bg-gradient-to-r from-watercolor-magenta via-watercolor-purple to-transparent mb-4 md:mb-6 transition-all duration-300 group-hover:w-24 md:group-hover:w-32" />
        
        <div className="space-y-3 text-base md:text-lg">
          <div className="flex items-start gap-3 transition-transform duration-200 hover:translate-x-1">
            <span className="text-watercolor-purple font-medium mt-0.5 text-xl md:text-2xl">📅</span>
            <p className="text-foreground/90 font-medium">{date}</p>
          </div>
          <div className="flex items-start gap-3 transition-transform duration-200 hover:translate-x-1">
            <span className="text-watercolor-orange font-medium mt-0.5 text-xl md:text-2xl">🕐</span>
            <p className="text-foreground/90 font-medium">{time}</p>
          </div>
          <div className="flex items-start gap-3 transition-transform duration-200 hover:translate-x-1">
            <span className="text-watercolor-magenta font-medium mt-0.5 text-xl md:text-2xl">📍</span>
            <p className="text-foreground/90 font-medium">{venue}</p>
          </div>
        </div>
        
        <p className="text-foreground/75 leading-relaxed pt-4 md:pt-5 border-t border-border/30 text-base md:text-lg">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};
