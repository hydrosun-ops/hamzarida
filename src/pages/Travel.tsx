import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WatercolorBackground } from "@/components/WatercolorBackground";
import { Plane, MapPin, Bus, Info, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface TravelInfo {
  id: string;
  section_type: string;
  title: string;
  subtitle: string | null;
  content: string | null;
  icon_emoji: string | null;
  display_order: number;
}

const Travel = () => {
  const navigate = useNavigate();
  const [travelSections, setTravelSections] = useState<TravelInfo[]>([]);

  useEffect(() => {
    fetchTravelInfo();
  }, []);

  const fetchTravelInfo = async () => {
    const { data, error } = await supabase
      .from('travel_info')
      .select('*')
      .order('display_order');
    
    if (error) {
      console.error('Error fetching travel info:', error);
      return;
    }
    
    setTravelSections(data || []);
  };

  const getIconComponent = (sectionType: string) => {
    switch (sectionType) {
      case 'airport':
        return <Plane className="w-6 h-6" />;
      case 'transportation':
        return <Bus className="w-6 h-6" />;
      case 'important':
        return <Info className="w-6 h-6" />;
      case 'contact':
        return <MapPin className="w-6 h-6" />;
      default:
        return <Info className="w-6 h-6" />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-watercolor-lavender/30 via-background to-watercolor-rose/20 relative">
      <WatercolorBackground />
      <Button
        onClick={() => navigate('/wedding')}
        variant="ghost"
        className="fixed top-4 left-4 z-50"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-5xl md:text-6xl font-serif text-watercolor-magenta animate-fade-in">
              Travel Information
            </h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know for your journey to Pakistan
            </p>
          </div>

          {travelSections.map((section) => (
            <Card key={section.id} className="bg-white/95 backdrop-blur-sm border-watercolor-magenta/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-watercolor-magenta">
                  {getIconComponent(section.section_type)}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.subtitle && (
                  <p className="text-muted-foreground font-medium">{section.subtitle}</p>
                )}
                {section.content && (
                  <div className="prose prose-sm max-w-none">
                    {section.content.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="text-muted-foreground whitespace-pre-line mb-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Card className="bg-white/95 backdrop-blur-sm border-watercolor-magenta/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-watercolor-magenta">
                <Bus className="w-6 h-6" />
                Local Transportation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Don't worry about getting around - we've got you covered!
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-watercolor-magenta mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Airport Transfers</h4>
                    <p className="text-sm text-muted-foreground">
                      Transportation from Islamabad International Airport to your hotel will be provided.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Bus className="w-5 h-5 text-watercolor-magenta mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Event Transportation</h4>
                    <p className="text-sm text-muted-foreground">
                      Internal transport between hotels and all wedding venues will be arranged for all guests.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Plane className="w-5 h-5 text-watercolor-magenta mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Departure</h4>
                    <p className="text-sm text-muted-foreground">
                      Return transportation to Islamabad International Airport will be provided for your departure.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-watercolor-magenta/10 to-watercolor-purple/10 backdrop-blur-sm border-watercolor-magenta/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-watercolor-magenta">
                <Info className="w-6 h-6" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Please share your flight details with us once booked</li>
                <li>Visa requirements vary by country - check Pakistan visa requirements for your nationality</li>
                <li>Transportation schedules will be shared closer to the wedding dates</li>
                <li>For any travel-related questions, please contact the hosts</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Travel;
