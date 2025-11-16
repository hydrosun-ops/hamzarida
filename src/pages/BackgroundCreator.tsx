import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Upload, Wand2, Download, Save } from "lucide-react";
import { WatercolorBackground } from "@/components/WatercolorBackground";
import { Slider } from "@/components/ui/slider";

const BackgroundCreator = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [coupleImage, setCoupleImage] = useState<string | null>(null);
  const [blendedImage, setBlendedImage] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(0.6);
  const [watercolorIntensity, setWatercolorIntensity] = useState(0.3);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    };

    checkAdminAccess();
  }, [navigate]);

  useEffect(() => {
    if (backgroundImage && coupleImage) {
      blendImages();
    }
  }, [backgroundImage, coupleImage, opacity, watercolorIntensity]);

  const handleImageUpload = (file: File, type: 'background' | 'couple') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'background') {
        setBackgroundImage(result);
      } else {
        setCoupleImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const blendImages = () => {
    if (!backgroundImage || !coupleImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bgImg = new Image();
    const coupleImg = new Image();

    bgImg.onload = () => {
      coupleImg.onload = () => {
        // Set canvas size
        canvas.width = 1920;
        canvas.height = 1080;

        // Draw background image
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        // Apply watercolor effect to background
        ctx.globalAlpha = watercolorIntensity;
        ctx.filter = 'blur(3px) saturate(1.3) contrast(0.9)';
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        
        // Reset filter
        ctx.filter = 'none';
        ctx.globalAlpha = 1;

        // Draw couple image in center with opacity
        const coupleWidth = canvas.width * 0.5;
        const coupleHeight = (coupleImg.height / coupleImg.width) * coupleWidth;
        const x = (canvas.width - coupleWidth) / 2;
        const y = (canvas.height - coupleHeight) / 2;

        // Apply watercolor blend mode
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = opacity;
        ctx.filter = 'blur(2px) saturate(1.2)';
        ctx.drawImage(coupleImg, x, y, coupleWidth, coupleHeight);

        // Reset
        ctx.globalCompositeOperation = 'source-over';
        ctx.filter = 'none';
        ctx.globalAlpha = 1;

        // Add watercolor overlay effect
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(147, 51, 234, 0.1)');
        gradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.1)');
        gradient.addColorStop(1, 'rgba(251, 146, 60, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Save blended result
        setBlendedImage(canvas.toDataURL('image/png'));
      };
      coupleImg.src = coupleImage;
    };
    bgImg.src = backgroundImage;
  };

  const enhanceWithAI = async () => {
    if (!blendedImage) return;

    setGenerating(true);
    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Transform this image into a beautiful watercolor painting style with soft edges, vibrant colors, and dreamy atmosphere. Keep the subjects recognizable but add artistic watercolor textures and effects throughout. Make it look like a professional watercolor artwork.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: blendedImage
                  }
                }
              ]
            }
          ],
          modalities: ['image', 'text']
        })
      });

      const data = await response.json();
      const enhancedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (enhancedImageUrl) {
        setBlendedImage(enhancedImageUrl);
        toast.success("Watercolor effect applied!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to enhance image");
    } finally {
      setGenerating(false);
    }
  };

  const saveToStorage = async () => {
    if (!blendedImage) return;

    setSaving(true);
    try {
      // Convert base64 to blob
      const response = await fetch(blendedImage);
      const blob = await response.blob();

      const fileName = `watercolor-background-${Date.now()}.png`;
      
      const { error, data } = await supabase.storage
        .from('slide-backgrounds')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('slide-backgrounds')
        .getPublicUrl(fileName);

      toast.success("Saved to storage! Use this URL in slides.");
      navigator.clipboard.writeText(publicUrl);
      toast.info("URL copied to clipboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save image");
    } finally {
      setSaving(false);
    }
  };

  const downloadImage = () => {
    if (!blendedImage) return;
    
    const link = document.createElement('a');
    link.download = `watercolor-background-${Date.now()}.png`;
    link.href = blendedImage;
    link.click();
    toast.success("Download started!");
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-watercolor-lavender/30 via-background to-watercolor-purple/20 p-4 relative">
      <WatercolorBackground />
      
      <div className="max-w-7xl mx-auto pt-8 relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin")}
          className="mb-6 hover:bg-watercolor-purple/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin
        </Button>

        <Card className="bg-white/95 backdrop-blur-sm border-2 border-watercolor-purple/20 mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-display text-watercolor-magenta flex items-center gap-2">
              <Wand2 className="w-8 h-8" />
              Watercolor Background Creator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Background Image Upload */}
              <div className="space-y-3">
                <Label className="text-lg font-display text-watercolor-purple">
                  Place/Background Image
                </Label>
                <div className="border-2 border-dashed border-watercolor-purple/30 rounded-lg p-8 text-center hover:border-watercolor-purple/60 transition-colors">
                  {backgroundImage ? (
                    <img src={backgroundImage} alt="Background" className="w-full h-48 object-cover rounded-lg" />
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 mx-auto text-watercolor-purple/50" />
                      <p className="text-sm text-muted-foreground">Upload background image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'background')}
                    className="hidden"
                    id="background-upload"
                  />
                  <Label htmlFor="background-upload">
                    <Button variant="outline" className="mt-4" asChild>
                      <span>Choose File</span>
                    </Button>
                  </Label>
                </div>
              </div>

              {/* Couple Image Upload */}
              <div className="space-y-3">
                <Label className="text-lg font-display text-watercolor-purple">
                  Couple Photo
                </Label>
                <div className="border-2 border-dashed border-watercolor-magenta/30 rounded-lg p-8 text-center hover:border-watercolor-magenta/60 transition-colors">
                  {coupleImage ? (
                    <img src={coupleImage} alt="Couple" className="w-full h-48 object-cover rounded-lg" />
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 mx-auto text-watercolor-magenta/50" />
                      <p className="text-sm text-muted-foreground">Upload couple photo</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'couple')}
                    className="hidden"
                    id="couple-upload"
                  />
                  <Label htmlFor="couple-upload">
                    <Button variant="outline" className="mt-4" asChild>
                      <span>Choose File</span>
                    </Button>
                  </Label>
                </div>
              </div>
            </div>

            {/* Controls */}
            {backgroundImage && coupleImage && (
              <div className="space-y-4 border-t-2 border-watercolor-purple/20 pt-6">
                <div className="space-y-2">
                  <Label className="font-display text-watercolor-purple">
                    Couple Photo Opacity: {(opacity * 100).toFixed(0)}%
                  </Label>
                  <Slider
                    value={[opacity]}
                    onValueChange={([value]) => setOpacity(value)}
                    min={0.1}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-display text-watercolor-purple">
                    Watercolor Intensity: {(watercolorIntensity * 100).toFixed(0)}%
                  </Label>
                  <Slider
                    value={[watercolorIntensity]}
                    onValueChange={([value]) => setWatercolorIntensity(value)}
                    min={0}
                    max={0.8}
                    step={0.05}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={enhanceWithAI}
                    disabled={generating}
                    className="flex-1 bg-gradient-to-r from-watercolor-magenta to-watercolor-purple hover:from-watercolor-purple hover:to-watercolor-magenta text-white font-display"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    {generating ? "Applying AI Watercolor..." : "Enhance with AI"}
                  </Button>
                  <Button
                    onClick={saveToStorage}
                    disabled={saving || !blendedImage}
                    variant="outline"
                    className="border-2 border-watercolor-purple/20 font-display"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save to Storage"}
                  </Button>
                  <Button
                    onClick={downloadImage}
                    disabled={!blendedImage}
                    variant="outline"
                    className="border-2 border-watercolor-purple/20 font-display"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        {blendedImage && (
          <Card className="bg-white/95 backdrop-blur-sm border-2 border-watercolor-purple/20">
            <CardHeader>
              <CardTitle className="text-2xl font-display text-watercolor-purple">
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border-2 border-watercolor-purple/20">
                <img src={blendedImage} alt="Blended" className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default BackgroundCreator;
