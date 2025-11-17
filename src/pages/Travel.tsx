import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WatercolorBackground } from "@/components/WatercolorBackground";
import { Plane, MapPin, Bus, Info, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Travel = () => {
  const navigate = useNavigate();
  
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

          <Card className="bg-white/95 backdrop-blur-sm border-watercolor-magenta/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-watercolor-magenta">
                <Plane className="w-6 h-6" />
                International Arrival
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Islamabad International Airport (ISB)</h3>
                <p className="text-muted-foreground">
                  All international guests should arrive into and depart from Islamabad International Airport (ISB).
                  This is the main gateway for all wedding events.
                </p>
              </div>
              
              <div className="p-4 bg-watercolor-lavender/10 rounded-lg border border-watercolor-magenta/10">
                <p className="text-sm">
                  <strong>Airport Code:</strong> ISB (Islamabad International Airport)<br />
                  <strong>Location:</strong> Located approximately 30km from Islamabad city center
                </p>
              </div>
            </CardContent>
          </Card>

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
