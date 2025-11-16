interface DancingFigureProps {
  delay?: number;
  color?: string;
  side?: 'left' | 'right';
}

export const DancingFigure = ({ delay = 0, color = "hsl(340, 90%, 65%)", side = 'left' }: DancingFigureProps) => {
  return (
    <div
      className={`absolute ${side === 'left' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 animate-float opacity-60`}
      style={{ animationDelay: `${delay}s` }}
    >
      <svg width="60" height="80" viewBox="0 0 60 80" className="drop-shadow-2xl">
        {/* Head with headpiece */}
        <circle cx="30" cy="15" r="8" fill={color} />
        <path d="M 22 12 Q 30 8 38 12" stroke="hsl(45, 100%, 55%)" strokeWidth="2" fill="none" />
        <circle cx="26" cy="8" r="2" fill="hsl(280, 70%, 50%)" />
        <circle cx="34" cy="8" r="2" fill="hsl(190, 90%, 45%)" />
        
        {/* Body with decorative outfit */}
        <path d="M 30 23 L 25 35 L 20 50 L 25 50 L 30 40 L 35 50 L 40 50 L 35 35 Z" fill={color} />
        <ellipse cx="30" cy="30" rx="8" ry="5" fill="hsl(52, 100%, 60%)" opacity="0.8" />
        
        {/* Arms dancing */}
        <g className="animate-pulse">
          <path d="M 25 28 Q 15 25 12 30" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 35 28 Q 45 25 48 30" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
        
        {/* Hands with bangles */}
        <circle cx="12" cy="30" r="3" fill="hsl(45, 100%, 55%)" />
        <circle cx="48" cy="30" r="3" fill="hsl(45, 100%, 55%)" />
        <circle cx="12" cy="30" r="1.5" fill={color} />
        <circle cx="48" cy="30" r="1.5" fill={color} />
        
        {/* Legs */}
        <path d="M 25 50 L 23 65 L 20 75" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 35 50 L 37 65 L 40 75" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
        
        {/* Decorative patterns */}
        <circle cx="30" cy="35" r="2" fill="hsl(190, 90%, 45%)" />
        <circle cx="26" cy="32" r="1.5" fill="hsl(280, 70%, 50%)" />
        <circle cx="34" cy="32" r="1.5" fill="hsl(280, 70%, 50%)" />
      </svg>
    </div>
  );
};
