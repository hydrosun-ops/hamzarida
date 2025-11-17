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
import { parsePhoneNumber } from 'libphonenumber-js';

const Auth = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
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

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse and normalize phone number
      let normalizedPhone = phone;
      try {
        const phoneNumber = parsePhoneNumber(phone, 'PK');
        if (phoneNumber) {
          normalizedPhone = phoneNumber.format('E.164'); // Format as +923001234567
        }
      } catch {
        toast.error("Please enter a valid phone number");
        setLoading(false);
        return;
      }
      
      // Check if guest exists with this phone number
      const { data: guests, error: guestError } = await supabase
        .from('guests')
        .select('id, name, phone')
        .eq('phone', normalizedPhone);

      if (guestError) throw guestError;

      if (!guests || guests.length === 0) {
        toast.error("Phone number not found in guest list. Please contact the hosts.");
        setLoading(false);
        return;
      }

      // Send OTP via Supabase Auth
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
      });

      if (error) throw error;

      setOtpSent(true);
      toast.success("Verification code sent to your phone!");
    } catch (error: any) {
      toast.error("Failed to send verification code: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse and normalize phone number
      let normalizedPhone = phone;
      try {
        const phoneNumber = parsePhoneNumber(phone, 'PK');
        if (phoneNumber) {
          normalizedPhone = phoneNumber.format('E.164');
        }
      } catch {
        toast.error("Please enter a valid phone number");
        setLoading(false);
        return;
      }

      // Verify OTP
      const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: otp,
        type: 'sms',
      });

      if (verifyError) throw verifyError;

      if (!authData.user) {
        throw new Error("Authentication failed");
      }

      // Link guest record to authenticated user
      const { data: guest, error: guestError } = await supabase
        .from('guests')
        .select('id, name')
        .eq('phone', normalizedPhone)
        .single();

      if (guestError) throw guestError;

      // Update guest record with user_id
      const { error: updateError } = await supabase
        .from('guests')
        .update({ user_id: authData.user.id })
        .eq('id', guest.id);

      if (updateError) throw updateError;

      toast.success(`Welcome, ${guest.name}!`);
      navigate("/wedding");
    } catch (error: any) {
      toast.error("Failed to verify code: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-watercolor-lavender/30 via-background to-watercolor-rose/20 flex items-center justify-center p-4 relative">
      <WatercolorBackground />
      
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-none shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4">
          <Heart className="w-12 h-12 mx-auto text-watercolor-magenta opacity-80" />
          <CardTitle className="text-3xl font-serif text-watercolor-magenta">Welcome</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {otpSent ? "Enter the verification code sent to your phone" : "Secure verification via SMS"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+92 300 1234567"
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
                className="w-full bg-gradient-to-r from-watercolor-magenta to-watercolor-purple hover:from-watercolor-purple hover:to-watercolor-magenta text-white py-6 text-lg shadow-lg"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-base">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="text-lg py-6 text-center tracking-widest"
                />
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code sent to {phone}
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-watercolor-magenta to-watercolor-purple hover:from-watercolor-purple hover:to-watercolor-magenta text-white py-6 text-lg shadow-lg"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
              >
                Change Phone Number
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
