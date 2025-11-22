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
      <div className={`fixed top-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-b from-background/80 to-transparent pointer-events-none z-40 transition-opacity duration-300 ${currentPage === 0 ? 'opacity-0' : 'opacity-100'}`} />
      
      {/* Bottom scroll indicator */}
      <div className={`fixed bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-t from-background/80 to-transparent pointer-events-none z-40 transition-opacity duration-300 ${currentPage === totalPages - 1 ? 'opacity-0' : 'opacity-100'}`} />
      
      {/* Scroll hint - only show on first page */}
      {currentPage === 0 && <div className="fixed bottom-20 md:bottom-24 left-4 md:left-8 z-40 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>}
      
      <div className="fixed top-2 right-2 md:top-4 md:right-4 z-50 flex gap-1 md:gap-2">
        {isAdmin && <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="bg-white/90 backdrop-blur-sm hover:bg-white border border-watercolor-purple/20 text-watercolor-purple text-xs md:text-sm px-2 md:px-3">
            <Settings className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
            <span className="hidden md:inline">Admin</span>
          </Button>}
        <Button variant="ghost" size="sm" onClick={handleLogout} className="bg-white/90 backdrop-blur-sm hover:bg-white border border-watercolor-magenta/20 text-watercolor-magenta text-xs md:text-sm px-2 md:px-3">
          <LogOut className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
          <span className="hidden md:inline">Exit</span>
        </Button>
      </div>

      <div ref={scrollRef} onScroll={handleScroll} className="overflow-y-scroll snap-y snap-mandatory hide-scrollbar h-full">
        {/* Page 1: Welcome - Always shown */}
        <WeddingPage background="bg-gradient-to-br from-watercolor-lavender/30 via-background to-watercolor-rose/20" backgroundMedia={slideBackgrounds[1]}>
          <div className="space-y-6 md:space-y-8 animate-fade-in">
            <Heart className="w-12 h-12 md:w-16 md:h-16 mx-auto text-watercolor-magenta opacity-80" />
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-watercolor-magenta leading-tight px-4">
              {guestName ? `Welcome, ${guestName}!` : "You're Invited"}
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-foreground/80 font-light max-w-2xl mx-auto px-4 leading-relaxed">
              Join us for a celebration of love in the heart of Pakistan
            </p>
            
            {/* Countdown */}
            <div className="pt-3 pb-4 md:pt-4 md:pb-6">
              <Countdown targetDate={new Date('2026-03-25T19:00:00+05:00')} eventName="the wedding" />
            </div>
            
            <div className="space-y-3 md:space-y-4">
              <div className="text-lg md:text-xl text-foreground px-4">
                <p className="font-semibold text-2xl md:text-3xl text-watercolor-purple mb-2">March 25 - 29, 2026</p>
                <p className="text-foreground/70 text-base md:text-lg">Optional Week-Long Trek: March 29 - April 5</p>
              </div>
              <div className="pt-4 md:pt-6 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
                <Button onClick={() => navigate('/rsvp')} size="lg" className="bg-gradient-to-r from-watercolor-magenta to-watercolor-purple hover:from-watercolor-purple hover:to-watercolor-magenta text-white px-6 md:px-8 py-5 md:py-6 text-lg md:text-xl rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-500 font-semibold">
                  RSVP by December 15th
                </Button>
                <Button onClick={() => navigate('/travel')} size="lg" variant="outline" className="border-2 border-watercolor-purple text-watercolor-purple hover:bg-watercolor-purple/10 hover:border-watercolor-purple/80 px-6 md:px-8 py-5 md:py-6 text-lg md:text-xl rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-500 font-semibold">
                  <Plane className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Travel Info
                </Button>
              </div>
            </div>
          </div>
        </WeddingPage>

        {/* Page 2: Dholki - March 25 */}
        {isInvitedTo('mehndi') && <WeddingPage background="bg-gradient-to-br from-watercolor-purple/20 to-background" backgroundMedia={slideBackgrounds[2]}>
          <div className="space-y-6 md:space-y-8 animate-fade-in" style={{
          animationDelay: '0.2s'
        }}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-watercolor-purple mb-8 md:mb-12 px-4">
              Arrival Day
            </h2>
            <EventCard date="March 25, 2025" title="Dholki Night" venue="Traditional Venue, Pakistan" time="Evening - 7:00 PM onwards" description="Begin our celebration with a traditional Dholki evening filled with music, dance, and joy. This intimate gathering will set the perfect tone for the festivities ahead." />
          </div>
        </WeddingPage>}

        {/* Page 3: Barat - March 26 */}
        {isInvitedTo('nikah') && <WeddingPage background="bg-gradient-to-br from-watercolor-rose/20 to-background" backgroundMedia={slideBackgrounds[3]}>
          <div className="space-y-6 md:space-y-8 animate-fade-in" style={{
          animationDelay: '0.3s'
        }}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-watercolor-magenta mb-8 md:mb-12 px-4">
              The Main Event
            </h2>
            <EventCard date="March 26, 2025" title="Barat Ceremony" venue="Grand Wedding Venue, Pakistan" time="Evening - 6:00 PM" description="The main wedding ceremony where families unite. Witness the beautiful traditions, vibrant colors, and heartfelt moments as we begin our journey together." />
          </div>
        </WeddingPage>}

        {/* Page 4: Warehouse DJ Party - March 27 */}
        {isInvitedTo('haldi') && <WeddingPage background="bg-gradient-to-br from-watercolor-orange/20 to-background" backgroundMedia={slideBackgrounds[4]}>
          <div className="space-y-6 md:space-y-8 animate-fade-in" style={{
          animationDelay: '0.4s'
        }}>
            <EventCard date="March 27, 2025" title="Warehouse DJ Party" venue="Warehouse Venue" time="Evening - 9:00 PM" description="Dance the night away at our modern celebration. A perfect blend of traditional and contemporary music to keep the energy high!" />
          </div>
        </WeddingPage>}

        {/* Page 5: Formal Reception - March 28 */}
        {isInvitedTo('reception') && <WeddingPage background="bg-gradient-to-br from-watercolor-gold/20 to-background" backgroundMedia={slideBackgrounds[5]}>
          <div className="space-y-6 md:space-y-8 animate-fade-in" style={{
          animationDelay: '0.5s'
        }}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-watercolor-gold mb-8 md:mb-12 px-4">
              Grand Finale
            </h2>
            <EventCard date="March 28, 2025" title="Formal Reception" venue="Luxury Banquet Hall, Pakistan" time="Evening - 7:00 PM" description="Join us for an elegant evening of dinner, speeches, and celebration. Dress in your finest as we conclude our wedding festivities in style." />
          </div>
        </WeddingPage>}

        {/* Page 6: Optional Trek */}
        {isInvitedTo('trek') && <WeddingPage background="bg-gradient-to-br from-watercolor-lavender/20 to-background" backgroundMedia={slideBackgrounds[6]}>
          <div className="space-y-6 md:space-y-8 animate-fade-in" style={{
          animationDelay: '0.6s'
        }}>
            <Mountain className="w-12 h-12 md:w-16 md:h-16 mx-auto text-watercolor-purple opacity-80" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-watercolor-purple mb-6 md:mb-8 px-4">
              Adventure Awaits
            </h2>
            <EventCard date="March 29 - April 5, 2025" title="Week-Long Pakistan Trek" venue="Northern Pakistan" time="7 Days of Adventure" description="Extend your stay and explore the breathtaking landscapes of northern Pakistan. Trek through mountain valleys, visit ancient villages, and experience the natural beauty of the region. Departure from Lahore on March 29th." />
            <div className="pt-4 md:pt-6 px-4">
              <Button onClick={() => navigate('/rsvp')} size="lg" variant="secondary" className="px-6 md:px-8 py-5 md:py-6 text-base md:text-lg rounded-full shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                Include Trek in Your RSVP
              </Button>
            </div>
          </div>
        </WeddingPage>}
      </div>

      <Navigation 
        currentPage={currentPage}
        totalPages={totalPages}
        onNavigate={handleNavigate}
      />
    </div>;
};
export default Wedding;