import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Upload, Sparkles, Heart, Image, Trash2, Plane } from "lucide-react";
import { WatercolorBackground } from "@/components/WatercolorBackground";

interface Slide {
  id: string;
  page_number: number;
  title: string;
  subtitle: string;
  description: string;
  icon_emoji: string;
  background_image: string | null;
  event_date: string | null;
  event_time: string | null;
  event_venue: string | null;
}

interface TravelInfo {
  id: string;
  section_type: string;
  title: string;
  subtitle: string | null;
  content: string | null;
  icon_emoji: string | null;
  display_order: number;
}

const AdminSlides = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [travelInfo, setTravelInfo] = useState<TravelInfo[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [creatingSlide, setCreatingSlide] = useState(false);
  const [newSlide, setNewSlide] = useState<Partial<Slide>>({
    page_number: 1,
    title: '',
    subtitle: '',
    description: '',
    icon_emoji: '💍',
    background_image: null,
    event_date: null,
    event_time: null,
    event_venue: null,
  });
  const [editingTravel, setEditingTravel] = useState<TravelInfo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [globalBackground, setGlobalBackground] = useState<string>('');
  const [editingGlobalBg, setEditingGlobalBg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newSlideFileInputRef = useRef<HTMLInputElement>(null);
  const globalBgInputRef = useRef<HTMLInputElement>(null);
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
      fetchSlides();
      fetchTravelInfo();
      fetchGlobalBackground();
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

  const fetchTravelInfo = async () => {
    const { data, error } = await supabase
      .from('travel_info')
      .select('*')
      .order('display_order');

    if (error) {
      toast.error("Failed to load travel info");
      console.error(error);
      return;
    }

    setTravelInfo(data || []);
  };

  const fetchGlobalBackground = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'watercolor_background')
      .maybeSingle();

    if (error) {
      console.error("Failed to load global background", error);
      return;
    }

    setGlobalBackground(data?.setting_value || '');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !editingSlide) return;
    
    const file = event.target.files[0];
    setUploading(true);

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${editingSlide.page_number}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('slide-backgrounds')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('slide-backgrounds')
        .getPublicUrl(filePath);

      // Update the editing slide with the new image URL
      setEditingSlide({
        ...editingSlide,
        background_image: publicUrl
      });

      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploading(false);
    }
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
        event_date: editingSlide.event_date,
        event_time: editingSlide.event_time,
        event_venue: editingSlide.event_venue,
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

  const handleUpdateTravel = async () => {
    if (!editingTravel) return;

    const { error } = await supabase
      .from('travel_info')
      .update({
        title: editingTravel.title,
        subtitle: editingTravel.subtitle,
        content: editingTravel.content,
        icon_emoji: editingTravel.icon_emoji,
      })
      .eq('id', editingTravel.id);

    if (error) {
      toast.error("Failed to update travel info");
      console.error(error);
      return;
    }

    toast.success("Travel info updated successfully!");
    fetchTravelInfo();
    setEditingTravel(null);
  };

  const handleDeleteSlide = async (slideId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this slide?")) {
      return;
    }

    const { error } = await supabase
      .from('wedding_slides')
      .delete()
      .eq('id', slideId);

    if (error) {
      toast.error("Failed to delete slide");
      console.error(error);
      return;
    }

    toast.success("Slide deleted successfully!");
    fetchSlides();
  };

  const handleDeleteTravel = async (travelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this travel info section?")) {
      return;
    }

    const { error } = await supabase
      .from('travel_info')
      .delete()
      .eq('id', travelId);

    if (error) {
      toast.error("Failed to delete travel info");
      console.error(error);
      return;
    }

    toast.success("Travel info deleted successfully!");
    fetchTravelInfo();
  };

  const handleNewSlideFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;
    
    const file = event.target.files[0];
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${newSlide.page_number}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('slide-backgrounds')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('slide-backgrounds')
        .getPublicUrl(filePath);

      setNewSlide({
        ...newSlide,
        background_image: publicUrl
      });

      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateSlide = async () => {
    if (!newSlide.page_number || !newSlide.title) {
      toast.error("Page number and title are required");
      return;
    }

    const { error } = await supabase
      .from('wedding_slides')
      .insert([{
        page_number: newSlide.page_number,
        title: newSlide.title,
        subtitle: newSlide.subtitle || '',
        description: newSlide.description || '',
        icon_emoji: newSlide.icon_emoji || '💍',
        background_image: newSlide.background_image,
        event_date: newSlide.event_date,
        event_time: newSlide.event_time,
        event_venue: newSlide.event_venue,
      }]);

    if (error) {
      toast.error("Failed to create slide");
      console.error(error);
      return;
    }

    toast.success("Slide created successfully!");
    fetchSlides();
    setCreatingSlide(false);
    setNewSlide({
      page_number: 1,
      title: '',
      subtitle: '',
      event_date: null,
      event_time: null,
      event_venue: null,
      description: '',
      icon_emoji: '💍',
      background_image: null,
    });
  };

  const handleGlobalBgUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;
    
    const file = event.target.files[0];
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `global-bg-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('slide-backgrounds')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('slide-backgrounds')
        .getPublicUrl(filePath);

      setGlobalBackground(publicUrl);
      toast.success("Background uploaded successfully!");
    } catch (error: any) {
      toast.error("Failed to upload background");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveGlobalBackground = async () => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        setting_key: 'watercolor_background',
        setting_value: globalBackground,
      }, {
        onConflict: 'setting_key'
      });

    if (error) {
      toast.error("Failed to save global background");
      console.error(error);
      return;
    }

    toast.success("Global background updated successfully!");
    setEditingGlobalBg(false);
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
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setEditingGlobalBg(true)}
              variant="outline"
              className="border-watercolor-orange text-watercolor-orange hover:bg-watercolor-orange/10"
            >
              <Image className="w-4 h-4 mr-2" />
              Global Background
            </Button>
            <Button
              onClick={() => setCreatingSlide(true)}
              className="bg-gradient-to-r from-watercolor-magenta to-watercolor-purple hover:from-watercolor-purple hover:to-watercolor-magenta text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create New Slide
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-watercolor-magenta" />
              <h1 className="text-3xl font-display font-bold text-watercolor-magenta">Edit Wedding Slides</h1>
            </div>
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
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-4xl mb-2">{slide.icon_emoji}</div>
                    <CardTitle className="text-xl font-display text-watercolor-purple">
                      Page {slide.page_number}
                    </CardTitle>
                    <CardDescription className="font-urdu text-lg">
                      {slide.title}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteSlide(slide.id, e)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{slide.description}</p>
                {slide.background_image && (
                  <div className="mt-4 rounded-md overflow-hidden h-32 bg-gray-100">
                    {slide.background_image.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video 
                        src={slide.background_image} 
                        className="w-full h-full object-cover opacity-50"
                        muted
                        loop
                      />
                    ) : (
                      <img 
                        src={slide.background_image} 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-50"
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6 mb-12 mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-serif text-watercolor-magenta flex items-center gap-3">
              <Plane className="w-8 h-8" />
              Travel Information
            </h2>
            <Button
              onClick={() => navigate('/travel')}
              variant="outline"
              className="border-watercolor-purple text-watercolor-purple hover:bg-watercolor-purple/10"
            >
              Preview Travel Page
            </Button>
          </div>
          <p className="text-muted-foreground">Click on any section to edit its content</p>
          {travelInfo.map((info) => (
            <Card
              key={info.id}
              className="bg-white/95 backdrop-blur-sm border-watercolor-magenta/20 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setEditingTravel(info)}
            >
              <CardHeader className="border-b-2 border-watercolor-purple/10">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{info.icon_emoji || '📝'}</span>
                    <div>
                      <div className="text-xl font-display text-watercolor-magenta">{info.title}</div>
                      {info.subtitle && (
                        <div className="text-sm text-muted-foreground font-normal">{info.subtitle}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteTravel(info.id, e)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Sparkles className="w-5 h-5 text-watercolor-purple" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-muted-foreground line-clamp-3 whitespace-pre-line">{info.content}</p>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-date" className="font-display text-watercolor-purple">Event Date</Label>
                    <Input
                      id="event-date"
                      value={editingSlide.event_date || ''}
                      onChange={(e) => setEditingSlide({...editingSlide, event_date: e.target.value})}
                      placeholder="March 25, 2025"
                      className="border-2 border-watercolor-purple/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-time" className="font-display text-watercolor-purple">Event Time</Label>
                    <Input
                      id="event-time"
                      value={editingSlide.event_time || ''}
                      onChange={(e) => setEditingSlide({...editingSlide, event_time: e.target.value})}
                      placeholder="7:00 PM onwards"
                      className="border-2 border-watercolor-purple/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-venue" className="font-display text-watercolor-purple">Event Venue</Label>
                    <Input
                      id="event-venue"
                      value={editingSlide.event_venue || ''}
                      onChange={(e) => setEditingSlide({...editingSlide, event_venue: e.target.value})}
                      placeholder="Venue Name, Pakistan"
                      className="border-2 border-watercolor-purple/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-display text-watercolor-purple flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Background Media (Image or Video)
                  </Label>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-gradient-to-r from-watercolor-purple to-watercolor-magenta hover:from-watercolor-magenta hover:to-watercolor-purple text-white"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "Uploading..." : "Upload Image/Video"}
                    </Button>
                    
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Supports: Images (JPG, PNG, WEBP) and Videos (MP4, WEBM)
                    <br />
                    Or paste a media URL below:
                  </div>
                  
                  <Input
                    value={editingSlide.background_image || ''}
                    onChange={(e) => setEditingSlide({...editingSlide, background_image: e.target.value})}
                    placeholder="https://example.com/media.mp4"
                    className="border-2 border-watercolor-purple/20"
                  />
                  
                  {editingSlide.background_image && (
                    <div className="mt-2 rounded-lg overflow-hidden h-48 border-2 border-watercolor-purple/20">
                      {editingSlide.background_image.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video 
                          src={editingSlide.background_image} 
                          className="w-full h-full object-cover"
                          controls
                          muted
                        />
                      ) : (
                        <img 
                          src={editingSlide.background_image} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      )}
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

        {editingTravel && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-white/98 max-h-[90vh] overflow-y-auto">
              <CardHeader className="border-b-2 border-watercolor-purple/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-display text-watercolor-magenta flex items-center gap-2">
                      <Sparkles className="w-6 h-6" />
                      Edit Travel Info: {editingTravel.section_type}
                    </CardTitle>
                    <CardDescription>Update travel information content</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setEditingTravel(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="travel-icon" className="font-display text-watercolor-purple">Icon Emoji</Label>
                  <Input
                    id="travel-icon"
                    value={editingTravel.icon_emoji || ''}
                    onChange={(e) => setEditingTravel({...editingTravel, icon_emoji: e.target.value})}
                    placeholder="✈️"
                    className="text-4xl h-16 text-center border-2 border-watercolor-purple/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travel-title" className="font-display text-watercolor-purple">Title</Label>
                  <Input
                    id="travel-title"
                    value={editingTravel.title}
                    onChange={(e) => setEditingTravel({...editingTravel, title: e.target.value})}
                    className="font-display border-2 border-watercolor-purple/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travel-subtitle" className="font-display text-watercolor-purple">Subtitle</Label>
                  <Input
                    id="travel-subtitle"
                    value={editingTravel.subtitle || ''}
                    onChange={(e) => setEditingTravel({...editingTravel, subtitle: e.target.value})}
                    className="border-2 border-watercolor-purple/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travel-content" className="font-display text-watercolor-purple">Content</Label>
                  <Textarea
                    id="travel-content"
                    value={editingTravel.content || ''}
                    onChange={(e) => setEditingTravel({...editingTravel, content: e.target.value})}
                    rows={8}
                    className="border-2 border-watercolor-purple/20"
                    placeholder="Use double line breaks to separate paragraphs"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleUpdateTravel}
                    className="flex-1 bg-gradient-to-r from-watercolor-magenta to-watercolor-purple hover:from-watercolor-purple hover:to-watercolor-magenta text-white font-display"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingTravel(null)}
                    className="border-2 border-watercolor-purple/20 font-display"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {creatingSlide && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-white/98 max-h-[90vh] overflow-y-auto">
              <CardHeader className="border-b-2 border-watercolor-purple/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-display text-watercolor-magenta flex items-center gap-2">
                      <Heart className="w-6 h-6" />
                      Create New Slide
                    </CardTitle>
                    <CardDescription>Add a new event slide to the wedding site</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setCreatingSlide(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="new-page-number" className="font-display text-watercolor-purple">Page Number *</Label>
                  <Input
                    id="new-page-number"
                    type="number"
                    min="1"
                    value={newSlide.page_number}
                    onChange={(e) => setNewSlide({...newSlide, page_number: parseInt(e.target.value)})}
                    className="border-2 border-watercolor-purple/20"
                  />
                  <p className="text-xs text-muted-foreground">Page 1 is Welcome, 2 is Dholki, etc.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-icon" className="font-display text-watercolor-purple">Icon Emoji</Label>
                  <Input
                    id="new-icon"
                    value={newSlide.icon_emoji}
                    onChange={(e) => setNewSlide({...newSlide, icon_emoji: e.target.value})}
                    placeholder="💍"
                    className="text-4xl h-16 text-center border-2 border-watercolor-purple/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-title" className="font-display text-watercolor-purple">Title *</Label>
                  <Input
                    id="new-title"
                    value={newSlide.title}
                    onChange={(e) => setNewSlide({...newSlide, title: e.target.value})}
                    placeholder="Dholki Night"
                    className="font-display border-2 border-watercolor-purple/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-subtitle" className="font-display text-watercolor-purple">Subtitle</Label>
                  <Input
                    id="new-subtitle"
                    value={newSlide.subtitle}
                    onChange={(e) => setNewSlide({...newSlide, subtitle: e.target.value})}
                    placeholder="March 25, 2025"
                    className="font-urdu border-2 border-watercolor-purple/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-description" className="font-display text-watercolor-purple">Description</Label>
                  <Textarea
                    id="new-description"
                    value={newSlide.description}
                    onChange={(e) => setNewSlide({...newSlide, description: e.target.value})}
                    rows={4}
                    placeholder="Begin our celebration with a traditional Dholki evening..."
                    className="border-2 border-watercolor-purple/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-event-date" className="font-display text-watercolor-purple">Event Date</Label>
                    <Input
                      id="new-event-date"
                      value={newSlide.event_date || ''}
                      onChange={(e) => setNewSlide({...newSlide, event_date: e.target.value})}
                      placeholder="March 25, 2025"
                      className="border-2 border-watercolor-purple/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-event-time" className="font-display text-watercolor-purple">Event Time</Label>
                    <Input
                      id="new-event-time"
                      value={newSlide.event_time || ''}
                      onChange={(e) => setNewSlide({...newSlide, event_time: e.target.value})}
                      placeholder="7:00 PM onwards"
                      className="border-2 border-watercolor-purple/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-event-venue" className="font-display text-watercolor-purple">Event Venue</Label>
                    <Input
                      id="new-event-venue"
                      value={newSlide.event_venue || ''}
                      onChange={(e) => setNewSlide({...newSlide, event_venue: e.target.value})}
                      placeholder="Venue Name, Pakistan"
                      className="border-2 border-watercolor-purple/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-display text-watercolor-purple flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Background Media (Image or Video)
                  </Label>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => newSlideFileInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-gradient-to-r from-watercolor-purple to-watercolor-magenta hover:from-watercolor-magenta hover:to-watercolor-purple text-white"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "Uploading..." : "Upload Image/Video"}
                    </Button>
                    
                    <Input
                      ref={newSlideFileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleNewSlideFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Supports: Images (JPG, PNG, WEBP) and Videos (MP4, WEBM)
                    <br />
                    Or paste a media URL below:
                  </div>
                  
                  <Input
                    value={newSlide.background_image || ''}
                    onChange={(e) => setNewSlide({...newSlide, background_image: e.target.value})}
                    placeholder="https://example.com/media.mp4"
                    className="border-2 border-watercolor-purple/20"
                  />
                  
                  {newSlide.background_image && (
                    <div className="mt-2 rounded-lg overflow-hidden h-48 border-2 border-watercolor-purple/20">
                      {newSlide.background_image.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video 
                          src={newSlide.background_image} 
                          className="w-full h-full object-cover"
                          controls
                          muted
                        />
                      ) : (
                        <img 
                          src={newSlide.background_image} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCreateSlide}
                    className="flex-1 bg-gradient-to-r from-watercolor-magenta to-watercolor-purple hover:from-watercolor-purple hover:to-watercolor-magenta text-white font-display"
                  >
                    Create Slide
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCreatingSlide(false)}
                    className="border-2 border-watercolor-purple/20 font-display"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {editingGlobalBg && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-white/98">
              <CardHeader className="border-b-2 border-watercolor-purple/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-display text-watercolor-magenta flex items-center gap-2">
                      <Image className="w-6 h-6" />
                      Global Website Background
                    </CardTitle>
                    <CardDescription>Update the watercolor background image for the entire site</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setEditingGlobalBg(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label className="font-display text-watercolor-purple">Background Image</Label>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => globalBgInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-gradient-to-r from-watercolor-purple to-watercolor-magenta hover:from-watercolor-magenta hover:to-watercolor-purple text-white"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "Uploading..." : "Upload Image"}
                    </Button>
                    
                    <Input
                      ref={globalBgInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleGlobalBgUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Supports: Images (JPG, PNG, WEBP)
                    <br />
                    Or paste an image URL below:
                  </div>
                  
                  <Input
                    value={globalBackground}
                    onChange={(e) => setGlobalBackground(e.target.value)}
                    placeholder="https://example.com/background.jpg"
                    className="border-2 border-watercolor-purple/20"
                  />
                  
                  {globalBackground && (
                    <div className="mt-2 rounded-lg overflow-hidden h-48 border-2 border-watercolor-purple/20">
                      <img 
                        src={globalBackground} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveGlobalBackground}
                    className="flex-1 bg-gradient-to-r from-watercolor-magenta to-watercolor-purple hover:from-watercolor-purple hover:to-watercolor-magenta text-white font-display"
                  >
                    Save Background
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingGlobalBg(false)}
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
