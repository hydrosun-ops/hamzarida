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
import { Heart, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { WatercolorBackground } from "@/components/WatercolorBackground";

interface FamilyMember {
  id?: string;
  name: string;
  dietary_requirements: string;
}

const RSVP = () => {
  const [loading, setLoading] = useState(false);
  const [guestId, setGuestId] = useState<string>("");
  const [guestName, setGuestName] = useState<string>("");
  const [existingRsvp, setExistingRsvp] = useState<any>(null);
  const [attending, setAttending] = useState(true);
  const [includingTrek, setIncludingTrek] = useState(false);
  const [dietaryRequirements, setDietaryRequirements] = useState("");
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGuestAndRsvp = async () => {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Fetch guest data
      const { data: guest } = await supabase
        .from('guests')
        .select('id, name')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!guest) {
        navigate('/auth');
        return;
      }

      setGuestId(guest.id);
      setGuestName(guest.name);

      // Fetch existing RSVP
      const { data: rsvp } = await supabase
        .from('rsvps')
        .select('*')
        .eq('guest_id', guest.id)
        .maybeSingle();

      if (rsvp) {
        setExistingRsvp(rsvp);
        setAttending(rsvp.attending);
        setIncludingTrek(rsvp.including_trek || false);
        setDietaryRequirements(rsvp.dietary_requirements || "");
      }

      // Fetch existing family members
      const { data: members } = await supabase
        .from('family_members')
        .select('*')
        .eq('guest_id', guest.id);

      if (members && members.length > 0) {
        setFamilyMembers(members.map(m => ({
          id: m.id,
          name: m.name,
          dietary_requirements: m.dietary_requirements || ''
        })));
      }
    };

    fetchGuestAndRsvp();
  }, [navigate]);

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { name: '', dietary_requirements: '' }]);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFamilyMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const rsvpData = {
        guest_id: guestId,
        attending,
        including_trek: includingTrek,
        plus_one: familyMembers.length > 0,
        dietary_requirements: dietaryRequirements || null,
      };

      // Save or update RSVP
      if (existingRsvp) {
        const { error } = await supabase
          .from('rsvps')
          .update(rsvpData)
          .eq('id', existingRsvp.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('rsvps')
          .insert([rsvpData]);

        if (error) throw error;
      }

      // Delete all existing family members first
      await supabase
        .from('family_members')
        .delete()
        .eq('guest_id', guestId);

      // Save family members
      if (familyMembers.length > 0 && attending) {
        const membersToInsert = familyMembers
          .filter(m => m.name.trim())
          .map(m => ({
            guest_id: guestId,
            name: m.name,
            dietary_requirements: m.dietary_requirements || null
          }));

        if (membersToInsert.length > 0) {
          const { error: membersError } = await supabase
            .from('family_members')
            .insert(membersToInsert);

          if (membersError) throw membersError;
        }
      }

      toast.success("RSVP submitted successfully!");
      navigate('/wedding');
    } catch (error: any) {
      toast.error(error.message || "Failed to submit RSVP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-watercolor-lavender/30 via-background to-watercolor-rose/20 flex items-center justify-center p-4 relative">
      <WatercolorBackground />
      
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm border-none shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/wedding')}
            className="absolute left-4 top-4 hover:bg-watercolor-purple/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Heart className="w-12 h-12 mx-auto text-watercolor-magenta opacity-80" />
          <CardTitle className="text-4xl font-serif text-watercolor-magenta">RSVP</CardTitle>
          <CardDescription className="text-base space-y-2">
            <p>Please respond by December 15th, 2024</p>
            <p className="text-sm text-watercolor-purple font-medium mt-2">
              💬 Please make sure your phone number is a WhatsApp number for event updates
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Primary Guest Info */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold text-lg">{guestName}</h3>
              
              <div className="flex items-center justify-between">
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
                <div className="space-y-2">
                  <Label htmlFor="dietary">
                    Your Dietary Requirements (Optional)
                  </Label>
                  <Textarea
                    id="dietary"
                    placeholder="Any dietary restrictions or preferences..."
                    value={dietaryRequirements}
                    onChange={(e) => setDietaryRequirements(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>

            {attending && (
              <>
                {/* Trek Option */}
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

                {/* Family Members */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">
                      Additional Family Members / Plus Ones
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFamilyMember}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Person
                    </Button>
                  </div>

                  {familyMembers.map((member, index) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold">Person {index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFamilyMember(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="Full Name"
                          value={member.name}
                          onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                          required
                        />
                        <Textarea
                          placeholder="Dietary requirements (optional)"
                          value={member.dietary_requirements}
                          onChange={(e) => updateFamilyMember(index, 'dietary_requirements', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}

                  {familyMembers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Click "Add Person" to include family members or a plus one
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-watercolor-magenta to-watercolor-purple hover:from-watercolor-purple hover:to-watercolor-magenta text-white py-6 text-lg shadow-lg"
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
