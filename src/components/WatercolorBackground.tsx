import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import karachiSkyline from "@/assets/karachi-skyline.webp";

export const WatercolorBackground = () => {
  const [backgroundUrl, setBackgroundUrl] = useState<string>(karachiSkyline);

  useEffect(() => {
    const fetchBackground = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'watercolor_background')
        .maybeSingle();

      if (data?.setting_value) {
        setBackgroundUrl(data.setting_value);
      }
    };

    fetchBackground();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Animated watercolor painting */}
      <img
        src={backgroundUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-[0.45] animate-fade-in"
        style={{
          mixBlendMode: 'multiply',
          transform: 'scale(1.1)',
          animation: 'watercolor-float 60s ease-in-out infinite',
        }}
        loading="eager"
        // @ts-ignore - fetchpriority is a valid HTML attribute
        fetchpriority="high"
      />
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/60" />
      
      <style>{`
        @keyframes watercolor-float {
          0%, 100% {
            transform: scale(1.1) translateY(0px);
            opacity: 0.45;
          }
          50% {
            transform: scale(1.15) translateY(-10px);
            opacity: 0.40;
          }
        }
      `}</style>
    </div>
  );
};
