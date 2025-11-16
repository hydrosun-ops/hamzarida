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
    <div className="min-h-screen bg-gradient-to-br from-wedding-cream via-background to-wedding-cream flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-wedding-emerald rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-wedding-ruby rounded-full blur-3xl" />
      </div>
      
      <Card className="w-full max-w-md relative z-10 bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center space-y-4">
          <Heart className="w-12 h-12 mx-auto text-secondary animate-pulse" />
          <CardTitle className="text-3xl font-serif">Welcome</CardTitle>
          <CardDescription className="text-base">
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
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
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
