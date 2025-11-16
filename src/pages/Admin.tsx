import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Users, ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WatercolorBackground } from "@/components/WatercolorBackground";

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
      const cleanPhone = phone.replace(/[\s\-()]/g, '');
      
      const { error } = await supabase
        .from('guests')
        .insert([{ 
          name, 
          phone: cleanPhone,
          email: email || null 
        }]);

      if (error) throw error;

      toast.success(`${name} added successfully!`);
      setName("");
      setPhone("");
      setEmail("");
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
        <Button
          variant="ghost"
          onClick={() => navigate("/wedding")}
          className="mb-6 hover:bg-watercolor-purple/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Wedding
        </Button>

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
                    placeholder="+1 234 567 8900"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
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
