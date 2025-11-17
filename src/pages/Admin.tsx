import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Users, ArrowLeft, Sparkles, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WatercolorBackground } from "@/components/WatercolorBackground";
import { Checkbox } from "@/components/ui/checkbox";
import { parsePhoneNumber, formatIncompletePhoneNumber } from 'libphonenumber-js';

interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  rsvp?: {
    attending: boolean;
    plus_one: boolean | null;
    plus_one_name: string | null;
    dietary_requirements: string | null;
    including_trek: boolean | null;
  } | null;
  family_members?: Array<{
    name: string;
    dietary_requirements: string | null;
  }>;
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
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in first");
        navigate("/auth");
        return;
      }

      // Find guest record linked to this user
      const { data: guest, error: guestError } = await supabase
        .from('guests')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (guestError || !guest) {
        toast.error("Guest record not found");
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('guest_id', guest.id)
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
      .select(`
        *,
        rsvp:rsvps(*),
        family_members(name, dietary_requirements)
      `)
      .order('name');

    if (error) {
      toast.error("Failed to load guests");
      console.error(error);
      return;
    }

    // Transform the data to handle single RSVP
    const transformedData = data?.map(guest => ({
      ...guest,
      rsvp: Array.isArray(guest.rsvp) && guest.rsvp.length > 0 ? guest.rsvp[0] : null
    })) || [];

    setGuests(transformedData);
  };

  const exportToExcel = () => {
    // Create CSV content
    const headers = [
      'Name',
      'Phone',
      'Email',
      'RSVP Status',
      'Plus One',
      'Plus One Name',
      'Dietary Requirements',
      'Including Trek',
      'Family Members',
      'Family Dietary Requirements'
    ];

    const rows = guests.map(guest => {
      const familyNames = guest.family_members?.map(fm => fm.name).join('; ') || '';
      const familyDietary = guest.family_members?.map(fm => fm.dietary_requirements || '').filter(Boolean).join('; ') || '';
      
      return [
        guest.name,
        guest.phone,
        guest.email || '',
        guest.rsvp ? (guest.rsvp.attending ? 'Attending' : 'Not Attending') : 'No Response',
        guest.rsvp?.plus_one ? 'Yes' : 'No',
        guest.rsvp?.plus_one_name || '',
        guest.rsvp?.dietary_requirements || '',
        guest.rsvp?.including_trek ? 'Yes' : 'No',
        familyNames,
        familyDietary
      ];
    });

    // Convert to CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `wedding-guest-list-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Guest list exported successfully!');
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

          <Card className="bg-white/95 backdrop-blur-sm border-none shadow-2xl md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-serif text-watercolor-purple">Guest List</CardTitle>
                  <CardDescription>
                    {guests.length} guest{guests.length !== 1 ? 's' : ''} invited • {guests.filter(g => g.rsvp?.attending).length} confirmed attending
                  </CardDescription>
                </div>
                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  className="border-watercolor-purple text-watercolor-purple hover:bg-watercolor-purple/10"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export to Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky top-0 bg-background">Name</TableHead>
                      <TableHead className="sticky top-0 bg-background">Phone</TableHead>
                      <TableHead className="sticky top-0 bg-background">RSVP Status</TableHead>
                      <TableHead className="sticky top-0 bg-background">Plus One</TableHead>
                      <TableHead className="sticky top-0 bg-background">Trek</TableHead>
                      <TableHead className="sticky top-0 bg-background">Dietary</TableHead>
                      <TableHead className="sticky top-0 bg-background">Family</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guests.map((guest) => (
                      <TableRow key={guest.id}>
                        <TableCell className="font-medium">{guest.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{guest.phone}</TableCell>
                        <TableCell>
                          {guest.rsvp ? (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              guest.rsvp.attending 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {guest.rsvp.attending ? '✓ Attending' : '✗ Not Attending'}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">No response</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {guest.rsvp?.plus_one ? (
                            <div>
                              <span className="text-green-600">Yes</span>
                              {guest.rsvp.plus_one_name && (
                                <div className="text-xs text-muted-foreground">{guest.rsvp.plus_one_name}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {guest.rsvp?.including_trek ? (
                            <span className="text-green-600">Yes</span>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate" title={guest.rsvp?.dietary_requirements || ''}>
                          {guest.rsvp?.dietary_requirements || <span className="text-muted-foreground">None</span>}
                        </TableCell>
                        <TableCell className="text-sm">
                          {guest.family_members && guest.family_members.length > 0 ? (
                            <div className="space-y-1">
                              {guest.family_members.map((fm, idx) => (
                                <div key={idx} className="text-xs">
                                  {fm.name}
                                  {fm.dietary_requirements && (
                                    <span className="text-muted-foreground"> ({fm.dietary_requirements})</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
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
