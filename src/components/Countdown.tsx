import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface CountdownProps {
  targetDate: Date;
  eventName?: string;
}

export const Countdown = ({ targetDate, eventName = "the wedding" }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-2xl font-serif text-center mb-6 text-watercolor-magenta">
        Countdown to {eventName}
      </h3>
      <div className="flex justify-center">
        <Card className="p-8 text-center bg-gradient-to-br from-white/90 to-watercolor-lavender/20 backdrop-blur-sm border-watercolor-magenta/20 hover:shadow-xl transition-all duration-300 min-w-[200px]">
          <div className="text-6xl md:text-7xl font-bold text-watercolor-magenta mb-3">
            {timeLeft.days}
          </div>
          <div className="text-lg md:text-xl text-muted-foreground">
            Days
          </div>
        </Card>
      </div>
    </div>
  );
};
