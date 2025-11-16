import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Heart, ArrowLeft } from "lucide-react";

const RSVP = () => {
  const [loading, setLoading] = useState(false);
  const [guestId, setGuestId] = useState<string>("");
  const [existingRsvp, setExistingRsvp] = useState<any>(null);
  const [attending, setAttending] = useState(true);
  const [includingTrek, setIncludingTrek] = useState(false);
  const [plusOne, setPlusOne] = useState(false);
  const [plusOneName, setPlusOneName] = useState("");
  const [dietaryRequirements, setDietaryRequirements] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGuestAndRsvp = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: guest } = await supabase
        .from('guests')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (guest) {
        setGuestId(guest.id);

        const { data: rsvp } = await supabase
          .from('rsvps')
          .select('*')
          .eq('guest_id', guest.id)
          .maybeSingle();

        if (rsvp) {
          setExistingRsvp(rsvp);
          setAttending(rsvp.attending);
          setIncludingTrek(rsvp.including_trek || false);
          setPlusOne(rsvp.plus_one || false);
          setPlusOneName(rsvp.plus_one_name || "");
          setDietaryRequirements(rsvp.dietary_requirements || "");
        }
      }
    };

    fetchGuestAndRsvp();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const rsvpData = {
        guest_id: guestId,
        attending,
        including_trek: includingTrek,
        plus_one: plusOne,
        plus_one_name: plusOne ? plusOneName : null,
        dietary_requirements: dietaryRequirements || null,
      };

      if (existingRsvp) {
        const { error } = await supabase
          .from('rsvps')
          .update(rsvpData)
          .eq('id', existingRsvp.id);

        if (error) throw error;
        toast.success("RSVP updated successfully!");
      } else {
        const { error } = await supabase
          .from('rsvps')
          .insert([rsvpData]);

        if (error) throw error;
        toast.success("RSVP submitted successfully!");
      }

      navigate('/');
    } catch (error: any) {
      toast.error(error.message || "Failed to submit RSVP");
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

      <Card className="w-full max-w-2xl relative z-10 bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="absolute left-4 top-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Heart className="w-12 h-12 mx-auto text-secondary" />
          <CardTitle className="text-4xl font-serif">RSVP</CardTitle>
          <CardDescription>
            Please respond by December 15th, 2024
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="attending" className="text-base font-semibold">
                  Will you be attending?
                </Label>
                <p className="text-sm text-muted-foreground">
                  March 25-29, 2025
                </p>
              </div>
              <Switch
                id="attending"
                checked={attending}
                onCheckedChange={setAttending}
              />
            </div>

            {attending && (
              <>
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="space-y-0.5">
                    <Label htmlFor="trek" className="text-base font-semibold">
                      Join the Pakistan Trek?
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      March 29 - April 5, 2025 (Optional)
                    </p>
                  </div>
                  <Switch
                    id="trek"
                    checked={includingTrek}
                    onCheckedChange={setIncludingTrek}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="plusone" className="text-base font-semibold">
                      Bringing a plus one?
                    </Label>
                  </div>
                  <Switch
                    id="plusone"
                    checked={plusOne}
                    onCheckedChange={setPlusOne}
                  />
                </div>

                {plusOne && (
                  <div className="space-y-2">
                    <Label htmlFor="plusOneName">Plus One Name</Label>
                    <Input
                      id="plusOneName"
                      placeholder="Enter guest name"
                      value={plusOneName}
                      onChange={(e) => setPlusOneName(e.target.value)}
                      required={plusOne}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="dietary">
                    Dietary Requirements (Optional)
                  </Label>
                  <Textarea
                    id="dietary"
                    placeholder="Let us know about any dietary restrictions or preferences..."
                    value={dietaryRequirements}
                    onChange={(e) => setDietaryRequirements(e.target.value)}
                    rows={4}
                  />
                </div>
              </>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
                disabled={loading}
              >
                {loading ? "Submitting..." : existingRsvp ? "Update RSVP" : "Submit RSVP"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RSVP;
