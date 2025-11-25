import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Users, ArrowLeft, Sparkles, Download, Edit, Upload } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WatercolorBackground } from "@/components/WatercolorBackground";
import { Checkbox } from "@/components/ui/checkbox";
import { parsePhoneNumber, formatIncompletePhoneNumber } from 'libphonenumber-js';
import * as XLSX from 'xlsx';

interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  category: string | null;
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
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [eventInvitations, setEventInvitations] = useState({
    mehndi: true, // Dholki Night
    nikah: true, // Barat Ceremony
    haldi: true, // Village Reception + DJ Party
    reception: true, // Formal Reception
    trek: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      'Category',
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
        guest.category || '',
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

  const handleEditGuest = (guest: Guest) => {
    setEditingGuestId(guest.id);
    setName(guest.name);
    setPhone(guest.phone);
    setEmail(guest.email || "");
    setCategory(guest.category || "");
    
    // Fetch current event invitations for this guest
    const fetchInvitations = async () => {
      const { data } = await supabase
        .from('event_invitations')
        .select('event_type')
        .eq('guest_id', guest.id)
        .eq('invited', true);
      
      if (data) {
        const invites = {
          mehndi: false,
          nikah: false,
          haldi: false,
          reception: false,
          trek: false,
        };
        data.forEach(inv => {
          if (inv.event_type in invites) {
            invites[inv.event_type as keyof typeof invites] = true;
          }
        });
        setEventInvitations(invites);
      }
    };
    
    fetchInvitations();
  };

  const handleCancelEdit = () => {
    setEditingGuestId(null);
    setName("");
    setPhone("");
    setEmail("");
    setCategory("");
    setEventInvitations({
      mehndi: true,
      nikah: true,
      haldi: true,
      reception: true,
      trek: true,
    });
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<{
        Name?: string;
        Category?: string;
        Phone?: string;
        Email?: string;
      }>;

      if (jsonData.length === 0) {
        toast.error("No data found in the Excel file");
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const row of jsonData) {
        try {
          const name = row.Name?.toString().trim();
          const category = row.Category?.toString().trim();
          const phone = row.Phone?.toString().trim();
          const email = row.Email?.toString().trim();

          if (!name || !phone) {
            errorCount++;
            continue;
          }

          // Format phone number to E.164 format
          let formattedPhone = phone;
          try {
            const phoneNumber = parsePhoneNumber(phone);
            if (phoneNumber && phoneNumber.isValid()) {
              formattedPhone = phoneNumber.format('E.164');
            } else {
              errorCount++;
              continue;
            }
          } catch {
            errorCount++;
            continue;
          }

          // Check if guest already exists
          const { data: existingGuest } = await supabase
            .from('guests')
            .select('id')
            .eq('phone', formattedPhone)
            .maybeSingle();

          if (existingGuest) {
            errorCount++;
            continue;
          }

          // Insert guest
          const { data: guestData, error: guestError } = await supabase
            .from('guests')
            .insert([{ 
              name, 
              category: category || null,
              phone: formattedPhone,
              email: email || null
            }])
            .select()
            .single();

          if (guestError) {
            errorCount++;
            continue;
          }

          // Insert default event invitations (all events)
          const invitationsToInsert = ['mehndi', 'nikah', 'haldi', 'reception', 'trek'].map(eventType => ({
            guest_id: guestData.id,
            event_type: eventType as 'welcome' | 'mehndi' | 'haldi' | 'nikah' | 'reception' | 'trek',
            invited: true,
          }));

          await supabase
            .from('event_invitations')
            .insert(invitationsToInsert);

          successCount++;
        } catch (error) {
          errorCount++;
          console.error('Error importing row:', error);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} guest${successCount > 1 ? 's' : ''}`);
        fetchGuests();
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} guest${errorCount > 1 ? 's' : ''} (duplicates or invalid data)`);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error("Failed to read Excel file");
      console.error(error);
    }
  };

  const downloadTemplate = () => {
    // Create template data
    const templateData = [
      { Name: 'John Doe', Category: 'Family', Phone: '+92 300 1234567', Email: 'john@example.com' },
      { Name: 'Jane Smith', Category: 'Friend', Phone: '+92 321 9876543', Email: 'jane@example.com' }
    ];

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Guest List');

    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Name
      { wch: 15 }, // Category
      { wch: 20 }, // Phone
      { wch: 30 }  // Email
    ];

    // Download
    XLSX.writeFile(wb, 'wedding-guest-import-template.xlsx');
    toast.success('Template downloaded! Fill it with your guest data.');
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse and normalize phone number to E.164 format (matches Auth.tsx)
      let formattedPhone = phone;
      try {
        const phoneNumber = parsePhoneNumber(phone);
        if (phoneNumber && phoneNumber.isValid()) {
          formattedPhone = phoneNumber.format('E.164'); // Store as +923451234567 format
        } else {
          toast.error("Please enter a valid international phone number");
          setLoading(false);
          return;
        }
      } catch {
        toast.error("Please enter a valid international phone number");
        setLoading(false);
        return;
      }

      if (editingGuestId) {
        // Update existing guest
        const { error: guestError } = await supabase
          .from('guests')
          .update({ 
            name, 
            phone: formattedPhone,
            email,
            category 
          })
          .eq('id', editingGuestId);

        if (guestError) throw guestError;

        // Delete existing invitations and re-insert
        await supabase
          .from('event_invitations')
          .delete()
          .eq('guest_id', editingGuestId);

        const invitationsToInsert = Object.entries(eventInvitations)
          .map(([eventType]) => ({
            guest_id: editingGuestId,
            event_type: eventType as 'welcome' | 'mehndi' | 'haldi' | 'nikah' | 'reception' | 'trek',
            invited: true,
          }));

        if (invitationsToInsert.length > 0) {
          const { error: inviteError } = await supabase
            .from('event_invitations')
            .insert(invitationsToInsert);

          if (inviteError) throw inviteError;
        }

        toast.success(`${name} updated successfully!`);
      } else {
        // Insert new guest
        const { data: guestData, error: guestError } = await supabase
          .from('guests')
          .insert([{ 
            name, 
            phone: formattedPhone,
            email,
            category 
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
      }
      
      setEditingGuestId(null);
      setName("");
      setPhone("");
      setEmail("");
      setCategory("");
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
                <CardTitle className="text-2xl font-serif text-watercolor-magenta">
                  {editingGuestId ? 'Edit Guest' : 'Add Guest'}
                </CardTitle>
              </div>
              <CardDescription>
                {editingGuestId ? 'Update guest information' : 'Add a new guest to the wedding invitation list'}
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
                <div className="space-y-2">
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Input
                    id="category"
                    type="text"
                    placeholder="Family, Friend, Colleague, etc."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Used for organizing guests (e.g., Family, Friends, Colleagues)</p>
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
                
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-watercolor-magenta to-watercolor-purple hover:from-watercolor-purple hover:to-watercolor-magenta text-white"
                    disabled={loading}
                  >
                    {loading ? (editingGuestId ? "Updating..." : "Adding...") : (editingGuestId ? "Update Guest" : "Add Guest")}
                  </Button>
                  {editingGuestId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
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
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleImportExcel}
                    className="hidden"
                  />
                  <Button
                    onClick={downloadTemplate}
                    variant="outline"
                    size="sm"
                    className="border-watercolor-orange text-watercolor-orange hover:bg-watercolor-orange/10"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Template
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="border-watercolor-magenta text-watercolor-magenta hover:bg-watercolor-magenta/10"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Import Excel
                  </Button>
                  <Button
                    onClick={exportToExcel}
                    variant="outline"
                    className="border-watercolor-purple text-watercolor-purple hover:bg-watercolor-purple/10"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky top-0 bg-background">Name</TableHead>
                      <TableHead className="sticky top-0 bg-background">Category</TableHead>
                      <TableHead className="sticky top-0 bg-background">Phone</TableHead>
                      <TableHead className="sticky top-0 bg-background">RSVP Status</TableHead>
                      <TableHead className="sticky top-0 bg-background">Plus One</TableHead>
                      <TableHead className="sticky top-0 bg-background">Trek</TableHead>
                      <TableHead className="sticky top-0 bg-background">Dietary</TableHead>
                      <TableHead className="sticky top-0 bg-background">Family</TableHead>
                      <TableHead className="sticky top-0 bg-background">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guests.map((guest) => (
                      <TableRow key={guest.id}>
                        <TableCell className="font-medium">{guest.name}</TableCell>
                        <TableCell className="text-sm">
                          {guest.category ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-watercolor-purple/10 text-watercolor-purple">
                              {guest.category}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
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
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditGuest(guest)}
                            className="hover:bg-watercolor-purple/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
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
