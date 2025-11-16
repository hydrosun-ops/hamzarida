interface FloatingFlowersProps {
  count?: number;
}

export const FloatingFlowers = ({ count = 8 }: FloatingFlowersProps) => {
  const colors = [
    "hsl(340, 90%, 65%)",
    "hsl(190, 90%, 45%)",
    "hsl(52, 100%, 60%)",
    "hsl(145, 75%, 45%)",
    "hsl(280, 70%, 50%)",
    "hsl(330, 85%, 55%)",
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {[...Array(count)].map((_, i) => {
        const randomDelay = Math.random() * 3;
        const randomDuration = 3 + Math.random() * 2;
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomSize = 20 + Math.random() * 30;

        return (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${randomX}%`,
              top: `${randomY}%`,
              animationDelay: `${randomDelay}s`,
              animationDuration: `${randomDuration}s`,
            }}
          >
            <svg width={randomSize} height={randomSize} viewBox="0 0 50 50">
              {/* Flower petals */}
              <circle cx="25" cy="15" r="8" fill={randomColor} opacity="0.8" />
              <circle cx="35" cy="25" r="8" fill={randomColor} opacity="0.8" />
              <circle cx="25" cy="35" r="8" fill={randomColor} opacity="0.8" />
              <circle cx="15" cy="25" r="8" fill={randomColor} opacity="0.8" />
              {/* Center */}
              <circle cx="25" cy="25" r="6" fill="hsl(45, 100%, 55%)" />
            </svg>
          </div>
        );
      })}
    </div>
  );
};
