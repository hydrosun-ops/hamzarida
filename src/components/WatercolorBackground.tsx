import karachiSkyline from "@/assets/karachi-skyline.webp";

export const WatercolorBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Animated watercolor painting */}
      <div 
        className="absolute inset-0 opacity-[0.15] animate-fade-in"
        style={{
          backgroundImage: `url(${karachiSkyline})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          mixBlendMode: 'multiply',
          transform: 'scale(1.1)',
          animation: 'watercolor-float 60s ease-in-out infinite',
        }}
      />
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/60" />
      
      <style>{`
        @keyframes watercolor-float {
          0%, 100% {
            transform: scale(1.1) translateY(0px);
            opacity: 0.15;
          }
          50% {
            transform: scale(1.15) translateY(-10px);
            opacity: 0.12;
          }
        }
      `}</style>
    </div>
  );
};
