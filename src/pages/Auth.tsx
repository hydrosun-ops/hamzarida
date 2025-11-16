import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Heart } from "lucide-react";

const Auth = () => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up phone number (remove spaces, dashes, etc)
      const cleanPhone = phone.replace(/[\s\-()]/g, '');
      
      // Check if phone exists in guests table
      const { data: guest, error } = await supabase
        .from('guests')
        .select('id, name, phone')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (error) throw error;

      if (!guest) {
        toast.error("Access code not found. Please check your phone number.");
        setLoading(false);
        return;
      }

      // Store guest info in localStorage
      localStorage.setItem('guestId', guest.id);
      localStorage.setItem('guestName', guest.name);
      localStorage.setItem('guestPhone', guest.phone);

      toast.success(`Welcome, ${guest.name}!`);
      navigate("/wedding");
    } catch (error: any) {
      toast.error("Failed to verify access code");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-truck-yellow via-truck-pink to-truck-blue flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative spinning peacocks in background */}
      <div className="absolute top-10 left-10 opacity-20">
        <div className="animate-spin-slow">
          <svg width="150" height="150" viewBox="0 0 100 100">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <g key={i} transform={`rotate(${angle} 50 50)`}>
                <ellipse cx="50" cy="25" rx="8" ry="20" fill="hsl(190, 90%, 45%)" opacity="0.8" />
                <ellipse cx="50" cy="20" rx="5" ry="8" fill="hsl(280, 70%, 50%)" />
                <circle cx="50" cy="20" r="3" fill="hsl(145, 75%, 45%)" />
              </g>
            ))}
            <circle cx="50" cy="50" r="12" fill="hsl(340, 90%, 65%)" />
          </svg>
        </div>
      </div>
      
      <div className="absolute bottom-10 right-10 opacity-20">
        <div className="animate-spin-slow" style={{ animationDirection: 'reverse' }}>
          <svg width="120" height="120" viewBox="0 0 100 100">
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <g key={i} transform={`rotate(${angle} 50 50)`}>
                <ellipse cx="50" cy="25" rx="8" ry="20" fill="hsl(52, 100%, 60%)" opacity="0.8" />
                <circle cx="50" cy="20" r="4" fill="hsl(330, 85%, 55%)" />
              </g>
            ))}
            <circle cx="50" cy="50" r="10" fill="hsl(190, 90%, 45%)" />
          </svg>
        </div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 bg-card/95 backdrop-blur-sm border-4 border-truck-pink shadow-2xl">
        <div className="absolute inset-0 pointer-events-none">
          {/* Decorative corner flowers */}
          <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-truck-yellow animate-pulse" />
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-truck-blue animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-truck-green animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-truck-purple animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
        
        <CardHeader className="text-center space-y-4">
          <Heart className="w-12 h-12 mx-auto text-truck-pink animate-pulse" />
          <CardTitle className="text-3xl font-serif bg-gradient-to-r from-truck-pink to-truck-purple bg-clip-text text-transparent">Welcome</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Enter your access code to view your invitation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAccess} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base">
                Access Code (Your Phone Number)
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="text-lg py-6"
              />
              <p className="text-sm text-muted-foreground">
                Enter the phone number you provided when you were invited
              </p>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-truck-pink via-truck-purple to-truck-blue hover:from-truck-blue hover:to-truck-pink text-white py-6 text-lg border-2 border-truck-yellow shadow-lg hover:shadow-2xl transition-all"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Enter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
