import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Upload, Sparkles, Heart } from "lucide-react";
import { WatercolorBackground } from "@/components/WatercolorBackground";

interface Slide {
  id: string;
  page_number: number;
  title: string;
  subtitle: string;
  description: string;
  icon_emoji: string;
  background_image: string | null;
}

const AdminSlides = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      const guestId = localStorage.getItem('guestId');
      
      if (!guestId) {
        toast.error("Please log in first");
        navigate("/auth");
        return;
      }

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
      fetchSlides();
    };

    checkAdminAccess();
  }, [navigate]);

  const fetchSlides = async () => {
    const { data, error } = await supabase
      .from('wedding_slides')
      .select('*')
      .order('page_number');

    if (error) {
      toast.error("Failed to load slides");
      console.error(error);
      return;
    }

    setSlides(data || []);
  };

  const handleSaveSlide = async () => {
    if (!editingSlide) return;

    const { error } = await supabase
      .from('wedding_slides')
      .update({
        title: editingSlide.title,
        subtitle: editingSlide.subtitle,
        description: editingSlide.description,
        icon_emoji: editingSlide.icon_emoji,
        background_image: editingSlide.background_image,
      })
      .eq('id', editingSlide.id);

    if (error) {
      toast.error("Failed to save slide");
      console.error(error);
      return;
    }

    toast.success("Slide updated successfully!");
    fetchSlides();
    setEditingSlide(null);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-watercolor-lavender/30 via-background to-watercolor-purple/20 p-4 relative">
      <WatercolorBackground />
      
      <div className="max-w-7xl mx-auto pt-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="hover:bg-watercolor-purple/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-watercolor-magenta" />
            <h1 className="text-3xl font-display font-bold text-watercolor-magenta">Edit Wedding Slides</h1>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide) => (
            <Card 
              key={slide.id} 
              className="bg-white/95 backdrop-blur-sm border-2 border-watercolor-purple/20 hover:border-watercolor-magenta/40 transition-all duration-300 cursor-pointer hover:shadow-2xl"
              onClick={() => setEditingSlide(slide)}
            >
              <CardHeader>
                <div className="text-4xl mb-2">{slide.icon_emoji}</div>
                <CardTitle className="text-xl font-display text-watercolor-purple">
                  Page {slide.page_number}
                </CardTitle>
                <CardDescription className="font-urdu text-lg">
                  {slide.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{slide.description}</p>
                {slide.background_image && (
                  <div className="mt-4 rounded-md overflow-hidden h-32 bg-gray-100">
                    <img 
                      src={slide.background_image} 
                      alt="Background" 
                      className="w-full h-full object-cover opacity-50"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {editingSlide && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-white/98 max-h-[90vh] overflow-y-auto">
              <CardHeader className="border-b-2 border-watercolor-purple/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-display text-watercolor-magenta flex items-center gap-2">
                      <Heart className="w-6 h-6" />
                      Edit Page {editingSlide.page_number}
                    </CardTitle>
                    <CardDescription>Update the slide content and styling</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setEditingSlide(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="icon" className="font-display text-watercolor-purple">Icon Emoji</Label>
                  <Input
                    id="icon"
                    value={editingSlide.icon_emoji}
                    onChange={(e) => setEditingSlide({...editingSlide, icon_emoji: e.target.value})}
                    placeholder="💍"
                    className="text-4xl h-16 text-center border-2 border-watercolor-purple/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="font-display text-watercolor-purple">Title</Label>
                  <Input
                    id="title"
                    value={editingSlide.title}
                    onChange={(e) => setEditingSlide({...editingSlide, title: e.target.value})}
                    className="font-display border-2 border-watercolor-purple/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle" className="font-display text-watercolor-purple">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={editingSlide.subtitle}
                    onChange={(e) => setEditingSlide({...editingSlide, subtitle: e.target.value})}
                    className="font-urdu border-2 border-watercolor-purple/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="font-display text-watercolor-purple">Description</Label>
                  <Textarea
                    id="description"
                    value={editingSlide.description}
                    onChange={(e) => setEditingSlide({...editingSlide, description: e.target.value})}
                    rows={4}
                    className="border-2 border-watercolor-purple/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="background" className="font-display text-watercolor-purple flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Background Image URL
                  </Label>
                  <Input
                    id="background"
                    value={editingSlide.background_image || ''}
                    onChange={(e) => setEditingSlide({...editingSlide, background_image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="border-2 border-watercolor-purple/20"
                  />
                  {editingSlide.background_image && (
                    <div className="mt-2 rounded-lg overflow-hidden h-48 border-2 border-watercolor-purple/20">
                      <img 
                        src={editingSlide.background_image} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveSlide}
                    className="flex-1 bg-gradient-to-r from-watercolor-magenta to-watercolor-purple hover:from-watercolor-purple hover:to-watercolor-magenta text-white font-display"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingSlide(null)}
                    className="border-2 border-watercolor-purple/20 font-display"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSlides;
