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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/wedding");
      }
    });
    // Note: No onAuthStateChange listener here to avoid navigation conflicts
    // Index.tsx and Wedding.tsx handle routing after authentication
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
    
    // Password validation - only for new users creating accounts
    if (isNewUser) {
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
      }
      
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

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
        navigate("/wedding");
      } else {
        // First time user, try to create account
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
          // If account already exists but wasn't linked, sign in and link it
          if (signUpError.message.includes('User already registered')) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: guestEmail,
              password: password,
            });

            if (signInError) {
              toast.error("Account exists but password is incorrect. Please try again or contact the hosts.");
              setLoading(false);
              return;
            }

            // Link the authenticated user to the guest
            if (signInData.user) {
              const { error: guestUpdateError } = await supabase
                .from('guests')
                .update({ user_id: signInData.user.id })
                .eq('id', guest.id);

              if (guestUpdateError) {
                console.error("Failed to link guest to user:", guestUpdateError);
              }

              // Create user role entry
              const { error: roleError } = await supabase
                .from('user_roles')
                .insert({
                  guest_id: guest.id,
                  user_id: signInData.user.id,
                  role: 'user'
                });

              if (roleError && !roleError.message.includes('duplicate')) {
                console.error("Failed to create user role:", roleError);
              }
            }

            toast.success(`Welcome back, ${guest.name}!`);
            navigate("/wedding");
            setLoading(false);
            return;
          } else {
            throw signUpError;
          }
        }

        // Link guest to auth user and create user role
        if (authData.user) {
          // Update guest with user_id
          const { error: guestUpdateError } = await supabase
            .from('guests')
            .update({ user_id: authData.user.id })
            .eq('id', guest.id);

          if (guestUpdateError) {
            console.error("Failed to link guest to user:", guestUpdateError);
            toast.error("Account created but failed to link to guest profile. Please contact support.");
            setLoading(false);
            return;
          }

          // Create user role entry
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              guest_id: guest.id,
              user_id: authData.user.id,
              role: 'user'
            });

          if (roleError) {
            console.error("Failed to create user role:", roleError);
            // Don't block login for role creation failure, but log it
          }
        }

        toast.success(`Welcome, ${guest.name}!`);
        navigate("/wedding");
      }
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
                placeholder={isNewUser ? "Enter your password (min 8 characters)" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isNewUser ? 8 : undefined}
                className="text-base h-12 border-2 focus:border-primary"
              />
              {isNewUser && password && password.length < 8 && (
                <p className="text-xs text-destructive">
                  Password must be at least 8 characters
                </p>
              )}
              {!isNewUser && (
                <p className="text-xs text-muted-foreground">
                  Enter your existing password to sign in
                </p>
              )}
            </div>
            {isNewUser && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-base font-medium">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="text-base h-12 border-2 focus:border-primary"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive">
                    Passwords do not match
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  First time? Create a secure password
                </p>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Forgot your password?{" "}
                <span className="font-medium text-primary">
                  Please contact the hosts for assistance
                </span>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
