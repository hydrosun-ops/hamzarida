import { useRef, useState, useEffect } from "react";
import { WeddingPage } from "@/components/WeddingPage";
import { EventCard } from "@/components/EventCard";
import { Countdown } from "@/components/Countdown";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Heart, Mountain, LogOut, Settings, Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { WatercolorBackground } from "@/components/WatercolorBackground";
const Wedding = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [guestName, setGuestName] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [invitedEvents, setInvitedEvents] = useState<Set<string>>(new Set());
  const [slideBackgrounds, setSlideBackgrounds] = useState<Record<number, string>>({});
  const navigate = useNavigate();

  // Helper to check if guest is invited to an event (show all if no invitations set for backwards compatibility)
  const isInvitedTo = (eventType: string) => {
    return invitedEvents.size === 0 || invitedEvents.has(eventType);
  };

  // Calculate visible pages based on invitations
  const visiblePageCount = [true,
  // Welcome - always shown
  isInvitedTo('mehndi'),
  // Dholki
  isInvitedTo('nikah'),
  // Barat
  isInvitedTo('haldi'),
  // Village + DJ
  isInvitedTo('reception'),
  // Formal reception
  isInvitedTo('trek') // Trek
  ].filter(Boolean).length;
  const totalPages = visiblePageCount;
  useEffect(() => {
    // Check if user is authenticated via Supabase
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Fetch guest data
      const {
        data: guest
      } = await supabase.from('guests').select('id, name').eq('user_id', session.user.id).maybeSingle();
      if (!guest) {
        navigate('/auth');
        return;
      }
      setGuestName(guest.name);

      // Check if user is admin
      const {
        data: roleData
      } = await supabase.from('user_roles').select('role').eq('guest_id', guest.id).eq('role', 'admin').maybeSingle();
      setIsAdmin(!!roleData);

      // Fetch event invitations
      const {
        data: invitations
      } = await supabase.from('event_invitations').select('event_type').eq('guest_id', guest.id).eq('invited', true);
      if (invitations) {
        setInvitedEvents(new Set(invitations.map(inv => inv.event_type)));
      }

      // Fetch slide backgrounds
      const {
        data: slides
      } = await supabase.from('wedding_slides').select('page_number, background_image').order('page_number');
      if (slides) {
        const backgrounds: Record<number, string> = {};
        slides.forEach(slide => {
          if (slide.background_image) {
            backgrounds[slide.page_number] = slide.background_image;
          }
        });
        setSlideBackgrounds(backgrounds);
      }
    };
    checkAuth();
  }, [navigate]);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!scrollRef.current) return;
    const scrollAmount = window.innerHeight;
    const newPosition = direction === 'next' ? scrollRef.current.scrollTop + scrollAmount : scrollRef.current.scrollTop - scrollAmount;
    scrollRef.current.scrollTo({
      top: newPosition,
      behavior: 'smooth'
    });
  };
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const newPage = Math.round(scrollRef.current.scrollTop / window.innerHeight);
    setCurrentPage(newPage);
  };
  return <div className="relative w-full h-screen overflow-hidden">
      {/* Top scroll indicator */}
      <div className={`fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-background/80 to-transparent pointer-events-none z-40 transition-opacity duration-300 ${currentPage === 0 ? 'opacity-0' : 'opacity-100'}`} />
      
      {/* Bottom scroll indicator */}
      <div className={`fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/80 to-transparent pointer-events-none z-40 transition-opacity duration-300 ${currentPage === totalPages - 1 ? 'opacity-0' : 'opacity-100'}`} />
      
      {/* Scroll hint - only show on first page */}
      {currentPage === 0 && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-sm">Scroll Down</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>}
      
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {isAdmin && <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="bg-white/90 backdrop-blur-sm hover:bg-white border border-watercolor-purple/20 text-watercolor-purple">
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Button>}
        <Button variant="ghost" size="sm" onClick={handleLogout} className="bg-white/90 backdrop-blur-sm hover:bg-white border border-watercolor-magenta/20 text-watercolor-magenta">
          <LogOut className="w-4 h-4 mr-2" />
          Exit
        </Button>
      </div>

      <div ref={scrollRef} onScroll={handleScroll} className="overflow-y-scroll snap-y snap-mandatory hide-scrollbar h-full">
        {/* Page 1: Welcome - Always shown */}
        <WeddingPage background="bg-gradient-to-br from-watercolor-lavender/30 via-background to-watercolor-rose/20" backgroundMedia={slideBackgrounds[1]}>
          <div className="space-y-8 animate-fade-in">
            <Heart className="w-16 h-16 mx-auto text-watercolor-magenta opacity-80" />
            <h1 className="text-6xl md:text-7xl font-serif font-bold text-watercolor-magenta leading-tight">
              {guestName ? `Welcome, ${guestName}!` : "You're Invited"}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto">
              Join us for a celebration of love in the heart of Pakistan
            </p>
            
            {/* Countdown */}
            <div className="pt-4 pb-6">
              <Countdown targetDate={new Date('2025-03-25T19:00:00+05:00')} eventName="the wedding" />
            </div>
            
            <div className="space-y-4">
              <div className="text-lg text-foreground">
                <p className="font-semibold text-2xl text-watercolor-purple mb-2">March 25 - 29, 2025</p>
                <p className="text-muted-foreground">Optional Week-Long Trek: March 29 - April 5</p>
              </div>
              <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate('/rsvp')} size="lg" className="bg-gradient-to-r from-watercolor-magenta to-watercolor-purple hover:from-watercolor-purple hover:to-watercolor-magenta text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-500">
                  RSVP by December 15th
                </Button>
                <Button onClick={() => navigate('/travel')} size="lg" variant="outline" className="border-2 border-watercolor-purple text-watercolor-purple hover:bg-watercolor-purple/10 px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-500">
                  <Plane className="w-5 h-5 mr-2" />
                  Travel Info
                </Button>
              </div>
            </div>
          </div>
        </WeddingPage>

        {/* Page 2: Dholki - March 25 */}
        {isInvitedTo('mehndi') && <WeddingPage background="bg-gradient-to-br from-watercolor-purple/20 to-background" backgroundMedia={slideBackgrounds[2]}>
          <div className="space-y-8 animate-fade-in" style={{
          animationDelay: '0.2s'
        }}>
            <h2 className="text-5xl font-serif font-bold text-watercolor-purple mb-12">
              Arrival Day
            </h2>
            <EventCard icon="🥁" date="March 25, 2025" title="Dholki Night" venue="Traditional Venue, Pakistan" time="Evening - 7:00 PM onwards" description="Begin our celebration with a traditional Dholki evening filled with music, dance, and joy. This intimate gathering will set the perfect tone for the festivities ahead." />
          </div>
        </WeddingPage>}

        {/* Page 3: Barat - March 26 */}
        {isInvitedTo('nikah') && <WeddingPage background="bg-gradient-to-br from-watercolor-rose/20 to-background" backgroundMedia={slideBackgrounds[3]}>
          <div className="space-y-8 animate-fade-in" style={{
          animationDelay: '0.3s'
        }}>
            <h2 className="text-5xl font-serif font-bold text-watercolor-magenta mb-12">
              The Main Event
            </h2>
            <EventCard icon="💍" date="March 26, 2025" title="Barat Ceremony" venue="Grand Wedding Venue, Pakistan" time="Evening - 6:00 PM" description="The main wedding ceremony where families unite. Witness the beautiful traditions, vibrant colors, and heartfelt moments as we begin our journey together." />
          </div>
        </WeddingPage>}

        {/* Page 4: Village Reception - March 27 */}
        {isInvitedTo('haldi') && <WeddingPage background="bg-gradient-to-br from-watercolor-orange/20 to-background" backgroundMedia={slideBackgrounds[4]}>
          <div className="space-y-8 animate-fade-in" style={{
          animationDelay: '0.4s'
        }}>
            <h2 className="text-5xl font-serif font-bold text-watercolor-orange mb-12">
              Double Celebration
            </h2>
            <div className="grid gap-6 max-w-3xl mx-auto">
              <EventCard icon="🌾" date="March 27, 2025" title="Village Reception" venue="Family Village Home" time="Afternoon - 2:00 PM" description="Experience authentic Pakistani village hospitality with a traditional reception celebrating with our extended family and community." />
              <EventCard icon="🎉" date="March 27, 2025" title="Warehouse DJ Party" venue="Warehouse Venue" time="Evening - 9:00 PM" description="Dance the night away at our modern celebration. A perfect blend of traditional and contemporary music to keep the energy high!" />
            </div>
          </div>
        </WeddingPage>}

        {/* Page 5: Formal Reception - March 28 */}
        {isInvitedTo('reception') && <WeddingPage background="bg-gradient-to-br from-watercolor-gold/20 to-background" backgroundMedia={slideBackgrounds[5]}>
          <div className="space-y-8 animate-fade-in" style={{
          animationDelay: '0.5s'
        }}>
            <h2 className="text-5xl font-serif font-bold text-watercolor-gold mb-12">
              Grand Finale
            </h2>
            <EventCard icon="✨" date="March 28, 2025" title="Formal Reception" venue="Luxury Banquet Hall, Pakistan" time="Evening - 7:00 PM" description="Join us for an elegant evening of dinner, speeches, and celebration. Dress in your finest as we conclude our wedding festivities in style." />
          </div>
        </WeddingPage>}

        {/* Page 6: Optional Trek */}
        {isInvitedTo('trek') && <WeddingPage background="bg-gradient-to-br from-watercolor-lavender/20 to-background" backgroundMedia={slideBackgrounds[6]}>
          <div className="space-y-8 animate-fade-in" style={{
          animationDelay: '0.6s'
        }}>
            <Mountain className="w-16 h-16 mx-auto text-watercolor-purple opacity-80" />
            <h2 className="text-5xl font-serif font-bold text-watercolor-purple mb-8">
              Adventure Awaits
            </h2>
            <EventCard icon="🏔️" date="March 29 - April 5, 2025" title="Week-Long Pakistan Trek" venue="Northern Pakistan" time="7 Days of Adventure" description="Extend your stay and explore the breathtaking landscapes of northern Pakistan. Trek through mountain valleys, visit ancient villages, and experience the natural beauty of the region. Departure from Lahore on March 29th." />
            <div className="pt-6">
              <Button onClick={() => navigate('/rsvp')} size="lg" variant="secondary" className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                Include Trek in Your RSVP
              </Button>
            </div>
          </div>
        </WeddingPage>}
      </div>

      
    </div>;
};
export default Wedding;