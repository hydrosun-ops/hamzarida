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
    <Card className="relative overflow-hidden bg-transparent border-none group transition-all duration-700">
      {/* Watercolor texture overlay */}
      <div className="absolute inset-0 opacity-5 mix-blend-multiply pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-watercolor-purple via-watercolor-magenta to-watercolor-orange" 
          style={{ 
            filter: 'blur(80px)',
            transform: 'scale(1.5)'
          }} 
        />
      </div>
      
      {/* Subtle gradient border effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1), rgba(156, 39, 176, 0.1), rgba(255, 152, 0, 0.1))',
        }}
      />
      
      <CardContent className="relative p-10 space-y-6">
        {icon && (
          <div className="text-6xl mb-4 opacity-80 transition-transform duration-500 group-hover:scale-110">
            {icon}
          </div>
        )}
        
        <h3 className="text-3xl font-serif font-bold text-watercolor-magenta mb-4 tracking-tight">
          {title}
        </h3>
        
        {/* Elegant divider */}
        <div className="h-px w-16 bg-gradient-to-r from-watercolor-magenta/50 to-transparent mb-6" />
        
        <div className="space-y-3 text-base">
          <div className="flex items-start gap-3">
            <span className="text-watercolor-purple font-medium mt-0.5">📅</span>
            <p className="text-foreground/80">{date}</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-watercolor-orange font-medium mt-0.5">🕐</span>
            <p className="text-foreground/80">{time}</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-watercolor-magenta font-medium mt-0.5">📍</span>
            <p className="text-foreground/80">{venue}</p>
          </div>
        </div>
        
        <p className="text-muted-foreground leading-relaxed pt-4 border-t border-border/30">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};
