export const AnimatedTruck = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-50 overflow-hidden h-32">
      <div className="animate-truck-drive">
        <svg
          viewBox="0 0 200 100"
          className="w-48 h-24"
          style={{
            filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
          }}
        >
          {/* Truck body with colorful patterns */}
          <rect x="40" y="30" width="100" height="40" fill="hsl(340, 90%, 65%)" rx="5" />
          <rect x="45" y="35" width="90" height="30" fill="hsl(52, 100%, 60%)" rx="3" />
          
          {/* Decorative patterns */}
          <circle cx="65" cy="50" r="8" fill="hsl(190, 90%, 45%)" />
          <circle cx="90" cy="50" r="8" fill="hsl(280, 70%, 50%)" />
          <circle cx="115" cy="50" r="8" fill="hsl(145, 75%, 45%)" />
          
          {/* Small flowers on top */}
          <circle cx="60" cy="28" r="3" fill="hsl(330, 85%, 55%)" />
          <circle cx="90" cy="25" r="4" fill="hsl(45, 100%, 55%)" />
          <circle cx="120" cy="28" r="3" fill="hsl(190, 90%, 45%)" />
          
          {/* Cabin */}
          <rect x="10" y="40" width="35" height="30" fill="hsl(25, 100%, 55%)" rx="3" />
          <rect x="15" y="45" width="25" height="15" fill="hsl(190, 90%, 70%)" rx="2" />
          
          {/* Wheels */}
          <circle cx="30" cy="72" r="8" fill="hsl(0, 0%, 20%)" />
          <circle cx="30" cy="72" r="5" fill="hsl(45, 100%, 55%)" />
          <circle cx="120" cy="72" r="8" fill="hsl(0, 0%, 20%)" />
          <circle cx="120" cy="72" r="5" fill="hsl(45, 100%, 55%)" />
          
          {/* Decorative tassels */}
          {[50, 70, 90, 110, 130].map((x, i) => (
            <g key={i}>
              <line x1={x} y1="30" x2={x} y2="22" stroke="hsl(330, 85%, 55%)" strokeWidth="1" />
              <circle cx={x} cy="20" r="2" fill="hsl(280, 70%, 50%)" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
