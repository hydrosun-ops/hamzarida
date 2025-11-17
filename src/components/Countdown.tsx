import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface CountdownProps {
  targetDate: Date;
  eventName?: string;
}

export const Countdown = ({ targetDate, eventName = "the wedding" }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
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
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <Card
            key={unit}
            className="p-6 text-center bg-gradient-to-br from-white/90 to-watercolor-lavender/20 backdrop-blur-sm border-watercolor-magenta/20 hover:shadow-xl transition-all duration-300"
          >
            <div className="text-4xl md:text-5xl font-bold text-watercolor-magenta mb-2">
              {value.toString().padStart(2, '0')}
            </div>
            <div className="text-sm md:text-base text-muted-foreground capitalize">
              {unit}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
