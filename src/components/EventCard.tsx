import { Card } from "@/components/ui/card";
import { Calendar, MapPin, Clock } from "lucide-react";

interface EventCardProps {
  date: string;
  title: string;
  venue: string;
  time: string;
  description: string;
  icon?: string;
}

export const EventCard = ({ date, title, venue, time, description, icon }: EventCardProps) => {
  return (
    <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary transition-all duration-300 hover:shadow-xl">
      <div className="space-y-6">
        {icon && <div className="text-6xl mb-4">{icon}</div>}
        <div className="space-y-2">
          <h3 className="text-3xl font-serif font-bold text-primary">{title}</h3>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{date}</span>
          </div>
        </div>
        
        <div className="space-y-3 text-left">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-foreground">{venue}</p>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-foreground">{time}</p>
          </div>
        </div>
        
        <p className="text-muted-foreground text-left leading-relaxed">{description}</p>
      </div>
    </Card>
  );
};
