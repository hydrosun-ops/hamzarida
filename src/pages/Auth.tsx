import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { WatercolorBackground } from "@/components/WatercolorBackground";
import { parsePhoneNumber, AsYouType } from 'libphonenumber-js';

const Auth = () => {
  const [phone, setPhone] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/wedding");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/wedding");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handlePhoneChange = (value: string) => {
    // Format as user types
    const formatter = new AsYouType();
    const formatted = formatter.input(value);
    setPhone(value);
    setFormattedPhone(formatted);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse and normalize phone number
      let normalizedPhone = phone;
      try {
        const phoneNumber = parsePhoneNumber(phone);
        if (phoneNumber && phoneNumber.isValid()) {
          normalizedPhone = phoneNumber.format('E.164');
        } else {
          toast.error("Please enter a valid international phone number (e.g., +1 650 382 9927)");
          setLoading(false);
          return;
        }
      } catch {
        toast.error("Please enter a valid international phone number (e.g., +1 650 382 9927)");
        setLoading(false);
        return;
      }
      
      // Check if guest exists with this phone number
      const { data: guests, error: guestError } = await supabase
        .from('guests')
        .select('id, name, phone, user_id')
        .eq('phone', normalizedPhone);

      if (guestError) throw guestError;

      if (!guests || guests.length === 0) {
        toast.error("Phone number not found in guest list. Please contact the hosts.");
        setLoading(false);
        return;
      }

      const guest = guests[0];

      // Sign up or sign in with email/password (using phone as identifier)
      const guestEmail = `${normalizedPhone.replace('+', '')}@wedding.guest`;
      
      // Check if user account already exists
      if (guest.user_id) {
        // User has an account, just sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: guestEmail,
          password: password,
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            toast.error("Incorrect password. Please try again.");
          } else {
            throw signInError;
          }
          setLoading(false);
          return;
        }

        toast.success(`Welcome back, ${guest.name}!`);
      } else {
        // First time user, create account
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: guestEmail,
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/wedding`,
            data: {
              phone: normalizedPhone,
              name: guest.name,
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('User already registered')) {
            toast.error("Account already exists. Please sign in with your password.");
          } else {
            throw signUpError;
          }
          setLoading(false);
          return;
        }

        // Link guest to auth user
        if (authData.user) {
          await supabase
            .from('guests')
            .update({ user_id: authData.user.id })
            .eq('id', guest.id);
        }

        toast.success(`Welcome, ${guest.name}!`);
      }

      navigate("/wedding");
    } catch (error: any) {
      toast.error("Login failed: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <WatercolorBackground />
      <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-card/95 border-2 border-primary/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Heart className="w-16 h-16 text-primary fill-primary animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-serif">Welcome</CardTitle>
          <CardDescription className="text-base">
            Enter your phone number and password to access your invitation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-medium">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 650 382 9927"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                required
                className="text-base h-12 border-2 focus:border-primary"
              />
              {formattedPhone && (
                <p className="text-xs text-muted-foreground">
                  Format: {formattedPhone}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +92 for Pakistan, +1 for USA)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base h-12 border-2 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                First time? Your password will be created automatically
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
