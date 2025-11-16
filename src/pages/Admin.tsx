import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Users, ArrowLeft, Sparkles } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WatercolorBackground } from "@/components/WatercolorBackground";
import { Checkbox } from "@/components/ui/checkbox";
import { parsePhoneNumber, formatIncompletePhoneNumber } from 'libphonenumber-js';

interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

const Admin = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [eventInvitations, setEventInvitations] = useState({
    mehndi: true, // Dholki Night
    nikah: true, // Barat Ceremony
    haldi: true, // Village Reception + DJ Party
    reception: true, // Formal Reception
    trek: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      const guestId = localStorage.getItem('guestId');
      
      if (!guestId) {
        toast.error("Please log in first");
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('guest_id', guestId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error || !data) {
        toast.error("Access denied. Admin only.");
        navigate("/wedding");
        return;
      }

      setIsAdmin(true);
      fetchGuests();
    };

    checkAdminAccess();
  }, [navigate]);

  const fetchGuests = async () => {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .order('name');

    if (error) {
      toast.error("Failed to load guests");
      console.error(error);
      return;
    }

    setGuests(data || []);
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse and format phone number
      let formattedPhone = phone;
      try {
        const phoneNumber = parsePhoneNumber(phone, 'PK'); // Default to Pakistan
        if (phoneNumber) {
          formattedPhone = phoneNumber.formatInternational();
        }
      } catch {
        // If parsing fails, use the input as-is
        formattedPhone = formatIncompletePhoneNumber(phone);
      }
      
      const { data: guestData, error: guestError } = await supabase
        .from('guests')
        .insert([{ 
          name, 
          phone: formattedPhone,
          email: email || null 
        }])
        .select()
        .single();

      if (guestError) throw guestError;

      // Insert event invitations
      const invitationsToInsert = Object.entries(eventInvitations)
        .filter(([_, invited]) => invited)
        .map(([eventType]) => ({
          guest_id: guestData.id,
          event_type: eventType as 'welcome' | 'mehndi' | 'haldi' | 'nikah' | 'reception' | 'trek',
          invited: true,
        }));

      if (invitationsToInsert.length > 0) {
        const { error: inviteError } = await supabase
          .from('event_invitations')
          .insert(invitationsToInsert);

        if (inviteError) throw inviteError;
      }

      toast.success(`${name} added successfully!`);
      setName("");
      setPhone("");
      setEmail("");
      setEventInvitations({
        mehndi: true,
        nikah: true,
        haldi: true,
        reception: true,
        trek: true,
      });
      fetchGuests();
    } catch (error: any) {
      toast.error("Failed to add guest");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-watercolor-lavender/30 via-background to-watercolor-purple/20 p-4 relative">
      <WatercolorBackground />
      
      <div className="max-w-6xl mx-auto pt-8 relative z-10">
        <div className="flex gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/wedding")}
            className="hover:bg-watercolor-purple/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Wedding
          </Button>
          <Button
            onClick={() => navigate("/admin/slides")}
            className="bg-gradient-to-r from-watercolor-magenta to-watercolor-purple hover:from-watercolor-purple hover:to-watercolor-magenta text-white font-display"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Edit Wedding Slides
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white/95 backdrop-blur-sm border-none shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-watercolor-purple" />
                <CardTitle className="text-2xl font-serif text-watercolor-magenta">Add Guest</CardTitle>
              </div>
              <CardDescription>
                Add a new guest to the wedding invitation list
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGuest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">International format (e.g., +92 300 1234567)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-3 pt-2">
                  <Label className="text-base">Event Invitations</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mehndi"
                        checked={eventInvitations.mehndi}
                        onCheckedChange={(checked) => 
                          setEventInvitations(prev => ({ ...prev, mehndi: !!checked }))
                        }
                      />
                      <label
                        htmlFor="mehndi"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Dholki Night (March 25) 🥁
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="nikah"
                        checked={eventInvitations.nikah}
                        onCheckedChange={(checked) => 
                          setEventInvitations(prev => ({ ...prev, nikah: !!checked }))
                        }
                      />
                      <label
                        htmlFor="nikah"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Barat Ceremony (March 26) 💍
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="haldi"
                        checked={eventInvitations.haldi}
                        onCheckedChange={(checked) => 
                          setEventInvitations(prev => ({ ...prev, haldi: !!checked }))
                        }
                      />
                      <label
                        htmlFor="haldi"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Village Reception + DJ Party (March 27) 🎉
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reception"
                        checked={eventInvitations.reception}
                        onCheckedChange={(checked) => 
                          setEventInvitations(prev => ({ ...prev, reception: !!checked }))
                        }
                      />
                      <label
                        htmlFor="reception"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Formal Reception (March 28) ✨
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="trek"
                        checked={eventInvitations.trek}
                        onCheckedChange={(checked) => 
                          setEventInvitations(prev => ({ ...prev, trek: !!checked }))
                        }
                      />
                      <label
                        htmlFor="trek"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Week-Long Trek (March 29 - April 5) 🏔️
                      </label>
                    </div>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-watercolor-magenta to-watercolor-purple hover:from-watercolor-purple hover:to-watercolor-magenta text-white"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Guest"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-none shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-watercolor-purple">Guest List</CardTitle>
              <CardDescription>
                {guests.length} guest{guests.length !== 1 ? 's' : ''} invited
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guests.map((guest) => (
                      <TableRow key={guest.id}>
                        <TableCell className="font-medium">{guest.name}</TableCell>
                        <TableCell className="text-muted-foreground">{guest.phone}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
