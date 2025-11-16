interface SpinningPeacockProps {
  size?: number;
  className?: string;
}

export const SpinningPeacock = ({ size = 80, className = "" }: SpinningPeacockProps) => {
  return (
    <div className={`animate-spin-slow ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Peacock feather pattern */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <g key={i} transform={`rotate(${angle} 50 50)`}>
            {/* Feather */}
            <ellipse
              cx="50"
              cy="25"
              rx="8"
              ry="20"
              fill="hsl(190, 90%, 45%)"
              opacity="0.8"
            />
            {/* Eye of feather */}
            <ellipse
              cx="50"
              cy="20"
              rx="5"
              ry="8"
              fill="hsl(280, 70%, 50%)"
            />
            <circle cx="50" cy="20" r="3" fill="hsl(145, 75%, 45%)" />
            <circle cx="50" cy="20" r="1.5" fill="hsl(0, 0%, 100%)" />
          </g>
        ))}
        
        {/* Center circle */}
        <circle cx="50" cy="50" r="12" fill="hsl(340, 90%, 65%)" />
        <circle cx="50" cy="50" r="8" fill="hsl(52, 100%, 60%)" />
        <circle cx="50" cy="50" r="4" fill="hsl(330, 85%, 55%)" />
      </svg>
    </div>
  );
};
